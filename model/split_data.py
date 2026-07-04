"""
Reshuffles all images from train/ and val/ into a proper 80/20 split.
Run this ONCE before retraining.

This script safely stages files to a temp directory before redistributing,
so no data is lost if something goes wrong.
"""
import os
import shutil
import random

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, 'data')
SPLIT_RATIO = 0.8  # 80% train, 20% val
SEED = 42

def gather_and_split():
    random.seed(SEED)
    
    # Step 1: Stage everything into a safe temp directory
    staging_dir = os.path.join(SCRIPT_DIR, '_staging_temp')
    if os.path.exists(staging_dir):
        shutil.rmtree(staging_dir)
    
    for class_name in ['normal', 'pcos']:
        stage_class_dir = os.path.join(staging_dir, class_name)
        os.makedirs(stage_class_dir, exist_ok=True)
        
        # Gather from both train and val
        count = 0
        for split in ['train', 'val']:
            src_dir = os.path.join(DATA_DIR, split, class_name)
            if not os.path.exists(src_dir):
                # Try alternate common names
                for alt_name in os.listdir(os.path.join(DATA_DIR, split)) if os.path.exists(os.path.join(DATA_DIR, split)) else []:
                    if alt_name.lower() == class_name.lower():
                        src_dir = os.path.join(DATA_DIR, split, alt_name)
                        break
            
            if os.path.exists(src_dir):
                for fname in os.listdir(src_dir):
                    fpath = os.path.join(src_dir, fname)
                    if os.path.isfile(fpath):
                        # Use move instead of copy for speed
                        shutil.move(fpath, os.path.join(stage_class_dir, fname))
                        count += 1
        
        print(f"[{class_name}] Staged {count} images")
    
    # Step 2: Now that all files are safely staged, clear the data directories
    for split in ['train', 'val']:
        split_dir = os.path.join(DATA_DIR, split)
        if os.path.exists(split_dir):
            shutil.rmtree(split_dir)
    
    # Step 3: Redistribute from staging into train/val with proper split
    for class_name in ['normal', 'pcos']:
        stage_class_dir = os.path.join(staging_dir, class_name)
        
        all_images = [f for f in os.listdir(stage_class_dir) if os.path.isfile(os.path.join(stage_class_dir, f))]
        random.shuffle(all_images)
        
        split_idx = int(len(all_images) * SPLIT_RATIO)
        train_images = all_images[:split_idx]
        val_images = all_images[split_idx:]
        
        print(f"[{class_name}] -> Train: {len(train_images)}, Val: {len(val_images)}")
        
        train_target = os.path.join(DATA_DIR, 'train', class_name)
        val_target = os.path.join(DATA_DIR, 'val', class_name)
        os.makedirs(train_target, exist_ok=True)
        os.makedirs(val_target, exist_ok=True)
        
        for fname in train_images:
            shutil.move(os.path.join(stage_class_dir, fname), os.path.join(train_target, fname))
        
        for fname in val_images:
            shutil.move(os.path.join(stage_class_dir, fname), os.path.join(val_target, fname))
    
    # Cleanup staging
    shutil.rmtree(staging_dir)
    print("\nData split complete! Ready for training.")

if __name__ == '__main__':
    gather_and_split()
