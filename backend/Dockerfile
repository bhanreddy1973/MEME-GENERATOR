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

# Download meme images during build (cached in Docker layer)
RUN mkdir -p /app/meme_data/media && \
    python -c "import gdown; gdown.download_folder('https://drive.google.com/drive/folders/1xz23zJiEdgmGdSVNjHDGj2vcrWLDaz1B', output='/app/meme_data/media', quiet=False)"

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
