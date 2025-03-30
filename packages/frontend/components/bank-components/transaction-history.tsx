import type { Transaction } from "@/components/banking-simulator"

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <div key={transaction.id || index} className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium">{transaction.type === "deposit" ? "Deposit" : "Withdrawal"}</p>
              <p className="text-sm text-muted-foreground">{transaction.description || "No description"}</p>
              <p className="text-xs text-muted-foreground">{transaction.timestamp.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p
                className={`font-medium ${transaction.type === "deposit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Balance: ${transaction.balance.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

