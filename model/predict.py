import sys
import torch
from PIL import Image
from dataset import get_transforms
from model import get_model

MODEL_PATH = 'best_model.pth'

# We assume standard 2 classes if trained on the dataset
CLASS_NAMES = ['normal', 'pcos']

def predict(image_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    try:
        image = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Error loading image: {e}")
        return

    # Use the validation transforms (no random flips)
    transform = get_transforms(is_training=False)
    input_tensor = transform(image).unsqueeze(0).to(device)

    model = get_model(num_classes=len(CLASS_NAMES))
    
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    except FileNotFoundError:
        print(f"Model file {MODEL_PATH} not found. Please train the model first.")
        return

    model = model.to(device)
    model.eval()

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        
        confidence, predicted_idx = torch.max(probabilities, 0)
        predicted_class = CLASS_NAMES[predicted_idx.item()]
        
        print("\n--- Prediction Results ---")
        print(f"Image: {image_path}")
        print(f"Prediction: {predicted_class.upper()}")
        print(f"Confidence: {confidence.item() * 100:.2f}%\n")
        
        print("Detailed Probabilities:")
        for i, cls in enumerate(CLASS_NAMES):
            print(f"  {cls}: {probabilities[i].item() * 100:.2f}%")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_image>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    predict(image_path)
