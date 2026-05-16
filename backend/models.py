from datetime import datetime, timezone
from flask_login import UserMixin
from extensions import db

class User(db.Model, UserMixin):
    __tablename__ = 'users'  # Explicit table name for PostgreSQL
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False, default='')
    last_name = db.Column(db.String(50), nullable=False, default='')
    password = db.Column(db.String(255), nullable=False)  # Increased for password hashes
    role = db.Column(db.String(20), default='user')
    credits = db.Column(db.Integer, default=100, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    bots = db.relationship('BotConfig', back_populates='owner', cascade='all, delete-orphan')
    discord_bots = db.relationship('DiscordBotConfig', back_populates='owner', cascade='all, delete-orphan')
    api_keys = db.relationship('ApiKey', back_populates='user', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='user_ref', lazy=True)

class BotConfig(db.Model):
    __tablename__ = 'bot_configs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    api_key_id = db.Column(db.Integer, db.ForeignKey('api_keys.id'), nullable=True)
    status = db.Column(db.String(20), default='stopped')
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_error = db.Column(db.Text, nullable=True)
    blocked_words = db.Column(db.Text, nullable=True)
    
    # Relationships
    owner = db.relationship('User', back_populates='bots')
    api_key = db.relationship('ApiKey', backref='telegram_bots')
    messages = db.relationship('Message', back_populates='telegram_bot', cascade='all, delete-orphan')

class DiscordBotConfig(db.Model):
    __tablename__ = 'discord_bot_configs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    api_key_id = db.Column(db.Integer, db.ForeignKey('api_keys.id'), nullable=True)
    status = db.Column(db.String(20), default='stopped')
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_error = db.Column(db.Text, nullable=True)
    blocked_words = db.Column(db.Text, nullable=True)
    
    # Relationships
    owner = db.relationship('User', back_populates='discord_bots')
    api_key = db.relationship('ApiKey', backref='discord_bots')
    messages = db.relationship('Message', back_populates='discord_bot', cascade='all, delete-orphan')

class ApiKey(db.Model):
    __tablename__ = 'api_keys'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    key = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = db.relationship('User', back_populates='api_keys')

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    bot_config_id = db.Column(db.Integer, db.ForeignKey('bot_configs.id'), nullable=True)
    discord_bot_config_id = db.Column(db.Integer, db.ForeignKey('discord_bot_configs.id'), nullable=True)
    platform = db.Column(db.String(20), nullable=False)
    text = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), nullable=True)
    probabilities = db.Column(db.Text, nullable=True)
    is_toxic = db.Column(db.Boolean, default=False)
    toxic_categories = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    owner = db.Column(db.String(100), nullable=True)
    toxicity_level = db.Column(db.Float, default=0.0)

    # Relationships
    telegram_bot = db.relationship('BotConfig', back_populates='messages')
    discord_bot = db.relationship('DiscordBotConfig', back_populates='messages')

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    tx_ref = db.Column(db.String(100), unique=True, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))