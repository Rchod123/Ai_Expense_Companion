
import {create} from 'zustand';

import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../types/expense.types';

import {ExpenseRepository} from '../repositories/expenseRepository';

type ExpenseState = {
  expenses: Expense[];

  loading: boolean;
  error: string | null;

  loadExpenses: () => Promise<void>;

  createExpense: (
    input: CreateExpenseInput,
  ) => Promise<void>;

  updateExpense: (
    id: string,
    input: UpdateExpenseInput,
  ) => Promise<void>;

  deleteExpense: (
    id: string,
  ) => Promise<void>;
};

export const useExpenseStore = create<ExpenseState>(
  (set, _get) => ({
    expenses: [],

    loading: false,
    error: null,

    loadExpenses: async () => {
      set({
        loading: true,
        error: null,
      });

      try {
        const expenses =
          await ExpenseRepository.getAll();

        set({
          expenses,
          loading: false,
        });
      } catch (error: any) {
        set({
          error: error.message,
          loading: false,
        });
      }
    },

    createExpense: async input => {
      try {
        const expense =
          await ExpenseRepository.create(input);

        set(state => ({
          expenses: [
            expense,
            ...state.expenses,
          ],
        }));
      } catch (error: any) {
        set({
          error: error.message,
        });

        throw error;
      }
    },

    updateExpense: async (id, input) => {
      try {
        const updated =
          await ExpenseRepository.update(id, input);

        set(state => ({
          expenses: state.expenses.map(item =>
            item.id === id ? updated : item,
          ),
        }));
      } catch (error: any) {
        set({
          error: error.message,
        });

        throw error;
      }
    },

    deleteExpense: async id => {
      try {
        await ExpenseRepository.delete(id);

        set(state => ({
          expenses: state.expenses.filter(
            item => item.id !== id,
          ),
        }));
      } catch (error: any) {
        set({
          error: error.message,
        });

        throw error;
      }
    },
  }),
);