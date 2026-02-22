import os
import torch
import threading
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class ModelLoader:
    _instance = None
    _model = None
    _tokenizer = None
    _device = None
    _loading_thread = None
    _lock = threading.Lock()
    is_ready = False
    error = None

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # We use a double-check pattern or just depend on the fact that __init__ 
        # is called after __new__. Since we use a singleton, we only initialize once.
        if not hasattr(self, 'initialized'):
            self.model_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "saved_models",
                "mental_health_classifier"
            )
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            self.initialized = True

    def load(self):
        """Loads the model and tokenizer if not already loaded (blocking)."""
        if not self.is_ready:
            with self._lock:
                if not self.is_ready:
                    self._do_load()
        return self._model, self._tokenizer, self.device

    def load_background(self):
        """Starts model loading in a background thread."""
        if self.is_ready:
            return

        with self._lock:
            if not self.is_ready and (self._loading_thread is None or not self._loading_thread.is_alive()):
                print("Starting background model loading...")
                self._loading_thread = threading.Thread(target=self._do_load)
                self._loading_thread.daemon = True
                self._loading_thread.start()

    def _do_load(self):
        """Internal method to perform the actual loading. Should be called under lock or carefully."""
        try:
            # We don't strictly need a lock INSIDE here if called from load/load_background under lock
            # but it doesn't hurt to be safe if this is called elsewhere.
            if self._model is not None:
                return

            print(f"Loading model from: {self.model_path}")
            tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
            
            model.to(self.device)
            model.eval()
            
            # Atomic update of the class variables
            ModelLoader._tokenizer = tokenizer
            ModelLoader._model = model
            ModelLoader.is_ready = True
            print(f"Model loaded successfully on: {self.device.upper()}")
        except Exception as e:
            ModelLoader.error = str(e)
            print(f"Error loading model: {e}")

# Singleton instance
model_loader = ModelLoader()

def load_model():
    return model_loader.load()

def load_model_async():
    model_loader.load_background()
