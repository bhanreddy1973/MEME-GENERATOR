FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir sentence-transformers gdown

# Pre-download the ML model during build
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Download meme images during build (tolerate partial failures from rate limiting)
RUN mkdir -p /app/meme_data/media && \
    python -c "\
import gdown, sys;\
try:\
    gdown.download_folder('https://drive.google.com/drive/folders/1xz23zJiEdgmGdSVNjHDGj2vcrWLDaz1B', output='/app/meme_data/media', quiet=False)\
except Exception as e:\
    print(f'[Build] Partial download (rate limited): {e}')\
import os;\
count = len([f for f in os.listdir('/app/meme_data/media') if os.path.isfile(os.path.join('/app/meme_data/media', f))]);\
print(f'[Build] Downloaded {count} meme images');\
" || true

# Copy backend code
COPY app.py .
COPY precompute_ocr.py .
COPY ocr_texts.json .
COPY text_embeddings.npz .
COPY download_memes.py .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8000

CMD ["./entrypoint.sh"]
