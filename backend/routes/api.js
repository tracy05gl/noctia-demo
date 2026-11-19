const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');

const { run, get, all } = require('../database/db');
const { requireAdmin, JWT_SECRET } = require('../middleware/auth');
const { CONFIG_VERSION, THRESHOLD_VERSION } = require('../../shared/config/thresholds');
const psqiBank = require('../../shared/question-banks/psqiQuestions');
const hadsBank = require('../../shared/question-banks/hadsQuestions');
const nocturiaBank = require('../../shared/question-banks/nocturiaQuestion');
const { scorePSQI } = require('../../shared/scoring/psqiScoring');
const { scoreHADS } = require('../../shared/scoring/hadsScoring');
const { evaluateNocturia } = require('../../shared/scoring/nocturia');
const { classifyNoctiaResult } = require('../../shared/scoring/integratedClassification');

const router = express.Router();

// Lấy bộ câu hỏi chuẩn hóa
router.get('/questions', (req, res) => {
  res.json({
    appMode: process.env.APP_MODE || 'DEMO',
    configVersion: CONFIG_VERSION,
    psqi: psqiBank,
    hads: hadsBank,
    nocturia: nocturiaBank
  });
});

// 1. Tạo phiên ẩn danh mới
router.post('/sessions', async (req, res) => {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const isSynthetic = (process.env.APP_MODE || 'DEMO') === 'DEMO' ? 1 : 0;
    await run(
      `INSERT INTO sessions (id, created_at, is_synthetic, config_version) VALUES (?, ?, ?, ?)`,
      [id, now, isSynthetic, CONFIG_VERSION]
    );
    res.status(201).json({ sessionId: id, createdAt: now, isSynthetic: Boolean(isSynthetic) });
  } catch (err) {
    res.status(500).json({ error: 'Không thể khởi tạo phiên đánh giá.' });
  }
});

// 2. Ghi nhận đồng ý tham gia
router.post(
  '/sessions/:id/consent',
  [param('id').isUUID(), body('agreed').isBoolean()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dữ liệu đồng ý không hợp lệ.' });

    const { id } = req.params;
    const { agreed } = req.body;
    const session = await get('SELECT id FROM sessions WHERE id = ?', [id]);
    if (!session) return res.status(404).json({ error: 'Không tìm thấy phiên.' });

    if (!agreed) {
      return res.json({ sessionId: id, consented: false, message: 'Bạn đã chọn không tham gia. Không có dữ liệu khảo sát nào được lưu.' });
    }

    const now = new Date().toISOString();
    await run('UPDATE sessions SET consent_at = ? WHERE id = ?', [now, id]);
    res.json({ sessionId: id, consented: true, consentAt: now });
  }
);

// 3. Lưu câu trả lời từng phần hoặc toàn bộ
router.post(
  '/sessions/:id/answers',
  [
    param('id').isUUID(),
    body('instrument').isIn(['PSQI', 'HADS', 'NOCTURIA']),
    body('answers').isObject()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Định dạng câu trả lời không hợp lệ.' });

    const { id } = req.params;
    const { instrument, answers } = req.body;
    const session = await get('SELECT id, consent_at FROM sessions WHERE id = ?', [id]);
    if (!session) return res.status(404).json({ error: 'Không tìm thấy phiên.' });
    if (!session.consent_at) return res.status(403).json({ error: 'Cần xác nhận đồng ý tham gia trước khi trả lời.' });

    try {
      for (const [qId, val] of Object.entries(answers)) {
        if (val !== undefined && val !== null && val !== '') {
          await run(
            `INSERT INTO answers (session_id, instrument, question_id, answer_value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(session_id, instrument, question_id) DO UPDATE SET answer_value = excluded.answer_value`,
            [id, instrument, qId, String(val)]
          );
        }
      }
      res.json({ saved: true, instrument });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi lưu câu trả lời.' });
    }
  }
);

// 4. Nộp bài & tính điểm ở backend
router.post('/sessions/:id/submit', [param('id').isUUID()], async (req, res) => {
  const { id } = req.params;
  const session = await get('SELECT id, consent_at FROM sessions WHERE id = ?', [id]);
  if (!session) return res.status(404).json({ error: 'Không tìm thấy phiên.' });
  if (!session.consent_at) return res.status(403).json({ error: 'Phiên chưa được xác nhận đồng ý.' });

  const rows = await all('SELECT instrument, question_id, answer_value FROM answers WHERE session_id = ?', [id]);
  const psqiMap = {};
  const hadsMap = {};
  let nocturiaVal = null;

  for (const r of rows) {
    if (r.instrument === 'PSQI') psqiMap[r.question_id] = r.answer_value;
    else if (r.instrument === 'HADS') hadsMap[r.question_id] = r.answer_value;
    else if (r.instrument === 'NOCTURIA' && r.question_id === 'nocturia_freq') nocturiaVal = r.answer_value;
  }

  try {
    const psqiRes = scorePSQI(psqiMap);
    const hadsRes = scoreHADS(hadsMap);
    const nocRes = evaluateNocturia(nocturiaVal);
    const classification = classifyNoctiaResult({
      psqiTotal: psqiRes.total,
      hadsA: hadsRes.hadsA,
      hadsD: hadsRes.hadsD,
      nocturiaFreq: nocRes.frequency
    });

    const now = new Date().toISOString();
    await run(
      `INSERT OR REPLACE INTO results (
        session_id, psqi_c1, psqi_c2, psqi_c3, psqi_c4, psqi_c5, psqi_c6, psqi_c7,
        psqi_total, hads_a, hads_d, nocturia_frequency, classification, threshold_version, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        psqiRes.components.c1, psqiRes.components.c2, psqiRes.components.c3,
        psqiRes.components.c4, psqiRes.components.c5, psqiRes.components.c6, psqiRes.components.c7,
        psqiRes.total, hadsRes.hadsA, hadsRes.hadsD, nocRes.frequency,
        classification.level, THRESHOLD_VERSION, now
      ]
    );
    await run('UPDATE sessions SET completed_at = ? WHERE id = ?', [now, id]);

    res.json({ sessionId: id, psqi: psqiRes, hads: hadsRes, nocturia: nocRes, classification, calculatedAt: now });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Dữ liệu chưa đầy đủ hoặc không hợp lệ.' });
  }
});

// 5. Xem kết quả của phiên
router.get('/sessions/:id/result', [param('id').isUUID()], async (req, res) => {
  const { id } = req.params;
  const row = await get('SELECT * FROM results WHERE session_id = ?', [id]);
  if (!row) return res.status(404).json({ error: 'Chưa có kết quả cho phiên này.' });

  const classification = classifyNoctiaResult({
    psqiTotal: row.psqi_total,
    hadsA: row.hads_a,
    hadsD: row.hads_d,
    nocturiaFreq: row.nocturia_frequency
  });
  const nocRes = evaluateNocturia(row.nocturia_frequency);
  const { interpretSubscale } = require('../../shared/scoring/hadsScoring');

  res.json({
    sessionId: id,
    psqi: {
      components: {
        c1: row.psqi_c1, c2: row.psqi_c2, c3: row.psqi_c3, c4: row.psqi_c4,
        c5: row.psqi_c5, c6: row.psqi_c6, c7: row.psqi_c7
      },
      total: row.psqi_total,
      isPoorSleep: row.psqi_total > 5
    },
    hads: {
      hadsA: row.hads_a,
      hadsD: row.hads_d,
      anxiety: interpretSubscale(row.hads_a),
      depression: interpretSubscale(row.hads_d)
    },
    nocturia: nocRes,
    classification,
    calculatedAt: row.calculated_at
  });
});

// 6. Thư viện giáo dục sức khỏe
router.get('/education', async (req, res) => {
  const items = await all('SELECT id, slug, title, summary, body, reference, updated_at FROM education_items ORDER BY id ASC');
  res.json({ items });
});

// 7. Đăng nhập Admin
router.post(
  '/admin/login',
  [body('username').notEmpty(), body('password').notEmpty()],
  async (req, res) => {
    const { username, password } = req.body;
    const user = await get('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, username: user.username, role: user.role });
  }
);

// 8. Thống kê Admin Dashboard
router.get('/admin/stats', requireAdmin, async (req, res) => {
  const totalSessionsRow = await get('SELECT COUNT(*) as total FROM sessions WHERE consent_at IS NOT NULL');
  const results = await all('SELECT * FROM results');

  const completed = results.length;
  const totalConsented = totalSessionsRow.total || 0;
  const completionRate = totalConsented > 0 ? Number(((completed / totalConsented) * 100).toFixed(1)) : 0;

  if (completed === 0) {
    return res.json({
      overview: { totalConsented, completed: 0, completionRate: 0, avgPsqi: 0, poorSleepRate: 0, avgHadsA: 0, avgHadsD: 0, nocturiaGe2Rate: 0 },
      classificationDist: { GREEN: 0, YELLOW: 0, RED: 0 },
      componentsAvg: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0 },
      nocturiaDist: { 0: 0, 1: 0, 2: 0 },
      records: []
    });
  }

  let sumPsqi = 0, poorCount = 0, sumA = 0, sumD = 0, nocGe2 = 0;
  const clsDist = { GREEN: 0, YELLOW: 0, RED: 0 };
  const nocDist = { 0: 0, 1: 0, 2: 0 };
  const compSum = { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0 };

  for (const r of results) {
    sumPsqi += r.psqi_total;
    if (r.psqi_total > 5) poorCount++;
    sumA += r.hads_a;
    sumD += r.hads_d;
    if (r.nocturia_frequency >= 2) nocGe2++;
    clsDist[r.classification] = (clsDist[r.classification] || 0) + 1;
    nocDist[r.nocturia_frequency] = (nocDist[r.nocturia_frequency] || 0) + 1;
    for (let i = 1; i <= 7; i++) compSum[`c${i}`] += r[`psqi_c${i}`];
  }

  const componentsAvg = {};
  for (let i = 1; i <= 7; i++) componentsAvg[`c${i}`] = Number((compSum[`c${i}`] / completed).toFixed(2));

  res.json({
    overview: {
      totalConsented,
      completed,
      completionRate,
      avgPsqi: Number((sumPsqi / completed).toFixed(2)),
      poorSleepRate: Number(((poorCount / completed) * 100).toFixed(1)),
      avgHadsA: Number((sumA / completed).toFixed(2)),
      avgHadsD: Number((sumD / completed).toFixed(2)),
      nocturiaGe2Rate: Number(((nocGe2 / completed) * 100).toFixed(1))
    },
    classificationDist: clsDist,
    componentsAvg,
    nocturiaDist: nocDist,
    records: results.map(r => ({
      psqi_total: r.psqi_total,
      hads_a: r.hads_a,
      hads_d: r.hads_d,
      nocturia_frequency: r.nocturia_frequency,
      classification: r.classification
    }))
  });
});

// 9. Xuất CSV ẩn danh
router.get('/admin/export.csv', requireAdmin, async (req, res) => {
  const rows = await all(`
    SELECT s.id as session_id, s.completed_at, s.is_synthetic, s.config_version,
           r.psqi_c1, r.psqi_c2, r.psqi_c3, r.psqi_c4, r.psqi_c5, r.psqi_c6, r.psqi_c7,
           r.psqi_total, r.hads_a, r.hads_d, r.nocturia_frequency, r.classification, r.threshold_version
    FROM results r
    JOIN sessions s ON s.id = r.session_id
    ORDER BY s.completed_at DESC
  `);

  const headers = [
    'session_id', 'completed_at', 'is_synthetic', 'config_version', 'threshold_version',
    'psqi_c1', 'psqi_c2', 'psqi_c3', 'psqi_c4', 'psqi_c5', 'psqi_c6', 'psqi_c7',
    'psqi_total', 'hads_a', 'hads_d', 'nocturia_frequency', 'classification'
  ];

  const csvLines = [headers.join(',')];
  for (const r of rows) {
    csvLines.push(headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="noctia_anonymous_export.csv"');
  res.send('\uFEFF' + csvLines.join('\n'));
});

module.exports = router;
