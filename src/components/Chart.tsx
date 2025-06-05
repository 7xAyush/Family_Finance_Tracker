import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartData, CategorySummary } from "@/types";

interface ChartProps {
  data: ChartData[] | CategorySummary[];
  type: "bar" | "pie" | "line";
  title: string;
  description?: string;
  className?: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

export function Chart({
  data,
  type,
  title,
  description,
  className,
}: ChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="tooltip-value"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data as ChartData[]}>
        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
        <XAxis dataKey="name" className="chart-axis" tick={{ fontSize: 12 }} />
        <YAxis
          className="chart-axis"
          tick={{ fontSize: 12 }}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="income"
          fill="#10B981"
          name="Income"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          fill="#EF4444"
          name="Expenses"
          radius={[2, 2, 0, 0]}
        />
        <Bar dataKey="net" fill="#6366F1" name="Net" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data as ChartData[]}>
        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
        <XAxis dataKey="name" className="chart-axis" tick={{ fontSize: 12 }} />
        <YAxis
          className="chart-axis"
          tick={{ fontSize: 12 }}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10B981"
          strokeWidth={3}
          name="Income"
          dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#EF4444"
          strokeWidth={3}
          name="Expenses"
          dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="#6366F1"
          strokeWidth={3}
          name="Net"
          dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    const pieData = (data as CategorySummary[]).map((item, index) => ({
      name: item.category,
      value: item.amount,
      percentage: item.percentage,
      count: item.count,
    }));

    const CustomPieTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="chart-tooltip">
            <p className="tooltip-label">{data.name}</p>
            <p className="tooltip-value">
              Amount: {formatCurrency(data.value)}
            </p>
            <p className="tooltip-value">
              Percentage: {data.percentage.toFixed(1)}%
            </p>
            <p className="tooltip-value">Transactions: {data.count}</p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) =>
                percentage > 5 ? `${name} (${percentage.toFixed(1)}%)` : ""
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pie-legend">
          {pieData.map((item, index) => (
            <div key={item.name} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="legend-text">
                {item.name}: {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      case "pie":
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Card className={`chart-card ${className}`}>
      <CardHeader className="chart-header">
        <CardTitle className="chart-title">{title}</CardTitle>
        {description && (
          <CardDescription className="chart-description">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="chart-content">
        {data && data.length > 0 ? (
          renderChart()
        ) : (
          <div className="chart-empty-state">
            <p className="empty-chart-message">No data available for chart</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
