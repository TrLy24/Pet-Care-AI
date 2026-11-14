/**
 * PawCare AI — Care Reminder Automated Unit Tests
 * Scope: Dog & Cat only
 */
import {
  CARE_SUGGESTIONS,
  CATEGORY_COLORS,
  CareCategory,
} from './CareReminder';

describe('CareReminder Entity & Suggestions', () => {
  describe('Species scope (Chỉ áp dụng Chó & Mèo)', () => {
    it('không chứa bất kỳ gợi ý nào cho chuột hamster, chim hoặc thỏ', () => {
      const invalidSpeciesSuggestions = CARE_SUGGESTIONS.filter(
        (s) => (s.species as string) === 'hamster' ||
               (s.species as string) === 'bird' ||
               (s.species as string) === 'rabbit'
      );
      expect(invalidSpeciesSuggestions).toHaveLength(0);
    });

    it('tất cả các gợi ý chỉ thuộc phạm vi dog, cat hoặc all', () => {
      CARE_SUGGESTIONS.forEach((s) => {
        expect(['dog', 'cat', 'all']).toContain(s.species);
      });
    });

    it('có đầy đủ các gợi ý chăm sóc hàng ngày cho chó', () => {
      const dogSuggestions = CARE_SUGGESTIONS.filter((s) => s.species === 'dog');
      expect(dogSuggestions.length).toBeGreaterThanOrEqual(6);

      const titles = dogSuggestions.map((s) => s.title);
      expect(titles.some((t) => t.includes('Bữa sáng'))).toBe(true);
      expect(titles.some((t) => t.includes('Đi dạo'))).toBe(true);
      expect(titles.some((t) => t.includes('Nước lọc') || t.includes('nước'))).toBe(true);
    });

    it('có đầy đủ các gợi ý chăm sóc hàng ngày cho mèo', () => {
      const catSuggestions = CARE_SUGGESTIONS.filter((s) => s.species === 'cat');
      expect(catSuggestions.length).toBeGreaterThanOrEqual(6);

      const titles = catSuggestions.map((s) => s.title);
      expect(titles.some((t) => t.includes('Bữa sáng') || t.includes('pate'))).toBe(true);
      expect(titles.some((t) => t.includes('khay cát') || t.includes('cát'))).toBe(true);
      expect(titles.some((t) => t.includes('búi lông') || t.includes('lông'))).toBe(true);
    });
  });

  describe('Cấu trúc gợi ý chăm sóc (Data Integrity)', () => {
    it('mỗi gợi ý đều có ID duy nhất, giờ định dạng HH:MM và danh mục hợp lệ', () => {
      const ids = new Set<string>();
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

      CARE_SUGGESTIONS.forEach((s) => {
        expect(ids.has(s.id)).toBe(false);
        ids.add(s.id);

        expect(s.title.trim().length).toBeGreaterThan(0);
        expect(s.time).toMatch(timeRegex);
        expect(s.icon.trim().length).toBeGreaterThan(0);
        expect(s.description.trim().length).toBeGreaterThan(0);
        expect(CATEGORY_COLORS[s.category]).toBeDefined();
      });
    });

    it('CATEGORY_COLORS định nghĩa mã màu hex hợp lệ cho tất cả danh mục', () => {
      const categories: CareCategory[] = [
        'feeding',
        'medication',
        'exercise',
        'grooming',
        'hygiene',
        'water',
        'other',
      ];
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      categories.forEach((cat) => {
        expect(CATEGORY_COLORS[cat]).toMatch(hexRegex);
      });
    });
  });
});

