/**
 * Bộ câu hỏi PSQI tiếng Việt - Giữ nguyên văn theo Phụ lục 3 (PHIẾU ĐIỀU TRA)
 * Đề tài: Chất lượng giấc ngủ ở bệnh nhân ĐTĐ típ 2 điều trị ngoại trú tại BV Trường ĐH Tây Nguyên 2026.
 */
const FREQ_OPTIONS = [
  { value: 0, label: 'Không có' },
  { value: 1, label: '< 1 lần/tuần' },
  { value: 2, label: '1–2 lần/tuần' },
  { value: 3, label: '> 2 lần/tuần' }
];

const QUALITY_OPTIONS = [
  { value: 0, label: 'Rất tốt' },
  { value: 1, label: 'Tương đối tốt' },
  { value: 2, label: 'Tương đối kém' },
  { value: 3, label: 'Rất kém' }
];

module.exports = {
  instrument: 'PSQI',
  title: 'Thang đánh giá chất lượng giấc ngủ Pittsburgh (PSQI)',
  instruction: 'Các câu hỏi sau đây chỉ liên quan đến thói quen đi ngủ thường ngày của ông/bà trong tháng vừa qua. Ông/Bà hãy trả lời gần đúng nhất với tình trạng giấc ngủ của ông/bà trong đa số ngày và đêm của tháng vừa qua.',
  questions: [
    { id: 'psqi_1', type: 'time', required: true, text: '1. Trong tháng qua, ông/bà thường lên giường đi ngủ lúc mấy giờ?', placeholder: 'Ví dụ: 22:00' },
    { id: 'psqi_2', type: 'number', min: 0, max: 600, required: true, unit: 'phút', text: '2. Trong tháng qua, mỗi đêm ông/bà thường mất bao nhiêu phút mới chợp mắt được?', placeholder: 'Nhập số phút (ví dụ: 20)' },
    { id: 'psqi_3', type: 'time', required: true, text: '3. Trong tháng qua, ông/bà thường thức dậy ra khỏi giường lúc mấy giờ?', placeholder: 'Ví dụ: 05:30' },
    { id: 'psqi_4', type: 'number', step: 0.5, min: 0, max: 24, required: true, unit: 'giờ', text: '4. Trong tháng qua, mỗi đêm ông/bà thường ngủ được mấy tiếng đồng hồ?', placeholder: 'Nhập số giờ ngủ thực tế (ví dụ: 6.5)' },
    { id: 'psqi_5a', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5a. Không thể ngủ được trong vòng 30 phút', options: FREQ_OPTIONS },
    { id: 'psqi_5b', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5b. Tỉnh dậy lúc nửa đêm hoặc quá sớm vào buổi sáng', options: FREQ_OPTIONS },
    { id: 'psqi_5c', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5c. Phải thức dậy để sử dụng nhà vệ sinh', options: FREQ_OPTIONS },
    { id: 'psqi_5d', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5d. Khó thở', options: FREQ_OPTIONS },
    { id: 'psqi_5e', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5e. Ho hoặc ngáy to', options: FREQ_OPTIONS },
    { id: 'psqi_5f', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5f. Cảm thấy rất lạnh', options: FREQ_OPTIONS },
    { id: 'psqi_5g', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5g. Cảm thấy rất nóng', options: FREQ_OPTIONS },
    { id: 'psqi_5h', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5h. Có ác mộng', options: FREQ_OPTIONS },
    { id: 'psqi_5i', type: 'radio', required: true, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5i. Thấy đau', options: FREQ_OPTIONS },
    { id: 'psqi_5j', type: 'radio_with_text', required: false, group: '5. Trong tháng qua, ông/bà có thường gặp các vấn đề sau gây mất ngủ không?', text: '5j. Lý do khác (nếu có, ghi rõ)', options: FREQ_OPTIONS },
    { id: 'psqi_6', type: 'radio', required: true, text: '6. Trong tháng qua, ông/bà có thường phải sử dụng thuốc hỗ trợ giấc ngủ không (theo đơn hoặc tự mua)?', options: FREQ_OPTIONS },
    { id: 'psqi_7', type: 'radio', required: true, text: '7. Trong tháng qua, ông/bà có hay gặp khó khăn để giữ đầu óc tỉnh táo lúc lái xe, lúc ăn hay lúc tham gia các hoạt động xả hơi không?', options: FREQ_OPTIONS },
    { id: 'psqi_8', type: 'radio', required: true, text: '8. Trong tháng qua, ông/bà có gặp khó khăn để duy trì hứng thú hoàn thành các công việc không?', options: FREQ_OPTIONS },
    { id: 'psqi_9', type: 'radio', required: true, text: '9. Trong tháng qua, nhìn chung ông/bà đánh giá về chất lượng giấc ngủ của mình như thế nào?', options: QUALITY_OPTIONS }
  ]
};
