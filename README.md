# Mind Matrix 🧠

A modern AI-powered conversational interface with real-time text-to-speech capabilities, featuring a beautiful 3D visualization and robust error handling.

## ✨ Features

- 🤖 **AI-Powered Chat**: Intelligent conversations using Groq's LLaMA model
- 🔊 **Text-to-Speech**: Real-time audio responses using ElevenLabs
- 🎨 **3D Visualization**: Interactive animated sphere that responds to voice
- 🔄 **Auto-Reconnection**: Robust WebSocket connection with automatic retry
- 🎯 **Error Handling**: Comprehensive error handling and user feedback
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌓 **Dark Theme**: Beautiful glassmorphic UI design

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- Groq API key ([Get one here](https://console.groq.com))
- ElevenLabs API key ([Get one here](https://elevenlabs.io))

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   GROK_API_KEY=your_grok_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

5. **Run the backend**
   ```bash
   python main.py
   ```
   
   Backend will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will start on `http://localhost:5173`

## 🏗️ Architecture

### Backend (`/backend`)

```
backend/
├── main.py           # FastAPI application with WebSocket endpoint
├── services.py       # AI service layer (Groq + ElevenLabs)
├── config.py         # Configuration management
├── database.py       # Database setup (SQLite)
├── models.py         # SQLAlchemy models
└── requirements.txt  # Python dependencies
```

**Key Features:**
- FastAPI with WebSocket support for real-time communication
- Streaming AI responses from Groq
- Audio generation with ElevenLabs
- Comprehensive logging and error handling
- Connection management with heartbeat
- Input validation and sanitization

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── App.jsx              # Main application component
│   ├── components/
│   │   └── Sphere.jsx       # 3D animated sphere
│   ├── utils/
│   │   ├── websocket.js     # WebSocket manager
│   │   └── audio.js         # Audio playback manager
│   ├── App.css              # Component styles
│   └── index.css            # Global styles
└── package.json
```

**Key Features:**
- React with hooks for state management
- Three.js for 3D graphics
- WebSocket with auto-reconnection
- HTML5 Audio for MP3 playback
- Framer Motion for animations
- Responsive glassmorphic UI

## 📡 API Documentation

### WebSocket Endpoint

**URL:** `ws://localhost:8000/ws/chat`

**Message Format:**

Client sends plain text:
```
Hello, how are you?
```

Server sends JSON objects:

```json
// Text response
{
  "type": "text",
  "content": "I'm doing well, thank you!",
  "timestamp": "2026-02-15T10:30:00"
}

// Audio chunk
{
  "type": "audio",
  "content": "base64_encoded_mp3_data"
}

// Audio stream end
{
  "type": "audio_end"
}

// Error
{
  "type": "error",
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2026-02-15T10:30:00"
}

// Heartbeat
{
  "type": "ping"
}
```

### REST Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROK_API_KEY` | Groq API key | Required |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Required |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Debug mode | `True` |
| `AI_MODEL` | AI model to use | `llama-3.3-70b-versatile` |
| `AI_TEMPERATURE` | Response creativity | `0.7` |
| `AI_MAX_TOKENS` | Max response length | `2048` |
| `VOICE_ID` | ElevenLabs voice ID | `21m00Tcm4TlvDq8ikWAM` |
| `MAX_MESSAGE_LENGTH` | Max input length | `4000` |
| `LOG_LEVEL` | Logging level | `INFO` |

See `.env.example` for complete list.

## 🎨 UI Features

### Status Indicator
- 🟢 **Connected** - Active connection to server
- 🟡 **Connecting/Reconnecting** - Attempting connection
- 🔴 **Error/Failed** - Connection failed

### Audio Controls
- **Volume Slider** - Adjust audio playback volume
- **Stop Button** - Stop current audio playback
- **Visual Feedback** - Animated sphere responds to speech

### Message Features
- **Typing Indicator** - Shows when AI is thinking
- **Timestamps** - Message time stamps
- **Auto-scroll** - Automatic scroll to latest message
- **Error Banner** - Clear error notifications

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🐛 Troubleshooting

### Audio Not Playing
- Check browser console for errors
- Ensure ElevenLabs API key is valid
- Try clicking on the page (some browsers require user interaction)
- Check volume slider and system audio

### WebSocket Connection Failed
- Verify backend is running on port 8000
- Check firewall settings
- Ensure CORS settings allow your frontend origin
- Check backend logs for errors

### API Errors
- Verify API keys are correct in `.env`
- Check API rate limits and quotas
- Review backend logs (`LOG_LEVEL=DEBUG`)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- **Groq** - Fast AI inference
- **ElevenLabs** - High-quality text-to-speech
- **Three.js** - 3D graphics
- **FastAPI** - Modern web framework
- **React** - UI library

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using modern web technologies**
