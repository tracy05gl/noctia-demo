require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./database/initDb');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); // Cho phép truy cập cùng origin khi deploy monolith/local
  }
}));
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' }
});
app.use('/api', apiLimiter, apiRoutes);

// Phục vụ giao diện Frontend tĩnh
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'NOCTIA', mode: process.env.APP_MODE || 'DEMO' });
});

if (require.main === module) {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`NOCTIA server running at http://localhost:${PORT} [Mode: ${process.env.APP_MODE || 'DEMO'}]`);
    });
  });
}

module.exports = app;
