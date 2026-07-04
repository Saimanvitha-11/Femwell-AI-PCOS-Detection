import os
import torch
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
from dataset import get_dataloaders
from model import get_model

DATA_DIR = './data'
BATCH_SIZE = 32
MODEL_PATH = 'best_model.pth'

def test():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Testing on device: {device}")
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model weights not found at {MODEL_PATH}. Please run train.py first.")

    _, val_loader, class_names = get_dataloaders(DATA_DIR, batch_size=BATCH_SIZE)
    
    model = get_model(num_classes=len(class_names))
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []

    print("Running predictions on validation set...")
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    print("\n" + "="*40)
    print("CLASSIFICATION REPORT")
    print("="*40)
    print(classification_report(all_labels, all_preds, target_names=class_names))

    # Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.title('Confusion Matrix')
    
    # Save the plot
    cm_path = 'confusion_matrix.png'
    plt.savefig(cm_path)
    print(f"Confusion matrix plot saved to {cm_path}")
    print("="*40)

if __name__ == '__main__':
    test()
