/**
 * PawCare AI — Care Reminder Domain Entity
 *
 * Represents daily care activities (feeding, walks, medicine, grooming, hygiene)
 * scheduled by pet owners.
 */
export type CareCategory =
  | 'feeding'
  | 'medication'
  | 'exercise'
  | 'grooming'
  | 'hygiene'
  | 'water'
  | 'other';

export const CATEGORY_COLORS: Record<CareCategory, string> = {
  feeding: '#EA580C',
  medication: '#8B5CF6',
  exercise: '#16A34A',
  grooming: '#DB2777',
  water: '#0284C7',
  hygiene: '#059669',
  other: '#64748B',
};

export interface CareReminder {
  id: string;
  petId: string;
  ownerId?: string;
  title: string;
  time: string; // e.g. "07:30"
  category: CareCategory;
  icon: string; // MaterialCommunityIcons name
  isDone: boolean;
  date: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface CareSuggestion {
  id: string;
  title: string;
  time: string;
  category: CareCategory;
  icon: string;
  description: string;
  species: 'all' | 'dog' | 'cat' | 'bird' | 'hamster' | 'rabbit';
}

export const CARE_SUGGESTIONS: CareSuggestion[] = [
  // ==================== CHÓ ====================
  {
    id: 's_dog_breakfast',
    title: 'Bữa sáng hạt & dinh dưỡng',
    time: '07:30',
    category: 'feeding',
    icon: 'food-drumstick',
    description: 'Cung cấp năng lượng khởi đầu ngày mới cho bé',
    species: 'dog',
  },
  {
    id: 's_dog_water',
    title: 'Thay nước lọc sạch mới',
    time: '08:00',
    category: 'water',
    icon: 'water-pump',
    description: 'Giữ khay nước uống luôn mát và sạch khuẩn',
    species: 'dog',
  },
  {
    id: 's_dog_vitamin',
    title: 'Uống men tiêu hóa / Vitamin',
    time: '08:30',
    category: 'medication',
    icon: 'pill',
    description: 'Bổ sung lợi khuẩn đường ruột & tăng đề kháng',
    species: 'dog',
  },
  {
    id: 's_dog_walk',
    title: 'Đi dạo & vận động ngoài trời',
    time: '17:30',
    category: 'exercise',
    icon: 'run-fast',
    description: '30 phút đi dạo giải tỏa stress & tiêu hao năng lượng',
    species: 'dog',
  },
  {
    id: 's_dog_dinner',
    title: 'Bữa tối giàu đạm phục hồi',
    time: '19:00',
    category: 'feeding',
    icon: 'bowl-mix',
    description: 'Khẩu phần ăn tối theo lượng calo MER',
    species: 'dog',
  },
  {
    id: 's_dog_brush',
    title: 'Chải lông & lau sạch chân',
    time: '20:30',
    category: 'grooming',
    icon: 'brush',
    description: 'Kiểm tra kẽ chân, ngừa ve rận & gỡ rối lông',
    species: 'dog',
  },
  {
    id: 's_dog_teeth',
    title: 'Đánh răng / Cho gặm que sạch răng',
    time: '21:00',
    category: 'hygiene',
    icon: 'tooth-outline',
    description: 'Ngừa cao răng, viêm nướu & khử hôi miệng',
    species: 'dog',
  },

  // ==================== MÈO ====================
  {
    id: 's_cat_breakfast',
    title: 'Bữa sáng hạt + pate dinh dưỡng',
    time: '07:30',
    category: 'feeding',
    icon: 'food-drumstick',
    description: 'Bổ sung đạm và nước qua thức ăn ướt',
    species: 'cat',
  },
  {
    id: 's_cat_water',
    title: 'Thay nước lọc / Vệ sinh vòi nước',
    time: '08:00',
    category: 'water',
    icon: 'water-pump',
    description: 'Mèo thích nước mới chảy để ngừa sỏi thận',
    species: 'cat',
  },
  {
    id: 's_cat_litter',
    title: 'Dọn sạch khay cát vệ sinh',
    time: '08:30',
    category: 'hygiene',
    icon: 'tray-full',
    description: 'Khay cát sạch giúp bé đi vệ sinh đúng chỗ & thoải mái',
    species: 'cat',
  },
  {
    id: 's_cat_play',
    title: 'Chơi đùa vận động với cần câu',
    time: '18:00',
    category: 'exercise',
    icon: 'cat',
    description: '15-20 phút tương tác kích thích bản năng săn mồi',
    species: 'cat',
  },
  {
    id: 's_cat_dinner',
    title: 'Bữa tối pate / thức ăn yêu thích',
    time: '19:30',
    category: 'feeding',
    icon: 'bowl-mix',
    description: 'Cung cấp năng lượng buổi tối ấm bụng',
    species: 'cat',
  },
  {
    id: 's_cat_hairball',
    title: 'Cho uống gel tiêu búi lông (Hairball)',
    time: '20:30',
    category: 'medication',
    icon: 'pill',
    description: 'Hỗ trợ tiêu hóa và đào thải búi lông ruột',
    species: 'cat',
  },
  {
    id: 's_cat_groom',
    title: 'Chải lông mượt & lau khóe mắt',
    time: '21:00',
    category: 'grooming',
    icon: 'brush',
    description: 'Loại bỏ lông rụng và giữ khóe mắt sạch ghèn',
    species: 'cat',
  },

  // ==================== CHIM ====================
  {
    id: 's_bird_breakfast',
    title: 'Bữa sáng hạt & trái cây tươi',
    time: '07:00',
    category: 'feeding',
    icon: 'food-apple',
    description: 'Hỗn hợp hạt, trái cây & rau xanh giàu vitamin',
    species: 'bird',
  },
  {
    id: 's_bird_water',
    title: 'Thay nước uống & tắm mới',
    time: '07:30',
    category: 'water',
    icon: 'water',
    description: 'Nước sạch hàng ngày, có thể thêm khay tắm nhỏ',
    species: 'bird',
  },
  {
    id: 's_bird_cage',
    title: 'Vệ sinh lồng & đáy lồng',
    time: '08:00',
    category: 'hygiene',
    icon: 'birdhouse',
    description: 'Dọn phân, thay lót đáy lồng để ngừa vi khuẩn',
    species: 'bird',
  },
  {
    id: 's_bird_play',
    title: 'Thả bay & tương tác ngoài lồng',
    time: '17:00',
    category: 'exercise',
    icon: 'bird',
    description: '20-30 phút bay tự do trong phòng an toàn mỗi ngày',
    species: 'bird',
  },
  {
    id: 's_bird_dinner',
    title: 'Bữa chiều hạt & thức ăn bổ sung',
    time: '18:00',
    category: 'feeding',
    icon: 'bowl-mix',
    description: 'Bổ sung viên khoáng hoặc mực cá (cuttlebone) cho mỏ',
    species: 'bird',
  },
  {
    id: 's_bird_cover',
    title: 'Phủ vải lồng ngủ đêm',
    time: '20:00',
    category: 'other',
    icon: 'weather-night',
    description: 'Giúp chim nghỉ ngơi đủ 10-12 giờ trong yên tĩnh & tối',
    species: 'bird',
  },

  // ==================== HAMSTER ====================
  {
    id: 's_hamster_food',
    title: 'Cho ăn hạt & rau củ buổi tối',
    time: '19:00',
    category: 'feeding',
    icon: 'corn',
    description: 'Hamster hoạt động ban đêm - cho ăn chính vào buổi tối',
    species: 'hamster',
  },
  {
    id: 's_hamster_water',
    title: 'Kiểm tra & đổ nước bình bi',
    time: '19:30',
    category: 'water',
    icon: 'water-pump',
    description: 'Vệ sinh bình nước bi, đảm bảo nước chảy đều',
    species: 'hamster',
  },
  {
    id: 's_hamster_cage',
    title: 'Dọn vệ sinh lồng & đệm lót',
    time: '08:00',
    category: 'hygiene',
    icon: 'home-outline',
    description: 'Dọn phân góc toilet, thay phần đệm lót bị ẩm',
    species: 'hamster',
  },
  {
    id: 's_hamster_wheel',
    title: 'Kiểm tra bánh xe chạy & đồ chơi',
    time: '20:00',
    category: 'exercise',
    icon: 'circle-outline',
    description: 'Đảm bảo bánh xe chạy êm, không kẹt kẽo để bé vận động đêm',
    species: 'hamster',
  },
  {
    id: 's_hamster_treat',
    title: 'Phần thưởng & kiểm tra sức khỏe',
    time: '20:30',
    category: 'other',
    icon: 'star-circle',
    description: 'Cho ăn vặt nhỏ (hạt bí, cà rốt), quan sát lông và mắt',
    species: 'hamster',
  },

  // ==================== THỎ ====================
  {
    id: 's_rabbit_hay',
    title: 'Bổ sung cỏ Timothy tươi',
    time: '07:00',
    category: 'feeding',
    icon: 'grass',
    description: 'Cỏ khô chiếm 80% khẩu phần - không được để hết',
    species: 'rabbit',
  },
  {
    id: 's_rabbit_water',
    title: 'Thay nước uống sạch mỗi ngày',
    time: '07:30',
    category: 'water',
    icon: 'water-pump',
    description: 'Thỏ cần nhiều nước để hệ tiêu hóa hoạt động tốt',
    species: 'rabbit',
  },
  {
    id: 's_rabbit_veggie',
    title: 'Rau xanh tươi buổi sáng',
    time: '08:00',
    category: 'feeding',
    icon: 'leaf',
    description: 'Rau cải, bó xôi, mùi tây - rửa sạch, không ướt quá',
    species: 'rabbit',
  },
  {
    id: 's_rabbit_litter',
    title: 'Vệ sinh khay vệ sinh thỏ',
    time: '08:30',
    category: 'hygiene',
    icon: 'tray-full',
    description: 'Thỏ cần khay sạch để giữ vệ sinh và không bị nhiễm khuẩn',
    species: 'rabbit',
  },
  {
    id: 's_rabbit_play',
    title: 'Thả thỏ chạy nhảy ngoài lồng',
    time: '17:00',
    category: 'exercise',
    icon: 'rabbit',
    description: 'Ít nhất 3 giờ/ngày ngoài lồng để xương khớp phát triển',
    species: 'rabbit',
  },
  {
    id: 's_rabbit_brush',
    title: 'Chải lông & kiểm tra móng',
    time: '20:00',
    category: 'grooming',
    icon: 'brush',
    description: 'Chải lông 2-3 lần/tuần, cắt móng mỗi 4-6 tuần',
    species: 'rabbit',
  },
];
