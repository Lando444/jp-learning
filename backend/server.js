const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PORT = Number(process.env.PORT ?? 4000);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const APP_ROOT = path.join(__dirname, '..');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          users: [],
          sessions: [],
          statsByUser: {},
          wrongQuestionsByUser: {},
          lessonProgressByUser: {},
        },
        null,
        2
      )
    );
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(APP_ROOT, relativePath), 'utf8'));
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  return { salt, hash };
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function publicUser(user) {
  return {
    id: user.id,
    nickname: user.nickname,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function sendData(res, data, status = 200) {
  sendJson(res, status, { data });
}

function sendError(res, status, code, message) {
  sendJson(res, status, { error: { code, message } });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getBearerToken(req) {
  const value = req.headers.authorization ?? '';
  if (!value.startsWith('Bearer ')) {
    return null;
  }
  return value.slice('Bearer '.length);
}

function getAuthUser(req, db) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  const session = db.sessions.find((item) => item.token === token);
  if (!session) {
    return null;
  }

  return db.users.find((user) => user.id === session.userId) ?? null;
}

function defaultStats() {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    completedSessions: 0,
  };
}

function getUserStats(db, userId) {
  db.statsByUser[userId] ??= defaultStats();
  return db.statsByUser[userId];
}

function getUserWrongQuestions(db, userId) {
  db.wrongQuestionsByUser[userId] ??= [];
  return db.wrongQuestionsByUser[userId];
}

function getUserLessonProgress(db, userId) {
  db.lessonProgressByUser[userId] ??= {};
  return db.lessonProgressByUser[userId];
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/^\/api/, '');
  const db = readDb();

  try {
    if (req.method === 'GET' && pathname === '/health') {
      sendData(res, { ok: true });
      return;
    }

    if (req.method === 'POST' && pathname === '/auth/register') {
      const body = await parseBody(req);
      const email = String(body.email ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      const nickname = String(body.nickname ?? '').trim() || '日语学习者';

      if (!email.includes('@') || password.length < 6) {
        sendError(res, 400, 'INVALID_AUTH_INPUT', '邮箱或密码格式不正确。');
        return;
      }

      let user = db.users.find((item) => item.email === email);

      if (user) {
        const { hash } = hashPassword(password, user.passwordSalt);
        if (hash !== user.passwordHash) {
          sendError(res, 401, 'INVALID_CREDENTIALS', '邮箱或密码不正确。');
          return;
        }
      } else {
        const { salt, hash } = hashPassword(password);
        user = {
          id: createId('user'),
          email,
          nickname,
          passwordSalt: salt,
          passwordHash: hash,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }

      const token = createToken();
      db.sessions.push({
        id: createId('session'),
        userId: user.id,
        token,
        createdAt: new Date().toISOString(),
      });

      writeDb(db);
      sendData(res, { user: publicUser(user), token });
      return;
    }

    if (req.method === 'POST' && pathname === '/auth/login') {
      const body = await parseBody(req);
      const email = String(body.email ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      const user = db.users.find((item) => item.email === email);

      if (!user) {
        sendError(res, 401, 'INVALID_CREDENTIALS', '邮箱或密码不正确。');
        return;
      }

      const { hash } = hashPassword(password, user.passwordSalt);
      if (hash !== user.passwordHash) {
        sendError(res, 401, 'INVALID_CREDENTIALS', '邮箱或密码不正确。');
        return;
      }

      const token = createToken();
      db.sessions.push({
        id: createId('session'),
        userId: user.id,
        token,
        createdAt: new Date().toISOString(),
      });

      writeDb(db);
      sendData(res, { user: publicUser(user), token });
      return;
    }

    if (req.method === 'GET' && pathname === '/content/lessons') {
      sendData(res, readJson('src/content/lessonCatalog.json'));
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/content/lessons/')) {
      const lessonId = pathname.split('/').pop();
      const file = path.join(APP_ROOT, 'src', 'content', 'lessons', `${lessonId}.json`);
      if (!fs.existsSync(file)) {
        sendError(res, 404, 'LESSON_NOT_FOUND', '课程不存在。');
        return;
      }
      sendData(res, JSON.parse(fs.readFileSync(file, 'utf8')));
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/content/questions/')) {
      const questionSetId = pathname.split('/').pop();
      const file = path.join(APP_ROOT, 'src', 'content', 'questions', `${questionSetId}.json`);
      if (!fs.existsSync(file)) {
        sendError(res, 404, 'QUESTION_SET_NOT_FOUND', '题库不存在。');
        return;
      }
      sendData(res, JSON.parse(fs.readFileSync(file, 'utf8')));
      return;
    }

    const user = getAuthUser(req, db);
    if (!user) {
      sendError(res, 401, 'UNAUTHORIZED', '请先登录。');
      return;
    }

    if (req.method === 'GET' && pathname === '/me') {
      sendData(res, publicUser(user));
      return;
    }

    if (req.method === 'GET' && pathname === '/me/stats') {
      sendData(res, getUserStats(db, user.id));
      return;
    }

    if (req.method === 'POST' && pathname === '/me/stats/session') {
      const body = await parseBody(req);
      const answeredCount = Math.max(0, Number(body.answeredCount ?? 0));
      const correctCount = Math.max(0, Number(body.correctCount ?? 0));
      const stats = getUserStats(db, user.id);
      stats.totalAnswered += answeredCount;
      stats.totalCorrect += Math.min(correctCount, answeredCount);
      stats.completedSessions += 1;
      writeDb(db);
      sendData(res, stats);
      return;
    }

    if (req.method === 'DELETE' && pathname === '/me/stats') {
      db.statsByUser[user.id] = defaultStats();
      writeDb(db);
      sendData(res, db.statsByUser[user.id]);
      return;
    }

    if (req.method === 'GET' && pathname === '/me/wrong-questions') {
      sendData(res, getUserWrongQuestions(db, user.id));
      return;
    }

    if (req.method === 'POST' && pathname === '/me/wrong-questions') {
      const question = await parseBody(req);

      if (!question.id || !question.stem || !Array.isArray(question.options)) {
        sendError(res, 400, 'INVALID_QUESTION', '错题数据格式不正确。');
        return;
      }

      const wrongQuestions = getUserWrongQuestions(db, user.id);
      const existing = wrongQuestions.find((item) => item.id === question.id);

      if (existing) {
        existing.wrongCount += 1;
        existing.lastWrongAt = new Date().toISOString();
      } else {
        wrongQuestions.push({
          ...question,
          wrongCount: 1,
          lastWrongAt: new Date().toISOString(),
        });
      }

      writeDb(db);
      sendData(res, wrongQuestions);
      return;
    }

    if (req.method === 'DELETE' && pathname === '/me/wrong-questions') {
      db.wrongQuestionsByUser[user.id] = [];
      writeDb(db);
      sendData(res, []);
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/me/wrong-questions/')) {
      const questionId = decodeURIComponent(pathname.split('/').pop());
      db.wrongQuestionsByUser[user.id] = getUserWrongQuestions(db, user.id).filter(
        (question) => question.id !== questionId
      );
      writeDb(db);
      sendData(res, db.wrongQuestionsByUser[user.id]);
      return;
    }

    if (req.method === 'GET' && pathname === '/me/lesson-progress') {
      sendData(res, getUserLessonProgress(db, user.id));
      return;
    }

    if (req.method === 'POST' && pathname === '/me/lesson-progress') {
      const body = await parseBody(req);
      const lessonId = String(body.lessonId ?? '');
      if (!lessonId) {
        sendError(res, 400, 'INVALID_LESSON', '课程 ID 不正确。');
        return;
      }

      const progress = getUserLessonProgress(db, user.id);
      progress[lessonId] = 'completed';
      writeDb(db);
      sendData(res, progress);
      return;
    }

    if (req.method === 'DELETE' && pathname === '/me/lesson-progress') {
      db.lessonProgressByUser[user.id] = {};
      writeDb(db);
      sendData(res, {});
      return;
    }

    sendError(res, 404, 'NOT_FOUND', '接口不存在。');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'INTERNAL_ERROR', '服务器内部错误。');
  }
}

ensureDb();

http.createServer(handleRequest).listen(PORT, '0.0.0.0', () => {
  console.log(`JP Learning API running at http://localhost:${PORT}/api`);
});
