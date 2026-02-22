import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

try:
    print("All available models:")
    models = list(genai.list_models())
    for m in models:
        print(f"Name: {m.name}, Display Name: {m.display_name}")
except Exception as e:
    print(f"Error: {e}")
