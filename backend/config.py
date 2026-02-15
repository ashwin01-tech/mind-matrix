"""
Configuration management for Mind Matrix backend
"""
import os
from typing import Optional
from dotenv import load_dotenv
import logging

load_dotenv()

class Settings:
    """Application settings and configuration"""
    
    # API Keys
    GROK_API_KEY: Optional[str] = os.getenv("GROK_API_KEY")
    ELEVENLABS_API_KEY: Optional[str] = os.getenv("ELEVENLABS_API_KEY")
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mindmatrix.db")
    
    # AI Model Configuration
    AI_MODEL: str = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", "0.7"))
    AI_MAX_TOKENS: int = int(os.getenv("AI_MAX_TOKENS", "2048"))
    
    # Audio Configuration
    VOICE_ID: str = os.getenv("VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel
    AUDIO_MODEL: str = os.getenv("AUDIO_MODEL", "eleven_multilingual_v2")
    AUDIO_FORMAT: str = os.getenv("AUDIO_FORMAT", "mp3_44100_128")
    
    # WebSocket Configuration
    WS_HEARTBEAT_INTERVAL: int = int(os.getenv("WS_HEARTBEAT_INTERVAL", "30"))
    WS_MESSAGE_QUEUE_SIZE: int = int(os.getenv("WS_MESSAGE_QUEUE_SIZE", "100"))
    
    # Rate Limiting
    MAX_MESSAGE_LENGTH: int = int(os.getenv("MAX_MESSAGE_LENGTH", "4000"))
    MAX_HISTORY_LENGTH: int = int(os.getenv("MAX_HISTORY_LENGTH", "50"))
    
    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    def validate(self) -> tuple[bool, list[str]]:
        """Validate required settings"""
        errors = []
        
        if not self.GROK_API_KEY:
            errors.append("GROK_API_KEY is not set in environment variables")
        
        if not self.ELEVENLABS_API_KEY:
            errors.append("ELEVENLABS_API_KEY is not set in environment variables")
        
        return len(errors) == 0, errors

# Global settings instance
settings = Settings()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger("mind-matrix")
