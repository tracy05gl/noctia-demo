module.exports = {
  instrument: 'NOCTURIA',
  title: 'Đánh giá số lần tiểu đêm',
  questions: [
    {
      id: 'nocturia_freq',
      type: 'radio',
      required: true,
      text: 'Trong một đêm thông thường, bạn thức dậy để đi tiểu bao nhiêu lần?',
      options: [
        { value: 0, label: 'Không lần nào' },
        { value: 1, label: '1 lần' },
        { value: 2, label: 'Từ 2 lần trở lên' }
      ]
    }
  ]
};
