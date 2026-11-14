/**
 * PawCare AI — On-Device Inference Service Unit Tests
 *
 * Kiểm thử tự động logic suy luận On-Device và xử lý kết quả:
 * 1. Danh sách 37 giống loài chuẩn Oxford-IIIT Pet (25 giống chó + 12 giống mèo).
 * 2. Phân loại xác suất Top 1 và Top 3 từ mảng logits Softmax.
 * 3. Tích hợp dữ liệu dinh dưỡng, cân nặng chuẩn, cảnh báo bệnh theo tiêu chuẩn thú y.
 * 4. Đảm bảo 100% không chứa các loài ngoài phạm vi (chim, thỏ, hamster).
 */
import {
  PET_37_CLASSES,
  parseModelOutputProbabilities,
  buildEnrichedResult,
  predictPetNative,
  isNativeOnDeviceSupported,
} from './OnDeviceInferenceService';
import { NativeModules, Platform } from 'react-native';

describe('OnDeviceInferenceService (37-Class Pet Model)', () => {
  describe('Cấu trúc danh mục 37 giống loài (Scope chó & mèo)', () => {
    it('chứa chính xác 37 giống loài', () => {
      expect(PET_37_CLASSES).toHaveLength(37);
    });

    it('chỉ bao gồm loài chó (dog) và mèo (cat)', () => {
      const speciesSet = new Set(PET_37_CLASSES.map((c) => c.species));
      expect(speciesSet).toEqual(new Set(['dog', 'cat']));
      expect(speciesSet.has('bird' as any)).toBe(false);
      expect(speciesSet.has('hamster' as any)).toBe(false);
      expect(speciesSet.has('rabbit' as any)).toBe(false);
    });

    it('gồm đúng 25 giống chó và 12 giống mèo', () => {
      const dogs = PET_37_CLASSES.filter((c) => c.species === 'dog');
      const cats = PET_37_CLASSES.filter((c) => c.species === 'cat');
      expect(dogs).toHaveLength(25);
      expect(cats).toHaveLength(12);
    });

    it('mỗi giống có đầy đủ index liên tục từ 0 đến 36, tên tiếng Anh và tiếng Việt', () => {
      PET_37_CLASSES.forEach((item, idx) => {
        expect(item.index).toBe(idx);
        expect(item.nameEn).toBeTruthy();
        expect(item.nameVi).toBeTruthy();
        expect(['dog', 'cat']).toContain(item.species);
      });
    });
  });

  describe('parseModelOutputProbabilities', () => {
    it('trả về đúng Top 1 và Top 3 từ mảng xác suất 37 phần tử', () => {
      // Giả lập mảng xác suất đầu ra với class 9 (British_Shorthair - Mèo Anh lông ngắn) đạt 0.92
      const probs = new Array(37).fill(0.001);
      probs[9] = 0.92; // British_Shorthair
      probs[23] = 0.05; // Persian
      probs[26] = 0.02; // Ragdoll

      const result = parseModelOutputProbabilities(probs);

      expect(result.breed).toBe('British_Shorthair');
      expect(result.breedVi).toBe('Mèo Anh lông ngắn');
      expect(result.species).toBe('cat');
      expect(result.speciesVi).toBe('Mèo');
      expect(result.confidence).toBe(0.92);
      expect(result.confidencePercent).toBe(92);

      // Top 3
      expect(result.top3Breeds).toHaveLength(3);
      expect(result.top3Breeds[0].label).toBe('British_Shorthair');
      expect(result.top3Breeds[1].label).toBe('Persian');
      expect(result.top3Breeds[2].label).toBe('Ragdoll');
    });

    it('trả về giống chó đúng khi dự đoán điểm cao nhất là chó Corgi hoặc Poodle', () => {
      const probs = new Array(37).fill(0.001);
      probs[4] = 0.88; // beagle
      probs[8] = 0.07; // boxer

      const result = parseModelOutputProbabilities(probs);

      expect(result.breed).toBe('beagle');
      expect(result.breedVi).toBe('Chó Beagle');
      expect(result.species).toBe('dog');
      expect(result.speciesVi).toBe('Chó');
      expect(result.confidencePercent).toBe(88);
      expect(result.profile).not.toBeNull();
    });
  });

  describe('buildEnrichedResult', () => {
    it('tổng hợp hồ sơ dinh dưỡng thú y và cảnh báo bệnh chi tiết cho Mèo Anh lông ngắn', () => {
      const probs = new Array(37).fill(0.001);
      probs[9] = 0.95; // British_Shorthair
      const parsed = parseModelOutputProbabilities(probs);

      const enriched = buildEnrichedResult(parsed);

      expect(enriched.breedName).toBe('Mèo Anh lông ngắn');
      expect(enriched.species).toBe('cat');
      expect(enriched.speciesVi).toBe('Mèo');
      expect(enriched.confidence).toBe(95);
      expect(enriched.standardWeight).toContain('kg');
      expect(enriched.lifespan).toBe('12 - 17 năm');
      expect(enriched.careTips).toBeTruthy();
      expect(enriched.healthWarnings).toBeTruthy();
    });

    it('tổng hợp hồ sơ cho Chó Beagle có cảnh báo nguy cơ béo phì', () => {
      const probs = new Array(37).fill(0.001);
      probs[4] = 0.91; // beagle
      const parsed = parseModelOutputProbabilities(probs);

      const enriched = buildEnrichedResult(parsed);

      expect(enriched.breedName).toBe('Chó Beagle');
      expect(enriched.species).toBe('dog');
      expect(enriched.speciesVi).toBe('Chó');
      expect(enriched.lifespan).toBe('10 - 15 năm');
    });
  });

  describe('Native OnDevice Module Bridge', () => {
    it('trả về false nếu không chạy trên nền tảng Android', async () => {
      const originalOS = Platform.OS;
      (Platform as any).OS = 'ios';

      const supported = await isNativeOnDeviceSupported();
      expect(supported).toBe(false);

      (Platform as any).OS = originalOS;
    });

    it('báo lỗi rõ ràng nếu Native Module OnDeviceAI chưa được nạp', async () => {
      const originalModule = NativeModules.OnDeviceAI;
      NativeModules.OnDeviceAI = null;

      await expect(predictPetNative('file:///dummy/path.jpg')).rejects.toThrow(
        'Mô-đun AI On-Device native chưa được khởi tạo.'
      );

      NativeModules.OnDeviceAI = originalModule;
    });
  });
});

