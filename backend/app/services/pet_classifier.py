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

# MODEL_DIR: Hỗ trợ linh hoạt cả khi chạy từ repo gốc (D:\DACN2) lẫn chạy bên trong backend/ trên cloud
if (BASE_DIR.parent / "models").is_dir():
    MODEL_DIR = BASE_DIR.parent / "models"
elif (BASE_DIR / "models").is_dir():
    MODEL_DIR = BASE_DIR / "models"
elif Path("models").is_dir():
    MODEL_DIR = Path("models").resolve()
else:
    MODEL_DIR = BASE_DIR.parent / "models"

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
    "cat",
    "dog",
]


# ============================================================
# 2. VIETNAMESE LABELS DICTIONARY
# ============================================================

SPECIES_VI = {
    "dog": "Chó",
    "cat": "Mèo",
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
    Nạp mô hình phân loại giống chuyên biệt cho loài (chó, mèo).
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
# 6. UNIFIED 37-CLASS PREDICTION PIPELINE
# ============================================================

def predict_pet(
    image: Image.Image,
    species_override: str | None = None,
) -> dict:
    """
    Quy trình nhận diện sử dụng mô hình gộp 37 giống (Oxford-IIIT Pet Model).
    """
    try:
        from app.services.pet_37class_classifier import predict_pet_37class
    except ImportError:
        from backend.app.services.pet_37class_classifier import predict_pet_37class
    return predict_pet_37class(image)
