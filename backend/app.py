# app.py

import os
from flask import Flask, jsonify, request, redirect, url_for
from extensions import db, login_manager, csrf, limiter
from models import User
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    """
    Application factory function. This is what Gunicorn will run.
    """
    app = Flask(__name__)
    
    # --- Configuration ---
    # This section is good. It correctly uses environment variables.
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a-strong-default-secret-key')
    
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- Initialize Extensions ---
    # This section is good.
    db.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)
    limiter.init_app(app)
    
    # --- CORS Configuration ---
    # Add your production frontend URL here when you have it!
    # e.g., 'https://hatespeech-ui.onrender.com'
    CORS(app, origins=['http://localhost:3000', 'https://your-frontend-url.onrender.com'], 
         supports_credentials=True)

    # --- Login Manager and Blueprints ---
    # This section is good.
    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Unauthorized'}), 401
        return redirect(url_for('auth.login'))

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from auth import auth_bp
    from user import user_bp
    from admin import admin_bp
    from api import api_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(api_bp)
    csrf.exempt(api_bp)

    # --- Basic Routes ---
    # This is good for health checks.
    @app.route('/')
    def index():
        return jsonify({'message': 'ToxiGuard API is running'}), 200
    
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'}), 200

    # --- Database Initialization ---
    # This is the ONLY thing that should run on startup.
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created/verified successfully.")
        except Exception as e:
            print(f"❌ Database initialization error: {e}")

    # --- Return the configured app ---
    return app

# ❌ The 'if __name__ == "__main__"' block has been COMPLETELY REMOVED.
# Gunicorn does not use it, and it contains production-unsafe code like debug=True.







# import time
# import os
# from flask import Flask, jsonify, request, redirect, url_for
# from extensions import db, login_manager, csrf, limiter
# from models import User
# from flask_cors import CORS
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# def create_app():
#     app = Flask(__name__)
    
#     # Configuration
#     app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
    
#     # Database configuration - Use Neon PostgreSQL
#     database_url = os.environ.get('DATABASE_URL')
#     if database_url:
#         # Render and some platforms use 'postgres://' which SQLAlchemy 1.4+ doesn't support
#         if database_url.startswith('postgres://'):
#             database_url = database_url.replace('postgres://', 'postgresql://', 1)
#         app.config['SQLALCHEMY_DATABASE_URI'] = database_url
#     else:
#         # Fallback to SQLite for local development
#         app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    
#     app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#     app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
#         'pool_size': 10,
#         'pool_recycle': 3600,
#         'pool_pre_ping': True,
#     }

#     # Initialize extensions
#     db.init_app(app)
#     login_manager.init_app(app)
#     login_manager.login_view = 'auth.login'
#     login_manager.login_message_category = 'info'
#     csrf.init_app(app)

#     # Initialize limiter with the app
#     limiter.init_app(app)
    
#     # CORS: allow frontend origin and credentials
#     CORS(app, origins=['http://localhost:3000', 'https://huggingface.co'], 
#          supports_credentials=True,
#          allow_headers=['Content-Type', 'Authorization'])

#     # Custom unauthorized handler: return JSON for API routes
#     @login_manager.unauthorized_handler
#     def unauthorized():
#         if request.path.startswith('/api/'):
#             return jsonify({'error': 'Unauthorized'}), 401
#         return redirect(url_for('auth.login'))

#     @login_manager.user_loader
#     def load_user(user_id):
#         return db.session.get(User, int(user_id))

#     # Register blueprints
#     from auth import auth_bp
#     from user import user_bp
#     from admin import admin_bp
#     from api import api_bp

#     app.register_blueprint(auth_bp)
#     app.register_blueprint(user_bp, url_prefix='/user')
#     app.register_blueprint(admin_bp, url_prefix='/admin')
#     app.register_blueprint(api_bp)
#     csrf.exempt(api_bp)

#     @app.route('/')
#     def index():
#         return jsonify({
#             'message': 'ToxiGuard API is running',
#             'status': 'healthy',
#             'database': 'PostgreSQL' if os.environ.get('DATABASE_URL') else 'SQLite'
#         }), 200
    
#     @app.route('/health')
#     def health():
#         return jsonify({'status': 'healthy'}), 200

#     with app.app_context():
#         # Create tables if they don't exist
#         try:
#             db.create_all()
#             print("Database tables created/verified successfully")
#         except Exception as e:
#             print(f"Database initialization error: {e}")
#             # Continue running even if DB init fails
        
#         # Restart bots only in the main process (not the reloader)
#         if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
#             try:
#                 from bot import start_bot_thread
#                 from models import BotConfig
#                 running_bots = BotConfig.query.filter_by(status='running').all()
#                 for bot in running_bots:
#                     print(f"Restarting bot {bot.username} (id={bot.id})")
#                     start_bot_thread(bot.id)
#                     time.sleep(2)
#             except Exception as e:
#                 print(f"Bot restart error (may be normal if DB is empty): {e}")

#     return app

# if __name__ == '__main__':
#     app = create_app()
#     @app.after_request
#     def after_request(response):
#         response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
#         response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#         response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#         response.headers.add('Access-Control-Allow-Credentials', 'true')
#         return response
    
#     # Use environment variable for port if available (for Hugging Face)
#     port = int(os.environ.get('PORT', 5000))
#     app.run(debug=True, host='0.0.0.0', port=port)