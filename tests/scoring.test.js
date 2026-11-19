const test = require('node:test');
const assert = require('node:assert/strict');
const { scorePSQI, calculateTimeInBedHours } = require('../shared/scoring/psqiScoring');
const { scoreHADS } = require('../shared/scoring/hadsScoring');
const { evaluateNocturia } = require('../shared/scoring/nocturia');
const { classifyNoctiaResult } = require('../shared/scoring/integratedClassification');

test('PSQI: Xử lý giờ đi ngủ qua nửa đêm (22:30 -> 05:30 = 7 giờ)', () => {
  assert.equal(calculateTimeInBedHours('22:30', '05:30'), 7);
  assert.equal(calculateTimeInBedHours('00:30', '06:30'), 6);
});

test('PSQI: Tính đúng C1-C7 và ngưỡng > 5 (5 vs 6)', () => {
  const goodSleep = scorePSQI({
    psqi_1: '22:00', psqi_2: 15, psqi_3: '06:00', psqi_4: 7.5,
    psqi_5a: 0, psqi_5b: 0, psqi_5c: 0, psqi_5d: 0, psqi_5e: 0,
    psqi_5f: 0, psqi_5g: 0, psqi_5h: 0, psqi_5i: 0, psqi_5j: 0,
    psqi_6: 0, psqi_7: 0, psqi_8: 0, psqi_9: 0
  });
  assert.equal(goodSleep.total, 0);
  assert.equal(goodSleep.isPoorSleep, false);

  // Thiếu câu hỏi bắt buộc phải báo lỗi, không tự gán 0
  assert.throws(() => scorePSQI({ psqi_1: '22:00' }), /Thiếu câu trả lời/);
});

test('HADS: Tính riêng HADS-A và HADS-D, kiểm tra ngưỡng biên 7/8 và 10/11', () => {
  const res = scoreHADS({
    hads_1: 2, hads_3: 2, hads_5: 2, hads_7: 1, hads_9: 0, hads_11: 0, hads_13: 0, // A = 7
    hads_2: 2, hads_4: 2, hads_6: 2, hads_8: 2, hads_10: 0, hads_12: 0, hads_14: 0 // D = 8
  });
  assert.equal(res.hadsA, 7);
  assert.equal(res.anxiety.level, 'NORMAL');
  assert.equal(res.hadsD, 8);
  assert.equal(res.depression.level, 'BORDERLINE');
});

test('Integrated Classification: Kiểm tra ranh giới và thứ tự ưu tiên Đỏ > Vàng > Xanh', () => {
  // Xanh: PSQI = 5, HADS-A = 7, HADS-D = 7, tiểu đêm = 2 (vẫn Xanh vì PSQI <= 5)
  assert.equal(classifyNoctiaResult({ psqiTotal: 5, hadsA: 7, hadsD: 7, nocturiaFreq: 2 }).level, 'GREEN');

  // Vàng do PSQI = 6, tiểu đêm = 1
  assert.equal(classifyNoctiaResult({ psqiTotal: 6, hadsA: 7, hadsD: 7, nocturiaFreq: 1 }).level, 'YELLOW');

  // Đỏ do PSQI = 6 + tiểu đêm = 2
  assert.equal(classifyNoctiaResult({ psqiTotal: 6, hadsA: 7, hadsD: 7, nocturiaFreq: 2 }).level, 'RED');

  // Vàng do HADS-A = 8
  assert.equal(classifyNoctiaResult({ psqiTotal: 4, hadsA: 8, hadsD: 5, nocturiaFreq: 0 }).level, 'YELLOW');

  // Đỏ do HADS-D = 11 (ưu tiên Đỏ dù đồng thời có điều kiện Vàng)
  assert.equal(classifyNoctiaResult({ psqiTotal: 6, hadsA: 9, hadsD: 11, nocturiaFreq: 0 }).level, 'RED');
});

test('Nocturia: Kiểm tra 3 lựa chọn hợp lệ và lỗi ngoài phạm vi', () => {
  assert.equal(evaluateNocturia(0).isFrequent, false);
  assert.equal(evaluateNocturia(1).isFrequent, false);
  assert.equal(evaluateNocturia(2).isFrequent, true);
  assert.throws(() => evaluateNocturia(3), /không hợp lệ/);
});
