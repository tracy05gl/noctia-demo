/**
 * Hệ thống phân loại kết quả tích hợp NOCTIA (Xanh - Vàng - Đỏ)
 * Thứ tự ưu tiên: ĐỎ > VÀNG > XANH.
 * Lưu ý: Đây là mức gợi ý của Noctia theo đề xuất nghiên cứu, KHÔNG phải chẩn đoán y khoa.
 */
const { PSQI, HADS, NOCTURIA, THRESHOLD_VERSION } = require('../config/thresholds');

function classifyNoctiaResult({ psqiTotal, hadsA, hadsD, nocturiaFreq }) {
  if (
    typeof psqiTotal !== 'number' || Number.isNaN(psqiTotal) ||
    typeof hadsA !== 'number' || Number.isNaN(hadsA) ||
    typeof hadsD !== 'number' || Number.isNaN(hadsD) ||
    typeof nocturiaFreq !== 'number' || Number.isNaN(nocturiaFreq)
  ) {
    throw new Error('Dữ liệu đầu vào chưa đầy đủ để phân loại kết quả Noctia.');
  }

  const reasons = [];

  // Kiểm tra điều kiện ĐỎ (ưu tiên cao nhất)
  const isRedHadsA = hadsA >= HADS.HIGH_MIN;
  const isRedHadsD = hadsD >= HADS.HIGH_MIN;
  const isRedSleepNocturia = (psqiTotal > PSQI.POOR_SLEEP_GT) && (nocturiaFreq >= NOCTURIA.HIGH_FREQUENCY_MIN);

  if (isRedHadsA) reasons.push(`Điểm lo âu (HADS-A = ${hadsA}) ở mức cao (≥ 11), cần được đánh giá chuyên môn.`);
  if (isRedHadsD) reasons.push(`Điểm trầm cảm (HADS-D = ${hadsD}) ở mức cao (≥ 11), cần được đánh giá chuyên môn.`);
  if (isRedSleepNocturia) reasons.push(`Chất lượng giấc ngủ kém (PSQI = ${psqiTotal} > 5) kèm tiểu đêm từ 2 lần/đêm trở lên.`);

  if (isRedHadsA || isRedHadsD || isRedSleepNocturia) {
    return {
      level: 'RED',
      label: 'Mức Đỏ – Cần trao đổi sớm với bác sĩ',
      reasons,
      nextStep: 'Bạn nên mang trang kết quả này trao đổi sớm với bác sĩ điều trị tại Phòng khám Nội 2 – Bệnh viện Trường Đại học Tây Nguyên để được thăm khám và đánh giá chuyên môn phù hợp.',
      disclaimer: 'Đây là mức gợi ý sàng lọc của Noctia, không phải chẩn đoán bệnh và không thay thế khám bác sĩ.',
      thresholdVersion: THRESHOLD_VERSION
    };
  }

  // Kiểm tra điều kiện VÀNG
  const isYellowPsqi = psqiTotal > PSQI.POOR_SLEEP_GT;
  const isYellowHadsA = hadsA >= HADS.BORDERLINE_MIN && hadsA <= HADS.BORDERLINE_MAX;
  const isYellowHadsD = hadsD >= HADS.BORDERLINE_MIN && hadsD <= HADS.BORDERLINE_MAX;

  if (isYellowPsqi) reasons.push(`Điểm chất lượng giấc ngủ PSQI = ${psqiTotal} (> 5), cho thấy giấc ngủ chưa tốt.`);
  if (isYellowHadsA) reasons.push(`Điểm lo âu (HADS-A = ${hadsA}) ở mức cần lưu ý (8–10).`);
  if (isYellowHadsD) reasons.push(`Điểm trầm cảm (HADS-D = ${hadsD}) ở mức cần lưu ý (8–10).`);

  if (isYellowPsqi || isYellowHadsA || isYellowHadsD) {
    return {
      level: 'YELLOW',
      label: 'Mức Vàng – Cần lưu ý và trao đổi khi tái khám',
      reasons,
      nextStep: 'Bạn nên áp dụng các hướng dẫn vệ sinh giấc ngủ dưới đây và trao đổi kết quả này với bác sĩ trong lần tái khám gần nhất.',
      disclaimer: 'Đây là mức gợi ý sàng lọc của Noctia, không phải chẩn đoán bệnh và không thay thế khám bác sĩ.',
      thresholdVersion: THRESHOLD_VERSION
    };
  }

  // Mức XANH (khi thỏa mãn tất cả: PSQI <= 5, HADS-A <= 7, HADS-D <= 7)
  reasons.push(`Điểm chất lượng giấc ngủ PSQI = ${psqiTotal} (≤ 5).`);
  reasons.push(`Điểm lo âu (HADS-A = ${hadsA}) và trầm cảm (HADS-D = ${hadsD}) trong giới hạn bình thường (≤ 7).`);

  return {
    level: 'GREEN',
    label: 'Mức Xanh – Kết quả sàng lọc ổn định',
    reasons,
    nextStep: 'Hãy tiếp tục duy trì thói quen ngủ lành mạnh, chế độ sinh hoạt điều độ và tái khám đái tháo đường định kỳ.',
    disclaimer: 'Đây là mức gợi ý sàng lọc của Noctia, không phải chẩn đoán bệnh và không thay thế khám bác sĩ.',
    thresholdVersion: THRESHOLD_VERSION
  };
}

module.exports = { classifyNoctiaResult };
