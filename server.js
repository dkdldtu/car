const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { customAlphabet } = require('nanoid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'reservations.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ reservations: [] }, null, 2));
}

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { reservations: [] });

async function initDb() {
  await db.read();
  db.data ||= { reservations: [] };
  await db.write();
}

function formatKoreanDateTime(value) {
  return new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ ok: false, message: '관리자 로그인이 필요합니다.' });
}

app.post('/api/reservations', async (req, res) => {
  const { name, phone, rentDate, returnDate, carType, purpose } = req.body;

  if (!name || !phone || !rentDate || !returnDate || !carType) {
    return res.status(400).json({
      ok: false,
      message: '이름, 연락처, 대여일, 반납일, 희망 차종은 필수입니다.',
    });
  }

  const reservation = {
    id: nanoid(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    rentDate,
    returnDate,
    carType,
    purpose: purpose ? String(purpose).trim() : '',
    status: '접수',
    createdAt: new Date().toISOString(),
  };

  await db.read();
  db.data.reservations.unshift(reservation);
  await db.write();

  return res.json({
    ok: true,
    message: '예약 문의가 정상적으로 접수되었습니다.',
    reservation,
  });
});

app.get('/api/reservations', requireAdmin, async (req, res) => {
  await db.read();
  const reservations = db.data.reservations.map((item) => ({
    ...item,
    createdAtKst: formatKoreanDateTime(item.createdAt),
  }));
  return res.json({ ok: true, reservations });
});

app.patch('/api/reservations/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['접수', '확인중', '예약확정', '취소'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ ok: false, message: '올바른 상태값이 아닙니다.' });
  }

  await db.read();
  const target = db.data.reservations.find((item) => item.id === id);
  if (!target) {
    return res.status(404).json({ ok: false, message: '예약 정보를 찾을 수 없습니다.' });
  }

  target.status = status;
  await db.write();
  return res.json({ ok: true, message: '예약 상태가 변경되었습니다.' });
});

app.delete('/api/reservations/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  await db.read();
  const before = db.data.reservations.length;
  db.data.reservations = db.data.reservations.filter((item) => item.id !== id);

  if (db.data.reservations.length === before) {
    return res.status(404).json({ ok: false, message: '삭제할 예약을 찾을 수 없습니다.' });
  }

  await db.write();
  return res.json({ ok: true, message: '예약이 삭제되었습니다.' });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' });
  }

  req.session.isAdmin = true;
  return res.json({ ok: true, message: '로그인되었습니다.' });
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, message: '로그아웃되었습니다.' });
  });
});

app.get('/admin/check', (req, res) => {
  return res.json({ ok: true, isAdmin: !!(req.session && req.session.isAdmin) });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'server is running' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Daewon Rentcar server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('DB 초기화 실패:', error);
    process.exit(1);
  });
