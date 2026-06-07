FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for easyocr
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code and data
COPY app.py .
COPY precompute_ocr.py .
COPY ocr_texts.json .
COPY text_embeddings.npz .

# Copy meme dataset
COPY ../meme_folder/media /data/media

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
