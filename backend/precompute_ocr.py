"""Pre-compute OCR text for meme images. Run this once."""
import os
import json
from pathlib import Path
from tqdm import tqdm

BASE_DIR = Path(__file__).parent.parent
DATASET_DIR = BASE_DIR / "meme_folder" / "media"
OCR_CACHE_FILE = Path(__file__).parent / "ocr_texts.json"

def main():
    import easyocr
    
    # Load existing cache if any
    if OCR_CACHE_FILE.exists():
        with open(OCR_CACHE_FILE, 'r') as f:
            ocr_texts = json.load(f)
        print(f"Loaded {len(ocr_texts)} existing OCR results.")
    else:
        ocr_texts = {}
    
    reader = easyocr.Reader(['en'], gpu=False)
    
    image_files = sorted([
        f for f in os.listdir(DATASET_DIR)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ])
    
    # Skip already processed
    remaining = [f for f in image_files if f not in ocr_texts]
    print(f"Total images: {len(image_files)}, Remaining: {len(remaining)}")
    
    for i, fname in enumerate(tqdm(remaining)):
        try:
            img_path = str(DATASET_DIR / fname)
            results = reader.readtext(img_path, detail=0)
            text = ' '.join(results).strip()
            if text:
                ocr_texts[fname] = text.lower()
        except Exception as e:
            continue
        
        # Save every 50 images
        if (i + 1) % 50 == 0:
            with open(OCR_CACHE_FILE, 'w') as f:
                json.dump(ocr_texts, f)
            print(f"  Saved progress: {len(ocr_texts)} texts extracted")
    
    with open(OCR_CACHE_FILE, 'w') as f:
        json.dump(ocr_texts, f)
    
    print(f"\nDone! Extracted text from {len(ocr_texts)} / {len(image_files)} images.")

if __name__ == "__main__":
    main()
