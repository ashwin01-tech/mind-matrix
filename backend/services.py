"""
AI Service layer for Mind Matrix
Handles AI model interactions and text-to-speech generation
"""
import asyncio
from typing import Optional, AsyncGenerator, List, Dict
from openai import AsyncOpenAI, OpenAIError
from elevenlabs.client import ElevenLabs
from elevenlabs.core.api_error import ApiError as ElevenLabsError
from config import settings, logger


class AIServiceError(Exception):
    """Base exception for AI Service errors"""
    pass


class AIService:
    """Service for AI chat completions and text-to-speech"""
    
    def __init__(self):
        """Initialize AI service clients with configuration"""
        try:
            if not settings.GROK_API_KEY:
                raise AIServiceError("GROK_API_KEY not configured")
            if not settings.ELEVENLABS_API_KEY:
                raise AIServiceError("ELEVENLABS_API_KEY not configured")
            
            self.grok_client = AsyncOpenAI(
                api_key=settings.GROK_API_KEY,
                base_url=settings.AI_BASE_URL,
                timeout=60.0,
                max_retries=2
            )
            
            self.elevenlabs_client = ElevenLabs(
                api_key=settings.ELEVENLABS_API_KEY
            )
            
            logger.info("AI Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI Service: {e}")
            raise AIServiceError(f"AI Service initialization failed: {e}")

    def _sanitize_input(self, text: str) -> str:
        """Sanitize and validate user input"""
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        text = text.strip()
        
        if len(text) > settings.MAX_MESSAGE_LENGTH:
            logger.warning(f"Input truncated from {len(text)} to {settings.MAX_MESSAGE_LENGTH} characters")
            text = text[:settings.MAX_MESSAGE_LENGTH]
        
        return text

    def _build_messages(self, user_input: str, context: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Build message list with system prompt and context"""
        messages = [{
            "role": "system",
            "content": (
                "You are Mind Matrix, an advanced AI assistant with empathetic intelligence. "
                "Provide thoughtful, helpful, and accurate responses. Be conversational yet professional. "
                "Keep responses concise but complete. If you're unsure, acknowledge it honestly."
            )
        }]
        
        # Add context history (limited)
        context_to_add = context[-settings.MAX_HISTORY_LENGTH:] if len(context) > settings.MAX_HISTORY_LENGTH else context
        messages.extend(context_to_add)
        
        messages.append({"role": "user", "content": user_input})
        
        return messages

    async def get_grok_response(
        self,
        user_input: str,
        context: Optional[List[Dict[str, str]]] = None
    ) -> Optional[AsyncGenerator]:
        """
        Get streaming response from Grok AI model
        
        Args:
            user_input: User's message
            context: Previous conversation history
            
        Returns:
            Async generator yielding response chunks, or None on error
        """
        if context is None:
            context = []
        
        try:
            # Sanitize and validate input
            user_input = self._sanitize_input(user_input)
            
            # Build message list
            messages = self._build_messages(user_input, context)
            
            logger.info(f"Requesting AI completion (input length: {len(user_input)})")
            
            # Create streaming completion
            completion = await self.grok_client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=messages,
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.AI_MAX_TOKENS,
                stream=True
            )
            
            return completion
            
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {e}", exc_info=True)
            return None
        except ValueError as e:
            logger.error(f"Input validation error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in get_grok_response: {e}", exc_info=True)
            return None

    async def text_to_speech(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Convert text to speech using ElevenLabs
        
        Args:
            text: Text to convert to speech
            
        Yields:
            Audio data chunks as bytes
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for TTS, skipping")
            return
        
        try:
            # Sanitize text for TTS
            text = text.strip()
            
            if len(text) > 5000:  # ElevenLabs limit
                logger.warning(f"Text too long for TTS ({len(text)} chars), truncating")
                text = text[:4900] + "..."
            
            logger.info(f"Generating TTS for {len(text)} characters")
            
            # Generate audio stream
            audio_stream = self.elevenlabs_client.text_to_speech.convert(
                text=text,
                voice_id=settings.VOICE_ID,
                model_id=settings.AUDIO_MODEL,
                output_format=settings.AUDIO_FORMAT,
            )
            
            chunk_count = 0
            for chunk in audio_stream:
                if chunk:
                    chunk_count += 1
                    yield chunk
            
            logger.info(f"TTS completed, generated {chunk_count} audio chunks")
            
        except ElevenLabsError as e:
            logger.error(f"ElevenLabs API error: {e}", exc_info=True)
        except Exception as e:
            logger.error(f"Unexpected error in text_to_speech: {e}", exc_info=True)
