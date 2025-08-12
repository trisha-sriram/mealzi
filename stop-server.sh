#!/bin/bash

# Stop Mealzi Recipe Manager Server
# This script stops the py4web server

echo "🛑 Stopping Mealzi Recipe Manager..."

# Find and kill py4web processes
PY4WEB_PIDS=$(ps aux | grep "py4web run apps" | grep -v grep | awk '{print $2}')

if [ -z "$PY4WEB_PIDS" ]; then
    echo "ℹ️  No py4web server processes found running."
else
    echo "🔍 Found py4web processes: $PY4WEB_PIDS"
    echo "🔄 Stopping py4web server..."
    
    for PID in $PY4WEB_PIDS; do
        echo "   Stopping process $PID..."
        kill $PID
    done
    
    # Wait a moment for processes to terminate
    sleep 2
    
    # Check if any processes are still running
    REMAINING_PIDS=$(ps aux | grep "py4web run apps" | grep -v grep | awk '{print $2}')
    if [ -n "$REMAINING_PIDS" ]; then
        echo "⚠️  Some processes still running, force killing..."
        for PID in $REMAINING_PIDS; do
            kill -9 $PID
        done
    fi
    
    echo "✅ Server stopped successfully!"
fi

# Check if port 8000 is still in use
if lsof -i :8000 >/dev/null 2>&1; then
    echo "⚠️  Port 8000 is still in use. You may need to manually kill the process."
else
    echo "✅ Port 8000 is now free."
fi 