import { getDatabase } from '../database/database';
import {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '../types/expense.types';

const now = () => new Date().toISOString();

const createClientId = () => {
  return `local_exp_${Date.now()}_${Math.random().toString().slice(2, 8)}`;
};

const mapExpense = (row: any): Expense => ({
  id: row.id,
  clientId: row.client_id,
  amount: row.amount,
  currency: row.currency,
  transactionType: row.transaction_type === 'received' ? 'received' : 'spent',

  categoryId: row.category_id,
  category: row.category,
  subCategory: row.sub_category,

  merchant: row.merchant,
  paymentMethod: row.payment_method,

  date: row.date,
  reminderDate: row.reminder_date,
  note: row.note,

  isRecurring: row.is_recurring === 1,

  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const ExpenseRepository = {
  async getAll(): Promise<Expense[]> {
    const db = await getDatabase();
    const [result] = await db.executeSql(`
            SELECT *
            FROM expenses
            WHERE deleted_at IS NULL
            ORDER BY date DESC, 
            created_at DESC;
            `);
    const expenses: Expense[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      expenses.push(mapExpense(result.rows.item(i)));
    }

    return expenses;
  },

  async getById(id: string): Promise<Expense | null> {
    const db = await getDatabase();

    const [result] = await db.executeSql(
      `
            SELECT *
            FROM expenses
            WHERE id = ?
            AND deleted_at IS NULL;
            `,
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }
    return mapExpense(result.rows.item(0));
  },

  async create(input: CreateExpenseInput) {
    const db = await getDatabase();
    const clientId = createClientId();
    const id = clientId;
    const timestamp = now();

    const expense: Expense = {
      id,
      clientId,
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.executeSql(
      `
            INSERT INTO expenses(
            id,
            client_id,
            amount,
            currency,
            transaction_type,
            category_id,
            category,
            sub_category,
            merchant,
            payment_method,
            date,
            reminder_date,
            note,
            is_recurring,
            created_at,
            updated_at,
            sync_status
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `,
      [
        id,
        clientId,
        input.amount,
        input.currency,
        input.transactionType,
        input.categoryId ?? null,
        input.category ?? null,
        input.subCategory ?? null,
        input.merchant ?? null,
        input.paymentMethod ?? null,
        input.date,
        input.reminderDate ?? null,
        input.note ?? null,
        input.isRecurring ? 1 : 0,
        timestamp,
        timestamp,
        'pending',
      ],
    );

    await db.executeSql(
      `
            INSERT INTO sync_queue(
                entity,
                operation,
                client_id,
                entity_id,
                data,
                created_at
            )
            VALUES(?,?,?,?,?,?);
            `,
      [
        input.transactionType === 'received' ? 'income' : 'expense',
        'CREATE',
        clientId,
        id,
        JSON.stringify(input),
        timestamp,
      ],
    );
    return expense;
  },

  async applyServerExpense(localId: string, serverExpense: Expense) {
    const db = await getDatabase();
    const existing = await this.getById(localId);
    if (existing && localId !== serverExpense.id) {
      await db.executeSql('DELETE FROM expenses WHERE id = ?', [localId]);
    }
    await db.executeSql(
      `INSERT OR REPLACE INTO expenses (id, client_id, amount, currency, transaction_type, category_id, category, sub_category, merchant, payment_method, date, reminder_date, note, is_recurring, created_at, updated_at, sync_status, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL)`,
      [serverExpense.id, serverExpense.clientId ?? existing?.clientId ?? serverExpense.id, serverExpense.amount, serverExpense.currency, serverExpense.transactionType, serverExpense.categoryId ?? null, serverExpense.category ?? null, serverExpense.subCategory ?? null, serverExpense.merchant ?? null, serverExpense.paymentMethod ?? null, serverExpense.date, serverExpense.reminderDate ?? null, serverExpense.note ?? null, serverExpense.isRecurring ? 1 : 0, serverExpense.createdAt ?? now(), serverExpense.updatedAt ?? now()],
    );
    await db.executeSql('DELETE FROM sync_queue WHERE entity_id = ? OR client_id = ?', [localId, serverExpense.clientId ?? localId]);
    return serverExpense;
  },

  async replaceWithServerExpenses(expenses: Expense[]) {
    const db = await getDatabase();
    await db.transaction(async transaction => {
      await transaction.executeSql("DELETE FROM expenses WHERE sync_status = 'synced'");
      for (const expense of expenses) {
        await transaction.executeSql(
          `INSERT OR IGNORE INTO expenses (id, client_id, amount, currency, transaction_type, category_id, category, sub_category, merchant, payment_method, date, reminder_date, note, is_recurring, created_at, updated_at, sync_status, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL)`,
          [expense.id, expense.clientId ?? expense.id, expense.amount, expense.currency, expense.transactionType, expense.categoryId ?? null, expense.category ?? null, expense.subCategory ?? null, expense.merchant ?? null, expense.paymentMethod ?? null, expense.date, expense.reminderDate ?? null, expense.note ?? null, expense.isRecurring ? 1 : 0, expense.createdAt ?? now(), expense.updatedAt ?? now()],
        );
      }
    });
    return this.getAll();
  },

  async update(id: string, input: UpdateExpenseInput) {
    const db = await getDatabase();
    const existing = await this.getById(id);

    if (!existing) {
      throw new Error('Expense not found');
    }

    const updatedAt = now();

    const updated = {
      ...existing,
      ...input,
      updatedAt,
    };

    await db.executeSql(
      `
            UPDATE expenses
            SET 
             amount = ?,
             currency = ?,
             transaction_type = ?,
             category_id = ?,
             category = ?,
             sub_category = ?,
             merchant = ?,
             payment_method = ?,
             date = ?,
             reminder_date = ?,
             note = ?,
             is_recurring = ?,
             updated_at = ?,
             sync_status = ?
            WHERE id = ?
            `,
      [
        updated.amount,
        updated.currency,
        updated.transactionType,
        updated.categoryId ?? null,
        updated.category ?? null,
        updated.subCategory ?? null,
        updated.merchant ?? null,
        updated.paymentMethod ?? null,
        updated.date,
        updated.reminderDate ?? null,
        updated.note ?? null,
        updated.isRecurring ? 1 : 0,
        updatedAt,
        'pending',
        id,
      ],
    );

    await db.executeSql(
      `
            INSERT INTO sync_queue(
                entity,
                operation,
                client_id,
                entity_id,
                data,
                created_at
            )
            VALUES(?,?,?,?,?,?);
            `,
      [
        updated.transactionType === 'received' ? 'income' : 'expense',
        'UPDATE',
        existing.clientId ?? existing.id,
        id,
        JSON.stringify(input),
        updatedAt,
      ],
    );
    return updated;
  },

  async delete(id: string) {
    const db = await getDatabase();
    const existing = await this.getById(id);

    if (!existing) {
      return;
    }
    const timestamp = now();

    await db.executeSql(
      `
            UPDATE expenses
            SET 
                deleted_at = ?,
                updated_at = ?,
                sync_status = ?
             WHERE id = ?
            `,
      [timestamp, timestamp, 'pending', id],
    );

    await db.executeSql(
      `
            INSERT INTO sync_queue(
            entity,
            operation,
            client_id,
            entity_id,
            data,
            created_at
            )
            VALUES(?,?,?,?,?,?)
            `,
      [
        existing.transactionType === 'received' ? 'income' : 'expense',
        'DELETE',
        existing.clientId ?? existing.id,
        id,
        null,
        timestamp,
      ],
    );
  },
};
