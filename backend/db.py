from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class BotConfig(db.Model):
    __tablename__ = 'bot_configs'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(100), unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    status = db.Column(db.String(20), default='stopped')
    last_error = db.Column(db.Text, nullable=True)

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), nullable=True)
    probabilities = db.Column(db.Text, nullable=True)  # JSON string
    is_toxic = db.Column(db.Boolean, default=False)
    toxic_categories = db.Column(db.Text, nullable=True)  # comma-separated
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'language': self.language,
            'probabilities': json.loads(self.probabilities) if self.probabilities else {},
            'is_toxic': self.is_toxic,
            'toxic_categories': self.toxic_categories.split(',') if self.toxic_categories else [],
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }