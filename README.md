# 🐾 PawCare AI — Nền Tảng Chăm Sóc & Dinh Dưỡng Thú Cưng Thông Minh

PawCare AI là ứng dụng di động thông minh chăm sóc thú cưng toàn diện, tích hợp **Trí tuệ nhân tạo nhận diện giống loài kép (On-Device & Cloud AI)**, **Động cơ dinh dưỡng chuẩn thú y quốc tế (WSAVA)**, **Trợ lý bác sĩ thú y ảo (Gemini LLM)** và **Cổng điều hành quản trị viên (Admin Portal)**.

> **Phạm vi khoa học & thực nghiệm:** Ứng dụng tập trung 100% vào **Chó (25 giống)** và **Mèo (12 giống)** thuộc bộ chuẩn **Oxford-IIIT Pet Dataset** cùng các giống phổ biến (Poodle, Corgi,...), loại bỏ hoàn toàn các loài ngoài phạm vi (chim, thỏ, chuột hamster) để đạt độ tin cậy và chính xác thú y cao nhất.

---

## 📋 Mục Lục
- [1. Tính Năng Cốt Lõi](#1-tính-năng-cốt-lõi)
- [2. Danh Mục 37 Giống Loài Hỗ Trợ](#2-danh-mục-37-giống-loài-hỗ-trợ)
- [3. Kiến Trúc AI & Mô Hình Học Sâu](#3-kiến-trúc-ai--mô-hình-học-sâu)
- [4. Động Cơ Dinh Dưỡng Thú Y](#4-động-cơ-dinh-dưỡng-thú-y)
- [5. Công Nghệ & Thư Viện Sử Dụng](#5-công-nghệ--thư-viện-sử-dụng)
- [6. Cấu Trúc Mã Nguồn (Clean Architecture)](#6-cấu-trúc-mã-nguồn-clean-architecture)
- [7. Hướng Dẫn Cài Đặt & Khởi Chạy](#7-hướng-dẫn-cài-đặt--khởi-chạy)
- [8. Biên Dịch Gói Ứng Dụng (Build APK)](#8-biên-dịch-gói-ứng-dụng-build-apk)
- [9. Hệ Thống Kiểm Thử Tự Động (Automated Testing)](#9-hệ-thống-kiểm-thử-tự-động-automated-testing)
- [10. Quy Ước Đóng Góp & Phát Triển](#10-quy-ước-đóng-góp--phát-triển)

---

## 1. Tính Năng Cốt Lõi

### 🔬 Nhận Diện Giống Loài Kép (Dual AI Mode)
- **On-Device AI (100% Offline):** Tích hợp Microsoft ONNX Runtime Android v1.18 trực tiếp trên thiết bị di động. Nhận diện hình ảnh siêu tốc (~100-300ms), không cần kết nối Internet, bảo mật hình ảnh và tối ưu bộ nhớ RAM (chạy ổn định trên các dòng máy cấu hình thấp như Samsung Galaxy J7 Prime, Oppo, Xiaomi,...).
- **FastAPI Cloud AI Server:** Xử lý suy luận trên máy chủ đám mây qua RESTful API, cung cấp phân phối xác suất Softmax và xếp hạng **Top 3 giống loài tương đồng**.
- **Làm giàu dữ liệu tức thì (Enriched Knowledge):** Trả về ngay hồ sơ đặc tính giống loài: cân nặng chuẩn, tuổi thọ trung bình, tính cách, rủi ro bệnh lý di truyền và khuyến nghị chăm sóc y tế.

### 🥗 Động Cơ Dinh Dưỡng Thú Y (Veterinary Nutrition Engine)
- **Chuẩn hóa WSAVA / NRC / AAFCO:** Tự động tính toán năng lượng trao đổi nghỉ ngơi:
  $$\text{RER} = 70 \times \text{Cân nặng (kg)}^{0.75}$$
- **Năng lượng duy trì (MER):** Điều chỉnh theo giai đoạn sống (chó/mèo con, trưởng thành, cao tuổi), mức độ vận động và tình trạng triệt sản.
- **Hệ số dinh dưỡng theo giống (Breed-Specific Modifiers):**
  - Giảm calo, tăng xơ cho giống dễ béo phì (Beagle $\times 0.88$, Pug, Basset Hound).
  - Tăng calo bù nhiệt cho giống mèo không lông (Sphynx $\times 1.25$).
  - Khuyến nghị chia 3-4 bữa/ngày, hạt size mini ngừa hạ đường huyết cho dòng chó Toy (Chihuahua).
  - Bổ sung Glucosamine/Chondroitin và kiểm soát tải trọng khớp cho giống lưng dài chân ngắn (Corgi $\times 0.88$).
- **Chi tiết khẩu phần:** Lượng hạt khô (g/ngày, ~370 kcal/100g), lượng pate ướt (g/ngày, ~100 kcal/100g) và lượng nước cần uống ($50\text{–}60\text{ ml/kg/ngày}$).

### 💉 Sổ Tiêm Chủng & Nhắc Nhở Chăm Sóc Y Tế (Care & Vaccine Hub)
- **Quản lý tiêm phòng:** Theo dõi mũi tiêm (dại, 7 bệnh cho chó, 4 bệnh cho mèo), lịch tẩy giun và nhỏ gáy ngừa ve rận.
- **Cảnh báo thông minh:** Tự động phân loại và đánh dấu các mũi tiêm **quá hạn (Overdue)** hoặc **sắp đến hạn trong 14 ngày (Upcoming)**.
- **Lịch chăm sóc hàng ngày:** Gợi ý lịch sinh hoạt theo đặc tính sinh học của Chó (đi dạo, uống nước, men tiêu hóa) và Mèo (dọn khay cát, gel tiêu búi lông Hairball, pate cấp nước).

### 🤖 Trợ Lý Bác Sĩ Thú Y AI (Gemini AI Assistant)
- Tích hợp mô hình ngôn ngữ lớn **Google Gemini**, hỗ trợ giải đáp 24/7 về triệu chứng bất thường, sơ cứu khẩn cấp, dinh dưỡng và hành vi thú cưng.

### 📊 Cổng Quản Trị Hệ Thống (Admin Portal)
- **Dashboard KPI thời gian thực:** Thống kê tổng số người dùng, tổng thú cưng, tỷ lệ phân bố Chó vs Mèo, số ca tiêm phòng đến hạn.
- **Bảo mật phân quyền (RBAC):** Chặn người dùng thường tự ý đổi quyền Admin; tích hợp cơ chế chống Admin tự tước quyền của chính mình (Self-demotion protection).
- **Quản lý bài viết & sản phẩm:** Xuất bản bài viết cẩm nang (Articles/Blog) và sản phẩm chăm sóc thú y (Affiliate Shop).

### 🔄 Cơ Chế Đồng Bộ Ngoại Tuyến (Offline-First Sync Engine)
- Lưu trữ cục bộ tức thì qua SQLite, tự động xếp hàng đợi đồng bộ (Outbox Sync) và đẩy lên Supabase Cloud Database ngay khi thiết bị có kết nối mạng trở lại.

---

## 2. Danh Mục 37 Giống Loài Hỗ Trợ

Hệ thống hỗ trợ nhận diện và cung cấp hồ sơ dinh dưỡng cho **37 giống loài chuẩn Oxford-IIIT Pet Dataset** cùng các giống phổ biến:

| STT | Tên Tiếng Việt | Tên Quốc Tế (Label) | Loài | Đặc Điểm Dinh Dưỡng & Rủi Ro Bệnh |
| :-: | :--- | :--- | :-: | :--- |
| 1 | Mèo Abyssinian | `Abyssinian` | Mèo | Năng động cao, bổ sung Taurine, theo dõi teo võng mạc |
| 2 | Chó Bulldog Mỹ | `american_bulldog` | Chó | Khung xương lớn, kiểm soát Canxi/Photpho ngừa loạn sản khớp |
| 3 | Chó Pitbull Mỹ | `american_pit_bull_terrier` | Chó | Khối cơ nạc cao, nhu cầu đạm động vật tinh khiết |
| 4 | Chó Basset Hound | `basset_hound` | Chó | Lưng dài chân ngắn, giảm 12% calo ngừa thoát vị đĩa đệm (IVDD) |
| 5 | Chó Beagle | `beagle` | Chó | Rất dễ béo phì, hệ số calo $\times 0.88$, kiểm soát khẩu phần |
| 6 | Mèo Bengal | `Bengal` | Mèo | Đạm thô cao $\ge 38\%$, bổ sung Omega-3 bảo vệ da lông vằn |
| 7 | Mèo Birman | `Birman` | Mèo | Giảm Magie và Photpho phòng sỏi Struvite đường tiết niệu |
| 8 | Mèo Bombay | `Bombay` | Mèo | Lông đen bóng đặc trưng, bổ sung Kẽm & Axit béo thiết yếu |
| 9 | Chó Boxer | `boxer` | Chó | Giống mặt xệ, hạt hình lượn sóng, phòng bệnh cơ tim giãn (DCM) |
| 10 | Mèo Anh lông ngắn | `British_Shorthair` | Mèo | Dễ tích mỡ khi triệt sản, bổ sung L-Carnitine đốt mỡ thừa |
| 11 | Chó Chihuahua | `chihuahua` | Chó | Chia 3–4 bữa/ngày, hạt extra-small ngừa hạ đường huyết |
| 12 | Mèo Ai Cập Mau | `Egyptian_Mau` | Mèo | Vận động tốc độ cao, khẩu phần đạm đậm đặc |
| 13 | Chó Cocker Spaniel | `english_cocker_spaniel` | Chó | Dễ viêm tai dị ứng, tránh ngũ cốc gluten, bổ sung Borage Oil |
| 14 | Chó Setter Anh | `english_setter` | Chó | Chó săn thể thao, Omega-3 cá hồi bảo vệ lông lượn sóng |
| 15 | Chó Pointer Đức | `german_shorthaired` | Chó | Mức tiêu hao calo cao, chia bữa tránh xoắn dạ dày (GDV) |
| 16 | Chó Great Pyrenees | `great_pyrenees` | Chó | Giống khổng lồ, chuyển hóa chậm, kiểm soát Canxi nghiêm ngặt |
| 17 | Chó Havanese | `havanese` | Chó | Hạt nhỏ dễ nhai, bổ sung Biotin mượt lông tơ |
| 18 | Chó Japanese Chin | `japanese_chin` | Chó | Giống vòm họng ngắn, bát ăn nông, kiểm soát dị ứng đạm |
| 19 | Chó Keeshond | `keeshond` | Chó | Lớp lông kép dày, kiểm soát mỡ ngừa đái tháo đường |
| 20 | Chó Leonberger | `leonberger` | Chó | Tầm vóc khổng lồ, Glucosamine hàm lượng cao nuôi dưỡng sụn |
| 21 | Mèo Maine Coon | `Maine_Coon` | Mèo | Thể hình lớn nhất nhóm mèo, hạt size to, bảo vệ cơ tim (HCM) |
| 22 | Chó Phốc hươu | `miniature_pinscher` | Chó | Năng lượng bùng nổ, kiểm soát trật xương bánh chè |
| 23 | Chó Newfoundland | `newfoundland` | Chó | Chó cứu hộ bơi lội, Taurine & Carnitine hỗ trợ chức năng tim |
| 24 | Mèo Ba Tư | `Persian` | Mèo | Mặt tịt, hạt hình hạnh nhân dễ ngậm, tăng xơ chống búi lông |
| 25 | Chó Phốc sóc | `pomeranian` | Chó | Nguy cơ sụp khí quản, thức ăn mềm/hạt ngâm, bổ sung sụn vi cá |
| 26 | Chó Pug mặt xệ | `pug` | Chó | Nguy cơ béo phì và hô hấp, giảm calo, bát ăn nghiêng chống sặc |
| 27 | Mèo Ragdoll | `Ragdoll` | Mèo | Tốc độ phát triển chậm (đến 3–4 tuổi), duy trì đạm chất lượng |
| 28 | Mèo Nga xanh | `Russian_Blue` | Mèo | Cân nặng chuẩn 3.5–5kg, ngừa sỏi thận oxalat |
| 29 | Chó Saint Bernard | `saint_bernard` | Chó | Chó cứu hộ dãy Alps, theo dõi xương khớp và chống đầy hơi |
| 30 | Chó Samoyed | `samoyed` | Chó | Bộ lông trắng tuyết kép, Omega-6 và Kẽm ngừa viêm da nóng |
| 31 | Chó Terrier Scotland| `scottish_terrier` | Chó | Kiểm soát khoáng chất thận, giảm hàm lượng muối |
| 32 | Chó Shiba Inu | `shiba_inu` | Chó | Cơ địa dị ứng Atopy, dùng đạm cá hồi hoặc thịt cừu thủy phân |
| 33 | Mèo Sphynx | `Sphynx` | Mèo | Mèo không lông, tăng calo $\times 1.25$ để bù đắp thân nhiệt |
| 34 | Chó Bull Terrier | `staffordshire_bull_terrier` | Chó | Cơ bắp săn chắc, bổ sung L-Glutamine phục hồi cơ bắp |
| 35 | Chó Wheaten Terrier | `wheaten_terrier` | Chó | Nguy cơ bệnh mất đạm đường ruột (PLE), chế độ ăn ít chất béo |
| 36 | Chó Yorkshire Terrier| `yorkshire_terrier` | Chó | Giống Toy răng yếu, hạt giòn đánh bật mảng bám men răng |
| 37 | Chó Corgi / Poodle | `corgi` / `poodle` | Chó | Hồ sơ mở rộng: Corgi chống thoát vị đĩa đệm; Poodle bảo vệ mắt |

---

## 3. Kiến Trúc AI & Mô Hình Học Sâu

```text
               +---------------------------------------------------+
               |             Ảnh Đầu Vào Thú Cưng (RGB)            |
               +---------------------------------------------------+
                                         |
                       Tiền xử lý (Resize 224x224, Chuẩn hóa ImageNet)
                                         |
        +--------------------------------+--------------------------------+
        |                                                                 |
        v                                                                 v
[Chế Độ On-Device AI]                                           [Chế Độ FastAPI Server]
• Microsoft ONNX Runtime Android                                • PyTorch / EfficientNet-B0
• File: pet_37class_linear_int8.onnx (~16.1MB)                  • File: efficientnet_b0_37class_best.pth
• Lượng tử hóa Dynamic Quantization                             • Server API: POST /pet/predict-base64
• Suy luận trên chip CPU ARM (NEON)                             • Tốc độ: ~150-350ms
• Tốc độ: ~100-250ms (Offline)                                  • Phù hợp máy không có phần cứng AI
        |                                                                 |
        +--------------------------------+--------------------------------+
                                         |
                             Mảng Xác Suất Softmax (37 phần tử)
                                         |
                            Trích xuất Top 3 Dự Đoán
                                         |
                 Ánh xạ Kho Tri Thức Dinh Dưỡng & Thú Y
              (breedNutritionProfiles.ts & nutrition_rules.py)
                                         |
       +-------------------------------------------------------------------+
       | - Tên giống tiếng Anh & tiếng Việt                                |
       | - Tỷ lệ phần trăm tin cậy (%)                                     |
       | - Cân nặng chuẩn, tuổi thọ, tính cách                             |
       | - Rủi ro bệnh lý & Khẩu phần năng lượng MER điều chỉnh            |
       +-------------------------------------------------------------------+
```

---

## 4. Động Cơ Dinh Dưỡng Thú Y

Công thức năng lượng được tính toán dựa trên hướng dẫn chính thức của **Hiệp hội Thú y Động vật Nhỏ Thế giới (WSAVA Global Nutrition Committee)**:

1. **Năng lượng nghỉ ngơi (RER):**
   $$\text{RER} = 70 \times \left(\text{Cân nặng (kg)}\right)^{0.75}$$
2. **Năng lượng duy trì hàng ngày (MER):**
   $$\text{MER} = \text{RER} \times \text{Hệ số sinh lý (Base Factor)} \times \text{Hệ số giống (Breed Modifier)}$$
3. **Hệ số sinh lý tham chiếu:**
   - **Chó con (< 4 tháng):** $3.0$ | **Chó con (4–12 tháng):** $2.0$
   - **Chó trưởng thành (đã triệt sản):** $1.6$ | **Chó trưởng thành (chưa triệt sản):** $1.8$
   - **Chó giảm cân:** $1.0$ | **Chó cao tuổi:** $1.4$
   - **Mèo con (< 4 tháng):** $2.5$ | **Mèo con (4–12 tháng):** $2.0$
   - **Mèo trưởng thành (đã triệt sản):** $1.2$ | **Mèo trưởng thành (chưa triệt sản):** $1.4$
   - **Mèo giảm cân:** $0.8$ | **Mèo cao tuổi:** $1.1$

---

## 5. Công Nghệ & Thư Viện Sử Dụng

| Phân Hệ | Công Nghệ & Phiên Bản | Vai Trò |
| :--- | :--- | :--- |
| **Mobile Client** | React Native `0.88.1` | Khung ứng dụng di động đa nền tảng |
| | Expo SDK `~58.0.23` (New Architecture) | Hệ sinh thái phát triển ứng dụng di động |
| | TypeScript `~6.0.3` | Kiểm soát an toàn kiểu dữ liệu tĩnh |
| | Expo Router `~58.0.30` | Điều hướng file-based routing |
| | Zustand `^5.0.15` | Quản lý trạng thái ứng dụng |
| | React Native Paper `^5.15.3` | Giao diện chuẩn Material Design 3 |
| **On-Device AI** | ONNX Runtime Android `1.18.0` | Công cụ suy luận mô hình trực tiếp trên Android |
| | Kotlin `2.2.10` | Native Module cầu nối (`OnDeviceAIModule.kt`) |
| **Backend AI** | Python `3.10+` / FastAPI `0.115+` | Máy chủ RESTful API hiệu năng cao |
| | PyTorch `2.6+` & TorchVision | Framework huấn luyện và nạp trọng số mô hình |
| | Pydantic `v2` | Rà soát và kiểm thực dữ liệu đầu vào |
| | Uvicorn `[standard]` | ASGI Server chạy Backend |
| **Cloud & Storage**| Supabase (`@supabase/supabase-js 2.118`) | Cơ sở dữ liệu PostgreSQL, Auth và Storage |
| | SQLite Local Storage | Lưu trữ cục bộ cho cơ chế Offline-First |
| **Kiểm Thử** | Jest `~30.5.2` & Jest Expo | Bộ kiểm thử tự động cho Mobile Client |
| | Python Unittest | Bộ kiểm thử tự động cho Backend AI |

---

## 6. Cấu Trúc Mã Nguồn (Clean Architecture)

```text
Pet-Care-AI/
├── android/                             # Dự án Android Native (Gradle 9.4, Kotlin 2.2)
│   └── app/src/main/
│       ├── assets/                      # Model ONNX (pet_37class.onnx, mapping)
│       └── java/vn/vku/petcareai/       # Native Modules (OnDeviceAIModule.kt)
├── backend/                             # Máy chủ Backend AI FastAPI
│   ├── app/
│   │   ├── api/routes/                  # API endpoints (/pet, /nutrition, /health)
│   │   ├── schemas/                     # Pydantic schemas (nutrition.py, pet.py)
│   │   ├── services/                    # pet_classifier.py, nutrition_engine.py
│   │   └── data/                        # nutrition_rules.py (luật thú y WSAVA)
│   ├── requirements.txt                 # Dependencies Python
│   └── test_*.py                        # Bộ test tự động phía Backend
├── models/                              # Trọng số PyTorch gốc (.pth)
│   └── 37_class/                        # efficientnet_b0_37class_best.pth
├── models_ondevice/                     # Mô hình xuất xưởng (.onnx, int8)
├── assets/images/                       # Hình ảnh tĩnh, minh họa onboarding
└── src/
    ├── app/                             # Điều hướng màn hình (Expo Router)
    │   ├── (app)/                       # Màn hình chính (index, scanner, nutrition, assistant)
    │   ├── (auth)/                      # Xác thực (login, register, forgot-password)
    │   └── admin.tsx                    # Cổng Quản trị Hệ thống (Admin Portal)
    ├── domain/                          # Nghiệp vụ lõi (Thuần TypeScript, 0 Framework)
    │   ├── entities/                    # Pet, CareReminder, User, Article, Product
    │   ├── services/                    # OnDeviceInferenceService, NutritionCalculator,
    │   │                                # breedNutritionProfiles, GeminiAssistantService
    │   └── usecases/                    # GetPets, SyncPets, EvaluateNutrition
    ├── data/                            # Tầng truy xuất & đồng bộ dữ liệu
    │   ├── repositories/                # AdminRepository, PetRepository, AuthRepository
    │   ├── remote/                      # supabaseClient.ts
    │   └── sync/                        # SyncEngine.ts, OutboxDao.ts
    └── presentation/                    # Tầng giao diện người dùng
        ├── components/                  # AddPetModal, PetCard, ThemedText
        ├── stores/                      # useAuthStore, usePetStore, useArticleStore
        └── theme/                       # Bảng màu, typography, chế độ Sáng/Tối
```

---

## 7. Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Tiên Quyết
- **Node.js:** Phiên bản LTS (Khuyến nghị Node.js 20 hoặc 22).
- **Python:** Phiên bản 3.10 trở lên.
- **Java:** OpenJDK 17.
- **Android SDK:** Cài đặt thông qua Android Studio (Hỗ trợ từ Android 8.1 API 27 đến Android 14+ API 34).

---

### Bước 1: Cấu hình Biến Môi Trường
Sao chép tệp `.env.example` thành `.env` tại thư mục gốc:
```bash
cp .env.example .env
```
Cấu hình các thông số cần thiết:
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Chế độ Mock dữ liệu (false để kết nối Supabase thật)
EXPO_PUBLIC_USE_MOCK=false

# Google Gemini API Key cho trợ lý thú y AI
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Bước 2: Khởi Chạy Máy Chủ Backend AI (FastAPI)
Mở terminal tại thư mục dự án:
```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo Python
python -m venv venv

# Kích hoạt môi trường ảo:
# Trên Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Trên macOS / Linux:
# source venv/bin/activate

# Cài đặt thư viện phụ thuộc
pip install -r requirements.txt

# Khởi chạy máy chủ FastAPI (cổng 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Hoặc chạy lệnh tắt từ thư mục gốc:
```bash
npm run backend
```
> Tài liệu Swagger UI tương tác trực tiếp có tại: `http://localhost:8000/docs`

---

### Bước 3: Cài Đặt & Khởi Chạy Ứng Dụng Mobile
Tại thư mục gốc dự án:
```bash
# Cài đặt toàn bộ dependencies npm
npm install

# Khởi chạy Expo Metro Bundler
npm start
```

Chạy trực tiếp ứng dụng lên điện thoại kết nối qua cáp USB:
```bash
npm run android
```

---

## 8. Biên Dịch Gói Ứng Dụng (Build APK)

Dự án hỗ trợ biên dịch APK tối ưu hóa theo kiến trúc chip phần cứng:

### 1. Build cho các dòng máy phổ thông / hiện đại (64-bit ARM - Oppo, Samsung mới, Xiaomi):
```powershell
cd android
.\gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a
```

### 2. Build cho các dòng máy cấu hình thấp / đời cũ (32-bit ARM - ví dụ Samsung Galaxy J7 Prime):
```powershell
cd android
.\gradlew.bat assembleDebug -PreactNativeArchitectures=armeabi-v7a
```

> Tệp APK đầu ra được tạo tại: `android/app/build/outputs/apk/debug/app-debug.apk`.

Cài đặt nhanh APK lên điện thoại kết nối máy tính qua ADB:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 9. Hệ Thống Kiểm Thử Tự Động (Automated Testing)

Dự án sở hữu bộ kiểm thử tự động toàn diện trên cả hai tầng ứng dụng, đảm bảo tính toàn vẹn và ngăn ngừa hồi quy lỗi:

### Lệnh Thực Thi Kiểm Thử:
```bash
# 1. Chạy toàn bộ 8 bộ test của Mobile App & Admin Portal (Jest):
npm test

# 2. Chạy riêng bộ kiểm thử quy tắc dinh dưỡng Backend AI (Python Unittest):
npm run test:backend

# 3. Chạy kiểm thử toàn diện từ A-Z (Frontend + Backend):
npm run test:all

# 4. Kiểm tra tĩnh kiểu dữ liệu TypeScript:
npm run typecheck
```

### Danh Sách Bộ Test Suites Đang Chạy:

| STT | Tệp Kiểm Thử (Test Suite) | Số Test Cases | Nội Dung Kiểm Thử | Kết Quả |
| :-: | :--- | :-: | :--- | :-: |
| 1 | `OnDeviceInferenceService.test.ts` | **10** | Danh mục 37 giống (25 chó, 12 mèo), tính xác suất Softmax, xếp hạng Top 3, làm giàu hồ sơ thú y, bridge native Android. | **PASS** |
| 2 | `breedNutritionProfiles.test.ts` | **9** | Đảm bảo 100% giống thuộc loài chó/mèo, cấu trúc cân nặng, tỷ lệ đạm/béo, hàm tra cứu giống theo tên/id. | **PASS** |
| 3 | `NutritionCalculator.test.ts` | **13** | Công thức năng lượng RER chuẩn WSAVA, hệ số MER, điều chỉnh calo cho Beagle (giảm calo), Sphynx (tăng calo), Chihuahua. | **PASS** |
| 4 | `AdminRepository.test.ts` | **6** | Tổng hợp KPI thời gian thực, cảnh báo vaccine quá hạn/sắp đến, bảo mật phân quyền RBAC và chống tự hạ quyền Admin. | **PASS** |
| 5 | `CareReminder.test.ts` | **6** | Kiểm tra danh mục nhắc việc hàng ngày chỉ áp dụng cho chó và mèo, định dạng giờ chuẩn HH:MM, mã màu HEX hợp lệ. | **PASS** |
| 6 | `GeminiAssistantService.test.ts` | **3** | Prompt tư vấn y khoa thú y và kịch bản phản hồi của trợ lý ảo AI. | **PASS** |
| 7 | `GetPets.test.ts` | **1** | Usecase lấy danh sách thú cưng của chủ nuôi. | **PASS** |
| 8 | `SyncEngine.test.ts` | **3** | Cơ chế hàng đợi đồng bộ ngoại tuyến/trực tuyến và giải quyết xung đột dữ liệu. | **PASS** |
| 9 | `test_nutrition_rules.py` (Backend) | **8** | Bộ quy tắc dinh dưỡng WSAVA phía máy chủ FastAPI. | **PASS** |
| 10 | `test_nutrition_validation.py` (Backend) | **6** | Pydantic Schemas validation, từ chối tuyệt đối các loài lạ (hamster, chim, thú khác). | **PASS** |

> **Tổng kết:** **65/65 Test Cases Đạt Chuẩn (100% Pass Rate)**, `tsc --noEmit` đạt **0 lỗi**.

---

## 10. Quy Ước Đóng Góp & Phát Triển

1. **Phân nhánh Git (Branching):** Không đẩy mã nguồn trực tiếp lên `main`. Tạo nhánh mới:
   - `feature/ten-tinh-nang`
   - `fix/ten-loi`
   - `test/bo-kiem-thu`
2. **Quy chuẩn thông điệp Commit:** Tuân theo [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: thêm chức năng mới`
   - `fix: sửa lỗi`
   - `test: bổ sung bộ kiểm thử tự động`
   - `docs: cập nhật tài liệu`
   - `refactor: tái cấu trúc mã nguồn`
3. **Tiêu chí nghiệm thu (Checklist):** Luôn đảm bảo `npm run typecheck` và `npm test` đều vượt qua 100% trước khi tạo Pull Request.
4. **Bảo mật:** **Tuyệt đối không đẩy tệp `.env`, API Keys, mật khẩu cơ sở dữ liệu hoặc khóa chứng chỉ Android Keystore lên GitHub.**
