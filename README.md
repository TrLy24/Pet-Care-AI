# 🐾 PawCare AI — Nền Tảng Chăm Sóc & Dinh Dưỡng Thú Cưng Thông Minh

Ứng dụng di động thông minh chăm sóc thú cưng toàn diện, tích hợp **Trí tuệ nhân tạo nhận diện giống loài (On-Device & Cloud AI)**, **Động cơ dinh dưỡng chuẩn thú y quốc tế (WSAVA)**, **Trợ lý bác sĩ thú y ảo (Gemini LLM)** và **Cổng điều hành quản trị viên (Admin Portal)**.

> **Phạm vi chuyên biệt:** Ứng dụng tập trung 100% vào **Chó (25 giống)** và **Mèo (12 giống)** thuộc bộ chuẩn Oxford-IIIT Pet Dataset cùng các giống phổ biến (Poodle, Corgi,...), đảm bảo độ chính xác y khoa và dinh dưỡng cao nhất.

---

## 🌟 Tính Năng Cốt Lõi

### 1. 🔬 Nhận Diện Giống Loài Kép (Dual AI Mode)
- **On-Device AI (100% Offline):** Tích hợp Microsoft ONNX Runtime Android trực tiếp trên thiết bị di động. Nhận diện hình ảnh siêu tốc (~100-300ms), không cần kết nối mạng Internet, bảo mật dữ liệu tuyệt đối và tiết kiệm tối đa tài nguyên RAM (chạy mượt mà trên cả thiết bị cấu hình khiêm tốn như Samsung Galaxy J7 Prime, Oppo, Xiaomi,...).
- **FastAPI Cloud AI Server:** Hỗ trợ suy luận điện toán đám mây qua API hiệu năng cao, trích xuất đặc trưng mạng nơ-ron sâu, phân phối xác suất Softmax và xếp hạng **Top 3 giống loài tương đồng**.
- **Làm giàu dữ liệu tức thì (Enriched Profiles):** Trả về ngay hồ sơ đặc tính giống loài, cân nặng tiêu chuẩn, tuổi thọ, tính cách, rủi ro bệnh lý di truyền và khuyến nghị chăm sóc y tế.

### 2. 🥗 Động Cơ Dinh Dưỡng Thú Y (Veterinary Nutrition Engine)
- **Chuẩn hóa WSAVA / NRC / AAFCO:** Tự động tính toán nhu cầu năng lượng nghỉ ngơi:
  $$\text{RER} = 70 \times \text{Cân nặng (kg)}^{0.75}$$
- **Nhu cầu năng lượng duy trì (MER):** Tùy chỉnh theo giai đoạn phát triển (chó/mèo con, trưởng thành, cao tuổi), mức độ vận động và tình trạng triệt sản.
- **Hệ số dinh dưỡng theo giống (Breed-Specific Modifiers):**
  - Giảm calo, tăng chất xơ cho giống có nguy cơ béo phì cao (Beagle, Pug, Basset Hound).
  - Tăng calo bù đắp thân nhiệt cho giống mèo không lông (Sphynx).
  - Khuyến nghị chia 3-4 bữa/ngày và hạt siêu nhỏ ngừa hạ đường huyết cho dòng chó Toy (Chihuahua).
  - Bổ sung Glucosamine/Chondroitin và kiểm soát tải trọng khớp cho giống lưng dài chân ngắn (Corgi).
- **Phân bổ khẩu phần:** Tỷ lệ thức ăn hạt (khô) vs Pate (ướt), lượng nước cần uống hàng ngày (ml/ngày) và số bữa ăn lý tưởng.

### 3. 💉 Sổ Tiêm Chủng & Nhắc Nhở Chăm Sóc Y Tế (Care & Vaccine Hub)
- **Quản lý tiêm phòng:** Theo dõi lịch tiêm vắc-xin (dại, 7 bệnh, 4 bệnh cho mèo), lịch tẩy giun định kỳ và nhỏ gáy ngừa ve rận.
- **Cảnh báo thông minh:** Tự động phát hiện và cảnh báo các mũi tiêm **quá hạn (Overdue)** hoặc **sắp đến hạn trong 14 ngày (Upcoming)**.
- **Nhắc việc hàng ngày:** Gợi ý lịch trình khoa học theo tập tính riêng biệt của Chó (đi dạo, uống nước, bổ sung men vi sinh) và Mèo (dọn khay cát vệ sinh, gel tiêu búi lông Hairball, pate dinh dưỡng).

### 4. 🤖 Trợ Lý Bác Sĩ Thú Y AI (Gemini AI Assistant)
- Tích hợp mô hình ngôn ngữ lớn **Google Gemini**, hỗ trợ giải đáp 24/7 về hành vi thú cưng, tư vấn triệu chứng bệnh thường gặp, chế độ ăn kiêng và các bước sơ cứu khẩn cấp.

### 5. 📊 Cổng Quản Trị Hệ Thống (Admin Portal)
- **KPI Dashboard thời gian thực:** Thống kê tổng số người dùng, tổng số thú cưng, tỷ lệ phân bố Chó vs Mèo, tổng số ca tiêm phòng cần xử lý.
- **Bảo mật phân quyền (RBAC):** Ngăn chặn người dùng thường leo thang đặc quyền Admin; tích hợp cơ chế tự bảo vệ chống Admin tự tước quyền của chính mình (Self-demotion protection).
- **Quản lý nội dung:** Kiểm duyệt và đăng tải bài viết cẩm nang kiến thức (Blog/Articles) cùng sản phẩm chăm sóc (Affiliate Shop).

### 6. 🔄 Cơ Chế Đồng Bộ Ngoại Tuyến (Offline-First Sync Engine)
- Lưu trữ dữ liệu cục bộ tức thì qua SQLite, tự động xếp hàng đợi đồng bộ (Outbox Sync) và đẩy lên Supabase Cloud Database ngay khi thiết bị có kết nối mạng trở lại.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân hệ | Công nghệ & Thư viện |
| :--- | :--- |
| **Mobile App (Frontend)** | React Native 0.88, Expo SDK 58, TypeScript 5+, Expo Router v5, Zustand, React Query, React Native Paper (Material 3), Lucide / Vector Icons |
| **AI Trên thiết bị (On-Device)** | Microsoft ONNX Runtime Android v1.18, Custom Android Native Module (`OnDeviceAIModule.kt`), MobileNetV3 / ResNet FP32 & INT8 |
| **Máy chủ AI (Backend)** | Python 3.10+, FastAPI, PyTorch, TorchVision, ONNX Runtime Server, Pydantic v2, Uvicorn |
| **Dữ liệu & Xác thực** | Supabase (PostgreSQL, Row Level Security - RLS, Storage CDN), SQLite Local Storage |
| **Kiểm thử tự động** | Jest, Jest Expo, React Native Testing Library, Python Unittest |

---

## 🏗️ Kiến Trúc Mã Nguồn (Clean Architecture)

Dự án tuân thủ nghiêm ngặt mô hình **Clean Architecture 3 lớp**:

```text
Pet-Care-AI/
├── android/                   # Mã nguồn native Android, cấu hình Gradle, ONNX Module
├── backend/                   # Máy chủ AI FastAPI & bộ kiểm thử Python
│   ├── app/
│   │   ├── api/routes/        # Endpoints: /pet, /nutrition, /health
│   │   ├── services/          # PetClassifier, NutritionEngine
│   │   └── schemas/           # Pydantic Schemas validation
│   └── requirements.txt       # Danh sách thư viện Python
├── models_ondevice/           # Mô hình On-Device AI (.onnx)
├── assets/                    # Hình ảnh, font chữ, icons
└── src/
    ├── app/                   # Điều hướng phân trang (Expo Router Routes)
    │   ├── (app)/             # Màn hình chính: Trang chủ, Nhận diện, Dinh dưỡng, Hồ sơ
    │   ├── (auth)/            # Màn hình đăng nhập, đăng ký, quên mật khẩu
    │   └── admin.tsx          # Cổng Quản trị Hệ thống (Admin Portal)
    ├── domain/                # Quy tắc nghiệp vụ độc lập (Entities, Usecases, Services)
    │   ├── entities/          # Pet, CareReminder, User, Nutrition, Article
    │   └── services/          # OnDeviceInferenceService, NutritionCalculator, breedNutritionProfiles
    ├── data/                  # Xử lý dữ liệu (Repositories, Remote Supabase, Local Sync)
    │   ├── repositories/      # AdminRepository, PetRepository, NutritionRepository
    │   └── sync/              # SyncEngine, OutboxDao
    └── presentation/          # Giao diện người dùng (Components, Theme, Stores Zustand)
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản LTS (v20+ hoặc v22+)
- **Python**: Phiên bản 3.10 trở lên
- **Java JDK**: OpenJDK 17
- **Android SDK**: Cài đặt qua Android Studio (API 27 đến 34+)

---

### Bước 1: Cấu hình Biến Môi Trường
Sao chép tệp mẫu `.env.example` thành `.env` tại thư mục gốc:
```bash
cp .env.example .env
```
Điền các giá trị cấu hình tương ứng:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
```

---

### Bước 2: Khởi Chạy Máy Chủ Backend AI (FastAPI)
Mở cửa sổ dòng lệnh riêng cho Backend:
```bash
# Di chuyển vào thư mục backend
cd backend

# Khởi tạo môi trường ảo Python
python -m venv venv

# Kích hoạt môi trường ảo (Windows PowerShell):
.\venv\Scripts\Activate.ps1
# (Trên macOS / Linux: source venv/bin/activate)

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# Khởi động máy chủ uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Hoặc từ thư mục gốc, chỉ cần chạy lệnh gộp:
```bash
npm run backend
```
> API Docs Swagger sẽ sẵn sàng tại: `http://localhost:8000/docs`

---

### Bước 3: Cài Đặt & Khởi Chạy Ứng Dụng Mobile
Tại thư mục gốc dự án:
```bash
# Cài đặt toàn bộ dependencies
npm install

# Khởi động Expo Metro Bundler
npm start
```

#### Chạy bản Native trên thiết bị hoặc máy ảo:
- **Android:**
  ```bash
  npm run android
  ```

---

## 📦 Biên Dịch Bản Cài Đặt APK (Build APK)

Nhờ kiến trúc module hóa, bạn có thể dễ dàng build file APK Debug tối ưu theo kiến trúc chip của điện thoại:

- **Build cho các dòng máy phổ thông / hiện đại (64-bit ARM - Oppo, Samsung mới, Xiaomi):**
  ```powershell
  cd android
  .\gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a
  ```
- **Build cho các dòng máy cấu hình thấp / đời cũ (32-bit ARM - ví dụ Samsung Galaxy J7 Prime):**
  ```powershell
  cd android
  .\gradlew.bat assembleDebug -PreactNativeArchitectures=armeabi-v7a
  ```

> File APK sau khi build hoàn tất sẽ nằm tại: `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🧪 Kiểm Thử Tự Động (Automated Testing)

Dự án sở hữu bộ kiểm thử tự động toàn diện trên cả hai tầng ứng dụng:

```bash
# 1. Kiểm thử toàn bộ chức năng Mobile App & Admin Portal (Jest):
npm test

# 2. Kiểm thử riêng các quy tắc nghiệp vụ Backend AI (Python Unittest):
npm run test:backend

# 3. Kiểm thử tự động từ A-Z (Chạy đồng thời cả Frontend & Backend):
npm run test:all

# 4. Kiểm tra tĩnh kiểu dữ liệu TypeScript:
npm run typecheck
```

### Kết Quả Kiểm Thử:
- **Mobile Client & Admin (Jest):** `8/8 Test Suites Passed`, `51/51 Test Cases Passed` (100% thành công).
- **AI Backend (Python Unittest):** `14/14 Test Cases Passed` (100% thành công).
- **TypeScript Typecheck:** `0 errors`.

---

## 👥 Quy Ước Phát Triển (Git Guidelines)

1. Không commit trực tiếp lên nhánh `main`. Tạo nhánh mới theo quy chuẩn:
   - `feature/ten-tinh-nang`
   - `fix/ten-loi`
   - `test/bo-kiem-thu`
2. Commit message tuân theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: thêm chức năng mới`
   - `fix: sửa lỗi`
   - `test: bổ sung bộ kiểm thử tự động`
   - `refactor: tái cấu trúc mã nguồn`
3. Luôn đảm bảo `npm run typecheck` và `npm test` đều vượt qua 100% trước khi tạo Pull Request.
4. **Tuyệt đối không đẩy tệp `.env`, API keys, hoặc file chứng chỉ keystore lên GitHub.**
