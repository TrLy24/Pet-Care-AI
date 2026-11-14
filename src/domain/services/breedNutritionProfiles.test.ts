/**
 * PawCare AI — Breed Nutrition Profiles Automated Unit Tests
 * Scope: 37 Oxford-IIIT Pet Classes + Core Breeds (Dog & Cat Only)
 */
import {
  BREED_NUTRITION_PROFILES,
  findBreedNutritionProfile,
} from './breedNutritionProfiles';

describe('breedNutritionProfiles Service', () => {
  describe('Danh mục hồ sơ giống loài (Dog & Cat Scope)', () => {
    it('chứa 39 hồ sơ giống loài (12 giống mèo, 25 giống chó Oxford-IIIT và 2 giống phổ biến Poodle/Corgi)', () => {
      const keys = Object.keys(BREED_NUTRITION_PROFILES);
      expect(keys).toHaveLength(39);
    });

    it('chỉ có loài dog hoặc cat, tuyệt đối không chứa loài khác (hamster, chim, thỏ)', () => {
      Object.entries(BREED_NUTRITION_PROFILES).forEach(([key, profile]) => {
        expect(['dog', 'cat']).toContain(profile.species);
        expect(profile.species).not.toBe('hamster');
        expect(profile.species).not.toBe('bird');
        expect(profile.species).not.toBe('rabbit');
      });
    });

    it('chứa đúng 27 giống chó và 12 giống mèo', () => {
      const dogs = Object.values(BREED_NUTRITION_PROFILES).filter((p) => p.species === 'dog');
      const cats = Object.values(BREED_NUTRITION_PROFILES).filter((p) => p.species === 'cat');

      expect(dogs).toHaveLength(27);
      expect(cats).toHaveLength(12);
    });

    it('mỗi hồ sơ có đầy đủ thông tin dinh dưỡng, cân nặng và rủi ro bệnh', () => {
      Object.entries(BREED_NUTRITION_PROFILES).forEach(([key, profile]) => {
        expect(profile.nameVi.trim().length).toBeGreaterThan(0);
        expect(profile.nameEn.trim().length).toBeGreaterThan(0);
        expect(profile.metabolicModifier).toBeGreaterThan(0.5);
        expect(profile.metabolicModifier).toBeLessThan(2.0);
        expect(profile.typicalWeightKg.min).toBeGreaterThan(0);
        expect(profile.typicalWeightKg.max).toBeGreaterThan(profile.typicalWeightKg.min);
        expect(profile.macroRatio.proteinPercent).toBeGreaterThanOrEqual(20);
        expect(profile.macroRatio.fatPercent).toBeGreaterThanOrEqual(10);
        expect(profile.healthRisks.length).toBeGreaterThan(0);
        expect(profile.dietaryAdviceVi.trim().length).toBeGreaterThan(0);
        expect(profile.scientificSource.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('findBreedNutritionProfile', () => {
    it('tìm thấy hồ sơ cho key chính xác (ví dụ beagle)', () => {
      const profile = findBreedNutritionProfile('beagle');
      expect(profile).not.toBeNull();
      expect(profile?.species).toBe('dog');
      expect(profile?.nameVi).toContain('Beagle');
    });

    it('tìm thấy hồ sơ không phân biệt chữ hoa thường và gạch dưới (ví dụ SHIBA_INU)', () => {
      const profile = findBreedNutritionProfile('shiba_inu');
      expect(profile).not.toBeNull();
      expect(profile?.nameVi).toContain('Shiba');
    });

    it('tìm thấy hồ sơ mèo Ba Tư (Persian)', () => {
      const profile = findBreedNutritionProfile('persian');
      expect(profile).not.toBeNull();
      expect(profile?.species).toBe('cat');
      expect(profile?.nameVi).toContain('Ba Tư');
    });

    it('tìm thấy hồ sơ chó Corgi theo tên tiếng Anh hoặc tên hiển thị', () => {
      const profile = findBreedNutritionProfile('corgi');
      expect(profile).not.toBeNull();
      expect(profile?.nameVi).toContain('Corgi');
      expect(profile?.metabolicModifier).toBe(0.88);
    });

    it('trả về null cho input null/undefined hoặc không tồn tại', () => {
      expect(findBreedNutritionProfile(null)).toBeNull();
      expect(findBreedNutritionProfile(undefined)).toBeNull();
      expect(findBreedNutritionProfile('')).toBeNull();
      expect(findBreedNutritionProfile('unknown_creature_xyz')).toBeNull();
    });
  });
});
