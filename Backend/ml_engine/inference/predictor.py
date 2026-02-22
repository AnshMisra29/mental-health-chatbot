import torch
import torch.nn.functional as F
from ml_engine.inference.model_loader import model_loader
from ml_engine.preprocessing.text_cleaner import clean_text

class Predictor:
    def __init__(self, confidence_threshold=0.40):
        self.confidence_threshold = confidence_threshold
        self.max_length = 256

    def _get_model(self):
        return model_loader.load() # This will return immediately if ready, or block if loading

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

        model, tokenizer, device = self._get_model()

        inputs = tokenizer(
            cleaned_text,
            return_tensors='pt',
            truncation=True,
            max_length=self.max_length,
            padding=True
        ).to(device)

        with torch.no_grad():
            logits = model(**inputs).logits

        probs = F.softmax(logits, dim=-1)[0]
        pred_id = probs.argmax().item()
        confidence = probs[pred_id].item()
        label = model.config.id2label[pred_id]

        # Confidence gate: default to 'Normal' if below threshold
        # CRITICAL: If the top prediction is 'Suicidal', we trust it even at lower confidence (e.g. > 35%)
        # to ensure safety. Otherwise, we use a 40% threshold before defaulting to 'Normal'.
        if label == 'Suicidal':
            if confidence < 0.35:
                label = 'Normal'
        elif confidence < self.confidence_threshold:
            label = 'Normal'

        return {
            'label': label,
            'confidence': confidence,
            'is_crisis': label == 'Suicidal',
            'all_probs': {
                model.config.id2label[i]: round(p.item(), 4)
                for i, p in enumerate(probs)
            }
        }

# Global predictor instance
predictor = Predictor()

def predict(text: str) -> dict:
    return predictor.predict(text)
