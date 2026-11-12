import torch
import json
from pathlib import Path

# 1. Stage 1 Species
s1_ckpt = torch.load('models/stage 1/efficientnet_b0_species_best.pth', map_location='cpu', weights_only=False)
with open('models/label_mappings/species_mapping.json') as f:
    s1_json = json.load(f)

print("=== CHECK STAGE 1 (SPECIES) ===")
print("Keys in checkpoint:", s1_ckpt.keys() if isinstance(s1_ckpt, dict) else "raw")
if 'class_to_idx' in s1_ckpt:
    print("Checkpoint class_to_idx:", s1_ckpt['class_to_idx'])
elif 'species_to_idx' in s1_ckpt:
    print("Checkpoint species_to_idx:", s1_ckpt['species_to_idx'])
print("JSON species_to_idx:", s1_json.get('species_to_idx'))

# 2. Stage 2 Breeds
for sp in ['dog', 'cat', 'bird', 'hamster', 'rabbit']:
    p = Path(f'models/stage 2/{sp}/efficientnet_b0_{sp}_best.pth')
    mp = Path(f'models/label_mappings/{sp}_mapping.json')
    if p.is_file() and mp.is_file():
        ckpt = torch.load(p, map_location='cpu', weights_only=False)
        with open(mp) as f:
            j_map = json.load(f)
        print(f"\n=== CHECK STAGE 2 ({sp.upper()}) ===")
        print("Keys:", ckpt.keys() if isinstance(ckpt, dict) else "raw")
        if 'class_to_idx' in ckpt:
            print(f"Checkpoint class_to_idx ({len(ckpt['class_to_idx'])}):", list(ckpt['class_to_idx'].items())[:3])
        if 'breed_to_idx' in j_map:
            print(f"JSON breed_to_idx ({len(j_map['breed_to_idx'])}):", list(j_map['breed_to_idx'].items())[:3])

