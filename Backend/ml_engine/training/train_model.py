import os
import argparse
from ml_engine.training.trainer import MentalHealthTrainer

def main():
    parser = argparse.ArgumentParser(description="Train the Mental Health Classifier")
    parser.add_argument("--data", type=str, required=True, help="Path to the training CSV file")
    args = parser.parse_args()

    if not os.path.exists(args.data):
        print(f"Error: Data file not found at {args.data}")
        return

    trainer = MentalHealthTrainer(args.data)
    print("Starting training process...")
    trainer.train()
    print("Training process completed.")

if __name__ == "__main__":
    main()
