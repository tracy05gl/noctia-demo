/**
 * Module tính điểm HADS (Hospital Anxiety and Depression Scale)
 * Tính riêng HADS-A (7 câu) và HADS-D (7 câu). KHÔNG cộng gộp.
 * Điểm đầu vào cho mỗi câu đã được ánh xạ theo đúng chiều điểm (0-3) của Phụ lục 5.
 */
const { HADS } = require('../config/thresholds');
const hadsBank = require('../question-banks/hadsQuestions');

function interpretSubscale(score) {
  if (score <= HADS.NORMAL_MAX) {
    return { level: 'NORMAL', label: 'Trong giới hạn bình thường (0–7)' };
  }
  if (score <= HADS.BORDERLINE_MAX) {
    return { level: 'BORDERLINE', label: 'Mức nghi ngờ / cần lưu ý (8–10)' };
  }
  return { level: 'HIGH', label: 'Mức cao, cần được đánh giá chuyên môn (≥ 11)' };
}

function scoreHADS(answers) {
  if (!answers || typeof answers !== 'object') {
    throw new Error('Dữ liệu HADS không hợp lệ.');
  }

  let hadsA = 0;
  let hadsD = 0;

  for (const q of hadsBank.questions) {
    const val = answers[q.id];
    if (val === undefined || val === null || val === '') {
      throw new Error(`Thiếu câu trả lời HADS bắt buộc: ${q.id}`);
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0 || num > 3) {
      throw new Error(`Giá trị HADS không hợp lệ tại ${q.id}: ${val}`);
    }
    if (q.subscale === 'A') hadsA += num;
    else if (q.subscale === 'D') hadsD += num;
  }

  return {
    hadsA,
    hadsD,
    anxiety: interpretSubscale(hadsA),
    depression: interpretSubscale(hadsD)
  };
}

module.exports = { scoreHADS, interpretSubscale };
