
import {create} from 'zustand';

import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../types/expense.types';

import {ExpenseRepository} from '../repositories/expenseRepository';
import { expenseApi } from '../services/expenseApi';
import { useAuthStore } from './authStore';
import { SyncRepository } from '../repositories/syncRepository';

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
        let expenses = await ExpenseRepository.getAll();
        if (useAuthStore.getState().user) {
          try {
            await SyncRepository.sync();
            const remoteExpenses = await expenseApi.getExpenses();
            expenses = await ExpenseRepository.replaceWithServerExpenses(remoteExpenses);
          } catch {
            // Preserve the local offline-first view when the server is unreachable.
          }
        }

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
        let expense = await ExpenseRepository.create(input);
        if (useAuthStore.getState().user) {
          try {
            const remote = await expenseApi.createExpense(input, expense.clientId ?? expense.id);
            expense = await ExpenseRepository.applyServerExpense(expense.id, remote);
          } catch {
            // The local record remains queued for a later sync.
          }
        }

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
        let updated: Expense = await ExpenseRepository.update(id, input);
        if (useAuthStore.getState().user) {
          try {
            const remote = await expenseApi.updateExpense(id, input);
            updated = await ExpenseRepository.applyServerExpense(id, remote);
          } catch {
            // The changed local record remains queued for a later sync.
          }
        }

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
        if (useAuthStore.getState().user) {
          try {
            await expenseApi.deleteExpense(id);
          } catch {
            // Soft deletion is retained locally and will sync later.
          }
        }

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
