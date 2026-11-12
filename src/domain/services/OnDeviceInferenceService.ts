/**
 * PawCare AI — On-Device Breed Classifier (Tối ưu hóa riêng cho Samsung J7 Prime & Mobile)
 *
 * Chạy nhận diện giống loài 100% Offline trên thiết bị:
 * - Dựa trên kiến trúc EfficientNet-B0 gộp 37 giống (Oxford-IIIT Pet Dataset)
 * - Tự động liên kết với kho tri thức thú y nội bộ (breedNutritionProfiles.ts)
 * - Cung cấp Top 3 dự đoán kèm độ tin cậy %, cân nặng chuẩn, cảnh báo bệnh và thực đơn khoa học
 */
import { NativeModules, Platform } from 'react-native';
import {
  findBreedNutritionProfile,
  type BreedNutritionProfile,
} from './breedNutritionProfiles';

const { OnDeviceAI } = NativeModules;

export interface OnDevicePredictionResult {
  species: 'dog' | 'cat';
  speciesVi: string;
  breed: string;
  breedVi: string;
  confidence: number;
  confidencePercent: number;
  top3Breeds: {
    label: string;
    label_vi: string;
    confidence: number;
    confidence_percent: number;
  }[];
  profile: BreedNutritionProfile | null;
}

export interface BreedClassInfo {
  index: number;
  nameEn: string;
  nameVi: string;
  species: 'dog' | 'cat';
}

/**
 * 37 Giống Chó & Mèo chuẩn hóa từ Oxford-IIIT Pet Model
 */
export const PET_37_CLASSES: BreedClassInfo[] = [
  { index: 0, nameEn: 'Abyssinian', nameVi: 'Mèo Abyssinian', species: 'cat' },
  { index: 1, nameEn: 'american_bulldog', nameVi: 'Chó Bulldog Mỹ', species: 'dog' },
  { index: 2, nameEn: 'american_pit_bull_terrier', nameVi: 'Chó Pitbull Mỹ', species: 'dog' },
  { index: 3, nameEn: 'basset_hound', nameVi: 'Chó Basset Hound', species: 'dog' },
  { index: 4, nameEn: 'beagle', nameVi: 'Chó Beagle', species: 'dog' },
  { index: 5, nameEn: 'Bengal', nameVi: 'Mèo Bengal', species: 'cat' },
  { index: 6, nameEn: 'Birman', nameVi: 'Mèo Birman', species: 'cat' },
  { index: 7, nameEn: 'Bombay', nameVi: 'Mèo Bombay', species: 'cat' },
  { index: 8, nameEn: 'boxer', nameVi: 'Chó Boxer', species: 'dog' },
  { index: 9, nameEn: 'British_Shorthair', nameVi: 'Mèo Anh lông ngắn', species: 'cat' },
  { index: 10, nameEn: 'chihuahua', nameVi: 'Chó Chihuahua', species: 'dog' },
  { index: 11, nameEn: 'Egyptian_Mau', nameVi: 'Mèo Ai Cập Mau', species: 'cat' },
  { index: 12, nameEn: 'english_cocker_spaniel', nameVi: 'Chó Cocker Spaniel', species: 'dog' },
  { index: 13, nameEn: 'english_setter', nameVi: 'Chó Setter Anh', species: 'dog' },
  { index: 14, nameEn: 'german_shorthaired', nameVi: 'Chó săn lông ngắn Đức', species: 'dog' },
  { index: 15, nameEn: 'great_pyrenees', nameVi: 'Chó Great Pyrenees', species: 'dog' },
  { index: 16, nameEn: 'havanese', nameVi: 'Chó Havanese', species: 'dog' },
  { index: 17, nameEn: 'japanese_chin', nameVi: 'Chó Japanese Chin', species: 'dog' },
  { index: 18, nameEn: 'keeshond', nameVi: 'Chó Keeshond', species: 'dog' },
  { index: 19, nameEn: 'leonberger', nameVi: 'Chó Leonberger', species: 'dog' },
  { index: 20, nameEn: 'Maine_Coon', nameVi: 'Mèo Maine Coon', species: 'cat' },
  { index: 21, nameEn: 'miniature_pinscher', nameVi: 'Chó Phốc hươu', species: 'dog' },
  { index: 22, nameEn: 'newfoundland', nameVi: 'Chó Newfoundland', species: 'dog' },
  { index: 23, nameEn: 'Persian', nameVi: 'Mèo Ba Tư', species: 'cat' },
  { index: 24, nameEn: 'pomeranian', nameVi: 'Chó Phốc sóc (Pomeranian)', species: 'dog' },
  { index: 25, nameEn: 'pug', nameVi: 'Chó Pug mặt xệ', species: 'dog' },
  { index: 26, nameEn: 'Ragdoll', nameVi: 'Mèo Ragdoll', species: 'cat' },
  { index: 27, nameEn: 'Russian_Blue', nameVi: 'Mèo Nga xanh', species: 'cat' },
  { index: 28, nameEn: 'saint_bernard', nameVi: 'Chó Saint Bernard', species: 'dog' },
  { index: 29, nameEn: 'samoyed', nameVi: 'Chó Samoyed tuyết trắng', species: 'dog' },
  { index: 30, nameEn: 'scottish_terrier', nameVi: 'Chó Terrier Scotland', species: 'dog' },
  { index: 31, nameEn: 'shiba_inu', nameVi: 'Chó Shiba Inu', species: 'dog' },
  { index: 32, nameEn: 'Siamese', nameVi: 'Mèo Xiêm', species: 'cat' },
  { index: 33, nameEn: 'Sphynx', nameVi: 'Mèo không lông Sphynx', species: 'cat' },
  { index: 34, nameEn: 'staffordshire_bull_terrier', nameVi: 'Chó Bull Terrier', species: 'dog' },
  { index: 35, nameEn: 'wheaten_terrier', nameVi: 'Chó Wheaten Terrier', species: 'dog' },
  { index: 36, nameEn: 'yorkshire_terrier', nameVi: 'Chó Yorkshire Terrier', species: 'dog' },
];

/**
 * Kiểm tra xem Native On-Device AI Module (ONNX Runtime Android) có khả dụng không
 */
export async function isNativeOnDeviceSupported(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    if (OnDeviceAI?.isModelReady) {
      const res = await OnDeviceAI.isModelReady();
      return !!res?.ready;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Nhận diện giống loài thú cưng 100% Offline trên thiết bị bằng mô hình 37 giống INT8
 */
export async function predictPetNative(
  imageUriOrBase64: string
): Promise<OnDevicePredictionResult> {
  if (!OnDeviceAI?.predictPet) {
    throw new Error('Mô-đun AI On-Device native chưa được khởi tạo.');
  }

  const raw = await OnDeviceAI.predictPet(imageUriOrBase64);
  const profile =
    findBreedNutritionProfile(raw.breed) ||
    findBreedNutritionProfile(raw.breed_vi);

  const top3 = (raw.top3Breeds || []).map((b: any) => ({
    label: b.label,
    label_vi: b.label_vi,
    confidence: b.confidence,
    confidence_percent: b.confidence_percent,
  }));

  return {
    species: raw.species === 'cat' ? 'cat' : 'dog',
    speciesVi: raw.species_vi || (raw.species === 'cat' ? 'Mèo' : 'Chó'),
    breed: raw.breed,
    breedVi: raw.breed_vi,
    confidence: raw.confidence,
    confidencePercent: raw.confidence_percent,
    top3Breeds: top3,
    profile,
  };
}

/**
 * Xử lý kết quả đầu ra xác suất (Probabilities mảng 37 phần tử) thành thông tin hoàn chỉnh
 */
export function parseModelOutputProbabilities(
  probabilities: number[] | Float32Array
): OnDevicePredictionResult {
  const ranked = Array.from(probabilities)
    .map((prob, index) => ({
      index,
      confidence: prob,
      info: PET_37_CLASSES[index] || {
        index,
        nameEn: `Class_${index}`,
        nameVi: `Giống_${index}`,
        species: 'dog',
      },
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const top1 = ranked[0];
  const top3 = ranked.slice(0, 3).map((item) => ({
    label: item.info.nameEn,
    label_vi: item.info.nameVi,
    confidence: Number(item.confidence.toFixed(4)),
    confidence_percent: Number((item.confidence * 100).toFixed(1)),
  }));

  const profile = findBreedNutritionProfile(top1.info.nameEn) || findBreedNutritionProfile(top1.info.nameVi);

  return {
    species: top1.info.species,
    speciesVi: top1.info.species === 'cat' ? 'Mèo' : 'Chó',
    breed: top1.info.nameEn,
    breedVi: top1.info.nameVi,
    confidence: Number(top1.confidence.toFixed(4)),
    confidencePercent: Number((top1.confidence * 100).toFixed(1)),
    top3Breeds: top3,
    profile,
  };
}

/**
 * Helper chuẩn hóa thông tin dinh dưỡng thú y thành đối tượng phân tích hoàn chỉnh
 */
export function buildEnrichedResult(
  parsed: OnDevicePredictionResult,
  fallbackBreedName?: string
) {
  const profile = parsed.profile;
  const breedName = parsed.breedVi || fallbackBreedName || parsed.breed;

  return {
    breedName,
    breedEnglish: parsed.breed,
    species: parsed.species,
    speciesVi: parsed.speciesVi,
    confidence: parsed.confidencePercent,
    top3Breeds: parsed.top3Breeds,
    origin: profile?.scientificSource ? 'Chuẩn giống quốc tế (AKC/CFA)' : 'Mô hình Oxford-IIIT Pet On-Device',
    temperament: profile?.sizeCategory
      ? [
          profile.sizeCategory === 'toy' ? 'Nhỏ nhắn' : profile.sizeCategory === 'giant' ? 'Khổng lồ' : 'Vừa vặn',
          'Năng động',
          'Tình cảm',
          'Thân thiện'
        ]
      : ['Thông minh', 'Lanh lợi', 'Thân thiện'],
    standardWeight: profile?.typicalWeightKg
      ? `${profile.typicalWeightKg.min} - ${profile.typicalWeightKg.max} kg`
      : 'Theo thể trạng từng giai đoạn',
    lifespan: parsed.species === 'cat' ? '12 - 17 năm' : '10 - 15 năm',
    careTips: profile?.dietaryAdviceVi || 'Cần bổ sung dinh dưỡng cân đối và tập thể dục hàng ngày.',
    healthWarnings:
      profile?.healthRisks && profile.healthRisks.length > 0
        ? profile.healthRisks.join(', ')
        : 'Cần tiêm phòng vaccine và tẩy giun định kỳ.',
  };
}

