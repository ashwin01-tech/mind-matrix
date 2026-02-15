import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# User provided key was saved as GROK_API_KEY, let's use that for now to test
api_key = os.getenv("GROK_API_KEY") 
print(f"Loaded Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1",
)

try:
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile", 
        messages=[
            {"role": "system", "content": "You are a test assistant."},
            {"role": "user", "content": "Testing key."}
        ]
    )
    print("Success:")
    print(completion.choices[0].message.content)
except Exception as e:
    print("Error:")
    print(e)
