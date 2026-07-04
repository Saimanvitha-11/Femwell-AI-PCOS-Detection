import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
from tqdm import tqdm
from dataset import get_dataloaders
from model import get_model

# Hyperparameters
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, 'data')
BATCH_SIZE = 32

# Phase 1: Train only the classification head (base frozen)
PHASE1_EPOCHS = 10
PHASE1_LR = 1e-3

# Phase 2: Fine-tune deeper layers + head together
PHASE2_EPOCHS = 20
PHASE2_LR = 1e-5

def train_one_epoch(model, loader, criterion, optimizer, device, desc="Training"):
    model.train()
    running_loss = 0.0
    running_corrects = 0

    bar = tqdm(loader, desc=desc)
    for inputs, labels in bar:
        inputs = inputs.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        _, preds = torch.max(outputs, 1)

        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        running_corrects += torch.sum(preds == labels.data)
        bar.set_postfix(loss=loss.item())

    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = running_corrects.double() / len(loader.dataset)
    return epoch_loss, epoch_acc


def validate(model, loader, criterion, device):
    model.eval()
    val_loss = 0.0
    val_corrects = 0

    bar = tqdm(loader, desc="Validation")
    with torch.no_grad():
        for inputs, labels in bar:
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            loss = criterion(outputs, labels)
            _, preds = torch.max(outputs, 1)

            val_loss += loss.item() * inputs.size(0)
            val_corrects += torch.sum(preds == labels.data)

    epoch_loss = val_loss / len(loader.dataset)
    epoch_acc = val_corrects.double() / len(loader.dataset)
    return epoch_loss, epoch_acc


def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    train_loader, val_loader, class_names = get_dataloaders(DATA_DIR, batch_size=BATCH_SIZE)
    print(f"Detected classes: {class_names}")
    print(f"Training samples: {len(train_loader.dataset)}, Validation samples: {len(val_loader.dataset)}")

    # Use label smoothing to prevent overconfident predictions
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    best_val_acc = 0.0

    # ==================== PHASE 1: Train Head Only ====================
    print("\n" + "=" * 60)
    print("PHASE 1: Training classification head (base layers frozen)")
    print("=" * 60)

    model = get_model(num_classes=len(class_names), freeze_base=True)
    model = model.to(device)

    # Only optimize parameters that require gradients (the head)
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=PHASE1_LR, weight_decay=1e-4
    )
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=5, T_mult=1)

    for epoch in range(PHASE1_EPOCHS):
        print(f"\n[Phase 1] Epoch {epoch + 1}/{PHASE1_EPOCHS}")
        print("-" * 30)

        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        print(f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f}")

        val_loss, val_acc = validate(model, val_loader, criterion, device)
        print(f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")

        scheduler.step()

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), "best_model_phase1.pth")
            print(f"--> Saved Phase 1 best model with accuracy: {best_val_acc:.4f}")

    print(f"\nPhase 1 Complete! Best Val Accuracy: {best_val_acc:.4f}")

    # ==================== PHASE 2: Fine-tune Deeper Layers ====================
    print("\n" + "=" * 60)
    print("PHASE 2: Fine-tuning layer3 + layer4 + head (progressive unfreezing)")
    print("=" * 60)

    # Load a fresh model with deeper layers unfrozen
    model_ft = get_model(num_classes=len(class_names), freeze_base=False)
    model_ft = model_ft.to(device)

    # Load the best Phase 1 weights into this new model
    model_ft.load_state_dict(torch.load("best_model_phase1.pth", map_location=device))
    
    # Now unfreeze layer3 and layer4
    for param in model_ft.layer3.parameters():
        param.requires_grad = True
    for param in model_ft.layer4.parameters():
        param.requires_grad = True

    # Use different learning rates: very small for base layers, larger for head
    optimizer_ft = optim.AdamW([
        {'params': model_ft.layer3.parameters(), 'lr': PHASE2_LR},
        {'params': model_ft.layer4.parameters(), 'lr': PHASE2_LR * 2},
        {'params': model_ft.fc.parameters(), 'lr': PHASE2_LR * 10},
    ], weight_decay=1e-3)

    scheduler_ft = CosineAnnealingWarmRestarts(optimizer_ft, T_0=5, T_mult=2)

    for epoch in range(PHASE2_EPOCHS):
        print(f"\n[Phase 2] Epoch {epoch + 1}/{PHASE2_EPOCHS}")
        print("-" * 30)

        train_loss, train_acc = train_one_epoch(model_ft, train_loader, criterion, optimizer_ft, device)
        print(f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f}")

        val_loss, val_acc = validate(model_ft, val_loader, criterion, device)
        print(f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")

        scheduler_ft.step()

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model_ft.state_dict(), "best_model.pth")
            print(f"--> Saved Phase 2 best model with accuracy: {best_val_acc:.4f}")

    print(f"\n{'=' * 60}")
    print(f"TRAINING COMPLETE! Best Overall Validation Accuracy: {best_val_acc:.4f}")
    print(f"Final model saved as 'best_model.pth'")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    train()
