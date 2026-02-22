import pandas as pd
import re
import os


def clean_text(text: str) -> str:
    """
    Clean input text for NLP processing.
    """
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()

    return text


def clean_dataset(input_path: str, output_path: str) -> None:
    """
    Cleans the dataset and saves the cleaned file.
    """

    # Load dataset
    df = pd.read_csv(input_path)

    # Remove unwanted column
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
        print("Removed 'Unnamed: 0' column.")

    # Drop missing statements
    initial_len = len(df)
    df = df.dropna(subset=['statement'])
    print(f"Dropped {initial_len - len(df)} rows with missing 'statement'.")

    # Clean text
    df['statement'] = df['statement'].apply(clean_text)

    # Remove empty rows after cleaning
    df = df[df['statement'] != ""]
    print(f"Remaining rows after cleaning: {len(df)}")

    # Remove duplicates
    initial_len = len(df)
    df = df.drop_duplicates()
    print(f"Removed {initial_len - len(df)} duplicate rows.")

    # Save cleaned dataset
    df.to_csv(output_path, index=False)
    print(f"Cleaned dataset saved to {output_path}")


if __name__ == "__main__":
    # Paths relative to this script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))

    input_file = os.path.join(script_dir, "Combined Data.csv")
    output_file = os.path.join(script_dir, "cleaned_data.csv")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    clean_dataset(input_file, output_file)