require('dotenv').config();
const bcrypt = require('bcryptjs');
const { run, get } = require('./db');

const EDUCATION_SEED = [
  {
    slug: 've-sinh-giac-ngu',
    title: '1. Vệ sinh giấc ngủ cơ bản',
    summary: 'Tạo môi trường ngủ yên tĩnh, tối và thoáng mát giúp não bộ dễ đi vào giấc ngủ sâu.',
    body: 'Giữ phòng ngủ tối, yên tĩnh, nhiệt độ dễ chịu. Chỉ dùng giường để ngủ; tránh xem điện thoại hoặc TV quá lâu trên giường trước khi ngủ.',
    reference: 'Kothari et al., Sleep Medicine, 2021; National Sleep Foundation.'
  },
  {
    slug: 'thoi-gian-ngu-deu-dan',
    title: '2. Duy trì thời gian ngủ đều đặn',
    summary: 'Đi ngủ và thức dậy vào cùng một khung giờ mỗi ngày giúp ổn định nhịp sinh học.',
    body: 'Cố gắng đi ngủ và thức dậy cùng một giờ kể cả cuối tuần. Tránh ngủ trưa quá dài (nên dưới 30 phút và trước 15 giờ chiều).',
    reference: 'Mostafa et al., Diabetes & Vascular Disease Research, 2025.'
  },
  {
    slug: 'han-che-caffeine',
    title: '3. Hạn chế caffeine vào buổi chiều và tối',
    summary: 'Cà phê, trà đặc vào buổi chiều tối có thể làm khó ngủ và gây tỉnh giấc ban đêm.',
    body: 'Tránh uống cà phê, trà đậm hoặc nước ngọt có caffeine sau 14 giờ chiều. Nếu muốn uống buổi tối, hãy chọn nước ấm hoặc trà thảo mộc không caffeine.',
    reference: 'Al-Sayed et al., The Review of Diabetic Studies, 2025.'
  },
  {
    slug: 'hoat-dong-the-luc',
    title: '4. Hoạt động thể lực phù hợp',
    summary: 'Đi bộ nhẹ nhàng hoặc tập dưỡng sinh ban ngày giúp cải thiện rõ rệt chất lượng giấc ngủ.',
    body: 'Duy trì đi bộ nhẹ 20–30 phút mỗi ngày vào buổi sáng hoặc chiều sớm. Tránh tập luyện cường độ cao sát giờ đi ngủ (trong vòng 2–3 giờ trước khi ngủ).',
    reference: 'Andy Rias et al., Journal of Preventive Medicine and Public Health, 2025.'
  },
  {
    slug: 'thu-gian-truoc-khi-ngu',
    title: '5. Thư giãn trước khi ngủ',
    summary: 'Hít thở chậm và thả lỏng cơ thể giúp giảm căng thẳng tinh thần trước giờ ngủ.',
    body: 'Dành 10–15 phút trước khi ngủ để hít thở sâu chậm (hít vào 4 giây, thở ra 6 giây), nghe nhạc nhẹ hoặc đọc sách giấy thay vì xem màn hình điện thoại.',
    reference: 'Xu et al., International Journal of Cognitive Therapy, 2024.'
  },
  {
    slug: 'giac-ngu-va-dtd-tip-2',
    title: '6. Mối liên quan giữa giấc ngủ và đái tháo đường típ 2',
    summary: 'Giấc ngủ kém và đường huyết có mối liên hệ hai chiều chặt chẽ.',
    body: 'Ngủ không đủ giấc hoặc ngủ chập chờn có thể làm cơ thể tăng tiết hormone căng thẳng, ảnh hưởng đến kiểm soát đường huyết. Ngược lại, đường huyết dao động và tiểu đêm cũng làm giấc ngủ bị gián đoạn.',
    reference: 'Reutrakul & Van Cauter, Metabolism, 2018; Dương Thị Ngọc Lan & Lê Văn An, 2024.'
  },
  {
    slug: 'nhan-biet-lo-au-tram-cam',
    title: '7. Nhận biết dấu hiệu lo âu và trầm cảm',
    summary: 'Sức khỏe tinh thần quan trọng không kém việc kiểm soát chỉ số đường huyết.',
    body: 'Nếu bạn thường xuyên cảm thấy căng thẳng kéo dài, bồn chồn, mất hứng thú với những việc trước đây từng thích hoặc buồn bã nhiều ngày, hãy chia sẻ với người thân và bác sĩ điều trị để được lắng nghe và hỗ trợ sớm.',
    reference: 'Zigmond & Snaith, 1983; Bộ Y tế Việt Nam.'
  },
  {
    slug: 'tieu-dem-va-trao-doi-bac-si',
    title: '8. Tiểu đêm và các vấn đề cần trao đổi với bác sĩ',
    summary: 'Thức dậy đi tiểu từ 2 lần/đêm trở lên làm giấc ngủ bị cắt vụn và giảm chất lượng sống.',
    body: 'Ở người bệnh đái tháo đường típ 2, tiểu đêm nhiều lần có thể liên quan đến đường huyết chưa ổn định, chức năng thận hoặc thói quen uống nhiều nước sát giờ ngủ. Hãy trao đổi với bác sĩ điều trị để được kiểm tra, không tự ý thay đổi thuốc đang dùng.',
    reference: 'Fu et al., Frontiers in Public Health, 2022; Dữ liệu sơ bộ BV Trường ĐH Tây Nguyên, 2026.'
  },
  {
    slug: 'khi-nao-can-ho-tro-chuyen-mon',
    title: '9. Khi nào cần tìm kiếm hỗ trợ chuyên môn?',
    summary: 'Chủ động gặp bác sĩ khi kết quả sàng lọc ở mức Vàng hoặc Đỏ.',
    body: 'Bạn nên mang trang kết quả Noctia đến trao đổi tại Phòng khám Nội 2 – Bệnh viện Trường Đại học Tây Nguyên nếu giấc ngủ kém kéo dài, tiểu đêm ≥ 2 lần/đêm, hoặc có điểm lo âu/trầm cảm cao (≥ 11). Tuyệt đối không tự ý ngừng hoặc đổi thuốc đái tháo đường.',
    reference: 'Hướng dẫn chuyên môn Khoa Y – Dược, Trường Đại học Tây Nguyên (đang chờ thẩm định cuối).'
  }
];

async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      consent_at TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      is_synthetic INTEGER NOT NULL DEFAULT 0,
      config_version TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      instrument TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_value TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      UNIQUE(session_id, instrument, question_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS results (
      session_id TEXT PRIMARY KEY,
      psqi_c1 INTEGER NOT NULL,
      psqi_c2 INTEGER NOT NULL,
      psqi_c3 INTEGER NOT NULL,
      psqi_c4 INTEGER NOT NULL,
      psqi_c5 INTEGER NOT NULL,
      psqi_c6 INTEGER NOT NULL,
      psqi_c7 INTEGER NOT NULL,
      psqi_total INTEGER NOT NULL,
      hads_a INTEGER NOT NULL,
      hads_d INTEGER NOT NULL,
      nocturia_frequency INTEGER NOT NULL,
      classification TEXT NOT NULL,
      threshold_version TEXT NOT NULL,
      calculated_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS education_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      body TEXT NOT NULL,
      reference TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Seed admin user
  const adminUser = process.env.ADMIN_DEFAULT_USER || 'admin_noctia';
  const adminPass = process.env.ADMIN_DEFAULT_PASS || 'Noctia@2026!';
  const existingAdmin = await get('SELECT id FROM admin_users WHERE username = ?', [adminUser]);
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPass, 10);
    await run('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)', [adminUser, hash, 'admin']);
  }

  // Seed education items
  const now = new Date().toISOString();
  for (const item of EDUCATION_SEED) {
    await run(
      `INSERT OR IGNORE INTO education_items (slug, title, summary, body, reference, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.slug, item.title, item.summary, item.body, item.reference, now]
    );
  }

  console.log('Database NOCTIA initialized successfully.');
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Init DB failed:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
