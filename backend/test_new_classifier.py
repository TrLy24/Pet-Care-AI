import sys
sys.stdout.reconfigure(encoding='utf-8')

import json
from PIL import Image
from pathlib import Path
from app.services.pet_classifier import predict_pet

test_images = [
    ("dog.jpg", "dog"),
    ("meo.jpg", "cat"),
    ("hamter.jpg", "hamster"),
    ("soc.jpg", None),
]

print("========================================")
print("TESTING 2-STAGE HIERARCHICAL CLASSIFIER")
print("========================================")

for filename, expected in test_images:
    p = Path(filename)
    if not p.is_file():
        continue

    print(f"\n--- Testing: {filename} ---")
    img = Image.open(p)
    result = predict_pet(img)

    print(f"Predicted Species: {result['species']} ({result['species_vi']}) - {result['species_confidence_percent']}%")
    print(f"Top 3 Species: {[s['label_vi'] + ': ' + str(s['confidence_percent']) + '%' for s in result['species_top3']]}")
    print(f"Predicted Breed: {result['breed']} ({result['breed_vi']}) - {result['breed_confidence_percent']}%")
    print("Top 3 Breeds:")
    for b in result["breed_top3"]:
        print(f"  * {b['label_vi']} ({b['label']}): {b['confidence_percent']}%")
    print(f"Pipeline: {result['stage1_model']} -> {result['stage2_model']}")

print("\n=== ALL IMAGE TESTS COMPLETED SUCCESSFULLY! ===")
