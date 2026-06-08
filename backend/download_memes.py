"""
Download meme images from Google Drive on first startup.
Skips download if images already exist.
"""
import os
import subprocess
import sys
from pathlib import Path

GDRIVE_FOLDER_ID = "1xz23zJiEdgmGdSVNjHDGj2vcrWLDaz1B"
MEME_DIR = Path("/app/meme_data/media")


def download_memes():
    """Download meme images from Google Drive if not already present."""
    if MEME_DIR.exists() and any(MEME_DIR.iterdir()):
        count = len(list(MEME_DIR.glob("*")))
        print(f"[Download] Meme folder already has {count} files. Skipping download.")
        return True

    print(f"[Download] Downloading memes from Google Drive folder: {GDRIVE_FOLDER_ID}")
    MEME_DIR.mkdir(parents=True, exist_ok=True)

    try:
        import gdown
        url = f"https://drive.google.com/drive/folders/{GDRIVE_FOLDER_ID}"
        gdown.download_folder(url, output=str(MEME_DIR), quiet=False)

        count = len(list(MEME_DIR.glob("*")))
        print(f"[Download] Done! {count} files in {MEME_DIR}")
        return count > 0

    except Exception as e:
        print(f"[Download] Error: {e}")
        # Don't fail the whole app if download fails — server can still start
        return False


if __name__ == "__main__":
    success = download_memes()
    if not success:
        print("[Download] Warning: No memes downloaded. Server will start with empty dataset.")
    # Always exit 0 so the server starts regardless
    sys.exit(0)
