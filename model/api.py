import io
import torch
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from model import get_model
from dataset import get_transforms

app = FastAPI(title="FemWell PCOS Ultrasound Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASS_NAMES = ["normal", "pcos"]
MODEL_PATH = "best_model.pth"

# Load model once at startup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = get_model(num_classes=len(CLASS_NAMES))
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model = model.to(device)
model.eval()

transform = get_transforms(is_training=False)


@app.get("/")
def health():
    return {"status": "ok", "model": "ResNet-50 PCOS Classifier"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accepts an ultrasound image and returns PCOS prediction.
    """
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted_idx = torch.max(probabilities, 0)

    prediction = CLASS_NAMES[predicted_idx.item()]
    probs = {cls: round(probabilities[i].item() * 100, 2) for i, cls in enumerate(CLASS_NAMES)}

    return {
        "prediction": prediction,
        "confidence": round(confidence.item() * 100, 2),
        "probabilities": probs,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
