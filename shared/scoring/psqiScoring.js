/**
 * Module tính điểm PSQI chuẩn theo:
 * Buysse DJ, Reynolds CF III, Monk TH, Berman SR, Kupfer DJ.
 * The Pittsburgh Sleep Quality Index: a new instrument for psychiatric practice and research.
 * Psychiatry Research. 1989;28(2):193-213.
 */
const { PSQI } = require('../config/thresholds');

function parseTimeToMinutes(timeStr) {
  if (typeof timeStr !== 'string' || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr.trim())) {
    throw new Error(`Giờ không hợp lệ (${timeStr}). Định dạng chuẩn HH:MM (24 giờ).`);
  }
  const [h, m] = timeStr.trim().split(':').map(Number);
  return h * 60 + m;
}

function validateLikert03(val, fieldName) {
  if (val === undefined || val === null || val === '') {
    throw new Error(`Thiếu câu trả lời bắt buộc: ${fieldName}`);
  }
  const num = Number(val);
  if (!Number.isInteger(num) || num < 0 || num > 3) {
    throw new Error(`Giá trị không hợp lệ cho ${fieldName}: ${val} (phải là số nguyên 0-3).`);
  }
  return num;
}

function calculateTimeInBedHours(bedTimeStr, wakeTimeStr) {
  const bedMin = parseTimeToMinutes(bedTimeStr);
  const wakeMin = parseTimeToMinutes(wakeTimeStr);
  let diffMin = wakeMin - bedMin;
  if (diffMin <= 0) {
    diffMin += 24 * 60; // Xử lý qua nửa đêm
  }
  return diffMin / 60;
}

function scorePSQI(answers) {
  if (!answers || typeof answers !== 'object') {
    throw new Error('Dữ liệu PSQI không hợp lệ.');
  }

  // Validate Q1, Q3 (giờ đi ngủ, giờ thức dậy)
  const timeInBedHours = calculateTimeInBedHours(answers.psqi_1, answers.psqi_3);

  // Validate Q2 (phút đi vào giấc ngủ)
  if (answers.psqi_2 === undefined || answers.psqi_2 === null || answers.psqi_2 === '') {
    throw new Error('Thiếu câu trả lời bắt buộc: psqi_2');
  }
  const latencyMin = Number(answers.psqi_2);
  if (Number.isNaN(latencyMin) || latencyMin < 0 || latencyMin > 600) {
    throw new Error('Thời gian đi vào giấc ngủ (psqi_2) phải từ 0 đến 600 phút.');
  }

  // Validate Q4 (số giờ ngủ thực tế)
  if (answers.psqi_4 === undefined || answers.psqi_4 === null || answers.psqi_4 === '') {
    throw new Error('Thiếu câu trả lời bắt buộc: psqi_4');
  }
  const sleepHours = Number(answers.psqi_4);
  if (Number.isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
    throw new Error('Thời lượng ngủ thực tế (psqi_4) phải từ 0 đến 24 giờ.');
  }

  // Validate 5a - 5i, 6, 7, 8, 9
  const q5a = validateLikert03(answers.psqi_5a, 'psqi_5a');
  const q5b = validateLikert03(answers.psqi_5b, 'psqi_5b');
  const q5c = validateLikert03(answers.psqi_5c, 'psqi_5c');
  const q5d = validateLikert03(answers.psqi_5d, 'psqi_5d');
  const q5e = validateLikert03(answers.psqi_5e, 'psqi_5e');
  const q5f = validateLikert03(answers.psqi_5f, 'psqi_5f');
  const q5g = validateLikert03(answers.psqi_5g, 'psqi_5g');
  const q5h = validateLikert03(answers.psqi_5h, 'psqi_5h');
  const q5i = validateLikert03(answers.psqi_5i, 'psqi_5i');
  // 5j là tùy chọn: nếu không nhập thì tính 0 theo hướng dẫn Buysse 1989
  const q5j = (answers.psqi_5j === undefined || answers.psqi_5j === null || answers.psqi_5j === '')
    ? 0
    : validateLikert03(answers.psqi_5j, 'psqi_5j');

  const q6 = validateLikert03(answers.psqi_6, 'psqi_6');
  const q7 = validateLikert03(answers.psqi_7, 'psqi_7');
  const q8 = validateLikert03(answers.psqi_8, 'psqi_8');
  const q9 = validateLikert03(answers.psqi_9, 'psqi_9');

  // C1: Chất lượng giấc ngủ chủ quan
  const c1 = q9;

  // C2: Thời gian đi vào giấc ngủ
  let q2Score = 0;
  if (latencyMin <= 15) q2Score = 0;
  else if (latencyMin <= 30) q2Score = 1;
  else if (latencyMin <= 60) q2Score = 2;
  else q2Score = 3;

  const c2Sum = q2Score + q5a;
  let c2 = 0;
  if (c2Sum === 0) c2 = 0;
  else if (c2Sum <= 2) c2 = 1;
  else if (c2Sum <= 4) c2 = 2;
  else c2 = 3;

  // C3: Thời lượng ngủ
  let c3 = 0;
  if (sleepHours > 7) c3 = 0;
  else if (sleepHours >= 6) c3 = 1;
  else if (sleepHours >= 5) c3 = 2;
  else c3 = 3;

  // C4: Hiệu quả giấc ngủ thường lệ
  const sleepEfficiency = (sleepHours / timeInBedHours) * 100;
  let c4 = 0;
  if (sleepEfficiency >= 85) c4 = 0;
  else if (sleepEfficiency >= 75) c4 = 1;
  else if (sleepEfficiency >= 65) c4 = 2;
  else c4 = 3;

  // C5: Rối loạn giấc ngủ (tổng 5b -> 5j)
  const c5Sum = q5b + q5c + q5d + q5e + q5f + q5g + q5h + q5i + q5j;
  let c5 = 0;
  if (c5Sum === 0) c5 = 0;
  else if (c5Sum <= 9) c5 = 1;
  else if (c5Sum <= 18) c5 = 2;
  else c5 = 3;

  // C6: Sử dụng thuốc ngủ
  const c6 = q6;

  // C7: Rối loạn chức năng ban ngày
  const c7Sum = q7 + q8;
  let c7 = 0;
  if (c7Sum === 0) c7 = 0;
  else if (c7Sum <= 2) c7 = 1;
  else if (c7Sum <= 4) c7 = 2;
  else c7 = 3;

  const total = c1 + c2 + c3 + c4 + c5 + c6 + c7;
  const isPoorSleep = total > PSQI.POOR_SLEEP_GT;

  return {
    components: { c1, c2, c3, c4, c5, c6, c7 },
    total,
    timeInBedHours: Number(timeInBedHours.toFixed(2)),
    sleepEfficiency: Number(sleepEfficiency.toFixed(1)),
    isPoorSleep,
    interpretation: isPoorSleep
      ? 'Chất lượng giấc ngủ kém (PSQI > 5)'
      : 'Không thuộc nhóm chất lượng giấc ngủ kém (PSQI ≤ 5)'
  };
}

module.exports = { scorePSQI, calculateTimeInBedHours, parseTimeToMinutes };
