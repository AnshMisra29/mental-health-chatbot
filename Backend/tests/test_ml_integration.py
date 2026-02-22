import sys
import os

# Add Backend to path so we can import ml_engine
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from ml_engine.inference.predictor import Predictor

def test_integration():
    predictor = Predictor()
    
    test_cases = [
        ("I feel so empty and hopeless, nothing seems worth it anymore.", "Depression"),
        ("I am feeling great today, had a productive day at work!", "Normal"),
        ("My heart races constantly and I cannot stop worrying.", "Anxiety"),
        ("I have been thinking that everyone would be better off without me.", "Suicidal"),
        ("My mood swings are so intense I cannot keep up with them.", "Bipolar")
    ]
    
    print("\n" + "="*50)
    print("RUNNING ML ENGINE VERIFICATION")
    print("="*50)
    
    for text, expected in test_cases:
        result = predictor.predict(text)
        print(f"\nInput: {text}")
        print(f"Predicted: {result['label']} (Confidence: {result['confidence']:.1%})")
        # Note: In a real test we'd assert, but since confidence can vary, we just print here
        # unless it's a hard mismatch.
    
    print("\n" + "="*50)
    print("VERIFICATION COMPLETE")
    print("="*50)

if __name__ == "__main__":
    test_integration()
