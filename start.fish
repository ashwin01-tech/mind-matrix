#!/usr/bin/env fish

# Mind Matrix - Quick Start Script
# This script will help you set up and run the project

set -g RED '\033[0;31m'
set -g GREEN '\033[0;32m'
set -g YELLOW '\033[1;33m'
set -g BLUE '\033[0;34m'
set -g NC '\033[0m' # No Color

echo -e "$BLUE"
echo "╔═══════════════════════════════════════╗"
echo "║                                       ║"
echo "║         Mind Matrix Setup             ║"
echo "║    AI Chat with Text-to-Speech        ║"
echo "║                                       ║"
echo "╚═══════════════════════════════════════╝"
echo -e "$NC"

# Check if backend .env exists
if not test -f backend/.env
    echo -e "$YELLOW⚠️  Backend .env file not found!$NC"
    echo ""
    echo "Please follow these steps:"
    echo ""
    echo "1. Get your API keys:"
    echo "   - Groq: https://console.groq.com"
    echo "   - ElevenLabs: https://elevenlabs.io"
    echo ""
    echo "2. Create backend/.env file:"
    echo "   cd backend"
    echo "   cp .env.example .env"
    echo ""
    echo "3. Edit backend/.env and add your API keys"
    echo ""
    echo -e "$RED❌ Setup incomplete. Exiting...$NC"
    exit 1
end

echo -e "$GREEN✅ Configuration found!$NC"
echo ""

# Ask user what to start
echo "What would you like to do?"
echo ""
echo "1) Start Backend only"
echo "2) Start Frontend only"
echo "3) Start Both (recommended)"
echo "4) Exit"
echo ""
read -P "Enter choice (1-4): " choice

switch $choice
    case 1
        echo ""
        echo -e "$BLUE🚀 Starting Backend...$NC"
        cd backend && ./start.fish
    case 2
        echo ""
        echo -e "$BLUE🚀 Starting Frontend...$NC"
        cd frontend && ./start.fish
    case 3
        echo ""
        echo -e "$BLUE🚀 Starting Backend and Frontend...$NC"
        echo ""
        echo "Opening 2 terminal tabs..."
        echo ""
        echo "Tab 1: Backend (http://localhost:8000)"
        echo "Tab 2: Frontend (http://localhost:5173)"
        echo ""
        
        # Start backend in background
        cd backend
        ./start.fish &
        set backend_pid $last_pid
        
        sleep 3
        
        # Start frontend
        cd ../frontend
        ./start.fish
        
    case 4
        echo -e "$GREEN👋 Goodbye!$NC"
        exit 0
    case '*'
        echo -e "$RED❌ Invalid choice. Exiting...$NC"
        exit 1
end
