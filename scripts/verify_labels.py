import torch
import json

ckpt = torch.load('models/37_class/efficientnet_b0_37class_best.pth', map_location='cpu', weights_only=False)
actual_class_to_idx = ckpt['class_to_idx']
idx_to_class = {v: k for k, v in actual_class_to_idx.items()}

with open('models/label_mappings/efficientnet_b0_37class_mapping.json', 'r', encoding='utf-8') as f:
    json_classes = json.load(f)['classes']

mismatches = []
print("=== SO SÁNH 37 LỚP TRONG CHECKPOINT .PTH VÀ FILE MAPPING JSON ===")
for i in range(37):
    actual = idx_to_class.get(i)
    in_json = json_classes[str(i)]['breed_name']
    match = (actual == in_json)
    if not match:
        mismatches.append((i, actual, in_json))
    print(f"Index {i:2d}: Checkpoint=[{actual:25s}] vs JSON=[{in_json:25s}] -> {'KHỚP' if match else 'LỆCH NHÃN!'}")

print(f"\nTổng số lớp bị lệch: {len(mismatches)} / 37")
if mismatches:
    print("\nCÁC LỚP BỊ LỆCH NHÃN:")
    for idx, act, j in mismatches:
        print(f"  - Index {idx}: Thực tế trong model={act}  !=  File JSON ghi={j}")

