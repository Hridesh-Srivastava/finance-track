import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Coffee, Home, Car, Utensils, Gift } from "lucide-react"

interface RecentTransactionsProps {
  isLoading: boolean
}

export function RecentTransactions({ isLoading }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-muted p-2">{transaction.icon}</div>
                <div>
                  <p className="text-sm font-medium leading-none">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={transaction.type === "expense" ? "destructive" : "default"}>
                  {transaction.type === "expense" ? "-" : "+"}${transaction.amount.toFixed(2)}
                </Badge>
                <span className="text-xs text-muted-foreground">{transaction.category}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const transactions = [
  {
    id: "1",
    description: "Grocery Shopping",
    date: "Today, 2:30 PM",
    amount: 78.5,
    category: "Groceries",
    type: "expense",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    id: "2",
    description: "Coffee Shop",
    date: "Today, 10:15 AM",
    amount: 4.75,
    category: "Food & Drink",
    type: "expense",
    icon: <Coffee className="h-4 w-4" />,
  },
  {
    id: "3",
    description: "Salary Deposit",
    date: "Yesterday",
    amount: 2150.0,
    category: "Income",
    type: "income",
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: "4",
    description: "Gas Station",
    date: "Mar 28, 2023",
    amount: 45.2,
    category: "Transportation",
    type: "expense",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "5",
    description: "Restaurant",
    date: "Mar 27, 2023",
    amount: 62.35,
    category: "Food & Drink",
    type: "expense",
    icon: <Utensils className="h-4 w-4" />,
  },
  {
    id: "6",
    description: "Online Purchase",
    date: "Mar 26, 2023",
    amount: 29.99,
    category: "Shopping",
    type: "expense",
    icon: <Gift className="h-4 w-4" />,
  },
]

