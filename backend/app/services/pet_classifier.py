import json
from functools import lru_cache
from pathlib import Path

import torch
from PIL import Image, ImageOps
from torchvision import transforms
from torchvision.models import efficientnet_b0


# ============================================================
# 1. CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BASE_DIR.parent
MODEL_DIR = PROJECT_DIR / "models"
MAPPINGS_DIR = MODEL_DIR / "label_mappings"
STAGE1_DIR = MODEL_DIR / "stage 1"
STAGE2_DIR = MODEL_DIR / "stage 2"

STAGE1_MODEL_PATH = STAGE1_DIR / "efficientnet_b0_species_best.pth"
STAGE1_MAPPING_PATH = MAPPINGS_DIR / "species_mapping.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TOP_K = 3
IMAGE_SIZE = 224
CROP_SIZE = 224
RESIZE_SIZE = 256

# Standard ImageNet normalization matching training
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

SUPPORTED_SPECIES = [
    "bird",
    "cat",
    "dog",
    "hamster",
    "rabbit",
]


# ============================================================
# 2. VIETNAMESE LABELS DICTIONARY
# ============================================================

SPECIES_VI = {
    "dog": "Chó",
    "cat": "Mèo",
    "bird": "Chim",
    "rabbit": "Thỏ",
    "hamster": "Chuột Hamster",
}

BREED_VI = {
    # --- CAT BREEDS (12) ---
    "Abyssinian": "Mèo Abyssinian",
    "Bengal": "Mèo Bengal",
    "Birman": "Mèo Birman",
    "Bombay": "Mèo Bombay",
    "British_Shorthair": "Mèo Anh lông ngắn",
    "Egyptian_Mau": "Mèo Ai Cập Mau",
    "Maine_Coon": "Mèo Maine Coon",
    "Persian": "Mèo Ba Tư",
    "Ragdoll": "Mèo Ragdoll",
    "Russian_Blue": "Mèo Nga xanh",
    "Siamese": "Mèo Xiêm",
    "Sphynx": "Mèo không lông Sphynx",

    # --- DOG BREEDS (25) ---
    "american_bulldog": "Bulldog Mỹ",
    "american_pit_bull_terrier": "Pit Bull Terrier Mỹ",
    "basset_hound": "Basset Hound",
    "beagle": "Beagle",
    "boxer": "Boxer",
    "chihuahua": "Chihuahua",
    "english_cocker_spaniel": "Cocker Spaniel Anh",
    "english_setter": "English Setter",
    "german_shorthaired": "Chó săn lông ngắn Đức",
    "great_pyrenees": "Great Pyrenees",
    "havanese": "Havanese",
    "japanese_chin": "Japanese Chin",
    "keeshond": "Keeshond",
    "leonberger": "Leonberger",
    "miniature_pinscher": "Miniature Pinscher (Phốc hươu)",
    "newfoundland": "Newfoundland",
    "pomeranian": "Phốc sóc (Pomeranian)",
    "pug": "Pug",
    "saint_bernard": "Saint Bernard",
    "samoyed": "Samoyed",
    "scottish_terrier": "Scottish Terrier",
    "shiba_inu": "Shiba Inu",
    "staffordshire_bull_terrier": "Staffordshire Bull Terrier",
    "wheaten_terrier": "Wheaten Terrier",
    "yorkshire_terrier": "Yorkshire Terrier",

    # --- BIRD BREEDS (10) ---
    "ALEXANDRINE PARAKEET": "Vẹt Alexandrine",
    "CANARY": "Chim Yến hót (Canary)",
    "COCKATOO": "Vẹt Mào (Cockatoo)",
    "EASTERN ROSELLA": "Vẹt Rosella phương Đông",
    "GOLDEN PARAKEET": "Vẹt Vàng (Golden Parakeet)",
    "GOULDIAN FINCH": "Chim Bảy màu (Gouldian Finch)",
    "HYACINTH MACAW": "Vẹt Macaw Xanh Lam (Hyacinth Macaw)",
    "JAVA SPARROW": "Chim Manh Nhật (Sẻ Java)",
    "RAINBOW LORIKEET": "Vẹt Cầu Vồng (Rainbow Lorikeet)",
    "ROSY FACED LOVEBIRD": "Vẹt Mẫu Đơn mặt hồng (Lovebird)",

    # --- HAMSTER BREEDS (2) ---
    "Syrian": "Chuột Hamster Bear (Syrian)",
    "Winter": "Chuột Hamster Winter White",

    # --- RABBIT BREEDS (4) ---
    "californian": "Thỏ California",
    "holland-lop": "Thỏ tai cụp Holland Lop",
    "lionhead": "Thỏ sư tử (Lionhead)",
    "new-zealand": "Thỏ New Zealand trắng",
}


# ============================================================
# 3. PREPROCESSING PIPELINE
# ============================================================

def get_image_transform():
    """
    Chuẩn hóa ảnh theo kích thước 224x224 và thống kê ImageNet
    khớp hoàn toàn với eval_transform trong training pipeline.
    """
    return transforms.Compose([
        transforms.Resize(RESIZE_SIZE),
        transforms.CenterCrop(CROP_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=IMAGENET_MEAN,
            std=IMAGENET_STD,
        ),
    ])


# ============================================================
# 4. LOAD STAGE 1 (SPECIES CLASSIFIER - 5 LOÀI)
# ============================================================

@lru_cache(maxsize=1)
def get_species_predictor():
    if not STAGE1_MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"Không tìm thấy model Stage 1: {STAGE1_MODEL_PATH}"
        )
    if not STAGE1_MAPPING_PATH.is_file():
        raise FileNotFoundError(
            f"Không tìm thấy mapping Stage 1: {STAGE1_MAPPING_PATH}"
        )

    with open(STAGE1_MAPPING_PATH, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    species_to_idx = mapping.get("species_to_idx", {})
    idx_to_species = mapping.get("idx_to_species", {})
    num_classes = len(species_to_idx)

    # Sort labels by index
    labels = [None] * num_classes
    for idx_str, sp in idx_to_species.items():
        labels[int(idx_str)] = sp

    checkpoint = torch.load(
        STAGE1_MODEL_PATH,
        map_location="cpu",
        weights_only=False,
    )

    state_dict = checkpoint.get("model_state_dict", checkpoint)

    model = efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = torch.nn.Sequential(
        torch.nn.Dropout(p=0.3),
        torch.nn.Linear(in_features, num_classes),
    )
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()

    print(
        f"[PetClassifier] Loaded Stage 1 Species Model (5 classes) | "
        f"Device={DEVICE}"
    )
    return model, labels


# ============================================================
# 5. LOAD STAGE 2 (BREED CLASSIFIER THEO TỪNG LOÀI)
# ============================================================

@lru_cache(maxsize=8)
def get_breed_predictor(species: str):
    """
    Nạp mô hình phân loại giống chuyên biệt cho loài (bird, cat, dog, hamster, rabbit).
    Được cache trong bộ nhớ để tái sử dụng tối đa.
    """
    species = species.lower().strip()
    if species not in SUPPORTED_SPECIES:
        raise ValueError(f"Loài không được hỗ trợ phân loại giống: {species}")

    mapping_path = MAPPINGS_DIR / f"{species}_mapping.json"
    model_path = STAGE2_DIR / species / f"efficientnet_b0_{species}_best.pth"

    if not model_path.is_file():
        raise FileNotFoundError(f"Không tìm thấy model Stage 2: {model_path}")
    if not mapping_path.is_file():
        raise FileNotFoundError(f"Không tìm thấy mapping Stage 2: {mapping_path}")

    with open(mapping_path, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    idx_to_breed = mapping.get("idx_to_breed", {})
    num_classes = mapping.get("num_classes", len(idx_to_breed))

    labels = [None] * num_classes
    for idx_str, br in idx_to_breed.items():
        labels[int(idx_str)] = br

    checkpoint = torch.load(
        model_path,
        map_location="cpu",
        weights_only=False,
    )

    state_dict = checkpoint.get("model_state_dict", checkpoint)

    model = efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = torch.nn.Sequential(
        torch.nn.Dropout(p=0.3),
        torch.nn.Linear(in_features, num_classes),
    )
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()

    print(
        f"[PetClassifier] Loaded Stage 2 Breed Model for '{species}' "
        f"({num_classes} classes) | Device={DEVICE}"
    )
    return model, labels


# ============================================================
# 6. HIERARCHICAL PREDICTION PIPELINE (STAGE 1 -> STAGE 2)
# ============================================================

def predict_pet(
    image: Image.Image,
    species_override: str | None = None,
) -> dict:
    """
    Quy trình nhận diện 2 giai đoạn phân cấp:
      1. Stage 1: Nhận diện loài (Chó, Mèo, Chim, Thỏ, Hamster)
      2. Stage 2: Nhận diện giống chuyên biệt của loài đó
    """
    transform = get_image_transform()
    image_rgb = ImageOps.exif_transpose(image).convert("RGB")
    image_tensor = transform(image_rgb).unsqueeze(0).to(DEVICE)

    # --------------------------------------------------------
    # BƯỚC 1: DỰ ĐOÁN LOÀI (STAGE 1)
    # --------------------------------------------------------
    if species_override and species_override.lower() in SUPPORTED_SPECIES:
        predicted_species = species_override.lower()
        species_confidence = 1.0
        species_results = [{
            "label": predicted_species,
            "label_vi": SPECIES_VI.get(predicted_species, predicted_species),
            "confidence": 1.0,
            "confidence_percent": 100.0,
        }]
    else:
        s1_model, species_labels = get_species_predictor()

        with torch.inference_mode():
            s1_logits = s1_model(image_tensor)
            s1_probs = torch.softmax(s1_logits, dim=1)[0]

        s1_probs_list = s1_probs.cpu().tolist()

        # Sắp xếp danh sách toàn bộ loài theo độ tin cậy
        ranked_species = sorted(
            enumerate(s1_probs_list),
            key=lambda x: x[1],
            reverse=True,
        )

        species_results = []
        for idx, prob in ranked_species:
            sp_name = species_labels[idx]
            species_results.append({
                "label": sp_name,
                "label_vi": SPECIES_VI.get(sp_name, sp_name),
                "confidence": round(float(prob), 6),
                "confidence_percent": round(float(prob) * 100, 2),
            })

        predicted_species = species_results[0]["label"]
        species_confidence = species_results[0]["confidence"]

    species_top3 = species_results[:min(TOP_K, len(species_results))]

    # --------------------------------------------------------
    # BƯỚC 2: DỰ ĐOÁN GIỐNG THEO LOÀI (STAGE 2)
    # --------------------------------------------------------
    s2_model, breed_labels = get_breed_predictor(predicted_species)

    with torch.inference_mode():
        s2_logits = s2_model(image_tensor)
        s2_probs = torch.softmax(s2_logits, dim=1)[0]

    num_breeds = len(breed_labels)
    k = min(TOP_K, num_breeds)
    top_values, top_indices = torch.topk(s2_probs, k=k)

    breed_results = []
    for prob, idx in zip(
        top_values.cpu().tolist(),
        top_indices.cpu().tolist(),
    ):
        label = breed_labels[idx]
        breed_results.append({
            "label": label,
            "label_vi": BREED_VI.get(label, label),
            "confidence": round(float(prob), 6),
            "confidence_percent": round(float(prob) * 100, 2),
        })

    best_breed = breed_results[0]

    return {
        "species": predicted_species,
        "species_vi": SPECIES_VI.get(predicted_species, predicted_species),
        "species_confidence": round(species_confidence, 6),
        "species_confidence_percent": round(species_confidence * 100, 2),
        "species_top3": species_top3,

        "breed": best_breed["label"],
        "breed_vi": best_breed["label_vi"],
        "breed_confidence": best_breed["confidence"],
        "breed_confidence_percent": best_breed["confidence_percent"],
        "breed_top3": breed_results,

        "pipeline": "2-stage-hierarchical",
        "stage1_model": "EfficientNet-B0 (5 species)",
        "stage2_model": f"EfficientNet-B0 ({predicted_species.capitalize()} - {num_breeds} breeds)",
        "device": str(DEVICE),
        "message": (
            f"Đã nhận diện loài {SPECIES_VI.get(predicted_species, predicted_species)} "
            f"và giống {best_breed['label_vi']} bằng mô hình AI 2 giai đoạn."
        ),
        "note": "Đây là kết quả dự đoán của AI, không phải xác nhận chắc chắn về loài hoặc giống thú cưng.",
    }
