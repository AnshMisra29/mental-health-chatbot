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
        """Loads the model and tokenizer if not already loaded (blocking).
        If a background thread is already loading, we wait for it instead of
        trying to acquire the lock (which would deadlock).
        """
        if self.is_ready:
            return self._model, self._tokenizer, self.device

        # If background thread is running, just wait for it to finish
        if self._loading_thread is not None and self._loading_thread.is_alive():
            print("Waiting for background model load to complete...")
            self._loading_thread.join(timeout=120)  # max 2 minutes wait
            if not self.is_ready:
                raise RuntimeError(f"Model failed to load: {self.error}")
        else:
            # No background thread — load synchronously
            with self._lock:
                if not self.is_ready:
                    self._do_load()

        return self._model, self._tokenizer, self.device

    def load_background(self):
        """Starts model loading in a background thread."""
        if self.is_ready:
            return

        # No lock needed here — the thread itself uses no lock
        if self._loading_thread is None or not self._loading_thread.is_alive():
            print("Starting background model loading...")
            self._loading_thread = threading.Thread(target=self._do_load)
            self._loading_thread.daemon = True
            self._loading_thread.start()

    def _do_load(self):
        """Internal method to perform the actual loading. Thread-safe via instance check."""
        try:
            if self._model is not None:
                return

            print(f"Loading model from: {self.model_path}")
            tokenizer = AutoTokenizer.from_pretrained(self.model_path, local_files_only=True)
            model = AutoModelForSequenceClassification.from_pretrained(self.model_path, local_files_only=True)
            
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
