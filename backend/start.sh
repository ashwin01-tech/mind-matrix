#!/bin/bash

# Mind Matrix - Backend Startup Script

echo "🚀 Starting Mind Matrix Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "❗ Please edit .env and add your API keys, then run this script again."
    exit 1
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run the server
echo "✅ Starting FastAPI server..."
python main.py
