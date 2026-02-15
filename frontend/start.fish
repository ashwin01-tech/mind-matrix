#!/usr/bin/env fish

# Mind Matrix - Frontend Startup Script (Fish Shell)

echo "🚀 Starting Mind Matrix Frontend..."

# Check if node_modules exists
if not test -d "node_modules"
    echo "📦 Installing dependencies..."
    npm install
end

# Start development server
echo "✅ Starting Vite development server..."
npm run dev
