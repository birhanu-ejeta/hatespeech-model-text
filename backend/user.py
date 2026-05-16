import json
import secrets
from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from extensions import db
from models import BotConfig, ApiKey, Message
from forms import BotForm, ApiKeyForm
from bot import start_bot_thread, stop_bot_thread

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard')
@login_required
def dashboard():
    bots = BotConfig.query.filter_by(user_id=current_user.id).all()
    messages = Message.query.filter_by(user_id=current_user.id).order_by(Message.timestamp.desc()).limit(20).all()
    for msg in messages:
        msg.probabilities_dict = json.loads(msg.probabilities) if msg.probabilities else {}
    api_keys_count = ApiKey.query.filter_by(user_id=current_user.id).count()
    toxic_messages = Message.query.filter_by(user_id=current_user.id, is_toxic=True).count()
    return render_template('user/dashboard.html', bots=bots, messages=messages, api_keys_count=api_keys_count, toxic_messages=toxic_messages)

@user_bp.route('/bots', methods=['GET', 'POST'])
@login_required
def manage_bots():
    form = BotForm()
    api_keys = ApiKey.query.filter_by(user_id=current_user.id).all()
    form.api_key_id.choices = [(0, 'Select API Key')] + [(k.id, f"{k.name} ({k.key[:8]}...)") for k in api_keys]
    if form.validate_on_submit():
        if form.api_key_id.data == 0:
            flash('Please select a valid API key.', 'danger')
            return redirect(url_for('user.manage_bots'))
        bot = BotConfig(
            user_id=current_user.id,
            token=form.token.data,
            username=form.username.data,
            api_key_id=form.api_key_id.data,
            blocked_words=form.blocked_words.data
        )
        db.session.add(bot)
        db.session.commit()
        flash('Bot added successfully!', 'success')
        return redirect(url_for('user.manage_bots'))
    bots = BotConfig.query.filter_by(user_id=current_user.id).all()
    return render_template('user/bots.html', form=form, bots=bots)

@user_bp.route('/bots/<int:bot_id>/start')
@login_required
def start_bot(bot_id):
    bot = BotConfig.query.get_or_404(bot_id)
    if bot.user_id != current_user.id:
        flash('Unauthorized.', 'danger')
        return redirect(url_for('user.manage_bots'))
    if start_bot_thread(bot.id):
        bot.status = 'running'
        db.session.commit()
        flash('Bot started.', 'success')
    else:
        flash('Bot is already running or could not start.', 'warning')
    return redirect(url_for('user.manage_bots'))

@user_bp.route('/bots/<int:bot_id>/stop')
@login_required
def stop_bot(bot_id):
    bot = BotConfig.query.get_or_404(bot_id)
    if bot.user_id != current_user.id:
        flash('Unauthorized.', 'danger')
        return redirect(url_for('user.manage_bots'))
    if stop_bot_thread(bot.id):
        bot.status = 'stopped'
        db.session.commit()
        flash('Bot stopped.', 'success')
    else:
        flash('Bot not running.', 'info')
    return redirect(url_for('user.manage_bots'))

@user_bp.route('/bots/<int:bot_id>/delete', methods=['POST'])
@login_required
def delete_bot(bot_id):
    bot = BotConfig.query.get_or_404(bot_id)
    if bot.user_id != current_user.id:
        flash('Unauthorized.', 'danger')
        return redirect(url_for('user.manage_bots'))
    stop_bot_thread(bot.id)
    db.session.delete(bot)
    db.session.commit()
    flash('Bot deleted.', 'success')
    return redirect(url_for('user.manage_bots'))

@user_bp.route('/api_keys', methods=['GET', 'POST'])
@login_required
def api_keys():
    form = ApiKeyForm()
    if form.validate_on_submit():
        key = secrets.token_urlsafe(32)
        api_key = ApiKey(user_id=current_user.id, key=key, name=form.name.data)
        db.session.add(api_key)
        db.session.commit()
        flash(f'API Key created: {key}', 'success')
        return redirect(url_for('user.api_keys'))
    api_keys = ApiKey.query.filter_by(user_id=current_user.id).all()
    return render_template('user/api_keys.html', form=form, api_keys=api_keys)

@user_bp.route('/logs')
@login_required
def logs():
    messages = Message.query.filter_by(user_id=current_user.id).order_by(Message.timestamp.desc()).all()
    for msg in messages:
        msg.probabilities_dict = json.loads(msg.probabilities) if msg.probabilities else {}
    return render_template('user/logs.html', messages=messages)