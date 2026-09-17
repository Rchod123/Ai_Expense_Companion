export type Expense = {
  id: string;
  clientId?: string;
  amount: number;
  currency: string;
  transactionType: 'received' | 'spent';

  categoryId?: string;
  category?: string;
  subCategory?: string;

  merchant?: string;
  paymentMethod?: string;

  date: string;
  reminderDate?: string;
  note?: string;

  isRecurring?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateExpenseInput = {
  amount: number;
  currency: string;
  transactionType: 'received' | 'spent';
  categoryId?: string;
  category?: string;
  subCategory?: string;
  merchant?: string;
  paymentMethod?: string;
  date: string;
  reminderDate?: string;
  note?: string;
  isRecurring?: boolean;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;
