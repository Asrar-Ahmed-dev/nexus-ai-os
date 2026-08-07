import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Gemini API Key
API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=API_KEY)

# Load model
model = genai.GenerativeModel("gemini-2.5-flash")


def ask_gemini(prompt: str):
    response = model.generate_content(prompt)
    return response.text
def ask_gemini_stream(prompt: str):
    response = model.generate_content(
        prompt,
        stream=True,
    )

    for chunk in response:
        try:
            text = chunk.text
            if text:
                yield text
        except ValueError:
            # Gemini sometimes sends chunks without text.
            # Ignore them and continue streaming.
            continue