
export interface ExpenseProps {
    id: string;
    transactionType: 'received' | 'spent',
    transactionAmount: string,
    SubCategory: string,
    date: string,
    Category: string,
}