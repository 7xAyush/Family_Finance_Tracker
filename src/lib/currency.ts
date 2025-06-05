// Currency formatting utilities for Indian Rupees

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  // For large amounts, show in lakhs/crores
  if (amount >= 10000000) {
    // 1 crore
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      compactDisplay: "short",
    }).format(amount);
  } else if (amount >= 100000) {
    // 1 lakh
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else {
    return formatCurrency(amount);
  }
}

export function formatCurrencyShort(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_CODE = "INR";
export const CURRENCY_NAME = "Indian Rupee";
