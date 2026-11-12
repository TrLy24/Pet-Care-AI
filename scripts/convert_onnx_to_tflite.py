"""
Script hướng dẫn chuyển đổi từ ONNX sang TensorFlow Lite (TFLite)
Hỗ trợ tạo model .tflite với tối ưu hóa XNNPACK / CPU ARM Cortex-A53 cho Android APK.

Cách 1: Sử dụng onnx2tf (Khuyên dùng nhất cho các mô hình thị giác máy tính)
    pip install onnx2tf tensorflow
    python scripts/convert_onnx_to_tflite.py

Cách 2: Sử dụng Google AI-Edge-Torch (Trực tiếp từ PyTorch sang TFLite):
    pip install ai-edge-torch
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ONNX_MODEL = BASE_DIR / "assets" / "models" / "pet_37class_int8.onnx"
OUTPUT_DIR = BASE_DIR / "assets" / "models"


def main():
    print("==================================================")
    print("   CONVERT ONNX TO TFLITE CHO ANDROID ON-DEVICE   ")
    print("==================================================")
    
    if not ONNX_MODEL.is_file():
        print(f"Lỗi: Không tìm thấy file model: {ONNX_MODEL}")
        return

    print(f"File nguồn: {ONNX_MODEL} ({ONNX_MODEL.stat().st_size / (1024*1024):.2f} MB)")
    print("\nĐể chuyển đổi sang .tflite, bạn có thể chạy lệnh sau:")
    print("  pip install onnx2tf tensorflow")
    print(f"  onnx2tf -in {ONNX_MODEL} -coi -output_folder_path {OUTPUT_DIR / 'tflite_out'}")
    print("\nFile .tflite sinh ra sẽ được tự động tối ưu hóa tập lệnh ARM NEON cho nhân CPU Cortex-A53 của Samsung J7 Prime.")


if __name__ == "__main__":
    main()

