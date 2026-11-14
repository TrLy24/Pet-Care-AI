/**
 * PawCare AI — Admin Portal & Repository Unit Tests
 *
 * Verifies key administrative capabilities:
 * 1. KPI Aggregation (User, Pet, Dog vs Cat, Overdue/Upcoming Vaccinations)
 * 2. Role Escalation Security (Non-admins cannot change roles; Admins cannot self-demote)
 * 3. Master Pet & User Data Mapping
 */
import { AdminRepository } from './AdminRepository';
import { supabase } from '../remote/supabaseClient';
import { useAuthStore } from '@/presentation/stores/useAuthStore';

// Mock supabase client
jest.mock('../remote/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock useAuthStore
jest.mock('@/presentation/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

describe('AdminRepository (Cổng Quản trị Hệ thống)', () => {
  let repo: AdminRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AdminRepository();
  });

  describe('1. getStats (Tổng hợp chỉ số KPI hệ thống)', () => {
    it('tính toán chính xác số lượng người dùng, thú cưng, tỷ lệ chó mèo và cảnh báo tiêm phòng', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 ngày trước (quá hạn)
      const soonDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 ngày tới (sắp tới)
      const farDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 ngày tới (chưa đến hạn)

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              is: jest.fn().mockResolvedValue({ count: 15, error: null }),
            }),
          };
        }
        if (table === 'pets') {
          return {
            select: jest.fn().mockReturnValue({
              is: jest.fn().mockResolvedValue({
                data: [
                  { species: 'dog' },
                  { species: 'dog' },
                  { species: 'cat' },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'vaccinations') {
          return {
            select: jest.fn().mockReturnValue({
              is: jest.fn().mockResolvedValue({
                data: [
                  { next_due_at: pastDate },
                  { next_due_at: soonDate },
                  { next_due_at: farDate },
                ],
                error: null,
              }),
            }),
          };
        }
        return { select: jest.fn() };
      });

      const stats = await repo.getStats();

      expect(stats.totalUsers).toBe(15);
      expect(stats.totalPets).toBe(3);
      expect(stats.dogCount).toBe(2);
      expect(stats.catCount).toBe(1);
      expect(stats.totalVaccinations).toBe(3);
      expect(stats.overdueVaccinations).toBe(1);
      expect(stats.upcomingVaccinations).toBe(1);
    });

    it('trả về dữ liệu an toàn mặc định khi truy vấn lỗi', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection timeout');
      });

      const stats = await repo.getStats();
      expect(stats.totalUsers).toBe(1);
      expect(stats.totalPets).toBe(0);
      expect(stats.overdueVaccinations).toBe(0);
    });
  });

  describe('2. updateUserRole & Bảo mật phân quyền Admin', () => {
    it('từ chối phân quyền nếu người thực hiện không phải Admin (Role: owner)', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        user: { id: 'user_regular', role: 'owner' },
      });

      const result = await repo.updateUserRole('user_target', 'admin');
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('ngăn chặn Admin tự hạ quyền quản trị viên của chính mình (Self-demotion protection)', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        user: { id: 'admin_1', role: 'admin' },
      });

      const result = await repo.updateUserRole('admin_1', 'owner');
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('cho phép Admin nâng quyền hoặc đổi vai trò cho tài khoản khác', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        user: { id: 'admin_1', role: 'admin' },
      });

      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await repo.updateUserRole('user_2', 'admin');
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({ role: 'admin' });
      expect(mockEq).toHaveBeenCalledWith('id', 'user_2');
    });
  });

  describe('3. getAllUsers (Thống kê tài khoản & số lượng thú cưng)', () => {
    it('ánh xạ đúng danh sách người dùng và tổng số pet của từng chủ nuôi', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'owner_1',
                      full_name: 'Nguyễn Văn A',
                      phone: '0901234567',
                      role: 'owner',
                      avatar_url: null,
                      created_at: '2026-01-01',
                    },
                    {
                      id: 'owner_2',
                      full_name: 'Trần Thị B',
                      phone: '',
                      role: 'admin',
                      avatar_url: null,
                      created_at: '2026-01-02',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'pets') {
          return {
            select: jest.fn().mockReturnValue({
              is: jest.fn().mockResolvedValue({
                data: [
                  { owner_id: 'owner_1' },
                  { owner_id: 'owner_1' },
                  { owner_id: 'owner_2' },
                ],
                error: null,
              }),
            }),
          };
        }
        return { select: jest.fn() };
      });

      const users = await repo.getAllUsers();
      expect(users).toHaveLength(2);
      expect(users[0].fullName).toBe('Nguyễn Văn A');
      expect(users[0].petCount).toBe(2);
      expect(users[1].fullName).toBe('Trần Thị B');
      expect(users[1].petCount).toBe(1);
    });
  });
});

