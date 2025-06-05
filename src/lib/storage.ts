import { Transaction, User, BankTransaction } from "@/types";

const STORAGE_KEYS = {
  TRANSACTIONS: "expense_tracker_transactions",
  USER: "expense_tracker_user",
  BANK_TRANSACTIONS: "expense_tracker_bank_transactions",
} as const;

export class Storage {
  static getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading transactions:", error);
      return [];
    }
  }

  static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions),
      );
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  }

  static addTransaction(
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const transactions = this.getTransactions();
    transactions.push(newTransaction);
    this.saveTransactions(transactions);

    return newTransaction;
  }

  static updateTransaction(
    id: string,
    updates: Partial<Transaction>,
  ): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex((t) => t.id === id);

    if (index === -1) return null;

    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveTransactions(transactions);
    return transactions[index];
  }

  static deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filteredTransactions = transactions.filter((t) => t.id !== id);

    if (filteredTransactions.length === transactions.length) return false;

    this.saveTransactions(filteredTransactions);
    return true;
  }

  static getUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading user:", error);
      return null;
    }
  }

  static saveUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
    }
  }

  static clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  static getBankTransactions(): BankTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANK_TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading bank transactions:", error);
      return [];
    }
  }

  static saveBankTransactions(transactions: BankTransaction[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.BANK_TRANSACTIONS,
        JSON.stringify(transactions),
      );
    } catch (error) {
      console.error("Error saving bank transactions:", error);
    }
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}
