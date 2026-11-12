import sys
sys.path.append('.')
from pathlib import Path
from PIL import Image
import torch
import torchvision.transforms as transforms
from backend.app.services.pet_classifier import predict_pet
import onnxruntime as ort
import json

test_imgs = [
    'backend/meobatu.jpg',
    'assets/images/onboarding/slide-1-scan.jpg',
    'assets/images/onboarding/slide-2-nutrition.jpg',
    'assets/images/onboarding/slide-3-care.jpg',
]

print("=================================================================")
print("KIỂM TRA ĐỐI CHIẾU MÔ HÌNH: 2-STAGE HIERARCHICAL vs 37-CLASS ONNX")
print("=================================================================")

# Load 37-class ONNX
s_37 = ort.InferenceSession('models_ondevice/onnx/pet_37class.onnx')
with open('models/label_mappings/efficientnet_b0_37class_mapping.json') as f:
    mapping_37 = json.load(f)['classes']

# Standard ImageNet transform (224x224)
eval_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

for img_path in test_imgs:
    p = Path(img_path)
    if not p.is_file():
        continue
    img = Image.open(p).convert('RGB')

    print(f"\n--- ẢNH: {img_path} ({img.size}) ---")

    # 1. Chạy mô hình 2-Stage PyTorch
    res_2stage = predict_pet(img)
    print(f"[Mô hình 2-Stage]:")
    print(f"  Loài:  {res_2stage['species_vi']} ({res_2stage['species']}) - {res_2stage['species_confidence_percent']}%")
    print(f"  Giống: {res_2stage['breed_vi']} ({res_2stage['breed']}) - {res_2stage['breed_confidence_percent']}%")
    print(f"  Top 3 giống: {[b['label_vi'] + ': ' + str(b['confidence_percent']) + '%' for b in res_2stage['breed_top3']]}")

    # 2. Chạy mô hình 37-Class ONNX
    tensor = eval_transform(img).unsqueeze(0).numpy()
    probs = s_37.run(['probabilities'], {'input_image': tensor})[0][0]
    top_indices = probs.argsort()[-3:][::-1]
    print(f"[Mô hình 37-Class ONNX]:")
    for idx in top_indices:
        item = mapping_37[str(idx)]
        print(f"  * {item['breed_name']} ({item['species']}): {probs[idx]*100:.2f}%")

