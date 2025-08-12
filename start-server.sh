#!/bin/bash

# Start Mealzi Recipe Manager Server
# This script starts the py4web server and opens the browser to the correct URL

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Mealzi Recipe Manager..."

# Navigate to backend directory
cd "$SCRIPT_DIR/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Error: Virtual environment not found!"
    echo "Please run the setup script first:"
    echo "  cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Use python from virtual environment
PYTHON_CMD="python"

echo "🐍 Using Python from virtual environment: $PYTHON_CMD"

# Start py4web server in the background
echo "📡 Starting py4web server on http://127.0.0.1:8000..."
$PYTHON_CMD -m py4web run apps --host 127.0.0.1 --port 8000 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server actually started
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Error: Server failed to start!"
    echo "Please check if py4web is installed correctly:"
    echo "  $PYTHON_CMD -m pip install py4web"
    exit 1
fi

# Open browser to the correct URL
echo "🌐 Opening browser to http://127.0.0.1:8000/CustomRecipeManager/static/"
if command -v open >/dev/null 2>&1; then
    # macOS
    open "http://127.0.0.1:8000/CustomRecipeManager/static/"
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "http://127.0.0.1:8000/CustomRecipeManager/static/"
elif command -v start >/dev/null 2>&1; then
    # Windows
    start "http://127.0.0.1:8000/CustomRecipeManager/static/"
else
    echo "📋 Please open your browser to: http://127.0.0.1:8000/CustomRecipeManager/static/"
fi

echo "✅ Server started successfully!"
echo "📍 Frontend: http://127.0.0.1:8000/CustomRecipeManager/static/"
echo "📍 API: http://127.0.0.1:8000/CustomRecipeManager/api/"
echo "📍 Root redirect: http://127.0.0.1:8000/ → /CustomRecipeManager/static/"
echo ""
echo "To stop the server, press Ctrl+C or run: kill $SERVER_PID"

# Wait for server process (this keeps the script running)
wait $SERVER_PID 