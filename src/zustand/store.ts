import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExpenseProps } from '../types/screenTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExpenseStoreProp {
  expenses: Array<ExpenseProps>;
  addExpense: (expense: ExpenseProps) => void;
  editExpense: (expense: ExpenseProps) => void;
  deleteExpense: (id: string) => void;
}

export const useExpenses = create<ExpenseStoreProp>()(
  persist(
    set => ({
      expenses: [],
      addExpense: (expense: ExpenseProps) =>
        set(state => ({ expenses: [expense, ...state.expenses] })),
      deleteExpense: (id: string) =>
        set(state => ({
          expenses: state.expenses.filter(item => item.id !== id),
        })),
      editExpense: (expense: ExpenseProps) =>
        set(state => ({
          expenses: state.expenses.map(item =>
            item.id === expense.id
              ? {
                  ...item,
                  transactionType: expense.transactionType,
                  transactionAmount: expense.transactionAmount,
                  SubCategory: expense.SubCategory,
                  date: expense.date,
                  Category: expense.Category,
                }
              : item,
          ),
        })),
    }),
    {
      name: 'expense-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
