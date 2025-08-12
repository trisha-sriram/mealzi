#!/bin/bash

# Setup script for Mealzi Recipe Manager
# This script creates a virtual environment and installs all required dependencies

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Setting up Mealzi Recipe Manager..."

# Navigate to backend directory
cd "$SCRIPT_DIR/backend"

# Check if Python 3 is available
if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Error: Python 3 is not installed or not in PATH!"
    echo "Please install Python 3 first:"
    echo "  brew install python3"
    exit 1
fi

echo "🐍 Python 3 found: $(python3 --version)"

# Remove existing virtual environment if it exists
if [ -d "venv" ]; then
    echo "🗑️  Removing existing virtual environment..."
    rm -rf venv
fi

# Create new virtual environment
echo "🔧 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Verify installation
echo "✅ Verifying installation..."
python -c "import py4web; print('py4web installed successfully!')"
python -c "import pydal; print('pydal installed successfully!')"
python -c "import requests; print('requests installed successfully!')"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the server, run:"
echo "  ./start-server.sh"
echo ""
echo "Or manually:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python -m py4web run apps --host 127.0.0.1 --port 8000" 