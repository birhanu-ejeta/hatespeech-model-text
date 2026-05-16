import json
from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_required
from extensions import db
from models import User, BotConfig, Message
from utils import admin_required
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    total_users = User.query.count()
    total_bots = BotConfig.query.count()
    total_messages = Message.query.count()
    toxic_messages = Message.query.filter_by(is_toxic=True).count()
    recent_msgs = Message.query.order_by(Message.timestamp.desc()).limit(10).all()
    for msg in recent_msgs:
        msg.probabilities_dict = json.loads(msg.probabilities) if msg.probabilities else {}
    # 7-day message trend
    today = datetime.utcnow().date()
    daily_counts = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        start = datetime.combine(day, datetime.min.time())
        end = datetime.combine(day, datetime.max.time())
        count = Message.query.filter(Message.timestamp.between(start, end)).count()
        daily_counts.append({'date': day.strftime('%Y-%m-%d'), 'count': count})
    return render_template('admin/dashboard.html',
                           total_users=total_users,
                           total_bots=total_bots,
                           total_messages=total_messages,
                           toxic_messages=toxic_messages,
                           recent_msgs=recent_msgs,
                           daily_counts=daily_counts)

@admin_bp.route('/users')
@login_required
@admin_required
def users():
    users = User.query.all()
    return render_template('admin/users.html', users=users)

@admin_bp.route('/users/<int:user_id>/toggle_role', methods=['POST'])
@login_required
@admin_required
def toggle_role(user_id):
    user = User.query.get_or_404(user_id)
    # Prevent demoting the only admin
    if user.role == 'admin' and User.query.filter_by(role='admin').count() == 1:
        flash('Cannot remove the only admin.', 'danger')
        return redirect(url_for('admin.users'))
    user.role = 'user' if user.role == 'admin' else 'admin'
    db.session.commit()
    flash(f'User {user.username} role changed to {user.role}.', 'success')
    return redirect(url_for('admin.users'))

@admin_bp.route('/logs')
@login_required
@admin_required
def logs():
    messages = Message.query.order_by(Message.timestamp.desc()).all()
    for msg in messages:
        msg.probabilities_dict = json.loads(msg.probabilities) if msg.probabilities else {}
    return render_template('admin/logs.html', messages=messages)

@admin_bp.route('/settings', methods=['GET', 'POST'])
@login_required
@admin_required
def settings():
    if request.method == 'POST':
        # Placeholder for global settings (e.g., global blocklist, thresholds)
        flash('Settings updated (demo).', 'success')
        return redirect(url_for('admin.settings'))
    return render_template('admin/settings.html')