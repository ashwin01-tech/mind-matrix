"""
Mind Matrix API - Main FastAPI application
Provides WebSocket-based AI chat with text-to-speech capabilities
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import asyncio
import json
import base64
from datetime import datetime
from typing import Dict, Set

from config import settings, logger
from services import AIService, AIServiceError
from database import init_db


class ConnectionManager:
    """Manages active WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        logger.info("ConnectionManager initialized")
    
    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"New connection established. Total active: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket connection"""
        self.active_connections.discard(websocket)
        logger.info(f"Connection closed. Total active: {len(self.active_connections)}")
    
    async def send_json(self, websocket: WebSocket, data: dict) -> bool:
        """Send JSON data through WebSocket with error handling"""
        try:
            await websocket.send_json(data)
            return True
        except Exception as e:
            logger.error(f"Failed to send JSON: {e}")
            return False
    
    async def send_error(self, websocket: WebSocket, error: str, details: str = "") -> None:
        """Send error message to client"""
        await self.send_json(websocket, {
            "type": "error",
            "error": error,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        })


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Mind Matrix API...")
    
    # Validate settings
    is_valid, errors = settings.validate()
    if not is_valid:
        logger.error("Configuration errors:")
        for error in errors:
            logger.error(f"  - {error}")
        raise RuntimeError("Invalid configuration. Please check your .env file.")
    
    # Initialize database
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Initialize AI service
    try:
        ai_service = AIService()
        app.state.ai_service = ai_service
        logger.info("AI Service initialized successfully")
    except AIServiceError as e:
        logger.error(f"AI Service initialization failed: {e}")
        raise
    
    logger.info("Mind Matrix API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Mind Matrix API...")
    if hasattr(app.state, 'ai_service'):
        logger.info("AI Service cleanup completed")


# Initialize FastAPI app
app = FastAPI(
    title="Mind Matrix API",
    description="AI-powered conversational interface with text-to-speech",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connection manager
manager = ConnectionManager()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Mind Matrix API",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check if AI service is available
        ai_service = app.state.ai_service
        
        return {
            "status": "healthy",
            "services": {
                "api": "operational",
                "ai_service": "operational",
                "database": "operational"
            },
            "active_connections": len(manager.active_connections),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for AI chat with streaming responses and audio
    
    Protocol:
    - Client sends: Plain text messages
    - Server sends: JSON objects with types:
        - "text": AI response text
        - "audio": Base64-encoded audio chunk
        - "audio_end": Signals end of audio stream
        - "error": Error message
        - "ping": Heartbeat message
    """
    await manager.connect(websocket)
    
    chat_history: list = []
    ai_service: AIService = app.state.ai_service
    
    # Heartbeat task
    async def send_heartbeat():
        """Send periodic heartbeat to keep connection alive"""
        try:
            while True:
                await asyncio.sleep(settings.WS_HEARTBEAT_INTERVAL)
                if websocket in manager.active_connections:
                    await manager.send_json(websocket, {"type": "ping"})
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Heartbeat error: {e}")
    
    heartbeat_task = asyncio.create_task(send_heartbeat())
    
    try:
        logger.info("WebSocket chat session started")
        
        # Send welcome message
        await manager.send_json(websocket, {
            "type": "system",
            "content": "Connected to Mind Matrix. How can I help you today?",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        while True:
            # Receive user input
            try:
                data = await websocket.receive_text()
            except Exception as e:
                logger.error(f"Error receiving message: {e}")
                break
            
            if not data or not data.strip():
                await manager.send_error(websocket, "Empty message received")
                continue
            
            user_input = data.strip()
            logger.info(f"Received message: {user_input[:100]}...")
            
            # Validate message length
            if len(user_input) > settings.MAX_MESSAGE_LENGTH:
                await manager.send_error(
                    websocket,
                    "Message too long",
                    f"Maximum length is {settings.MAX_MESSAGE_LENGTH} characters"
                )
                continue
            
            # Store user message
            chat_history.append({"role": "user", "content": user_input})
            
            # Get AI response
            try:
                response_generator = await ai_service.get_grok_response(
                    user_input,
                    chat_history[:-1]
                )
                
                if not response_generator:
                    await manager.send_error(
                        websocket,
                        "AI service unavailable",
                        "Could not generate response. Please try again."
                    )
                    continue
                
                # Stream response chunks
                full_response = ""
                async for chunk in response_generator:
                    if chunk.choices and chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        full_response += content
                
                # Send complete text response
                if full_response:
                    await manager.send_json(websocket, {
                        "type": "text",
                        "content": full_response,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                    chat_history.append({"role": "assistant", "content": full_response})
                    logger.info(f"Sent response: {len(full_response)} characters")
                    
                    # Generate and stream audio
                    try:
                        audio_generator = ai_service.text_to_speech(full_response)
                        audio_chunk_count = 0
                        
                        async for audio_chunk in audio_generator:
                            if audio_chunk:
                                # Encode audio to base64
                                encoded_audio = base64.b64encode(audio_chunk).decode('utf-8')
                                await manager.send_json(websocket, {
                                    "type": "audio",
                                    "content": encoded_audio
                                })
                                audio_chunk_count += 1
                        
                        # Signal end of audio
                        await manager.send_json(websocket, {"type": "audio_end"})
                        logger.info(f"Audio streaming completed: {audio_chunk_count} chunks")
                        
                    except Exception as e:
                        logger.error(f"Audio generation error: {e}", exc_info=True)
                        await manager.send_json(websocket, {
                            "type": "warning",
                            "content": "Audio generation failed, but text response is available"
                        })
                else:
                    await manager.send_error(websocket, "Empty response from AI")
                    
            except Exception as e:
                logger.error(f"Error processing request: {e}", exc_info=True)
                await manager.send_error(
                    websocket,
                    "Processing error",
                    "An error occurred while processing your request"
                )
    
    except WebSocketDisconnect:
        logger.info("Client disconnected normally")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await manager.send_error(websocket, "Connection error", str(e))
        except:
            pass
    finally:
        # Cleanup
        heartbeat_task.cancel()
        manager.disconnect(websocket)
        logger.info(f"WebSocket session ended. Messages: {len(chat_history)}")


if __name__ == "__main__":
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
