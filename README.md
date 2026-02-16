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
- ElevenLabs API key

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   ELEVENLABS_API_KEY=your_key_here
   ```

3. **Start Development Server**
   This command starts both the Backend (Port 3000) and Frontend (Port 5173) concurrently.

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) to view the app.

## 🏗️ Architecture

- **Backend**: Node.js + Express + WebSocket (`ws`) + TypeScript
- **Frontend**: React + Vite + Three.js (`@react-three/fiber`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
