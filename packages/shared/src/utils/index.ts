import type { Transaction, TransactionType } from "../types"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    if (transaction.type === "income") {
      return total + transaction.amount
    } else {
      return total - transaction.amount
    }
  }, 0)
}

export function groupTransactionsByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce(
    (groups, transaction) => {
      if (transaction.type === "expense") {
        const category = transaction.category
        if (!groups[category]) {
          groups[category] = 0
        }
        groups[category] += transaction.amount
      }
      return groups
    },
    {} as Record<string, number>,
  )
}

export function calculateTotalByType(transactions: Transaction[], type: TransactionType): number {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0)
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0
  return ((income - expenses) / income) * 100
}

