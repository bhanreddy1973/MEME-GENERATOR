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

# Copy backend code
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Pre-download the model during build so startup is faster
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Create meme data directory
RUN mkdir -p /app/meme_data/media

EXPOSE 8000

CMD ["./entrypoint.sh"]
