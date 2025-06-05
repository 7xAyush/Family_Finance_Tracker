import {
  Transaction,
  Summary,
  CategorySummary,
  ChartData,
  TimeFilter,
} from "@/types";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
} from "date-fns";

export class Analytics {
  static calculateSummary(
    transactions: Transaction[],
    period: TimeFilter,
  ): Summary {
    const filteredTransactions = this.filterTransactionsByPeriod(
      transactions,
      period,
    );

    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: filteredTransactions.length,
      period: this.getPeriodLabel(period),
    };
  }

  static getCategorySummary(
    transactions: Transaction[],
    period: TimeFilter,
  ): CategorySummary[] {
    const filteredTransactions = this.filterTransactionsByPeriod(
      transactions,
      period,
    );
    const categoryMap = new Map<string, { amount: number; count: number }>();

    const totalAmount = filteredTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    filteredTransactions.forEach((transaction) => {
      const existing = categoryMap.get(transaction.category) || {
        amount: 0,
        count: 0,
      };
      categoryMap.set(transaction.category, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  static getChartData(
    transactions: Transaction[],
    period: TimeFilter,
  ): ChartData[] {
    const now = new Date();
    const periods = this.getPeriods(period, 12); // Get last 12 periods

    return periods.map((periodStart) => {
      const periodEnd = this.getPeriodEnd(periodStart, period);
      const periodTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= periodStart && transactionDate <= periodEnd;
      });

      const income = periodTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = periodTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: format(periodStart, this.getDateFormat(period)),
        income,
        expenses,
        net: income - expenses,
      };
    });
  }

  private static filterTransactionsByPeriod(
    transactions: Transaction[],
    period: TimeFilter,
  ): Transaction[] {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "daily":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "weekly":
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "yearly":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        return transactions;
    }

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  private static getPeriods(period: TimeFilter, count: number): Date[] {
    const now = new Date();
    const periods: Date[] = [];

    for (let i = count - 1; i >= 0; i--) {
      let periodStart: Date;

      switch (period) {
        case "daily":
          periodStart = startOfDay(subDays(now, i));
          break;
        case "weekly":
          periodStart = startOfWeek(subWeeks(now, i));
          break;
        case "monthly":
          periodStart = startOfMonth(subMonths(now, i));
          break;
        case "yearly":
          periodStart = startOfYear(subYears(now, i));
          break;
        default:
          periodStart = now;
      }

      periods.push(periodStart);
    }

    return periods;
  }

  private static getPeriodEnd(periodStart: Date, period: TimeFilter): Date {
    switch (period) {
      case "daily":
        return endOfDay(periodStart);
      case "weekly":
        return endOfWeek(periodStart);
      case "monthly":
        return endOfMonth(periodStart);
      case "yearly":
        return endOfYear(periodStart);
      default:
        return periodStart;
    }
  }

  private static getDateFormat(period: TimeFilter): string {
    switch (period) {
      case "daily":
        return "MMM dd";
      case "weekly":
        return "MMM dd";
      case "monthly":
        return "MMM yyyy";
      case "yearly":
        return "yyyy";
      default:
        return "MMM dd";
    }
  }

  private static getPeriodLabel(period: TimeFilter): string {
    const now = new Date();

    switch (period) {
      case "daily":
        return format(now, "EEEE, MMMM do, yyyy");
      case "weekly":
        return `Week of ${format(startOfWeek(now), "MMMM do, yyyy")}`;
      case "monthly":
        return format(now, "MMMM yyyy");
      case "yearly":
        return format(now, "yyyy");
      default:
        return "Current Period";
    }
  }

  static exportToCSV(transactions: Transaction[]): string {
    const headers = [
      "Date",
      "Type",
      "Amount (₹)",
      "Category",
      "Description",
      "Matched",
      "Bank Reference",
    ];
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      `₹${t.amount.toFixed(2)}`,
      t.category,
      t.description,
      t.isMatched ? "Yes" : "No",
      t.bankReference || "",
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }
}
