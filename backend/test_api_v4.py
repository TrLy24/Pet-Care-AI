import sys
sys.stdout.reconfigure(encoding='utf-8')

import base64
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== 1. TEST /health & / ===")
r_home = client.get("/")
assert r_home.status_code == 200
print("Home:", r_home.json())

r_health = client.get("/health")
assert r_health.status_code == 200
print("Health:", r_health.json())

print("\n=== 2. TEST /pet/predict-base64 với dog.jpg ===")
with open("dog.jpg", "rb") as f:
    b64_dog = base64.b64encode(f.read()).decode("utf-8")

r_predict = client.post("/pet/predict-base64", json={"image_base64": b64_dog})
print("HTTP status:", r_predict.status_code)
assert r_predict.status_code == 200
res = r_predict.json()
pred = res["prediction"]
print("Loài nhận diện:", pred["species_vi"], f"({pred['species_confidence_percent']}%)")
print("Giống nhận diện:", pred["breed_vi"], f"({pred['breed_confidence_percent']}%)")
print("Top 3 giống:", [b["label_vi"] for b in pred["breed_top3"]])

print("\n=== 3. TEST /pet/predict với meo.jpg (UploadFile) ===")
with open("meo.jpg", "rb") as f:
    files = {"file": ("meo.jpg", f, "image/jpeg")}
    r_file = client.post("/pet/predict", files=files)

print("HTTP status:", r_file.status_code)
assert r_file.status_code == 200
res_file = r_file.json()
pred_file = res_file["prediction"]
print("Loài nhận diện:", pred_file["species_vi"], f"({pred_file['species_confidence_percent']}%)")
print("Giống nhận diện:", pred_file["breed_vi"], f"({pred_file['breed_confidence_percent']}%)")
print("Top 3 giống:", [b["label_vi"] for b in pred_file["breed_top3"]])

print("\n=== TẤT CẢ TEST API FASTAPI HOÀN TOÀN THÀNH CÔNG! ===")

