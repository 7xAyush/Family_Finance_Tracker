export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  isMatched?: boolean;
  bankReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  reference: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  period: string;
}

export interface MatchResult {
  matched: Transaction[];
  unmatched: Transaction[];
  discrepancies: {
    transaction: Transaction;
    bankTransaction?: BankTransaction;
    issue: string;
  }[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export type TimeFilter = "daily" | "weekly" | "monthly" | "yearly";

export interface ChartData {
  name: string;
  income: number;
  expenses: number;
  net: number;
}
