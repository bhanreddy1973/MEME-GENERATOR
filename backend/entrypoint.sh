#!/bin/bash

echo "=== MemeGenius Startup ==="

# Check if memes exist (should be baked into image from build)
MEME_COUNT=$(find /app/meme_data/media -type f 2>/dev/null | wc -l)
echo "[Startup] Meme images available: $MEME_COUNT"

# If somehow missing, try downloading
if [ "$MEME_COUNT" -lt "10" ]; then
    echo "[Startup] Few/no images found, attempting download..."
    python download_memes.py || echo "[Startup] Download had issues, continuing..."
fi

# Start the FastAPI server
echo "=== Starting server ==="
exec uvicorn app:app --host 0.0.0.0 --port 8000
