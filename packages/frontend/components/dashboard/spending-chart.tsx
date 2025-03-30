"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { formatCurrency } from "@/lib/shared"

interface Transaction {
  id: string
  date: string
  amount: number
  type: "income" | "expense"
  category?: string
}

export function SpendingChart() {
  const { user } = useAuth()
  const [view, setView] = useState<"bar" | "line">("bar")
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("weekly")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchTransactions = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Calculate date range based on period
        const now = new Date()
        const startDate = new Date()

        if (period === "weekly") {
          startDate.setDate(now.getDate() - 7)
        } else if (period === "monthly") {
          startDate.setMonth(now.getMonth() - 1)
        } else if (period === "yearly") {
          startDate.setFullYear(now.getFullYear() - 1)
        }

        console.log("Date range for filtering:", {
          period,
          startDate: startDate.toISOString(),
          now: now.toISOString(),
        })

        try {
          // This query requires the composite index mentioned in the error
          const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("type", "==", "expense"),
            where("date", ">=", startDate.toISOString().split("T")[0]),
            orderBy("date", "asc"),
          )

          const querySnapshot = await getDocs(q)
          const fetchedTransactions = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[]

          setTransactions(fetchedTransactions)
        } catch (firestoreError) {
          console.warn("Server-side filtering failed, using simpler query:", firestoreError)

          // Use a simpler query that doesn't require the composite index
          // Just filter by userId only, then do the rest client-side
          const simpleQuery = query(collection(db, "transactions"), where("userId", "==", user.uid))

          const querySnapshot = await getDocs(simpleQuery)
          const allTransactions = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[]

          // Filter on the client side
          const filteredTransactions = allTransactions.filter((t) => {
            if (!t.date || t.type !== "expense") return false

            try {
              const transactionDate = new Date(t.date)
              return !isNaN(transactionDate.getTime()) && transactionDate >= startDate
            } catch (e) {
              console.error("Error parsing date for transaction:", t.id, e)
              return false
            }
          })

          console.log(`Filtered ${allTransactions.length} transactions down to ${filteredTransactions.length}`)
          setTransactions(filteredTransactions)

          // Show a more helpful error message with the link to create the index
          // setError(
          //   <span>
          //     For better performance, please{" "}
          //     <a
          //       href="https://console.firebase.google.com/v1/r/project/blinkbank-4c28c/firestore/indexes?create_composite=ClRwcm9qZWN0cy9ibGlua2JhbmstNGMyOGMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RyYW5zYWN0aW9ucy9pbmRleGVzL18QARoICgR0eXBlEAEaCgoGdXNlcklkEAEaCAoEZGF0ZRABGgwKCF9fbmFtZV9fEAE"
          //       target="_blank"
          //       rel="noopener noreferrer"
          //       className="underline text-primary"
          //     >
          //       create the required Firestore index
          //     </a>
          //   </span>,
          // )
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setError("Failed to load transaction data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, period])

  // Process transaction data for the chart
  const processChartData = () => {
    if (!transactions || transactions.length === 0) {
      // Return empty data structure matching the period
      if (period === "weekly") {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
          name: day,
          amount: 0,
        }))
      } else if (period === "monthly") {
        return Array.from({ length: 4 }, (_, i) => ({
          name: `Week ${i + 1}`,
          amount: 0,
        }))
      } else {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => ({
          name: month,
          amount: 0,
        }))
      }
    }

    if (period === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dayMap = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {} as Record<string, number>)

      transactions.forEach((transaction) => {
        try {
          const date = new Date(transaction.date)
          if (isNaN(date.getTime())) return
          const dayName = days[date.getDay()]
          dayMap[dayName] += transaction.amount || 0
        } catch {
          // Skip transaction if date parsing fails
        }
      })

      return days.map((day) => ({
        name: day,
        amount: dayMap[day],
      }))
    } else if (period === "monthly") {
      const weeklyData: Record<string, number> = {}

      transactions.forEach((transaction) => {
        try {
          const date = new Date(transaction.date)
          if (isNaN(date.getTime())) return
          const weekNum = Math.floor((date.getDate() - 1) / 7) + 1
          const weekKey = `Week ${weekNum}`
          weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (transaction.amount || 0)
        } catch {
          // Skip transaction if date parsing fails
        }
      })

      return Array.from({ length: 4 }, (_, i) => ({
        name: `Week ${i + 1}`,
        amount: weeklyData[`Week ${i + 1}`] || 0,
      }))
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthMap = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {} as Record<string, number>)

      transactions.forEach((transaction) => {
        try {
          const date = new Date(transaction.date)
          if (isNaN(date.getTime())) return
          const monthName = months[date.getMonth()]
          monthMap[monthName] += transaction.amount || 0
        } catch {
          // Skip transaction if date parsing fails
        }
      })

      return months.map((month) => ({
        name: month,
        amount: monthMap[month],
      }))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-[120px]" />
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = processChartData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Your spending patterns over time</CardDescription>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue={period} className="w-[200px]" onValueChange={(value) => setPeriod(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={view} onValueChange={(value) => setView(value as "bar" | "line")}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] w-full">
          {transactions.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No transactions found for selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {view === "bar" ? (
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" name="Spending" />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Spending"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

