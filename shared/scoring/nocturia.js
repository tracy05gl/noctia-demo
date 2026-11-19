const { NOCTURIA } = require('../config/thresholds');

function evaluateNocturia(value) {
  if (value === undefined || value === null || value === '') {
    throw new Error('Thiếu câu trả lời số lần tiểu đêm.');
  }
  const freq = Number(value);
  if (![0, 1, 2].includes(freq)) {
    throw new Error(`Giá trị tiểu đêm không hợp lệ: ${value} (chỉ nhận 0, 1, hoặc 2).`);
  }

  const labels = {
    0: 'Không lần nào',
    1: '1 lần/đêm',
    2: 'Từ 2 lần/đêm trở lên'
  };

  const isFrequent = freq >= NOCTURIA.HIGH_FREQUENCY_MIN;

  return {
    frequency: freq,
    label: labels[freq],
    isFrequent,
    recommendation: isFrequent
      ? 'Bạn thức dậy đi tiểu từ 2 lần mỗi đêm trở lên. Bạn nên trao đổi với bác sĩ điều trị để được kiểm tra thêm về tình trạng kiểm soát đường huyết và chức năng thận.'
      : 'Số lần tiểu đêm hiện tại chưa ở mức cao. Hãy tiếp tục theo dõi và duy trì kiểm soát đường huyết tốt.'
  };
}

module.exports = { evaluateNocturia };
