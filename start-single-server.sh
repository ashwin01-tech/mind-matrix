#!/bin/bash

# Mind Matrix - Single Server Quick Start
# This script builds and runs the application on a single server

set -e  # Exit on error

echo "🧠 Mind Matrix - Single Server Mode"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << EOF
PORT=3000
NODE_ENV=production
DATABASE_URL="file:../mindmatrix.db"

# AI Keys (Required)
GROQ_API_KEY=your_groq_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# AI Configuration
AI_BASE_URL="https://api.groq.com/openai/v1"
AI_MODEL="llama-3.3-70b-versatile"
VOICE_ID="21m00Tcm4TlvDq8ikWAM"
AUDIO_MODEL="eleven_monolingual_v1"
EOF
    echo "✅ Created .env file. Please update with your API keys!"
    echo ""
fi

echo "📦 Installing dependencies..."
npm install --quiet

echo ""
echo "📦 Installing client dependencies..."
cd client && npm install --quiet && cd ..

echo ""
echo "🗄️  Setting up database..."
npx prisma generate --silent
npx prisma db push --silent 2>/dev/null || true

echo ""
echo "🔨 Building application..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "🚀 Starting server on http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""
echo "=================================="
echo ""

npm start
