import {Pool} from 'pg';

// Server-side connection helper. Configure this with .env values instead of
// committing production credentials into the mobile application.
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'expense_app'
});
