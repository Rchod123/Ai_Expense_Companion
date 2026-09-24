import { getDatabase } from './database';

export const initDatabase = async () => {
  const db = await getDatabase();

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      client_id TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      transaction_type TEXT NOT NULL DEFAULT 'spent',
      category_id TEXT,
      category TEXT,
      sub_category TEXT,
      merchant TEXT,
      payment_method TEXT,
      date TEXT NOT NULL,
      reminder_date TEXT,
      note TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      deleted_at TEXT
    );
  `);

  // Existing development databases were created before these UI fields existed.
  // Add them without discarding locally stored transactions.
  const [columnsResult] = await db.executeSql('PRAGMA table_info(expenses)');
  const columns = new Set<string>();
  for (let index = 0; index < columnsResult.rows.length; index += 1) {
    columns.add(columnsResult.rows.item(index).name);
  }
  if (!columns.has('transaction_type')) {
    await db.executeSql(
      "ALTER TABLE expenses ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'spent'",
    );
  }
  if (!columns.has('category')) {
    await db.executeSql('ALTER TABLE expenses ADD COLUMN category TEXT');
  }
  if (!columns.has('deleted_at')) {
    await db.executeSql('ALTER TABLE expenses ADD COLUMN deleted_at TEXT');
  }
  if (!columns.has('reminder_date')) {
    await db.executeSql('ALTER TABLE expenses ADD COLUMN reminder_date TEXT');
  }

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      operation TEXT NOT NULL,
      client_id TEXT NOT NULL,
      entity_id TEXT,
      data TEXT,
      created_at TEXT NOT NULL
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS auth_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      access_token TEXT,
      refresh_token TEXT,
      expires_in INTEGER,
      user_json TEXT
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS ai_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      predicted_category TEXT NOT NULL,
      predicted_class_index INTEGER,
      confidence REAL,
      final_category TEXT NOT NULL,
      final_class_index INTEGER,
      was_correct INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  console.log('Database initialized');
};
