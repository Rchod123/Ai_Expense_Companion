import NativeExpenseAI from '../native/NativeExpenseAI';

export const ExpensePredict = async (expense: string) => {
  const result = await NativeExpenseAI.predict(expense);
  return result;
};
