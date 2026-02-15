#!/bin/bash

# Mind Matrix - Frontend Startup Script

echo "🚀 Starting Mind Matrix Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
echo "✅ Starting Vite development server..."
npm run dev
