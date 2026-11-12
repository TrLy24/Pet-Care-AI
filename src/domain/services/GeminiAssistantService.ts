/**
 * GeminiAssistantService
 *
 * Domain service providing Generative AI veterinary consultations
 * via Google Gemini API (gemini-1.5-flash) with specialized veterinary context.
 */
import type { ChatMessage } from '../entities/ChatMessage';

export interface PetContext {
  id?: string;
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  weightKg?: number;
  ageYears?: number;
  isNeutered?: boolean;
}

export interface GeminiConsultationRequest {
  userQuery: string;
  petContext?: PetContext | null;
  history?: ChatMessage[];
  apiKey?: string;
}

const SYSTEM_PROMPT = `
Bạn là "PawCare AI Doctor" - Trợ lý Bác sĩ Thú y AI thông minh, tận tâm và chuyên nghiệp được phát triển riêng cho ứng dụng di động PawCare AI.

NGUYÊN TẮC HOẠT ĐỘNG:
1. Ngôn ngữ: Luôn trả lời bằng tiếng Việt thân thiện, rõ ràng, dễ hiểu cho người nuôi thú cưng.
2. Chuyên môn: Cung cấp thông tin chăm sóc sức khỏe, sơ cứu, dinh dưỡng, hành vi, và lịch tiêm chủng/tẩy giun chuẩn y khoa thú y.
3. Cá nhân hóa: Khi có thông tin thú cưng (tên, loài chó/mèo, giống loài, cân nặng), hãy xưng hô thân mật (ví dụ: "với bé [Tên bé] giống [Giống] nặng [Số kg]...") và đưa ra lời khuyên được may đo chính xác cho kích thước và cơ địa của bé.
4. Cảnh báo khẩn cấp: Nếu người dùng mô tả các triệu chứng nguy hiểm (khó thở, co giật, nôn ra máu, tiêu chảy cấp mất nước, ngộ độc sô-cô-la/hành tỏi, hôn mê), hãy CẢNH BÁO ĐỎ và khuyên đưa bé tới trạm thú y gần nhất NGAY LẬP TỨC.
5. Khuyến cáo y tế: Nhắc nhở người dùng rằng tư vấn của AI mang tính tham khảo chuyên môn và không thay thế hoàn toàn việc thăm khám trực tiếp tại phòng khám thú y.
6. Quy tắc định dạng câu trả lời:
- TUYỆT ĐỐI KHÔNG dùng dấu sao (*) hoặc dấu sao đôi (**) trong bất kỳ câu trả lời nào. Không dùng **chữ đậm** hay *chữ nghiêng*.
- Để nhấn mạnh từ ngữ quan trọng hoặc tiêu đề: Hãy viết IN HOA (ví dụ: CẢNH BÁO KHẨN CẤP, LƯU Ý, BƯỚC 1, NGAY LẬP TỨC).
- Để tạo danh sách liệt kê: Dùng dấu gạch ngang (-) hoặc đánh số thứ tự (1., 2., 3.).
- Dùng emoji sinh động, câu từ tự nhiên, mạch lạc, dễ đọc trên điện thoại.
`;

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export class GeminiAssistantService {
  /**
   * Kiểm tra xem API Key có phải là Google Gemini Key hợp lệ không
   */
  static isValidKey(key?: string | null): boolean {
    if (!key) return false;
    const trimmed = key.trim();
    if (
      trimmed.startsWith('your_') ||
      trimmed.includes('placeholder') ||
      trimmed.length < 30 ||
      trimmed === 'your_gemini_api_key_here'
    ) {
      return false;
    }
    // Google Gemini API Key chuẩn bắt đầu bằng AIzaSy hoặc AQ.
    return trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.');
  }

  /**
   * Lấy API Key khả dụng (chỉ trả về key nếu thực sự hợp lệ)
   */
  static getEffectiveApiKey(customKey?: string): string {
    const custom = customKey?.trim();
    if (this.isValidKey(custom)) return custom!;

    const env = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
    if (this.isValidKey(env)) return env!;

    return '';
  }

  /**
   * Send consultation query to Google Gemini API
   */
  static async consult(request: GeminiConsultationRequest): Promise<{ text: string; suggestedActions?: string[] }> {
    const apiKey = this.getEffectiveApiKey(request.apiKey);

    // Nếu không có API Key hợp lệ: Sử dụng hệ thống tri thức thú y nội bộ PawCare ngay lập tức
    if (!apiKey) {
      return this.generateSmartFallback(request.userQuery, request.petContext);
    }

    try {
      // Build context string from pet profile
      let petContextStr = '';
      if (request.petContext) {
        petContextStr = `\n[THÔNG TIN THÚ CƯNG HIỆN TẠI]:
        - Tên: ${request.petContext.name}
        - Loài: ${request.petContext.species === 'cat' ? 'Mèo' : 'Chó'}
        - Giống: ${request.petContext.breed || 'Chưa rõ'}
        - Cân nặng: ${request.petContext.weightKg ? `${request.petContext.weightKg} kg` : 'Chưa rõ'}
        - Triệt sản: ${request.petContext.isNeutered ? 'Đã triệt sản' : 'Chưa triệt sản'}\n`;
      }

      // Build conversation contents with strictly alternating turns (user -> model -> user)
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Clean history: exclude initial greeting, errors, and current user question
      const validHistory = (request.history || []).filter(
        (m) => m.id !== 'msg_welcome' && !m.isError && m.text.trim() !== request.userQuery.trim()
      );

      // Take recent messages (up to last 6)
      const recent = validHistory.slice(-6);

      let nextRole: 'user' | 'model' = 'user';
      for (const msg of recent) {
        const role = msg.sender === 'user' ? 'user' : 'model';
        if (role === nextRole) {
          contents.push({
            role,
            parts: [{ text: msg.text }],
          });
          nextRole = nextRole === 'user' ? 'model' : 'user';
        }
      }

      // Ensure that current prompt will alternate properly
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents.pop();
      }

      // Add current user query with pet context as the final user turn
      const promptText = petContextStr
        ? `${petContextStr}\nCâu hỏi của người nuôi: ${request.userQuery}`
        : request.userQuery;

      contents.push({
        role: 'user',
        parts: [{ text: promptText }],
      });

      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };

      // Multi-tier model execution: try models in order until success
      let lastErrMsg = '';
      for (const model of CANDIDATE_MODELS) {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        try {
          const controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 6000);
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });
          if (timeoutId) clearTimeout(timeoutId);

          if (response.ok) {
            const resData = await response.json();
            const candidate = resData?.candidates?.[0];
            const textOutput = candidate?.content?.parts?.[0]?.text;

            if (textOutput) {
              return {
                text: this.cleanAsterisks(textOutput.trim()),
                suggestedActions: this.extractSuggestions(request.userQuery),
              };
            }
          } else {
            const errJson = await response.json().catch(() => ({}));
            lastErrMsg = errJson?.error?.message || `HTTP ${response.status}`;
            continue;
          }
        } catch (e) {
          if (timeoutId) clearTimeout(timeoutId);
          lastErrMsg = e instanceof Error ? e.message : 'Lỗi kết nối';
        }
      }

      throw new Error(lastErrMsg || 'Không thể kết nối tới Google Gemini.');
    } catch (error) {
      const fallback = this.generateSmartFallback(request.userQuery, request.petContext);
      return {
        text: fallback.text,
        suggestedActions: fallback.suggestedActions,
      };
    }
  }

  /**
   * Cleans asterisks (*) and double-asterisks (**) from AI text
   */
  static cleanAsterisks(text: string): string {
    if (!text) return '';
    return text
      // Replace list bullets like '* ' or '  * ' with '• '
      .replace(/^(\s*)\*\s+/gm, '$1• ')
      // Remove bold **word** -> word
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic *word* -> word
      .replace(/\*(.*?)\*/g, '$1')
      // Remove any remaining stray asterisks
      .replace(/\*+/g, '')
      .trim();
  }

  /**
   * Extract dynamic action suggestions based on user intent
   */
  private static extractSuggestions(query: string): string[] {
    const q = query.toLowerCase();
    const suggestions: string[] = [];

    if (q.includes('ăn') || q.includes('dinh dưỡng') || q.includes('hạt') || q.includes('pate')) {
      suggestions.push('🥗 Xem gợi ý khẩu phần chuẩn');
      suggestions.push('🥩 Thức ăn nguy hiểm cần tránh');
    }
    if (q.includes('tiêm') || q.includes('vắc xin') || q.includes('chích') || q.includes('giun')) {
      suggestions.push('💉 Xem sổ tiêm chủng');
      suggestions.push('📅 Đặt lịch tiêm phòng mới');
    }
    if (q.includes('giống') || q.includes('chó') || q.includes('mèo') || q.includes('loài')) {
      suggestions.push('📸 Quét nhận diện giống AI');
    }
    if (suggestions.length === 0) {
      suggestions.push('🥗 Tư vấn dinh dưỡng');
      suggestions.push('💉 Lịch tiêm phòng chuẩn');
      suggestions.push('🚨 Dấu hiệu nguy cấp');
    }
    return suggestions.slice(0, 3);
  }

  /**
   * Smart rule-based veterinary knowledge engine for offline operation
   */
  private static generateSmartFallback(query: string, petContext?: PetContext | null): { text: string; suggestedActions: string[] } {
    const q = query.toLowerCase();
    const petName = petContext?.name ? `bé ${petContext.name}` : 'thú cưng';
    const petBreed = petContext?.breed ? ` (giống ${petContext.breed})` : '';

    if (q.includes('bỏ ăn') || q.includes('biếng ăn') || q.includes('không ăn')) {
      return {
        text: `🐾 Lời khuyên bác sĩ về tình trạng ${petName}${petBreed} bỏ ăn:\n\n` +
          `1. Kiểm tra thời gian bỏ ăn: Nếu bé mới bỏ 1 bữa nhưng vẫn uống nước và vui chơi, hãy theo dõi thêm. Tuy nhiên, với mèo bỏ ăn quá 24h có thể dẫn đến chứng thoái hóa gan nhiễm mỡ nguy hiểm.\n` +
          `2. Quan sát triệu chứng đi kèm: Kiểm tra xem bé có bị sốt, nôn ói, tiêu chảy, lừ đừ hoặc chảy nước dãi không.\n` +
          `3. Cách khắc phục tạm thời: Thử hâm ấm thức ăn (pate) để kích thích khứu giác, cung cấp nước sạch hoặc dung dịch bù điện giải cho thú cưng.\n` +
          `4. Khi nào cần đi khám: Nếu bỏ ăn kèm sốt, nôn ra dịch vàng/bọt trắng hoặc kéo dài trên 24 giờ, hãy đưa bé tới phòng khám thú y ngay.`,
        suggestedActions: ['🥗 Kiểm tra khẩu phần ăn', '🚨 Dấu hiệu nguy cấp'],
      };
    }

    if (q.includes('tiêm') || q.includes('vắc xin') || q.includes('vaccin') || q.includes('lịch tiêm')) {
      return {
        text: `💉 Phác đồ tiêm chủng khuyến nghị cho ${petName}:\n\n` +
          `• Chó con (từ 6 - 8 tuần tuổi):\n` +
          `  - Mũi 1 (6-8 tuần): Vắc-xin 5 bệnh (Care, Parvo, Viêm gan, Ho cũi, Phó cúm).\n` +
          `  - Mũi 2 (10-12 tuần): Vắc-xin 7 bệnh.\n` +
          `  - Mũi 3 (14-16 tuần): Vắc-xin 7 bệnh + Mũi Dại (Rabies).\n` +
          `  - Nhắc lại: Mỗi năm tiêm nhắc 1 mũi 7 bệnh và 1 mũi dại.\n\n` +
          `• Mèo con (từ 8 tuần tuổi):\n` +
          `  - Mũi 1 (8 tuần): Vắc-xin 4 bệnh (Giảm bạch cầu, Viêm mũi khí quản, Calicivirus, Chlamydia).\n` +
          `  - Mũi 2 (12 tuần): Vắc-xin 4 bệnh nhắc lại.\n` +
          `  - Mũi 3 (16 tuần): Nhắc lại 4 bệnh + Tiêm phòng dại.\n` +
          `  - Nhắc lại: Mỗi năm tiêm nhắc 1 mũi tổng hợp.`,
        suggestedActions: ['💉 Vào sổ tiêm chủng', '📅 Tạo lịch nhắc mới'],
      };
    }

    if (q.includes('tiêu chảy') || q.includes('đi ngoài') || q.includes('phân lỏng') || q.includes('phân đen') || q.includes('phân máu')) {
      return {
        text: `🚨 Hướng dẫn xử lý khi ${petName} bị tiêu chảy / đi ngoài phân lỏng:\n\n` +
          `1. Bù nước & điện giải: Tiêu chảy gây mất nước nhanh, hãy pha oresol cho thú cưng uống từng lượng nhỏ.\n` +
          `2. Chế độ ăn nhẹ: Cho nhịn ăn 6-8 tiếng để đường ruột nghỉ ngơi, sau đó cho ăn cháo loãng nấu ức gà luộc xé nhỏ (không nêm gia vị, không dầu mỡ).\n` +
          `3. Tuyệt đối tránh: Không cho uống sữa bò, ăn đồ sống, thức ăn nhiều đạm béo hay đồ ngọt.\n` +
          `4. CẢNH BÁO NGUY HIỂM: Nếu phân có lẫn máu tươi, phân đen như bã cà phê, mùi tanh khắm hoặc kèm sốt, nôn ói liên tục (dấu hiệu Parvo / Care / Viêm tụy cấp), cần đưa bé đến phòng khám thú y NGAY LẬP TỨC.`,
        suggestedActions: ['🚨 Dấu hiệu nguy cấp', '🥗 Chế độ ăn phục hồi đường ruột'],
      };
    }

    if (q.includes('ngứa') || q.includes('rụng lông') || q.includes('nấm') || q.includes('ve') || q.includes('rận') || q.includes('bọ chét') || q.includes('viêm da')) {
      return {
        text: `🩺 Tư vấn da lông & ký sinh trùng cho ${petName}${petBreed}:\n\n` +
          `1. Nấm da (Ringworm): Thường xuất hiện đốm rụng lông hình tròn, vảy trắng, ngứa ngáy. Cần cách ly, bôi thuốc đặc trị nấm (Ketoconazole) và tắm sữa tắm trị nấm 1-2 lần/tuần.\n` +
          `2. Ve, rận, bọ chét: Sử dụng thuốc nhỏ gáy hoặc viên nhai định kỳ (Bravecto, NexGard, Revolution). Giặt sạch đệm nằm và xịt khử khuẩn môi trường sống.\n` +
          `3. Viêm da dị ứng: Có thể do dị ứng thức ăn (đạm bò, gà) hoặc hóa chất lau sàn. Hãy chuyển sang hạt hạt ít gây dị ứng (Hypoallergenic).\n` +
          `4. Lưu ý: Không tự ý dùng thuốc bôi ngoài da của người chứa corticoid liều cao cho chó mèo vì có thể gây nhiễm độc gan thận khi bé liếm phải.`,
        suggestedActions: ['🧴 Cách phòng ngừa ve rận', '🥗 Thức ăn dị ứng da lông'],
      };
    }

    if (q.includes('độc') || q.includes('socola') || q.includes('chocolate') || q.includes('hành') || q.includes('tỏi') || q.includes('nho') || q.includes('xương')) {
      return {
        text: `⚠️ CẢNH BÁO THỰC PHẨM & DỊ VẬT NGUY HIỂM CHO THÚ CƯNG:\n\n` +
          `1. Sô-cô-la: Chứa Theobromine gây co giật, suy tim cấp ở chó mèo. Càng là socola đen nguyên chất thì độc tính càng cao.\n` +
          `2. Hành, tỏi, hẹ: Phá hủy hồng cầu gây thiếu máu tán huyết cấp tính.\n` +
          `3. Nho tươi & nho khô: Gây suy thận cấp không hồi phục chỉ với vài quả.\n` +
          `4. Xương gia cầm nấu chín: Xương gà/vịt dễ gãy vụn tạo cạnh sắc nhọn làm rách họng, thủng dạ dày ruột.\n` +
          `5. Chất ngọt nhân tạo Xylitol (trong kẹo cao su, bơ đậu phộng): Khiến tụt đường huyết đột ngột và suy gan.\n\n` +
          `🚨 SƠ CỨU: Nếu bé vừa nuốt phải trong vòng 1-2 giờ, hãy liên hệ và mang bé đến trạm thú y cấp cứu gần nhất để bác sĩ hỗ trợ gây nôn chuyên khoa!`,
        suggestedActions: ['🚨 Dấu hiệu ngộ độc', '🥗 Thực phẩm an toàn'],
      };
    }

    if (q.includes('ăn') || q.includes('dinh dưỡng') || q.includes('khẩu phần') || q.includes('hạt') || q.includes('pate') || q.includes('cân nặng')) {
      return {
        text: `🥗 Hướng dẫn dinh dưỡng chuẩn cho ${petName}${petBreed}:\n\n` +
          `1. Định lượng khẩu phần mỗi ngày:\n` +
          `  - Chó mèo trưởng thành: Khoảng 2.5% - 3.5% trọng lượng cơ thể/ngày.\n` +
          `  - Chó mèo con đang phát triển: Khoảng 4% - 6% trọng lượng cơ thể/ngày, chia làm 3 - 4 bữa nhỏ.\n` +
          `2. Nguyên tắc đổi thức ăn (Quy tắc 7 ngày):\n` +
          `  - Ngày 1-2: 75% hạt cũ + 25% hạt mới.\n` +
          `  - Ngày 3-4: 50% hạt cũ + 50% hạt mới.\n` +
          `  - Ngày 5-6: 25% hạt cũ + 75% hạt mới.\n` +
          `  - Ngày 7: 100% hạt mới (giúp hệ tiêu hóa thích nghi, không bị tiêu chảy).\n` +
          `3. Luôn chuẩn bị nước sạch 24/7 để bảo vệ thận và bàng quang.`,
        suggestedActions: ['🥗 Xem khẩu phần chi tiết', '🍖 Thực đơn tự nấu'],
      };
    }

    if (q.includes('triệt sản') || q.includes('thiến') || q.includes('động dục') || q.includes('gào đực') || q.includes('sa tử cung')) {
      return {
        text: `🩺 Tư vấn triệt sản & sinh sản cho ${petName}:\n\n` +
          `1. Thời điểm lý tưởng: Từ 6 - 8 tháng tuổi (trước kỳ động dục đầu tiên hoặc sau khi kết thúc kỳ salo).\n` +
          `2. Lợi ích sức khỏe: Giúp đực bớt đánh nhau, xịt nước tiểu đánh dấu lãnh thổ; giúp cái phòng ngừa 90% nguy cơ ung thư vú và viêm tử cung tích mủ.\n` +
          `3. Chăm sóc hậu phẫu: Cho bé đeo loa chống liếm (vòng Elizabeth) liên tục 7-10 ngày, giữ vết mổ khô ráo, hạn chế chạy nhảy leo trèo.`,
        suggestedActions: ['💊 Chăm sóc sau phẫu thuật', '🥗 Dinh dưỡng sau triệt sản'],
      };
    }

    if (q.includes('nôn') || q.includes('ói') || q.includes('bọt trắng') || q.includes('bọt vàng')) {
      return {
        text: `⚠️ Hướng dẫn xử lý khi ${petName} bị nôn mửa:\n\n` +
          `• Nôn bọt trắng/dịch vàng lúc đói: Thường do tăng tiết axit dịch vị dạ dày khi để khoảng cách giữa các bữa quá xa. Chia nhỏ bữa ăn và cho ăn đúng giờ.\n` +
          `• Nôn ra thức ăn chưa tiêu: Thường do ăn quá nhanh hoặc ăn phải vật lạ, dị ứng hạt mới.\n` +
          `• Sơ cứu tại nhà: Tạm ngưng thức ăn trong 4 - 6 giờ, cho uống từng ngụm nước nhỏ. Không tự ý cho uống thuốc người.\n` +
          `• 🚨 CẢNH BÁO NGUY HIỂM: Nếu nôn liên tục, nôn ra máu, đi ngoài phân đen/máu tanh, hoặc bé nằm li bì, có thể do nhiễm Parvo/Care hoặc nuốt dị vật. Hãy đưa bé cấp cứu ngay!`,
        suggestedActions: ['🚨 Dấu hiệu nguy cấp', '🥗 Chế độ ăn nhẹ (Hạt/Pate)'],
      };
    }

    return {
      text: `💡 Tư vấn nhanh về vấn đề bạn đang quan tâm:\n\n` +
        `• Đối với ${petName}${petBreed}, khi gặp biểu hiện bất thường hoặc thắc mắc về chăm sóc, bạn nên theo dõi sát tinh thần, thói quen ăn uống và nhiệt độ cơ thể của bé.\n` +
        `• Nếu bé có biểu hiện mệt mỏi, bỏ ăn hoặc nôn ói/tiêu chảy, hãy đưa bé tới phòng khám thú y để được bác sĩ kiểm tra trực tiếp.\n` +
        `• Bạn cũng có thể hỏi cụ thể hơn về các chủ đề: triệu chứng, dinh dưỡng hạt/pate hoặc lịch tiêm chủng để tôi phân tích chi tiết nhé!`,
      suggestedActions: ['Bé bỏ ăn phải làm sao?', 'Lịch tiêm phòng mũi đầu?', 'Thực phẩm gây độc cho chó mèo'],
    };
  }
}

