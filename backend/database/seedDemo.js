require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { run } = require('./db');
const { initDatabase } = require('./initDb');
const { scorePSQI } = require('../../shared/scoring/psqiScoring');
const { scoreHADS } = require('../../shared/scoring/hadsScoring');
const { evaluateNocturia } = require('../../shared/scoring/nocturia');
const { classifyNoctiaResult } = require('../../shared/scoring/integratedClassification');
const { CONFIG_VERSION, THRESHOLD_VERSION } = require('../../shared/config/thresholds');

const DEMO_CASES = [
  {
    name: 'Nhóm Xanh (PSQI <= 5, HADS <= 7, tiểu đêm 0)',
    psqi: {
      psqi_1: '22:00', psqi_2: 10, psqi_3: '06:00', psqi_4: 7.5,
      psqi_5a: 0, psqi_5b: 0, psqi_5c: 0, psqi_5d: 0, psqi_5e: 0,
      psqi_5f: 0, psqi_5g: 0, psqi_5h: 0, psqi_5i: 0, psqi_5j: 0,
      psqi_6: 0, psqi_7: 0, psqi_8: 0, psqi_9: 0
    },
    hads: {
      hads_1: 0, hads_2: 0, hads_3: 1, hads_4: 0, hads_5: 1, hads_6: 0, hads_7: 0,
      hads_8: 1, hads_9: 0, hads_10: 0, hads_11: 0, hads_12: 0, hads_13: 0, hads_14: 0
    },
    nocturia: 0
  },
  {
    name: 'Nhóm Vàng do PSQI (PSQI > 5, HADS <= 7, tiểu đêm 1)',
    psqi: {
      psqi_1: '22:30', psqi_2: 40, psqi_3: '05:30', psqi_4: 5.5,
      psqi_5a: 2, psqi_5b: 2, psqi_5c: 1, psqi_5d: 0, psqi_5e: 1,
      psqi_5f: 0, psqi_5g: 1, psqi_5h: 0, psqi_5i: 1, psqi_5j: 0,
      psqi_6: 0, psqi_7: 1, psqi_8: 1, psqi_9: 2
    },
    hads: {
      hads_1: 1, hads_2: 1, hads_3: 1, hads_4: 0, hads_5: 1, hads_6: 1, hads_7: 1,
      hads_8: 1, hads_9: 0, hads_10: 0, hads_11: 0, hads_12: 1, hads_13: 0, hads_14: 0
    },
    nocturia: 1
  },
  {
    name: 'Nhóm Vàng do HADS (PSQI <= 5, HADS-A = 9, tiểu đêm 0)',
    psqi: {
      psqi_1: '22:00', psqi_2: 15, psqi_3: '06:00', psqi_4: 7,
      psqi_5a: 1, psqi_5b: 1, psqi_5c: 0, psqi_5d: 0, psqi_5e: 0,
      psqi_5f: 0, psqi_5g: 0, psqi_5h: 0, psqi_5i: 0, psqi_5j: 0,
      psqi_6: 0, psqi_7: 0, psqi_8: 1, psqi_9: 1
    },
    hads: {
      hads_1: 2, hads_2: 1, hads_3: 1, hads_4: 0, hads_5: 2, hads_6: 1, hads_7: 1,
      hads_8: 1, hads_9: 1, hads_10: 0, hads_11: 1, hads_12: 0, hads_13: 1, hads_14: 0
    },
    nocturia: 0
  },
  {
    name: 'Nhóm Đỏ do HADS-A >= 11',
    psqi: {
      psqi_1: '23:00', psqi_2: 20, psqi_3: '06:00', psqi_4: 6.5,
      psqi_5a: 1, psqi_5b: 1, psqi_5c: 0, psqi_5d: 0, psqi_5e: 0,
      psqi_5f: 0, psqi_5g: 0, psqi_5h: 0, psqi_5i: 0, psqi_5j: 0,
      psqi_6: 0, psqi_7: 1, psqi_8: 0, psqi_9: 1
    },
    hads: {
      hads_1: 3, hads_2: 1, hads_3: 2, hads_4: 1, hads_5: 2, hads_6: 1, hads_7: 2,
      hads_8: 1, hads_9: 2, hads_10: 1, hads_11: 2, hads_12: 1, hads_13: 1, hads_14: 1
    },
    nocturia: 0
  },
  {
    name: 'Nhóm Đỏ do PSQI > 5 kết hợp tiểu đêm >= 2',
    psqi: {
      psqi_1: '22:00', psqi_2: 45, psqi_3: '05:00', psqi_4: 4.5,
      psqi_5a: 3, psqi_5b: 3, psqi_5c: 3, psqi_5d: 1, psqi_5e: 1,
      psqi_5f: 0, psqi_5g: 1, psqi_5h: 1, psqi_5i: 2, psqi_5j: 0,
      psqi_6: 1, psqi_7: 2, psqi_8: 2, psqi_9: 3
    },
    hads: {
      hads_1: 1, hads_2: 1, hads_3: 1, hads_4: 1, hads_5: 1, hads_6: 1, hads_7: 1,
      hads_8: 1, hads_9: 0, hads_10: 0, hads_11: 0, hads_12: 0, hads_13: 0, hads_14: 0
    },
    nocturia: 2
  }
];

async function seedDemo() {
  await initDatabase();
  const now = new Date().toISOString();

  for (const c of DEMO_CASES) {
    const sid = uuidv4();
    await run(
      `INSERT INTO sessions (id, consent_at, created_at, completed_at, is_synthetic, config_version)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [sid, now, now, now, CONFIG_VERSION]
    );

    for (const [k, v] of Object.entries(c.psqi)) {
      await run(
        `INSERT INTO answers (session_id, instrument, question_id, answer_value) VALUES (?, 'PSQI', ?, ?)`,
        [sid, k, String(v)]
      );
    }
    for (const [k, v] of Object.entries(c.hads)) {
      await run(
        `INSERT INTO answers (session_id, instrument, question_id, answer_value) VALUES (?, 'HADS', ?, ?)`,
        [sid, k, String(v)]
      );
    }
    await run(
      `INSERT INTO answers (session_id, instrument, question_id, answer_value) VALUES (?, 'NOCTURIA', 'nocturia_freq', ?)`,
      [sid, String(c.nocturia)]
    );

    const psqiRes = scorePSQI(c.psqi);
    const hadsRes = scoreHADS(c.hads);
    const nocRes = evaluateNocturia(c.nocturia);
    const cls = classifyNoctiaResult({
      psqiTotal: psqiRes.total,
      hadsA: hadsRes.hadsA,
      hadsD: hadsRes.hadsD,
      nocturiaFreq: nocRes.frequency
    });

    await run(
      `INSERT INTO results (
        session_id, psqi_c1, psqi_c2, psqi_c3, psqi_c4, psqi_c5, psqi_c6, psqi_c7,
        psqi_total, hads_a, hads_d, nocturia_frequency, classification, threshold_version, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sid,
        psqiRes.components.c1, psqiRes.components.c2, psqiRes.components.c3,
        psqiRes.components.c4, psqiRes.components.c5, psqiRes.components.c6, psqiRes.components.c7,
        psqiRes.total, hadsRes.hadsA, hadsRes.hadsD, nocRes.frequency,
        cls.level, THRESHOLD_VERSION, now
      ]
    );
    console.log(`[DEMO SEEDED] ${c.name} -> ${cls.level} (PSQI=${psqiRes.total}, HADS-A=${hadsRes.hadsA}, HADS-D=${hadsRes.hadsD}, Noc=${nocRes.frequency})`);
  }
}

if (require.main === module) {
  seedDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
