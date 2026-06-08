#!/bin/bash

echo "=== MemeGenius Startup ==="

# Download memes from Google Drive (skips if already present)
python download_memes.py || echo "[Entrypoint] Download script had issues, continuing anyway..."

# Start the FastAPI server
echo "=== Starting server ==="
exec uvicorn app:app --host 0.0.0.0 --port 8000
