#!/usr/bin/env fish

# Mind Matrix - Backend Startup Script (Fish Shell)

echo "🚀 Starting Mind Matrix Backend..."

# Check if virtual environment exists
if not test -d "venv"
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
end

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate.fish

# Check if .env exists
if not test -f ".env"
    echo "⚠️  No .env file found!"
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "❗ Please edit .env and add your API keys, then run this script again."
    exit 1
end

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run the server
echo "✅ Starting FastAPI server..."
python main.py
