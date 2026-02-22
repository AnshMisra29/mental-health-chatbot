import torch
import torch.nn.functional as F
from ml_engine.inference.model_loader import model_loader
from ml_engine.preprocessing.text_cleaner import clean_text

class Predictor:
    def __init__(self, confidence_threshold=0.50):
        self.model, self.tokenizer, self.device = model_loader.load()
        self.confidence_threshold = confidence_threshold
        self.max_length = 256

    def predict(self, text: str) -> dict:
        """
        Cleans the input text and returns the classification result.
        """
        cleaned_text = clean_text(text)
        
        if not cleaned_text:
            return {
                "label": "Normal",
                "confidence": 0.0,
                "all_probs": {}
            }

        inputs = self.tokenizer(
            cleaned_text,
            return_tensors='pt',
            truncation=True,
            max_length=self.max_length,
            padding=True
        ).to(self.device)

        with torch.no_grad():
            logits = self.model(**inputs).logits

        probs = F.softmax(logits, dim=-1)[0]
        pred_id = probs.argmax().item()
        confidence = probs[pred_id].item()
        label = self.model.config.id2label[pred_id]

        # Confidence gate: default to 'Normal' if below threshold
        if confidence < self.confidence_threshold:
            label = 'Normal'

        return {
            'label': label,
            'confidence': confidence,
            'is_crisis': label == 'Suicidal',
            'all_probs': {
                self.model.config.id2label[i]: round(p.item(), 4)
                for i, p in enumerate(probs)
            }
        }

# Global predictor instance
predictor = Predictor()

def predict(text: str) -> dict:
    return predictor.predict(text)
