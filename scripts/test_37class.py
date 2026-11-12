import sys
sys.path.append('.')
import json
from PIL import Image
import onnxruntime as ort
from backend.app.services.pet_classifier import get_image_transform

img = Image.open('backend/meobatu.jpg').convert('RGB')
tensor = get_image_transform()(img).unsqueeze(0).numpy()

sess = ort.InferenceSession('models_ondevice/onnx/pet_37class.onnx')
probs = sess.run(['probabilities'], {'input_image': tensor})[0][0]

with open('models/label_mappings/efficientnet_b0_37class_mapping.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)['classes']

top3_idx = probs.argsort()[-3:][::-1]
print('=== 37-CLASS ONNX FP32 PREDICTION ===')
for idx in top3_idx:
    item = mapping[str(idx)]
    print(f"- {item['breed_name']} ({item['species']}): {probs[idx]*100:.2f}%")

from onnxruntime.quantization import quantize_dynamic, QuantType
quantize_dynamic(
    'models_ondevice/onnx/pet_37class.onnx',
    'models_ondevice/onnx/pet_37class_linear_int8.onnx',
    weight_type=QuantType.QInt8,
    op_types_to_quantize=['MatMul']
)

sess_int8 = ort.InferenceSession('models_ondevice/onnx/pet_37class_linear_int8.onnx')
probs_int8 = sess_int8.run(['probabilities'], {'input_image': tensor})[0][0]

top3_int8 = probs_int8.argsort()[-3:][::-1]
print('\n=== 37-CLASS ONNX INT8 PREDICTION ===')
for idx in top3_int8:
    item = mapping[str(idx)]
    print(f"- {item['breed_name']} ({item['species']}): {probs_int8[idx]*100:.2f}%")
