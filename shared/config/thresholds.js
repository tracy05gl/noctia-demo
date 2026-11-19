/**
 * Cấu hình ngưỡng phân loại chuẩn theo thuyết minh đề tài NOCTIA (Trường ĐH Tây Nguyên, 2026)
 * KHÔNG tự ý thay đổi ngưỡng PSQI > 5 hoặc quy tắc Xanh - Vàng - Đỏ.
 */
module.exports = {
  CONFIG_VERSION: process.env.CONFIG_VERSION || '1.0.0-mvp',
  THRESHOLD_VERSION: process.env.THRESHOLD_VERSION || '2026.1-tnu',
  PSQI: {
    POOR_SLEEP_GT: 5 // PSQI > 5 (tức >= 6) là chất lượng giấc ngủ kém
  },
  HADS: {
    NORMAL_MAX: 7,     // 0 - 7: Trong giới hạn bình thường
    BORDERLINE_MIN: 8, // 8 - 10: Mức nghi ngờ / cần lưu ý
    BORDERLINE_MAX: 10,
    HIGH_MIN: 11       // >= 11: Mức cao, cần được đánh giá chuyên môn
  },
  NOCTURIA: {
    HIGH_FREQUENCY_MIN: 2 // >= 2 lần/đêm
  }
};
