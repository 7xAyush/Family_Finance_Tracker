import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { Transaction } from "@/types";
import { Storage } from "@/lib/storage";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "category";
type FilterOption = "all" | "income" | "expense";

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [transactions, searchTerm, sortBy, filterBy, selectedCategory]);

  const loadTransactions = () => {
    const allTransactions = Storage.getTransactions();
    setTransactions(allTransactions);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(term) ||
          transaction.category.toLowerCase().includes(term),
      );
    }

    // Apply type filter
    if (filterBy !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === filterBy,
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.category === selectedCategory,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleTransactionAdded = (transaction: Transaction) => {
    setIsAddingTransaction(false);
    loadTransactions();
    toast.success("Transaction added successfully");
  };

  const handleTransactionUpdated = (transaction: Transaction) => {
    setEditingTransaction(null);
    loadTransactions();
    toast.success("Transaction updated successfully");
  };

  const handleTransactionEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleExport = () => {
    try {
      const csvContent = Analytics.exportToCSV(filteredTransactions);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `transactions_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Transactions exported successfully");
      }
    } catch (error) {
      toast.error("Failed to export transactions");
      console.error("Export error:", error);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(transactions.map((t) => t.category))];
    return categories.sort();
  };

  const stats = {
    total: filteredTransactions.length,
    income: filteredTransactions.filter((t) => t.type === "income").length,
    expenses: filteredTransactions.filter((t) => t.type === "expense").length,
    totalAmount: filteredTransactions.reduce(
      (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
      0,
    ),
  };

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Transactions</h1>
            <p className="page-description">
              Manage and track all your income and expense transactions
            </p>
          </div>

          <div className="header-actions">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredTransactions.length === 0}
              className="export-button"
            >
              <Download className="button-icon" />
              Export CSV
            </Button>

            <Button
              onClick={() => setIsAddingTransaction(true)}
              className="add-transaction-button"
            >
              <Plus className="button-icon" />
              Add Transaction
            </Button>
          </div>
        </div>
      </div>

      <div className="transactions-content">
        <Card className="filters-card">
          <CardHeader>
            <CardTitle className="filters-title">
              <Filter className="title-icon" />
              Filters & Search
            </CardTitle>
            <CardDescription>
              Filter and search through your transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="filters-grid">
              <div className="search-field">
                <Search className="search-icon" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <Select
                value={filterBy}
                onValueChange={(value) => setFilterBy(value as FilterOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="amount-desc">
                    Amount (Highest First)
                  </SelectItem>
                  <SelectItem value="amount-asc">
                    Amount (Lowest First)
                  </SelectItem>
                  <SelectItem value="category">Category (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="stats-summary">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Transactions</span>
                  <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Income</span>
                  <span className="stat-value text-green-600">
                    {stats.income}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Expenses</span>
                  <span className="stat-value text-red-600">
                    {stats.expenses}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Net Amount</span>
                  <span
                    className={`stat-value ${stats.totalAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ${Math.abs(stats.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="transactions-list-section">
          <TransactionList
            transactions={filteredTransactions}
            onTransactionUpdated={loadTransactions}
            onTransactionEdit={handleTransactionEdit}
          />
        </div>
      </div>

      <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
        <DialogContent className="add-transaction-dialog">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingTransaction}
        onOpenChange={() => setEditingTransaction(null)}
      >
        <DialogContent className="edit-transaction-dialog">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              editTransaction={editingTransaction}
              onTransactionUpdated={handleTransactionUpdated}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
