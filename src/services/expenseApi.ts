import { apiClient } from "./apiClient";

import { CreateExpenseInput, UpdateExpenseInput } from "../types/expense.types";

export const expenseApi = {
    getExpenses: async() => {
        const response = await apiClient.get('/expenses');
        return response.data.data;
    },

    getExpense: async(id:string) => {
        const response = await apiClient.get(`/expenses/${id}`);
        return response.data.data;
    },

    createExpense: async(
        input: CreateExpenseInput,
        idempotencyKey: string,
    )=>{
        const response = await apiClient.post(
            '/expenses',
            input,
            {
                headers: {
                    'Idempotency-Key': idempotencyKey,
                }
            }
        );
        return response.data.data;
    },

    updateExpense: async(
        id: string,
        input: UpdateExpenseInput
    ) => {
        const response = await apiClient.put(
            `/expenses/${id}`,
            input,
        );
        return response.data.data;
    },

    deleteExpense: async(id: string) => {
        const response = await apiClient.delete(
            `/expenses/${id}`
        );
        return response.data.data;
    }

};
