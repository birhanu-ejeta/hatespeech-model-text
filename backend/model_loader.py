# backend/model_loader.py
"""
Singleton model loader - ensures the ML model is loaded only ONCE 
and shared across all modules (api, bot, discord_bot).
"""
import threading
from model import load_model as _load_model, predict_toxicity as _predict_toxicity

# Global model cache with thread safety
_model_lock = threading.Lock()
_cached_model = None
_cached_thresholds = None
_cached_label_columns = None
_cached_tokenizer = None
_cached_preprocessor = None
_loaded = False

def get_model():
    """Get or load the model (singleton pattern with caching).
    
    Returns:
        tuple: (model, thresholds, label_columns, tokenizer, preprocessor)
    """
    global _cached_model, _cached_thresholds, _cached_label_columns
    global _cached_tokenizer, _cached_preprocessor, _loaded
    
    # Quick check without lock (fast path)
    if _loaded:
        return _cached_model, _cached_thresholds, _cached_label_columns, _cached_tokenizer, _cached_preprocessor
    
    # Thread-safe loading (slow path - only runs once)
    with _model_lock:
        # Double-check after acquiring lock
        if _loaded:
            return _cached_model, _cached_thresholds, _cached_label_columns, _cached_tokenizer, _cached_preprocessor
        
        print("=" * 60)
        print("🔄 LOADING MODEL FOR THE FIRST TIME...")
        print("=" * 60)
        
        (_cached_model, _cached_thresholds, _cached_label_columns, 
         _cached_tokenizer, _cached_preprocessor) = _load_model()
        
        _loaded = True
        
        print("=" * 60)
        print("✅ MODEL CACHED SUCCESSFULLY!")
        print("=" * 60)
        
        return _cached_model, _cached_thresholds, _cached_label_columns, _cached_tokenizer, _cached_preprocessor


def predict_toxicity_cached(text):
    """Predict toxicity using the cached singleton model.
    
    Args:
        text: The text to analyze
        
    Returns:
        dict: Toxicity prediction results
    """
    model, thresholds, label_columns, tokenizer, preprocessor = get_model()
    return _predict_toxicity(text, model, thresholds, label_columns, tokenizer, preprocessor)