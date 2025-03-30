import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, PiggyBank } from "lucide-react"
import { calculateTotalByType, calculateSavingsRate, formatCurrency } from "@/lib/shared"
import { Transaction } from "./analytics"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"

interface OverviewStatsProps {
  isLoading: boolean
  transactions: Transaction[]
  period: string
  totalBalance?: number
}

export function OverviewStats({ isLoading, transactions, period, totalBalance = 0 }: OverviewStatsProps) {
  const { user } = useAuth()
  const [previousPeriodData, setPreviousPeriodData] = useState<{
    income: number
    expenses: number
    savings: number
    balance: number
  } | null>(null)
  const [loadingPrevious, setLoadingPrevious] = useState(true)

  // Calculate current period data
  const totalIncome = calculateTotalByType(transactions, "income")
  const totalExpenses = calculateTotalByType(transactions, "expense")
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses)

  // Fetch previous period data for comparison
  useEffect(() => {
    if (!user) return

    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    // Calculate previous period range based on current period
    if (period === "week") {
      startDate.setDate(now.getDate() - 14) // 2 weeks ago
      endDate.setDate(now.getDate() - 7) // 1 week ago
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 2) // 2 months ago
      endDate.setMonth(now.getMonth() - 1) // 1 month ago
    } else if (period === "quarter") {
      startDate.setMonth(now.getMonth() - 6) // 2 quarters ago
      endDate.setMonth(now.getMonth() - 3) // 1 quarter ago
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 2) // 2 years ago
      endDate.setFullYear(now.getFullYear() - 1) // 1 year ago
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("date", ">=", startDate.toISOString().split("T")[0]),
      where("date", "<=", endDate.toISOString().split("T")[0]),
      orderBy("date", "desc")
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const prevTransactions: Transaction[] = []
      
      querySnapshot.forEach((doc) => {
        prevTransactions.push({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, "id">),
        })
      })

      const prevIncome = calculateTotalByType(prevTransactions, "income")
      const prevExpenses = calculateTotalByType(prevTransactions, "expense")
      const prevSavings = calculateSavingsRate(prevIncome, prevExpenses)

      setPreviousPeriodData({
        income: prevIncome,
        expenses: prevExpenses,
        savings: prevSavings,
        balance: prevIncome - prevExpenses
      })
      setLoadingPrevious(false)
    })

    return () => unsubscribe()
  }, [user, period])

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const incomeChange = previousPeriodData 
    ? calculateChange(totalIncome, previousPeriodData.income)
    : 0
  const expensesChange = previousPeriodData 
    ? calculateChange(totalExpenses, previousPeriodData.expenses)
    : 0
  const savingsChange = previousPeriodData 
    ? calculateChange(savingsRate, previousPeriodData.savings)
    : 0
  const balanceChange = previousPeriodData 
    ? calculateChange(totalBalance, previousPeriodData.balance)
    : 0

  if (isLoading || loadingPrevious) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className={`text-xs ${balanceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {balanceChange >= 0 ? '↑' : '↓'} {Math.abs(balanceChange).toFixed(1)}% from last {period}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          <p className={`text-xs ${incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}% from last {period}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className={`text-xs ${expensesChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {expensesChange <= 0 ? '↓' : '↑'} {Math.abs(expensesChange).toFixed(1)}% from last {period}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
          <p className={`text-xs ${savingsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {savingsChange >= 0 ? '↑' : '↓'} {Math.abs(savingsChange).toFixed(1)}% from last {period}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}