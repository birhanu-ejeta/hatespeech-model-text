import asyncio
import threading
import json
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes
from extensions import db
from models import BotConfig, Message, User
from model_loader import predict_toxicity_cached
# Active bots: bot_config_id -> (thread, stop_event)
active_bots = {}
bot_lock = threading.Lock()

def run_bot(bot_config_id, stop_event):
    """Run the bot in a separate thread with its own event loop."""
    async def start_bot():
        # Get bot config from DB (needs app context)
        from app import create_app
        app = create_app()
        with app.app_context():
            bot_cfg = BotConfig.query.get(bot_config_id)
            if not bot_cfg:
                print(f"Bot config {bot_config_id} not found.")
                return
            token = bot_cfg.token
            api_key_id = bot_cfg.api_key_id
            blocked_words = bot_cfg.blocked_words

        application = Application.builder().token(token).build()

        async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
            if not update.message or not update.message.text:
                return

            text = update.message.text
            result = result = predict_toxicity_cached(text)

            sender = update.message.from_user
            owner = sender.username or sender.first_name or str(sender.id)
            toxicity_level = max(result['probabilities'].values()) if result['is_toxic'] else 0.0

            with app.app_context():
                bot_cfg = BotConfig.query.get(bot_config_id)
                if not bot_cfg:
                    return
                probabilities_json = json.dumps(result['probabilities'])
                toxic_cats_str = ','.join(result['toxic_categories'])
                msg = Message(
                    user_id=bot_cfg.user_id,
                    bot_config_id=bot_config_id,
                    platform='telegram',
                    text=text,
                    language=result['language'],
                    probabilities=probabilities_json,
                    is_toxic=result['is_toxic'],
                    toxic_categories=toxic_cats_str,
                    owner=owner,
                    toxicity_level=toxicity_level
                                )
                user = User.query.get(bot_cfg.user_id)
                if user.credits <= 0:
                    print(f"User {user.username} has no credits. Skipping message.")
                    return  # Do not process the message
                # Decrement credits
                user.credits -= 1
                db.session.add(msg)
                db.session.commit()

            # Blocked words check
            if blocked_words:
                words = [w.strip().lower() for w in blocked_words.split(',')]
                if any(w in text.lower() for w in words):
                    await update.message.reply_text("⚠️ Your message contains blocked words and will not be tolerated.")
                    return

            if result['is_toxic']:
                categories = ', '.join(result['toxic_categories'])
                warning = f"⚠️ Toxic message detected! Categories: {categories}. Please keep the conversation respectful."

                # Delete the toxic message
                try:
                    await update.message.delete()
                except Exception as e:
                    print(f"Could not delete message: {e}")
                    await update.message.reply_text(warning)
                    return

                # Send private warning to the sender
                try:
                    await context.bot.send_message(chat_id=sender.id, text=warning)
                    print(f"Private warning sent to {sender.id}")
                except Exception as e:
                    print(f"Could not send private message to {sender.id}: {e}")
                    # Fallback: send a group message mentioning the user
                    mention = f"@{sender.username}" if sender.username else sender.first_name
                    await update.message.chat.send_message(text=f"{mention} {warning}")
                    
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

        await application.initialize()
        await application.start()
        await application.updater.start_polling()
        # Wait until stop_event is set
        await stop_event.wait()
        await application.stop()

    asyncio.run(start_bot())

def start_bot_thread(bot_config_id):
    """Start a bot thread if not already running."""
    with bot_lock:
        if bot_config_id in active_bots:
            return False
        stop_event = asyncio.Event()
        thread = threading.Thread(target=run_bot, args=(bot_config_id, stop_event), daemon=True)
        thread.start()
        active_bots[bot_config_id] = (thread, stop_event)
        return True

def stop_bot_thread(bot_config_id):
    """Signal a bot thread to stop."""
    with bot_lock:
        if bot_config_id in active_bots:
            # We simply remove the entry; the thread will continue but won't be managed.
            # In practice, the thread will exit when the process ends.
            del active_bots[bot_config_id]
            return True
    return False