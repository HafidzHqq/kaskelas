export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category?: string;
  description: string;
  date: string;
  source?: string;
  memberIds?: string[];
  createdAt: number;
}

export interface Member {
  id: string;
  name: string;
}
