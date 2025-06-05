import React, { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chart } from "@/components/Chart";
import { SummaryCard } from "@/components/SummaryCard";
import {
  Transaction,
  TimeFilter,
  Summary,
  CategorySummary,
  ChartData,
} from "@/types";
import { Storage } from "@/lib/storage";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";
import {
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [yearlyData, setYearlyData] = useState<ChartData[]>([]);

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

    // Get yearly trend data for annual overview
    const yearlyTrendData = Analytics.getChartData(allTransactions, "yearly");
    setYearlyData(yearlyTrendData);
  };

  const handleExportReport = (format: "csv" | "summary") => {
    try {
      if (format === "csv") {
        const csvContent = Analytics.exportToCSV(transactions);
        downloadFile(
          csvContent,
          `transactions_report_${getCurrentDateString()}.csv`,
          "text/csv",
        );
        toast.success("Transaction data exported successfully");
      } else {
        const summaryReport = generateSummaryReport();
        downloadFile(
          summaryReport,
          `financial_summary_${getCurrentDateString()}.txt`,
          "text/plain",
        );
        toast.success("Summary report exported successfully");
      }
    } catch (error) {
      toast.error("Failed to export report");
      console.error("Export error:", error);
    }
  };

  const downloadFile = (
    content: string,
    filename: string,
    contentType: string,
  ) => {
    const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getCurrentDateString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const generateSummaryReport = () => {
    if (!summary) return "";

    let report = "FINANCIAL SUMMARY REPORT\n";
    report += "========================\n\n";
    report += `Generated on: ${format(new Date(), "MMMM dd, yyyy")}\n`;
    report += `Period: ${summary.period}\n\n`;

    report += "FINANCIAL OVERVIEW\n";
    report += "------------------\n";
    report += `Total Income: $${summary.totalIncome.toFixed(2)}\n`;
    report += `Total Expenses: $${summary.totalExpenses.toFixed(2)}\n`;
    report += `Net Income: $${summary.netIncome.toFixed(2)}\n`;
    report += `Total Transactions: ${summary.transactionCount}\n\n`;

    if (categorySummary.length > 0) {
      report += "SPENDING BY CATEGORY\n";
      report += "-------------------\n";
      categorySummary.forEach((category, index) => {
        report += `${index + 1}. ${category.category}: $${category.amount.toFixed(2)} (${category.percentage.toFixed(1)}%)\n`;
      });
      report += "\n";
    }

    report += "FINANCIAL INSIGHTS\n";
    report += "------------------\n";
    if (summary.netIncome > 0) {
      report += "✓ Positive cash flow - You saved money this period\n";
    } else if (summary.netIncome < 0) {
      report += "⚠ Negative cash flow - Expenses exceeded income\n";
    } else {
      report += "• Balanced - Income equals expenses\n";
    }

    if (categorySummary.length > 0) {
      const topCategory = categorySummary[0];
      report += `• Top spending category: ${topCategory.category} ($${topCategory.amount.toFixed(2)})\n`;
    }

    const averageTransaction =
      summary.transactionCount > 0
        ? (summary.totalIncome + summary.totalExpenses) /
          summary.transactionCount
        : 0;
    report += `• Average transaction amount: $${averageTransaction.toFixed(2)}\n`;

    return report;
  };

  const getInsights = () => {
    if (!summary || !categorySummary.length) return [];

    const insights = [];

    if (summary.netIncome > 0) {
      insights.push({
        type: "success",
        title: "Positive Cash Flow",
        description: `You saved $${summary.netIncome.toFixed(2)} this period. Great job!`,
      });
    } else if (summary.netIncome < 0) {
      insights.push({
        type: "warning",
        title: "Spending Alert",
        description: `You spent $${Math.abs(summary.netIncome).toFixed(2)} more than you earned.`,
      });
    }

    if (categorySummary.length > 0) {
      const topCategory = categorySummary[0];
      insights.push({
        type: "info",
        title: "Top Spending Category",
        description: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your expenses.`,
      });
    }

    const incomeToExpenseRatio =
      summary.totalIncome > 0
        ? (summary.totalExpenses / summary.totalIncome) * 100
        : 0;

    if (incomeToExpenseRatio < 50) {
      insights.push({
        type: "success",
        title: "Excellent Savings Rate",
        description: `You're only spending ${incomeToExpenseRatio.toFixed(1)}% of your income.`,
      });
    } else if (incomeToExpenseRatio > 90) {
      insights.push({
        type: "warning",
        title: "High Expense Ratio",
        description: `You're spending ${incomeToExpenseRatio.toFixed(1)}% of your income.`,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Financial Reports</h1>
            <p className="page-description">
              Comprehensive analysis of your financial data with detailed
              insights and trends
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

            <Button
              variant="outline"
              onClick={() => handleExportReport("csv")}
              disabled={transactions.length === 0}
              className="export-button"
            >
              <Download className="button-icon" />
              Export CSV
            </Button>

            <Button
              onClick={() => handleExportReport("summary")}
              disabled={!summary}
              className="export-summary-button"
            >
              <FileText className="button-icon" />
              Export Summary
            </Button>
          </div>
        </div>
      </div>

      <div className="reports-content">
        {summary && (
          <SummaryCard summary={summary} className="reports-summary" />
        )}

        {insights.length > 0 && (
          <Card className="insights-card">
            <CardHeader>
              <CardTitle>Financial Insights</CardTitle>
              <CardDescription>
                Key observations about your financial patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="insights-grid">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-item ${insight.type}`}>
                    <div className="insight-content">
                      <h4 className="insight-title">{insight.title}</h4>
                      <p className="insight-description">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="trends" className="reports-tabs">
          <TabsList className="reports-tabs-list">
            <TabsTrigger value="trends" className="tab-trigger">
              <TrendingUp className="tab-icon" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="categories" className="tab-trigger">
              <PieChart className="tab-icon" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="overview" className="tab-trigger">
              <BarChart3 className="tab-icon" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="tab-content">
            <div className="charts-grid">
              <Chart
                data={chartData}
                type="line"
                title={`Financial Trend - ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}`}
                description="Track your income and expenses over time"
                className="trend-chart"
              />

              <Chart
                data={chartData}
                type="bar"
                title="Income vs Expenses Comparison"
                description="Compare your income and expenses side by side"
                className="comparison-chart"
              />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="tab-content">
            <div className="charts-grid">
              {categorySummary.length > 0 && (
                <>
                  <Chart
                    data={categorySummary}
                    type="pie"
                    title="Spending Distribution"
                    description="See how your money is distributed across categories"
                    className="pie-chart"
                  />

                  <Card className="category-details-card">
                    <CardHeader>
                      <CardTitle>Category Breakdown</CardTitle>
                      <CardDescription>
                        Detailed view of your spending by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="category-list">
                        {categorySummary.map((category, index) => (
                          <div
                            key={category.category}
                            className="category-item"
                          >
                            <div className="category-rank">#{index + 1}</div>
                            <div className="category-info">
                              <h4 className="category-name">
                                {category.category}
                              </h4>
                              <div className="category-stats">
                                <span className="category-amount">
                                  ${category.amount.toFixed(2)}
                                </span>
                                <span className="category-percentage">
                                  {category.percentage.toFixed(1)}%
                                </span>
                                <span className="category-count">
                                  {category.count} transaction
                                  {category.count !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="overview" className="tab-content">
            <div className="charts-grid">
              {yearlyData.length > 0 && (
                <Chart
                  data={yearlyData}
                  type="bar"
                  title="Annual Financial Overview"
                  description="Your financial performance over the years"
                  className="yearly-chart"
                />
              )}

              <Card className="stats-overview-card">
                <CardHeader>
                  <CardTitle>Financial Statistics</CardTitle>
                  <CardDescription>
                    Key metrics about your financial activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{transactions.length}</div>
                      <div className="stat-label">Total Transactions</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-value">
                        {transactions.length > 0
                          ? (
                              transactions.reduce(
                                (sum, t) => sum + t.amount,
                                0,
                              ) / transactions.length
                            ).toFixed(0)
                          : "0"}
                      </div>
                      <div className="stat-label">Avg Transaction ($)</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-value">
                        {
                          [...new Set(transactions.map((t) => t.category))]
                            .length
                        }
                      </div>
                      <div className="stat-label">Categories Used</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-value">
                        {transactions.filter((t) => t.isMatched).length}
                      </div>
                      <div className="stat-label">Bank Matched</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
