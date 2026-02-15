import os
import httpx
from dotenv import load_dotenv
from openai import AsyncOpenAI
from elevenlabs.client import ElevenLabs

load_dotenv()

GROK_API_KEY = os.getenv("GROK_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

class AIService:
    def __init__(self):
        self.grok_client = AsyncOpenAI(
            api_key=GROK_API_KEY,
            base_url="https://api.x.ai/v1",
        )
        self.elevenlabs_client = ElevenLabs(
            api_key=ELEVENLABS_API_KEY
        )

    async def get_grok_response(self, user_input: str, context: list):
        try:
            # Construct messages from context + user input
            messages = [{"role": "system", "content": "You are a helpful and intelligent AI assistant named Mind Matrix."}]
            for msg in context:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
            messages.append({"role": "user", "content": user_input})

            completion = await self.grok_client.chat.completions.create(
                model="grok-2-latest",
                messages=messages,
                stream=True 
            )
            
            # Since we want to stream the response back, we will return the generator
            return completion

        except Exception as e:
            print(f"Error getting Grok response: {e}")
            return None

    async def text_to_speech(self, text: str):
        try:
            audio_generator = self.elevenlabs_client.generate(
                text=text,
                voice="Rachel", # Default voice
                model="eleven_multilingual_v2",
                stream=True
            )
            return audio_generator
        except Exception as e:
            print(f"Error generating speech: {e}")
            return None
