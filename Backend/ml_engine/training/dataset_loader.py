import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from datasets import Dataset, DatasetDict
from ml_engine.preprocessing.text_cleaner import clean_text

LABEL_MAP = {
    "Anxiety": 0, "Normal": 1, "Depression": 2, "Suicidal": 3,
    "Stress": 4, "Bipolar": 5, "Personality disorder": 6, "Personality Disorder": 6,
}

ID2LABEL = {
    0: "Anxiety", 1: "Normal", 2: "Depression",
    3: "Suicidal", 4: "Stress", 5: "Bipolar", 6: "Personality Disorder"
}

def load_and_prepare_dataset(csv_path, seed=42):
    """
    Loads, cleans, and splits the dataset for training.
    """
    df = pd.read_csv(csv_path)
    
    # Validation & Cleaning
    df = df.dropna(subset=['statement', 'status'])
    df = df[df['statement'].str.strip() != '']
    df = df.drop_duplicates()
    
    # Map labels
    df['label'] = df['status'].map(LABEL_MAP)
    df = df.dropna(subset=['label'])
    df['label'] = df['label'].astype(int)
    
    # Split: 80% train, 10% validation, 10% test
    train_df, test_df = train_test_split(
        df, test_size=0.10, random_state=seed, stratify=df['label']
    )
    train_df, val_df = train_test_split(
        train_df, test_size=0.1111, random_state=seed, stratify=train_df['label']
    )
    
    ds = DatasetDict({
        'train': Dataset.from_pandas(train_df.reset_index(drop=True)),
        'validation': Dataset.from_pandas(val_df.reset_index(drop=True)),
        'test': Dataset.from_pandas(test_df.reset_index(drop=True))
    })
    
    return ds, df
