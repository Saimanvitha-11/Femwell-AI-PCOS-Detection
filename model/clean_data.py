"""
Scans all images in data/ and removes any that PIL cannot open.
Run this ONCE before training to clean up corrupt files.
"""
import os
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, 'data')

removed = 0
scanned = 0

for root, dirs, files in os.walk(DATA_DIR):
    for fname in files:
        fpath = os.path.join(root, fname)
        scanned += 1
        try:
            with Image.open(fpath) as img:
                img.verify()  # Verify it's actually a valid image
        except Exception:
            print(f"  REMOVING corrupt file: {fpath}")
            os.remove(fpath)
            removed += 1

print(f"\nScanned {scanned} files. Removed {removed} corrupt images.")
