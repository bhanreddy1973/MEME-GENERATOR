#!/bin/bash
# Start the MemeGenius backend
cd "$(dirname "$0")"
source .venv/bin/activate
echo "Starting MemeGenius Backend (CLIP + GAN)..."
echo "First run will download CLIP model (~600MB) and compute embeddings for 2400+ images."
echo ""
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
