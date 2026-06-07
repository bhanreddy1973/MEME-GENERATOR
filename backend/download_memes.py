"""
Download meme images from Google Drive on first startup.
Skips download if images already exist (persistent disk).
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
        result = subprocess.run(
            [
                sys.executable, "-m", "gdown",
                f"https://drive.google.com/drive/folders/{GDRIVE_FOLDER_ID}",
                "-O", str(MEME_DIR),
                "--folder",
                "--remaining-ok",
            ],
            capture_output=True,
            text=True,
            timeout=600,  # 10 min timeout
        )
        print(result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout)
        if result.returncode != 0:
            print(f"[Download] Warning: {result.stderr[-1000:]}")

        count = len(list(MEME_DIR.glob("*")))
        print(f"[Download] Done! {count} files in {MEME_DIR}")
        return count > 0

    except subprocess.TimeoutExpired:
        print("[Download] Timeout! Partial download may exist.")
        return MEME_DIR.exists() and any(MEME_DIR.iterdir())
    except Exception as e:
        print(f"[Download] Error: {e}")
        return False


if __name__ == "__main__":
    success = download_memes()
    sys.exit(0 if success else 1)
