import { Transaction, BankTransaction, MatchResult } from "@/types";

export class BankMatcher {
  static parseBankStatement(csvContent: string): BankTransaction[] {
    const lines = csvContent.split("\n");
    const transactions: BankTransaction[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = this.parseCSVLine(line);
      if (columns.length >= 4) {
        const transaction: BankTransaction = {
          id: crypto.randomUUID(),
          date: this.parseDate(columns[0]),
          description: columns[1].trim(),
          amount: this.parseAmount(columns[2]),
          balance: this.parseAmount(columns[3]),
          reference: columns[4] || "",
        };
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  private static parseDate(dateStr: string): string {
    try {
      // Handle various date formats
      const cleanDate = dateStr.replace(/['"]/g, "").trim();
      const date = new Date(cleanDate);

      if (isNaN(date.getTime())) {
        // Try parsing DD/MM/YYYY format
        const parts = cleanDate.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            .toISOString()
            .split("T")[0];
        }
        return new Date().toISOString().split("T")[0];
      }

      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }

  private static parseAmount(amountStr: string): number {
    try {
      const cleaned = amountStr.replace(/['"$,]/g, "").trim();
      return parseFloat(cleaned) || 0;
    } catch {
      return 0;
    }
  }

  static matchTransactions(
    userTransactions: Transaction[],
    bankTransactions: BankTransaction[],
  ): MatchResult {
    const matched: Transaction[] = [];
    const unmatched: Transaction[] = [...userTransactions];
    const discrepancies: MatchResult["discrepancies"] = [];

    for (const userTx of userTransactions) {
      const potentialMatches = bankTransactions.filter(
        (bankTx) =>
          this.isSameDate(userTx.date, bankTx.date) &&
          this.isAmountMatch(userTx.amount, bankTx.amount, userTx.type),
      );

      if (potentialMatches.length === 1) {
        const bankTx = potentialMatches[0];
        matched.push({
          ...userTx,
          isMatched: true,
          bankReference: bankTx.reference,
        });
        const index = unmatched.findIndex((tx) => tx.id === userTx.id);
        if (index > -1) unmatched.splice(index, 1);
      } else if (potentialMatches.length > 1) {
        discrepancies.push({
          transaction: userTx,
          issue: "Multiple potential matches found",
        });
      } else {
        // Look for transactions with similar amounts but different dates
        const similarAmountTx = bankTransactions.find((bankTx) =>
          this.isAmountMatch(userTx.amount, bankTx.amount, userTx.type),
        );

        if (similarAmountTx) {
          discrepancies.push({
            transaction: userTx,
            bankTransaction: similarAmountTx,
            issue: "Amount matches but date differs",
          });
        } else {
          discrepancies.push({
            transaction: userTx,
            issue: "No matching bank transaction found",
          });
        }
      }
    }

    return { matched, unmatched, discrepancies };
  }

  private static isSameDate(date1: string, date2: string): boolean {
    return date1 === date2;
  }

  private static isAmountMatch(
    userAmount: number,
    bankAmount: number,
    type: "income" | "expense",
  ): boolean {
    const expectedBankAmount =
      type === "expense" ? -Math.abs(userAmount) : Math.abs(userAmount);
    return Math.abs(expectedBankAmount - bankAmount) < 0.01;
  }

  static generateDiscrepancyReport(matchResult: MatchResult): string {
    let report = "Bank Matching Report\n";
    report += "==================\n\n";

    report += `Matched Transactions: ${matchResult.matched.length}\n`;
    report += `Unmatched Transactions: ${matchResult.unmatched.length}\n`;
    report += `Discrepancies Found: ${matchResult.discrepancies.length}\n\n`;

    if (matchResult.discrepancies.length > 0) {
      report += "Discrepancy Details:\n";
      report += "-------------------\n";

      matchResult.discrepancies.forEach((discrepancy, index) => {
        report += `${index + 1}. ${discrepancy.transaction.description}\n`;
        report += `   Amount: $${discrepancy.transaction.amount}\n`;
        report += `   Date: ${discrepancy.transaction.date}\n`;
        report += `   Issue: ${discrepancy.issue}\n\n`;
      });
    }

    return report;
  }
}
