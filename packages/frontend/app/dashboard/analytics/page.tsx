"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { groupTransactionsByCategory, calculateTotalByType, calculateSavingsRate, formatCurrency } from "@/lib/shared"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
  date: string
  createdAt: string
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [period, setPeriod] = useState("month")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchTransactions()
    }
  }, [user, loading, router, period])

  const fetchTransactions = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Calculate date range based on selected period
      const now = new Date()
      const startDate = new Date()

      if (period === "week") {
        startDate.setDate(now.getDate() - 7)
      } else if (period === "month") {
        startDate.setMonth(now.getMonth() - 1)
      } else if (period === "quarter") {
        startDate.setMonth(now.getMonth() - 3)
      } else if (period === "year") {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("date", ">=", startDate.toISOString().split("T")[0]),
        orderBy("date", "desc"),
      )

      const querySnapshot = await getDocs(q)
      const fetchedTransactions: Transaction[] = []

      querySnapshot.forEach((doc) => {
        fetchedTransactions.push({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, "id">),
        })
      })

      setTransactions(fetchedTransactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate analytics data
  const categoryData = () => {
    const categories = groupTransactionsByCategory(transactions)
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const totalIncome = calculateTotalByType(transactions, "income")
  const totalExpenses = calculateTotalByType(transactions, "expense")
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses)

  // Top expenses
  const topExpenses = [...transactions]
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <DashboardShell>
      <DashboardHeader heading="Analytics" text="Detailed analysis of your financial data.">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </DashboardHeader>
      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="income">Income Analysis</TabsTrigger>
          <TabsTrigger value="savings">Savings Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="spending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Breakdown of your expenses by category</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Expenses</CardTitle>
                <CardDescription>Your largest expenses this {period}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topExpenses.length > 0 ? (
                      topExpenses.map((expense, index) => (
                        <div key={expense.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">{expense.category}</p>
                          </div>
                          <p className="text-sm font-medium">{formatCurrency(expense.amount)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No expenses found for this period.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Daily Spending</CardTitle>
                <CardDescription>Your spending pattern throughout the {period}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={transactions
                        .filter((t) => t.type === "expense")
                        .map((t) => ({
                          date: new Date(t.date).toLocaleDateString("en-US", { weekday: "short" }),
                          amount: t.amount,
                        }))}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Spending Insights</CardTitle>
              <CardDescription>AI-powered analysis of your spending habits</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-medium">Spending Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      You've spent a total of {formatCurrency(totalExpenses)} during this {period}, with the highest
                      spending in the {categoryData()[0]?.name || "N/A"} category.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-medium">Savings Rate</h4>
                    <p className="text-sm text-muted-foreground">
                      Your current savings rate is {savingsRate.toFixed(1)}%.
                      {savingsRate < 20
                        ? " Consider reducing discretionary spending to increase your savings."
                        : " Great job maintaining a healthy savings rate!"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-medium">Spending Recommendation</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on your spending patterns, you might want to focus on reducing expenses in
                      {topExpenses[0]?.category
                        ? ` the ${topExpenses[0].category} category`
                        : " your highest spending categories"}
                      .
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Analysis</CardTitle>
              <CardDescription>Analysis of your income sources and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Income Sources</h4>
                    <div className="grid h-[200px] grid-cols-2 gap-4">
                      {transactions.filter((t) => t.type === "income").length > 0 ? (
                        <>
                          <div className="rounded-md bg-primary/20 p-4">
                            <div className="text-lg font-bold">Primary Income</div>
                            <div className="text-2xl font-bold">
                              {formatCurrency(
                                transactions
                                  .filter((t) => t.type === "income" && t.category === "Income")
                                  .reduce((sum, t) => sum + t.amount, 0),
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(
                                (transactions
                                  .filter((t) => t.type === "income" && t.category === "Income")
                                  .reduce((sum, t) => sum + t.amount, 0) /
                                  totalIncome) *
                                  100,
                              )}
                              % of total income
                            </div>
                          </div>
                          <div className="rounded-md bg-primary/10 p-4">
                            <div className="text-lg font-bold">Other Income</div>
                            <div className="text-2xl font-bold">
                              {formatCurrency(
                                transactions
                                  .filter((t) => t.type === "income" && t.category !== "Income")
                                  .reduce((sum, t) => sum + t.amount, 0),
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(
                                (transactions
                                  .filter((t) => t.type === "income" && t.category !== "Income")
                                  .reduce((sum, t) => sum + t.amount, 0) /
                                  totalIncome) *
                                  100,
                              )}
                              % of total income
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 flex items-center justify-center">
                          <p className="text-muted-foreground">No income data available for this period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Income Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={transactions
                          .filter((t) => t.type === "income")
                          .map((t) => ({
                            date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                            amount: t.amount,
                          }))}
                      >
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="amount" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="savings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Savings Analysis</CardTitle>
              <CardDescription>Track your progress towards savings goals</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Emergency Fund</h4>
                      <span className="text-sm text-muted-foreground">75% complete</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[75%] rounded-full bg-primary"></div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>$7,500 saved</span>
                      <span>$10,000 goal</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Vacation Fund</h4>
                      <span className="text-sm text-muted-foreground">40% complete</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[40%] rounded-full bg-primary"></div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>$2,000 saved</span>
                      <span>$5,000 goal</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Home Down Payment</h4>
                      <span className="text-sm text-muted-foreground">25% complete</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[25%] rounded-full bg-primary"></div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>$12,500 saved</span>
                      <span>$50,000 goal</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>Long-term analysis of your financial patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-8">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Net Worth Growth</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={[
                          { month: "Jan", amount: totalIncome - totalExpenses },
                          { month: "Feb", amount: (totalIncome - totalExpenses) * 1.05 },
                          { month: "Mar", amount: (totalIncome - totalExpenses) * 1.1 },
                          { month: "Apr", amount: (totalIncome - totalExpenses) * 1.15 },
                          { month: "May", amount: (totalIncome - totalExpenses) * 1.2 },
                          { month: "Jun", amount: (totalIncome - totalExpenses) * 1.25 },
                        ]}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="amount" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Spending vs. Income</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={[
                          { month: "Jan", income: totalIncome * 0.9, expenses: totalExpenses * 0.9 },
                          { month: "Feb", income: totalIncome * 0.95, expenses: totalExpenses * 0.95 },
                          { month: "Mar", income: totalIncome, expenses: totalExpenses },
                          { month: "Apr", income: totalIncome * 1.05, expenses: totalExpenses * 1.02 },
                          { month: "May", income: totalIncome * 1.1, expenses: totalExpenses * 1.05 },
                          { month: "Jun", income: totalIncome * 1.15, expenses: totalExpenses * 1.08 },
                        ]}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="income" fill="#10b981" name="Income" />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

