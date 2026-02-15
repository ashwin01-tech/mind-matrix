# Mind Matrix Backend

FastAPI backend with WebSocket support for AI-powered chat with text-to-speech.

## Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Run server:
   ```bash
   python main.py
   ```

## Project Structure

- `main.py` - FastAPI app and WebSocket endpoint
- `services.py` - AI service layer (Groq + ElevenLabs)
- `config.py` - Configuration and settings
- `database.py` - Database initialization
- `models.py` - SQLAlchemy data models

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `WS /ws/chat` - WebSocket chat endpoint

## Features

- ✅ Streaming AI responses
- ✅ Real-time audio generation
- ✅ Comprehensive error handling
- ✅ Request validation
- ✅ Connection management
- ✅ Detailed logging
- ✅ Auto-reconnection support
