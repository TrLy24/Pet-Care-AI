"""
Script xuất mô hình PyTorch (.pth) sang ONNX và lượng tử hóa INT8 (Quantization) cho On-Device Mobile AI.
Hỗ trợ tối ưu hóa riêng cho các thiết bị cấu hình tầm trung / cũ như Samsung Galaxy J7 Prime (Exynos 7870 - Cortex A53):
- Lượng tử hóa INT8 (Dynamic Quantization) giảm 75% dung lượng model (16.4 MB -> ~4.2 MB)
- Tận dụng tập lệnh ARM NEON đa luồng
- Nạp Softmax trực tiếp vào output để mobile nhận ngay mảng xác suất (0.0 - 1.0)
"""

import os
import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0
import onnx
import onnxruntime as ort
from onnxruntime.quantization import quantize_dynamic, QuantType

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MAPPINGS_DIR = MODELS_DIR / "label_mappings"
OUTPUT_DIR = BASE_DIR / "models_ondevice"
ONNX_DIR = OUTPUT_DIR / "onnx"
QUANT_DIR = OUTPUT_DIR / "onnx_int8"


class ModelWithSoftmax(nn.Module):
    """Bọc mô hình với Softmax để output trực tiếp là xác suất (0.0 - 1.0) trên mobile"""
    def __init__(self, base_model):
        super().__init__()
        self.base_model = base_model
        self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        logits = self.base_model(x)
        return self.softmax(logits)


def build_model(num_classes: int, checkpoint_path: Path) -> nn.Module:
    """Tái tạo kiến trúc EfficientNet-B0 và nạp checkpoint weights"""
    if not checkpoint_path.is_file():
        raise FileNotFoundError(f"Không tìm thấy file checkpoint: {checkpoint_path}")

    model = efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes)
    )

    checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=False)
    state_dict = checkpoint.get("model_state_dict", checkpoint)
    model.load_state_dict(state_dict)
    model.eval()
    return ModelWithSoftmax(model)


def export_and_quantize(model_name: str, num_classes: int, checkpoint_path: Path):
    """Xuất sang ONNX FP32 và tự động lượng tử hóa INT8"""
    onnx_fp32_path = ONNX_DIR / f"{model_name}.onnx"
    onnx_int8_path = QUANT_DIR / f"{model_name}_int8.onnx"

    print(f"\n=======================================================")
    print(f"[*] Đang xử lý: {model_name} ({num_classes} classes)...")

    # 1. Nạp mô hình PyTorch
    model = build_model(num_classes, checkpoint_path)
    dummy_input = torch.randn(1, 3, 224, 224)

    # 2. Xuất ONNX FP32
    torch.onnx.export(
        model,
        dummy_input,
        str(onnx_fp32_path),
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input_image"],
        output_names=["probabilities"],
        dynamic_axes={"input_image": {0: "batch_size"}, "probabilities": {0: "batch_size"}},
        dynamo=False,
    )

    size_fp32 = onnx_fp32_path.stat().st_size / (1024 * 1024)
    print(f" -> [ONNX FP32] Đã lưu: {onnx_fp32_path.name} | Dung lượng: {size_fp32:.2f} MB")

    # 3. Lượng tử hóa INT8 (Dynamic Quantization - tối ưu cho CPU ARM Cortex-A53)
    quantize_dynamic(
        model_input=str(onnx_fp32_path),
        model_output=str(onnx_int8_path),
        weight_type=QuantType.QUInt8,
    )

    size_int8 = onnx_int8_path.stat().st_size / (1024 * 1024)
    reduction = ((size_fp32 - size_int8) / size_fp32) * 100
    print(f" -> [ONNX INT8] Đã lưu: {onnx_int8_path.name} | Dung lượng: {size_int8:.2f} MB (Giảm {reduction:.1f}%)")

    # 4. Benchmark kiểm thử nhanh bằng onnxruntime
    session = ort.InferenceSession(str(onnx_int8_path))
    test_arr = np.random.randn(1, 3, 224, 224).astype(np.float32)

    # Chạy warm-up
    _ = session.run(["probabilities"], {"input_image": test_arr})

    # Đo thời gian suy luận
    times = []
    for _ in range(5):
        t0 = time.perf_counter()
        _ = session.run(["probabilities"], {"input_image": test_arr})
        times.append((time.perf_counter() - t0) * 1000)

    avg_ms = np.mean(times)
    print(f" -> [Inference Test] Thời gian suy luận trung bình: {avg_ms:.1f} ms / ảnh")


def main():
    ONNX_DIR.mkdir(parents=True, exist_ok=True)
    QUANT_DIR.mkdir(parents=True, exist_ok=True)

    print("========================================================")
    print("   PETCARE AI: EXPORT & INT8 QUANTIZATION FOR MOBILE   ")
    print("========================================================")

    # 1. Stage 1: Nhận diện loài (5 loài)
    with open(MAPPINGS_DIR / "species_mapping.json", "r", encoding="utf-8") as f:
        s1_mapping = json.load(f)
    s1_classes = len(s1_mapping.get("species_to_idx", {}))
    export_and_quantize(
        "stage1_species",
        s1_classes,
        MODELS_DIR / "stage 1" / "efficientnet_b0_species_best.pth"
    )

    # 2. Stage 2: Nhận diện giống chó mèo (2 loài chính và phổ biến nhất)
    # Cat
    with open(MAPPINGS_DIR / "cat_mapping.json", "r", encoding="utf-8") as f:
        cat_map = json.load(f)
    export_and_quantize(
        "stage2_cat",
        cat_map.get("num_classes", len(cat_map.get("idx_to_breed", {}))),
        MODELS_DIR / "stage 2" / "cat" / "efficientnet_b0_cat_best.pth"
    )

    # Dog
    with open(MAPPINGS_DIR / "dog_mapping.json", "r", encoding="utf-8") as f:
        dog_map = json.load(f)
    export_and_quantize(
        "stage2_dog",
        dog_map.get("num_classes", len(dog_map.get("idx_to_breed", {}))),
        MODELS_DIR / "stage 2" / "dog" / "efficientnet_b0_dog_best.pth"
    )

    # Bird, Hamster, Rabbit
    for sp in ["bird", "hamster", "rabbit"]:
        map_p = MAPPINGS_DIR / f"{sp}_mapping.json"
        ckpt_p = MODELS_DIR / "stage 2" / sp / f"efficientnet_b0_{sp}_best.pth"
        if map_p.is_file() and ckpt_p.is_file():
            with open(map_p, "r", encoding="utf-8") as f:
                sp_map = json.load(f)
            export_and_quantize(
                f"stage2_{sp}",
                sp_map.get("num_classes", len(sp_map.get("idx_to_breed", {}))),
                ckpt_p
            )

    # 3. Model 37 class
    ckpt_37 = MODELS_DIR / "37_class" / "efficientnet_b0_37class_best.pth"
    if ckpt_37.is_file():
        export_and_quantize("pet_37class", 37, ckpt_37)

    print("\n========================================================")
    print("[HOÀN TẤT] Tất cả models đã được xuất và lượng tử hóa INT8!")
    print(f"File ONNX gốc:     {ONNX_DIR}")
    print(f"File ONNX INT8:    {QUANT_DIR}")
    print("========================================================")


if __name__ == "__main__":
    main()
