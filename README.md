# Mind Matrix 🧠

An advanced AI-powered conversational interface with **emotional intelligence**, **memory management**, and **expressive particle visualization**. Features real-time text-to-speech, emotion detection, activity logging, and RAG-based context awareness.

## ✨ Features

- 🤖 **AI-Powered Chat**: Intelligent conversations.
- 🔊 **Expressive Text-to-Speech**: ElevenLabs with emotion-aware voice modulation.
- 🎨 **Hyperspeed Background**: Dynamic 3D visualization.
- 🔄 **Auto-Reconnection**: Robust WebSocket with automatic retry logic.
- 🌓 **Dark Theme**: Professional glassmorphic UI design.
- 🎭 **Emotion Detection**: Real-time sentiment analysis.

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- ElevenLabs API key (optional for voice features)

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd mind-matrix
   npm install
   cd client && npm install && cd ..
   ```

2. **Configure environment**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="file:../mindmatrix.db"
   
   # AI Keys
   GROQ_API_KEY=your_groq_key
   ELEVENLABS_API_KEY=your_elevenlabs_key  # Optional
   
   AI_BASE_URL="https://api.groq.com/openai/v1"
   AI_MODEL="llama-3.3-70b-versatile"
   VOICE_ID="21m00Tcm4TlvDq8ikWAM"
   ```

3. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Running the Application

#### Option 1: Development Mode (Recommended for Development)
Two servers with hot reload:
```bash
npm run dev
```
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:3000 (Express + WebSocket)
- Hot reload enabled for instant updates

#### Option 2: Single Server Mode (Production-like)
One server serving everything:
```bash
npm run dev:single
```
- Everything: http://localhost:3000
- Builds frontend first, then starts server
- Test production behavior locally

#### Option 3: Production Mode
Optimized build for deployment:
```bash
npm run build
npm start
```
- Everything: http://localhost:3000
- Fully optimized and minified
- Ready for deployment

See [SINGLE_SERVER_GUIDE.md](./SINGLE_SERVER_GUIDE.md) for detailed explanation of each mode.

## 🏗️ Architecture

- **Backend**: Node.js + Express + WebSocket (`ws`) + TypeScript
- **Frontend**: React + Vite + Three.js (`@react-three/fiber`)

## 🔧 Troubleshooting

### Common Issues

#### 1. ElevenLabs API 401 Error
**Error:** `Status code: 401` from ElevenLabs

**Solutions:**
- Update your `ELEVENLABS_API_KEY` in `.env` (see [ELEVENLABS_SETUP.md](./ELEVENLABS_SETUP.md))
- Or disable voice in the UI (click volume icon)
- The app works perfectly without voice features

#### 2. WebSocket Connection Failed
**Error:** `Firefox can't establish a connection to ws://localhost:3000/ws/chat`

**Solutions:**
- Wait 5-10 seconds for the server to fully start
- The app has auto-retry logic (up to 5 attempts)
- Check that port 3000 is not in use: `lsof -ti:3000`
- Restart the dev server: `npm run dev`

#### 3. Multiple Three.js Instances Warning
**Warning:** `Multiple instances of Three.js being imported`

**Note:** This is a known issue with `react-force-graph-3d` but doesn't affect functionality. The warning can be safely ignored.

#### 4. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### 5. Database Issues
**Error:** Database connection or Prisma errors

**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Reset database (will delete all data)
npx prisma migrate reset
```

### Getting Help

- Check console logs in browser (F12)
- Check terminal output for backend errors
- Ensure all dependencies are installed: `npm install`
- Clear browser cache and reload
- Try incognito/private browsing mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
