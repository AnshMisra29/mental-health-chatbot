import os
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, f1_score
from transformers import (
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
    EarlyStoppingCallback
)
from ml_engine.training.dataset_loader import load_and_prepare_dataset, ID2LABEL, LABEL2ID

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "saved_models", "mental_health_classifier")
MODEL_NAME = "distilbert-base-uncased"
MAX_LENGTH = 256
BATCH_SIZE = 8
EPOCHS = 5
LR = 2e-5

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    macro_f1 = f1_score(labels, predictions, average='macro', zero_division=0)
    acc = accuracy_score(labels, predictions)
    return {
        'accuracy': round(acc, 4),
        'macro_f1': round(macro_f1, 4),
    }

def make_weighted_trainer_class(weights_tensor):
    class WeightedTrainer(Trainer):
        def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
            labels = inputs.pop("labels")
            outputs = model(**inputs)
            logits = outputs.logits
            loss_fn = nn.CrossEntropyLoss(weight=weights_tensor)
            loss = loss_fn(logits, labels)
            return (loss, outputs) if return_outputs else loss
    return WeightedTrainer

class MentalHealthTrainer:
    def __init__(self, data_path):
        self.data_path = data_path
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

    def train(self):
        # Load and prepare data
        print(f"Loading data from {self.data_path}...")
        tokenized_ds, df = load_and_prepare_dataset(self.data_path)
        
        # Calculate class weights for imbalanced data
        from sklearn.utils.class_weight import compute_class_weight
        class_weights = compute_class_weight('balanced', classes=np.arange(len(ID2LABEL)), y=df['label'].values)
        weights_tensor = torch.FloatTensor(class_weights).to(self.device)

        # Load model
        print(f"Loading base model {MODEL_NAME}...")
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME, num_labels=len(ID2LABEL), id2label=ID2LABEL, label2id=LABEL2ID
        )
        
        from transformers import AutoTokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

        WeightedTrainer = make_weighted_trainer_class(weights_tensor)
        
        args = TrainingArguments(
            output_dir=OUTPUT_DIR,
            num_train_epochs=EPOCHS,
            per_device_train_batch_size=BATCH_SIZE,
            eval_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            metric_for_best_model="macro_f1",
            fp16=torch.cuda.is_available(),
            report_to="none"
        )
        
        trainer = WeightedTrainer(
            model=model,
            args=args,
            train_dataset=tokenized_ds['train'],
            eval_dataset=tokenized_ds['validation'],
            data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
            compute_metrics=compute_metrics,
            callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
        )
        
        print("Starting training...")
        trainer.train()
        
        # Save final model
        print(f"Saving model to {OUTPUT_DIR}...")
        trainer.save_model(OUTPUT_DIR)
        tokenizer.save_pretrained(OUTPUT_DIR)
        print("Model saved successfully.")

if __name__ == "__main__":
    pass
