import {apiClient} from './apiClient';

export type AIFeedbackInput = {
  description: string;
  transactionType: string;
  predictedCategory: string;
  predictedClassIndex: number | null;
  confidence: number | null;
  finalCategory: string;
  finalClassIndex: number | null;
  wasCorrect: number;
  createdAt: string;
};

export const aiFeedbackApi = {
  async create(input: AIFeedbackInput) {
    await apiClient.post('/ai-feedback', input);
  },
};
