import {getDatabase} from '../database/database';
import {AIFeedbackInput} from '../services/aiFeedbackApi';

export const AIFeedbackRepository = {
  async create(input: AIFeedbackInput) {
    const db = await getDatabase();
    await db.executeSql(
      `INSERT INTO ai_feedback (description, transaction_type, predicted_category, predicted_class_index, confidence, final_category, final_class_index, was_correct, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [input.description, input.transactionType, input.predictedCategory, input.predictedClassIndex, input.confidence, input.finalCategory, input.finalClassIndex, input.wasCorrect, input.createdAt],
    );
  },
};
