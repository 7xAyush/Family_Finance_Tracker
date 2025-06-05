import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Summary } from "@/types";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  summary: Summary;
  className?: string;
}

export function SummaryCard({ summary, className }: SummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getNetIncomeColor = (amount: number) => {
    if (amount > 0) return "text-green-600";
    if (amount < 0) return "text-red-600";
    return "text-gray-600";
  };

  const summaryItems = [
    {
      title: "Total Income",
      value: formatCurrency(summary.totalIncome),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Money received",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(summary.totalExpenses),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Money spent",
    },
    {
      title: "Net Income",
      value: formatCurrency(summary.netIncome),
      icon: DollarSign,
      color: getNetIncomeColor(summary.netIncome),
      bgColor: summary.netIncome >= 0 ? "bg-green-50" : "bg-red-50",
      description: "Income minus expenses",
    },
    {
      title: "Transactions",
      value: summary.transactionCount.toString(),
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total recorded",
    },
  ];

  return (
    <div className={cn("summary-cards-container", className)}>
      <div className="summary-header">
        <h2 className="summary-title">Financial Summary</h2>
        <p className="summary-period">{summary.period}</p>
      </div>

      <div className="summary-grid">
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="summary-card">
              <CardHeader className="summary-card-header">
                <div className="summary-card-title-row">
                  <CardTitle className="summary-card-title">
                    {item.title}
                  </CardTitle>
                  <div className={cn("summary-icon-wrapper", item.bgColor)}>
                    <Icon className={cn("summary-icon", item.color)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="summary-card-content">
                <div className="summary-value-section">
                  <div className={cn("summary-value", item.color)}>
                    {item.value}
                  </div>
                  <p className="summary-description">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {summary.netIncome < 0 && (
        <div className="summary-alert">
          <Card className="alert-card">
            <CardContent className="alert-content">
              <div className="alert-icon">
                <TrendingDown className="icon-warning" />
              </div>
              <div className="alert-text">
                <h4 className="alert-title">Spending Alert</h4>
                <p className="alert-description">
                  Your expenses exceed your income by{" "}
                  {formatCurrency(Math.abs(summary.netIncome))}. Consider
                  reviewing your spending habits.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
