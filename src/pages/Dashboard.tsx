import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { SummaryCard } from "@/components/SummaryCard";
import { Chart } from "@/components/Chart";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Transaction,
  TimeFilter,
  Summary,
  CategorySummary,
  ChartData,
} from "@/types";
import { Storage } from "@/lib/storage";
import { Analytics } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeFilter]);

  const loadData = () => {
    const allTransactions = Storage.getTransactions();
    setTransactions(allTransactions);

    const summaryData = Analytics.calculateSummary(allTransactions, timeFilter);
    setSummary(summaryData);

    const categoryData = Analytics.getCategorySummary(
      allTransactions,
      timeFilter,
    );
    setCategorySummary(categoryData);

    const chartData = Analytics.getChartData(allTransactions, timeFilter);
    setChartData(chartData);
  };

  const handleTransactionAdded = (transaction: Transaction) => {
    setIsAddingTransaction(false);
    loadData();
    toast.success("Transaction added successfully");
  };

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getTimeFilterLabel = (filter: TimeFilter) => {
    const labels = {
      daily: "Today",
      weekly: "This Week",
      monthly: "This Month",
      yearly: "This Year",
    };
    return labels[filter];
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Welcome back, {user?.name}! Here's your financial overview.
            </p>
          </div>

          <div className="header-actions">
            <Select
              value={timeFilter}
              onValueChange={(value) => setTimeFilter(value as TimeFilter)}
            >
              <SelectTrigger className="time-filter-select">
                <Calendar className="select-icon" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Dialog
              open={isAddingTransaction}
              onOpenChange={setIsAddingTransaction}
            >
              <DialogTrigger asChild>
                <Button className="add-transaction-button">
                  <Plus className="button-icon" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="add-transaction-dialog">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm onTransactionAdded={handleTransactionAdded} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {summary && (
          <SummaryCard summary={summary} className="dashboard-summary" />
        )}

        <div className="dashboard-grid">
          <div className="charts-section">
            <Chart
              data={chartData}
              type="bar"
              title={`Financial Trend - ${getTimeFilterLabel(timeFilter)}`}
              description="Income vs Expenses over time"
              className="trend-chart"
            />

            {categorySummary.length > 0 && (
              <Chart
                data={categorySummary}
                type="pie"
                title="Spending by Category"
                description="Breakdown of your expenses by category"
                className="category-chart"
              />
            )}
          </div>

          <div className="recent-transactions-section">
            <Card className="recent-transactions-card">
              <CardHeader className="recent-header">
                <CardTitle className="recent-title">
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Your latest financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <TransactionList
                    transactions={recentTransactions}
                    onTransactionUpdated={loadData}
                  />
                ) : (
                  <div className="no-transactions">
                    <div className="no-transactions-content">
                      <IndianRupee className="no-transactions-icon" />
                      <h3 className="no-transactions-title">
                        No transactions yet
                      </h3>
                      <p className="no-transactions-description">
                        Start tracking your finances by adding your first
                        transaction.
                      </p>
                      <Button
                        onClick={() => setIsAddingTransaction(true)}
                        className="first-transaction-button"
                      >
                        <Plus className="button-icon" />
                        Add Your First Transaction
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {categorySummary.length > 0 && (
          <div className="category-insights">
            <Card className="insights-card">
              <CardHeader>
                <CardTitle>Spending Insights</CardTitle>
                <CardDescription>
                  Your top spending categories for{" "}
                  {getTimeFilterLabel(timeFilter).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="insights-grid">
                  {categorySummary.slice(0, 3).map((category, index) => (
                    <div key={category.category} className="insight-item">
                      <div className="insight-rank">#{index + 1}</div>
                      <div className="insight-content">
                        <h4 className="insight-category">
                          {category.category}
                        </h4>
                        <p className="insight-amount">
                          ${category.amount.toFixed(2)} (
                          {category.percentage.toFixed(1)}%)
                        </p>
                        <p className="insight-count">
                          {category.count} transaction
                          {category.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
