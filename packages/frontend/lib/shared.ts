// This file contains shared constants and utilities that were previously in @finance-tracker/shared

// Constants
export const TRANSACTION_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food & Dining",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Savings & Investments",
  "Personal Spending",
  "Entertainment",
  "Education",
  "Gifts & Donations",
  "Travel",
  "Business",
  "Income",
  "Other",
] as const;

export const COLLECTION_NAMES = {
  USERS: "users",
  TRANSACTIONS: "transactions",
  FINANCIAL_SUMMARIES: "financialSummaries",
  BUDGETS: "budgets",
  INSIGHTS: "insights",
} as const;

export const ERROR_MESSAGES = {
  UNAUTHENTICATED: "You must be logged in to perform this action",
  UNAUTHORIZED: "You are not authorized to perform this action",
  INVALID_INPUT: "Invalid input provided",
  SERVER_ERROR: "An unexpected error occurred",
} as const;

// Type Definitions
export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  category?: TransactionCategory;
  type: TransactionType;
  date?: Date | string;
  description?: string;
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateBalance(transactions: Transaction[] | undefined): number {
  if (!transactions || !Array.isArray(transactions)) return 0;

  return transactions.reduce((total, transaction) => {
    if (!transaction || typeof transaction.amount !== "number") return total;
    return transaction.type === "income"
      ? total + transaction.amount
      : total - transaction.amount;
  }, 0);
}

export function groupTransactionsByCategory(
  transactions: Transaction[] | undefined
): Record<string, number> {
  if (!transactions || !Array.isArray(transactions)) return {};

  return transactions.reduce((groups, transaction) => {
    if (
      transaction?.type === "expense" &&
      transaction.category &&
      typeof transaction.amount === "number"
    ) {
      const category = transaction.category;
      groups[category] = (groups[category] || 0) + transaction.amount;
    }
    return groups;
  }, {} as Record<string, number>);
}

export function calculateTotalByType(
  transactions: Transaction[] | undefined,
  type: TransactionType
): number {
  if (!transactions || !Array.isArray(transactions)) return 0;

  return transactions
    .filter((transaction) => transaction?.type === type && typeof transaction.amount === "number")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (typeof income !== "number" || typeof expenses !== "number") return 0;
  if (income <= 0) return 0;
  return ((income - expenses) / income) * 100;
}

// Additional utility that might be helpful
export function validateTransaction(transaction: unknown): transaction is Transaction {
  return (
    typeof transaction === "object" &&
    transaction !== null &&
    "id" in transaction &&
    "amount" in transaction &&
    "type" in transaction &&
    (transaction as Transaction).type in ["income", "expense"]
  );
}