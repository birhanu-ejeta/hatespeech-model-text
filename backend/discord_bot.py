import asyncio
import threading
import json
import discord
from discord.ext import commands
from extensions import db
from models import DiscordBotConfig, Message, User

from model_loader import  predict_toxicity_cached
# Active bots: id -> (thread, stop_event)
active_bots = {}
bot_lock = threading.Lock()

def run_discord_bot(bot_config_id, stop_event):
    """Run a Discord bot in a separate thread."""
    async def start_bot():
        from app import create_app
        app = create_app()
        with app.app_context():
            bot_cfg = DiscordBotConfig.query.get(bot_config_id)
            if not bot_cfg:
                print(f"Discord bot config {bot_config_id} not found.")
                return
            token = bot_cfg.token
            blocked_words = bot_cfg.blocked_words

        # Set up Discord bot with necessary intents
        intents = discord.Intents.default()
        intents.message_content = True
        intents.messages = True
        bot = commands.Bot(command_prefix='!', intents=intents)

        @bot.event
        async def on_ready():
            print(f'Discord bot {bot.user} is ready!')
            # Update bot status
            await bot.change_presence(activity=discord.Game(name="Monitoring messages"))

        @bot.event
        async def on_message(message):
            if message.author == bot.user:
                return

            text = message.content
            if not text:
                return

            result = predict_toxicity_cached(text)

            owner = str(message.author)
            toxicity_level = max(result['probabilities'].values()) if result['is_toxic'] else 0.0

            with app.app_context():
                bot_cfg = DiscordBotConfig.query.get(bot_config_id)
                if not bot_cfg:
                    return
                # Deduct credits
                user = User.query.get(bot_cfg.user_id)
                if user.credits <= 0:
                    return
                user.credits -= 1
                probabilities_json = json.dumps(result['probabilities'])
                toxic_cats_str = ','.join(result['toxic_categories'])
                msg = Message(
                    user_id=user.id,
                    discord_bot_config_id=bot_config_id,
                    platform='discord',
                    text=text,
                    language=result['language'],
                    probabilities=probabilities_json,
                    is_toxic=result['is_toxic'],
                    toxic_categories=toxic_cats_str,
                    owner=owner,
                    toxicity_level=toxicity_level
                )
                db.session.add(msg)
                db.session.commit()

            # Blocked words and toxicity handling
            if blocked_words:
                words = [w.strip().lower() for w in blocked_words.split(',')]
                if any(w in text.lower() for w in words):
                    await message.reply("⚠️ Your message contains blocked words.")
                    return

            if result['is_toxic']:
                categories = ', '.join(result['toxic_categories'])
                warning = f"⚠️ Toxic message detected! Categories: {categories}. Please keep the conversation respectful."
                try:
                    await message.delete()
                except Exception as e:
                    await message.channel.send(warning)
                    return
                try:
                    await message.author.send(warning)
                except Exception:
                    await message.channel.send(f"{message.author.mention} {warning}")

        # Start the bot - THIS MUST BE OUTSIDE on_message
        await bot.start(token)

        # Wait until stop_event is set
        await stop_event.wait()
        await bot.close()

    asyncio.run(start_bot())

def start_discord_bot_thread(bot_config_id):
    with bot_lock:
        if bot_config_id in active_bots:
            return False
        stop_event = asyncio.Event()
        thread = threading.Thread(target=run_discord_bot, args=(bot_config_id, stop_event), daemon=True)
        thread.start()
        active_bots[bot_config_id] = (thread, stop_event)
        return True

def stop_discord_bot_thread(bot_config_id):
    with bot_lock:
        if bot_config_id in active_bots:
            del active_bots[bot_config_id]
            return True
    return False