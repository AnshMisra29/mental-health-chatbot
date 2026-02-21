import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class ModelLoader:
    _instance = None
    _model = None
    _tokenizer = None
    _device = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Path to the model is relative to the root of the Backend folder usually
        # But we should use an absolute path or a well-defined relative path
        self.model_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "saved_models",
            "mental_health_classifier"
        )
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

    def load(self):
        """Loads the model and tokenizer if not already loaded."""
        if self._model is None or self._tokenizer is None:
            print(f"Loading model from: {self.model_path}")
            self._tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self._model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
            self._model.to(self.device)
            self._model.eval()
            print(f"✅ Model loaded on: {self.device.upper()}")
        
        return self._model, self._tokenizer, self.device

# Singleton instance
model_loader = ModelLoader()

def load_model():
    return model_loader.load()
