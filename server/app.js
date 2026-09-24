/* global Buffer */
const crypto = require('crypto');
const express = require('express');
const { pool } = require('./db');

const app = express();
app.use(express.json());
const prefix = '/api/v1';
const jwtSecret = process.env.JWT_SECRET || 'change-this-development-secret';
const accessLifetime = 15 * 60 * 1000;
const refreshLifetime = 30 * 24 * 60 * 60 * 1000;

const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const json = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const signAccessToken = user => {
  const payload = json({ sub: user.id, exp: Date.now() + accessLifetime });
  const signature = crypto
    .createHmac('sha256', jwtSecret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
};
const verifyAccessToken = token => {
  const [payload, signature] = String(token || '').split('.');
  const expected = crypto
    .createHmac('sha256', jwtSecret)
    .update(payload || '')
    .digest('base64url');
  if (
    !payload ||
    !signature ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    throw new Error('Invalid token');
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (data.exp < Date.now()) throw new Error('Token expired');
  return data;
};
const passwordHash = password =>
  new Promise((resolve, reject) =>
    crypto.scrypt(
      password,
      process.env.PASSWORD_SALT || 'expense-companion',
      64,
      (error, key) => (error ? reject(error) : resolve(key.toString('hex'))),
    ),
  );
const userDto = row => ({
  id: row.id,
  name: row.name,
  email: row.email,
  currency: row.default_currency,
  timezone: row.timezone,
});
const expenseDto = row => ({
  id: row.id,
  clientId: row.client_id,
  amount: Number(row.amount),
  currency: row.currency,
  transactionType: row.transaction_type,
  categoryId: row.category_id || undefined,
  category: row.category || undefined,
  subCategory: row.sub_category || undefined,
  merchant: row.merchant || undefined,
  paymentMethod: row.payment_method || undefined,
  date: String(row.date).slice(0, 10),
  reminderDate: row.reminder_date
    ? String(row.reminder_date).slice(0, 10)
    : undefined,
  note: row.note || undefined,
  isRecurring: row.is_recurring,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
const ok = (res, data, message = 'Request successful') =>
  res.json({ success: true, data, message });
const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, error: { code, message } });
const auth = (req, res, next) => {
  try {
    const data = verifyAccessToken(
      req.headers.authorization?.replace(/^Bearer\s+/i, ''),
    );
    req.userId = data.sub;
    next();
  } catch (_) {
    fail(res, 401, 'UNAUTHORIZED', 'Please sign in again.');
  }
};
const validExpense = body =>
  Number.isFinite(Number(body.amount)) &&
  Number(body.amount) > 0 &&
  ['spent', 'received'].includes(body.transactionType) &&
  /^\d{4}-\d{2}-\d{2}$/.test(body.date || '');
const values = body => [
  Number(body.amount),
  String(body.currency || 'INR').toUpperCase(),
  body.transactionType,
  body.categoryId || null,
  body.category || null,
  body.subCategory || null,
  body.merchant || null,
  body.paymentMethod || null,
  body.date,
  body.reminderDate || null,
  body.note || null,
  Boolean(body.isRecurring),
];

app.get(`${prefix}/health`, async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    ok(res, { database: 'connected' });
  } catch (e) {
    fail(res, 503, 'DATABASE_UNAVAILABLE', e.message);
  }
});
app.post(`${prefix}/auth/register`, async (req, res, next) => {
  try {
    const { name, email, password, currency = 'INR' } = req.body;
    if (
      !name?.trim() ||
      !/^\S+@\S+\.\S+$/.test(email || '') ||
      !password ||
      password.length < 8
    )
      return fail(
        res,
        400,
        'VALIDATION_ERROR',
        'Name, a valid email, and an 8-character password are required.',
      );
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, default_currency) VALUES ($1, LOWER($2), $3, $4) RETURNING *',
      [name.trim(), email.trim(), await passwordHash(password), currency],
    );
    const user = result.rows[0];
    const refreshToken = crypto.randomBytes(48).toString('base64url');
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, hash(refreshToken), new Date(Date.now() + refreshLifetime)],
    );
    ok(
      res,
      {
        accessToken: signAccessToken(user),
        refreshToken,
        expiresIn: accessLifetime / 1000,
        user: userDto(user),
      },
      'Registration successful',
    );
  } catch (error) {
    if (error.code === '23505')
      return fail(
        res,
        409,
        'EMAIL_EXISTS',
        'An account already exists for this email.',
      );
    next(error);
  }
});
app.post(`${prefix}/auth/login`, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = LOWER($1) AND is_active = TRUE',
      [req.body.email || ''],
    );
    const user = result.rows[0];
    if (
      !user ||
      !crypto.timingSafeEqual(
        Buffer.from(user.password_hash),
        Buffer.from(await passwordHash(req.body.password || '')),
      )
    )
      return fail(
        res,
        401,
        'INVALID_CREDENTIALS',
        'Email or password is incorrect.',
      );
    const refreshToken = crypto.randomBytes(48).toString('base64url');
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, hash(refreshToken), new Date(Date.now() + refreshLifetime)],
    );
    ok(res, {
      accessToken: signAccessToken(user),
      refreshToken,
      expiresIn: accessLifetime / 1000,
      user: userDto(user),
    });
  } catch (error) {
    next(error);
  }
});
app.post(`${prefix}/auth/refresh`, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT u.* FROM refresh_tokens t JOIN users u ON u.id = t.user_id WHERE t.token_hash = $1 AND t.revoked_at IS NULL AND t.expires_at > NOW()',
      [hash(req.body.refreshToken || '')],
    );
    if (!result.rows[0])
      return fail(res, 401, 'INVALID_REFRESH_TOKEN', 'Session has expired.');
    ok(res, {
      accessToken: signAccessToken(result.rows[0]),
      expiresIn: accessLifetime / 1000,
    });
  } catch (error) {
    next(error);
  }
});
app.post(`${prefix}/auth/logout`, auth, async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token_hash = $2',
      [req.userId, hash(req.body.refreshToken || '')],
    );
    ok(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
});
app.get(`${prefix}/auth/me`, auth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [
      req.userId,
    ]);
    ok(res, userDto(result.rows[0]));
  } catch (error) {
    next(error);
  }
});
app.put(`${prefix}/auth/me`, auth, async (req, res, next) => {
  try {
    const { name, timezone, currency } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), timezone = COALESCE($2, timezone), default_currency = COALESCE($3, default_currency), updated_at = NOW() WHERE id = $4 RETURNING *',
      [name?.trim() || null, timezone || null, currency || null, req.userId],
    );
    ok(res, userDto(result.rows[0]), 'Profile updated');
  } catch (error) {
    next(error);
  }
});
app.get(`${prefix}/expenses`, auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 AND deleted_at IS NULL ORDER BY date DESC, created_at DESC',
      [req.userId],
    );
    ok(res, result.rows.map(expenseDto));
  } catch (error) {
    next(error);
  }
});
app.post(`${prefix}/ai-feedback`, auth, async (req, res, next) => {
  try {
    const feedback = req.body || {};
    const required = ['description', 'transactionType', 'predictedCategory', 'finalCategory'];
    if (required.some(key => !String(feedback[key] || '').trim()) || ![0, 1].includes(Number(feedback.wasCorrect)))
      return fail(res, 400, 'VALIDATION_ERROR', 'AI feedback fields are incomplete.');
    const result = await pool.query(
      'INSERT INTO ai_feedback (user_id, description, transaction_type, predicted_category, predicted_class_index, confidence, final_category, final_class_index, was_correct, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
      [req.userId, feedback.description, feedback.transactionType, feedback.predictedCategory, feedback.predictedClassIndex ?? null, feedback.confidence ?? null, feedback.finalCategory, feedback.finalClassIndex ?? null, Number(feedback.wasCorrect), feedback.createdAt || new Date().toISOString()],
    );
    ok(res, {id: result.rows[0].id}, 'AI feedback saved');
  } catch (error) { next(error); }
});
app.get(`${prefix}/expenses/:id`, auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [req.params.id, req.userId],
    );
    if (!result.rows[0])
      return fail(res, 404, 'EXPENSE_NOT_FOUND', 'Expense not found.');
    ok(res, expenseDto(result.rows[0]));
  } catch (error) {
    next(error);
  }
});
app.post(`${prefix}/expenses`, auth, async (req, res, next) => {
  try {
    if (!validExpense(req.body))
      return fail(
        res,
        400,
        'VALIDATION_ERROR',
        'A positive amount, transaction type, and date are required.',
      );
    const clientId =
      req.body.clientId || req.get('Idempotency-Key') || crypto.randomUUID();
    const result = await pool.query(
      'INSERT INTO expenses (user_id, client_id, amount, currency, transaction_type, category_id, category, sub_category, merchant, payment_method, date, reminder_date, note, is_recurring) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (user_id, client_id) DO UPDATE SET client_id = EXCLUDED.client_id RETURNING *',
      [req.userId, clientId, ...values(req.body)],
    );
    ok(res, expenseDto(result.rows[0]), 'Transaction created');
  } catch (error) {
    next(error);
  }
});
app.put(`${prefix}/expenses/:id`, auth, async (req, res, next) => {
  try {
    const existing = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [req.params.id, req.userId],
    );
    if (!existing.rows[0])
      return fail(res, 404, 'EXPENSE_NOT_FOUND', 'Expense not found.');
    const merged = { ...expenseDto(existing.rows[0]), ...req.body };
    if (!validExpense(merged))
      return fail(
        res,
        400,
        'VALIDATION_ERROR',
        'A positive amount, transaction type, and date are required.',
      );
    const result = await pool.query(
      'UPDATE expenses SET amount=$1, currency=$2, transaction_type=$3, category_id=$4, category=$5, sub_category=$6, merchant=$7, payment_method=$8, date=$9, reminder_date=$10, note=$11, is_recurring=$12, updated_at=NOW() WHERE id=$13 AND user_id=$14 RETURNING *',
      [...values(merged), req.params.id, req.userId],
    );
    ok(res, expenseDto(result.rows[0]), 'Transaction updated');
  } catch (error) {
    next(error);
  }
});
app.delete(`${prefix}/expenses/:id`, auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE expenses SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
      [req.params.id, req.userId],
    );
    if (!result.rows[0])
      return fail(res, 404, 'EXPENSE_NOT_FOUND', 'Expense not found.');
    ok(res, { id: req.params.id }, 'Transaction deleted');
  } catch (error) {
    next(error);
  }
});
app.post(`${prefix}/sync`, auth, async (req, res, next) => {
  try {
    const accepted = [];
    for (const change of req.body.changes || []) {
      const clientId = change.clientId;
      if (
        !clientId ||
        !['CREATE', 'UPDATE', 'DELETE'].includes(change.operation)
      )
        continue;
      if (change.operation === 'DELETE') {
        await pool.query(
          'UPDATE expenses SET deleted_at = NOW(), updated_at = NOW() WHERE user_id = $1 AND (id::text = $2 OR client_id = $2)',
          [req.userId, change.entityId || clientId],
        );
        accepted.push({ clientId, serverId: change.entityId || clientId });
        continue;
      }
      const data = change.data || {};
      const previous = await pool.query(
        'SELECT * FROM expenses WHERE user_id = $1 AND (id::text = $2 OR client_id = $2) LIMIT 1',
        [req.userId, change.entityId || clientId],
      );
      const merged = {
        ...(previous.rows[0] ? expenseDto(previous.rows[0]) : {}),
        ...data,
      };
      if (!validExpense(merged)) continue;
      let result;
      if (previous.rows[0]) {
        result = await pool.query(
          'UPDATE expenses SET amount=$1, currency=$2, transaction_type=$3, category_id=$4, category=$5, sub_category=$6, merchant=$7, payment_method=$8, date=$9, reminder_date=$10, note=$11, is_recurring=$12, deleted_at=NULL, updated_at=NOW() WHERE id=$13 RETURNING *',
          [...values(merged), previous.rows[0].id],
        );
      } else {
        result = await pool.query(
          'INSERT INTO expenses (user_id, client_id, amount, currency, transaction_type, category_id, category, sub_category, merchant, payment_method, date, reminder_date, note, is_recurring) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
          [req.userId, clientId, ...values(merged)],
        );
      }
      accepted.push({ clientId, serverId: result.rows[0].id });
    }
    ok(res, {
      accepted,
      updated: [],
      conflicts: [],
      deleted: [],
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
app.use((error, _req, res, _next) => {
  console.error(error);
  fail(res, 500, 'INTERNAL_ERROR', 'An unexpected server error occurred.');
});

module.exports = app;
