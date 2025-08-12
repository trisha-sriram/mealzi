# Installation Guide for Mealzi Recipe Manager

This guide will help you set up and run the Mealzi Recipe Manager on your local machine.

## Prerequisites

- **Python 3.8 or higher** (Python 3.13 recommended)
- **Git** (to clone the repository)
- **macOS, Linux, or Windows** (with bash shell)

## Quick Start (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mealzi
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```
   This will:
   - Create a Python virtual environment
   - Install all required dependencies
   - Verify the installation

3. **Start the server:**
   ```bash
   ./start-server.sh
   ```
   This will:
   - Start the py4web server
   - Open your browser automatically
   - Show helpful URLs

4. **Access the application:**
   - Frontend: http://127.0.0.1:8000/CustomRecipeManager/static/
   - API: http://127.0.0.1:8000/CustomRecipeManager/api/

## Manual Installation

If the quick start doesn't work, follow these manual steps:

### Step 1: Install Python Dependencies

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Start the Server

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate

# Start the server
python -m py4web run apps --host 127.0.0.1 --port 8000
```

## Troubleshooting

### Common Issues

1. **"Permission denied" when running scripts:**
   ```bash
   chmod +x setup.sh start-server.sh stop-server.sh
   ```

2. **"Python not found" error:**
   - Install Python 3.8+ from python.org or use your system's package manager
   - On macOS: `brew install python3`
   - On Ubuntu: `sudo apt install python3 python3-venv`

3. **"pip install" fails with "externally-managed-environment":**
   - This is expected! The setup script creates a virtual environment to avoid this issue
   - Always use the virtual environment: `source venv/bin/activate`

4. **Port 8000 already in use:**
   ```bash
   # Stop any existing server
   ./stop-server.sh
   
   # Or manually kill the process
   lsof -ti:8000 | xargs kill -9
   ```

5. **Virtual environment not found:**
   ```bash
   # Re-run the setup
   ./setup.sh
   ```

### Server Management

- **Start server:** `./start-server.sh`
- **Stop server:** `./stop-server.sh`
- **Check if running:** `lsof -i :8000`
- **View logs:** The server shows logs in the terminal where it's running

### Development

- **Edit code:** The server auto-reloads when you make changes
- **Database:** Located in `backend/apps/CustomRecipeManager/databases/`
- **Static files:** Located in `backend/apps/CustomRecipeManager/static/`

## System Requirements

- **Minimum:** 2GB RAM, 1GB free disk space
- **Recommended:** 4GB RAM, 2GB free disk space
- **Network:** Internet connection for initial setup (to download dependencies)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure you're using Python 3.8+
3. Try running the setup script again
4. Check that all scripts are executable: `ls -la *.sh` 