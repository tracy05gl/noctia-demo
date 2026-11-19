/**
 * Bộ câu hỏi HADS tiếng Việt - Theo Phụ lục 5 (PHIẾU ĐIỀU TRA)
 * LƯU Ý BẢN QUYỀN: Thang đo HADS thuộc bản quyền của GL Assessment.
 * Chỉ sử dụng trong môi trường nghiên cứu/DEMO; cần xác nhận giấy phép trước khi phát hành rộng rãi.
 */
module.exports = {
  instrument: 'HADS',
  title: 'Thang đo Lo âu và Trầm cảm trong bệnh viện (HADS)',
  copyrightNotice: 'Chế độ DEMO/Nghiên cứu nội bộ. Cần hoàn tất thủ tục bản quyền HADS trước khi triển khai cộng đồng.',
  instruction: 'Hãy mô tả tâm trạng của bản thân mà ông/bà thấy thích hợp nhất với bản thân mình trong 1 tuần vừa qua kể cả hôm nay. Với mỗi câu, chỉ chọn 1 lựa chọn phù hợp nhất.',
  questions: [
    {
      id: 'hads_1', subscale: 'A', reversed: true, required: true,
      text: '1. Cảm thấy căng thẳng',
      options: [
        { value: 3, label: 'Hầu hết thời gian' },
        { value: 2, label: 'Rất thường xuyên' },
        { value: 1, label: 'Thỉnh thoảng' },
        { value: 0, label: 'Không hề' }
      ]
    },
    {
      id: 'hads_2', subscale: 'D', reversed: false, required: true,
      text: '2. Vẫn thích những điều trước đây mình từng thích',
      options: [
        { value: 0, label: 'Vẫn thích như trước' },
        { value: 1, label: 'Không nhiều như trước' },
        { value: 2, label: 'Chỉ thích một chút' },
        { value: 3, label: 'Hầu như không thích' }
      ]
    },
    {
      id: 'hads_3', subscale: 'A', reversed: true, required: true,
      text: '3. Cảm thấy sợ hãi như thể có điều tồi tệ sắp xảy ra',
      options: [
        { value: 3, label: 'Rất rõ ràng và khá nặng' },
        { value: 2, label: 'Có nhưng không quá nặng' },
        { value: 1, label: 'Có chút ít nhưng không đáng lo' },
        { value: 0, label: 'Không hề' }
      ]
    },
    {
      id: 'hads_4', subscale: 'D', reversed: false, required: true,
      text: '4. Có thể cười và nhìn thấy khía cạnh hài hước của mọi việc',
      options: [
        { value: 0, label: 'Như trước đây' },
        { value: 1, label: 'Không nhiều như trước' },
        { value: 2, label: 'Ít rõ rệt' },
        { value: 3, label: 'Không hề' }
      ]
    },
    {
      id: 'hads_5', subscale: 'A', reversed: true, required: true,
      text: '5. Có những suy nghĩ lo lắng cứ xuất hiện trong đầu',
      options: [
        { value: 3, label: 'Hầu hết thời gian' },
        { value: 2, label: 'Phần lớn thời gian' },
        { value: 1, label: 'Thỉnh thoảng' },
        { value: 0, label: 'Rất ít khi' }
      ]
    },
    {
      id: 'hads_6', subscale: 'D', reversed: true, required: true,
      text: '6. Cảm thấy vui vẻ',
      options: [
        { value: 3, label: 'Không hề' },
        { value: 2, label: 'Không thường xuyên' },
        { value: 1, label: 'Thỉnh thoảng' },
        { value: 0, label: 'Hầu hết thời gian' }
      ]
    },
    {
      id: 'hads_7', subscale: 'A', reversed: false, required: true,
      text: '7. Có thể ngồi thảnh thơi và cảm thấy thư giãn',
      options: [
        { value: 0, label: 'Hoàn toàn có thể' },
        { value: 1, label: 'Thường xuyên' },
        { value: 2, label: 'Không thường xuyên' },
        { value: 3, label: 'Không hề' }
      ]
    },
    {
      id: 'hads_8', subscale: 'D', reversed: true, required: true,
      text: '8. Cảm thấy như thể tôi chậm chạp hơn trước',
      options: [
        { value: 3, label: 'Gần như mọi lúc' },
        { value: 2, label: 'Rất thường xuyên' },
        { value: 1, label: 'Thỉnh thoảng' },
        { value: 0, label: 'Không hề' }
      ]
    },
    {
      id: 'hads_9', subscale: 'A', reversed: false, required: true,
      text: '9. Cảm giác bồn chồn trong bụng',
      options: [
        { value: 0, label: 'Không hề' },
        { value: 1, label: 'Thỉnh thoảng' },
        { value: 2, label: 'Khá thường xuyên' },
        { value: 3, label: 'Rất thường xuyên' }
      ]
    },
    {
      id: 'hads_10', subscale: 'D', reversed: true, required: true,
      text: '10. Không còn quan tâm đến ngoại hình của bản thân',
      options: [
        { value: 3, label: 'Hoàn toàn đúng' },
        { value: 2, label: 'Không chăm sóc ngoại hình của bản thân như trước' },
        { value: 1, label: 'Không chăm sóc nhiều như trước' },
        { value: 0, label: 'Vẫn chăm sóc như trước' }
      ]
    },
    {
      id: 'hads_11', subscale: 'A', reversed: true, required: true,
      text: '11. Cảm thấy bồn chồn như thể phải đi tới đi lui',
      options: [
        { value: 3, label: 'Rất nhiều' },
        { value: 2, label: 'Khá nhiều' },
        { value: 1, label: 'Không nhiều lắm' },
        { value: 0, label: 'Không hề' }
      ]
    },
    {
      id: 'hads_12', subscale: 'D', reversed: false, required: true,
      text: '12. Mong đợi những điều thú vị',
      options: [
        { value: 0, label: 'Như trước' },
        { value: 1, label: 'Ít hơn trước' },
        { value: 2, label: 'Ít hơn nhiều so với trước' },
        { value: 3, label: 'Hầu như không còn' }
      ]
    },
    {
      id: 'hads_13', subscale: 'A', reversed: true, required: true,
      text: '13. Cảm giác hoảng loạn một cách đột ngột',
      options: [
        { value: 3, label: 'Rất thường xuyên' },
        { value: 2, label: 'Khá thường xuyên' },
        { value: 1, label: 'Không thường xuyên' },
        { value: 0, label: 'Không hề' }
      ]
    },
    {
      id: 'hads_14', subscale: 'D', reversed: false, required: true,
      text: '14. Có thể tận hưởng một cuốn sách hay, radio hay TV',
      options: [
        { value: 0, label: 'Thường xuyên' },
        { value: 1, label: 'Thỉnh thoảng' },
        { value: 2, label: 'Hiếm khi' },
        { value: 3, label: 'Rất hiếm khi' }
      ]
    }
  ]
};
