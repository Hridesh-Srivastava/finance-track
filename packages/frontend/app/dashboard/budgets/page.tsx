"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, Trash2 } from "lucide-react"
import { TRANSACTION_CATEGORIES, formatCurrency } from "@/lib/shared"
import { format, startOfMonth } from "date-fns"

interface Budget {
  id: string
  userId: string
  category: string
  amount: number
  period: "daily" | "weekly" | "monthly" | "yearly"
  startDate: string
  endDate?: string
  createdAt: string
}

interface Transaction {
  id: string
  userId: string
  amount: number
  category: string
  type: "income" | "expense"
  date: string
}

export default function BudgetsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly" as const,
    startDate: format(new Date(), "yyyy-MM-dd"),
  })

  const currentMonthStart = startOfMonth(new Date())

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, loading, router])

  const fetchBudgets = useCallback(async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, "budgets"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      )

      const querySnapshot = await getDocs(q)
      const fetchedBudgets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[]

      setBudgets(fetchedBudgets)
    } catch (error) {
      console.error("Error fetching budgets:", error)
      throw error
    }
  }, [user])

  const fetchTransactions = useCallback(async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("type", "==", "expense"),
        orderBy("date", "desc")
      )

      const querySnapshot = await getDocs(q)
      const fetchedTransactions = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(t => new Date(t.date) >= currentMonthStart) as Transaction[]

      setTransactions(fetchedTransactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      throw error
    }
  }, [user, currentMonthStart])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchBudgets(), fetchTransactions()])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchBudgets, fetchTransactions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBudget(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewBudget(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!newBudget.category) {
      setFormError("Please select a category")
      return
    }

    const amount = Number(newBudget.amount)
    if (!newBudget.amount || isNaN(amount) || amount <= 0) {
      setFormError("Please enter a valid amount")
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, "budgets"), {
        userId: user?.uid,
        category: newBudget.category,
        amount,
        period: newBudget.period,
        startDate: newBudget.startDate,
        createdAt: serverTimestamp(),
      })

      setNewBudget({
        category: "",
        amount: "",
        period: "monthly",
        startDate: format(new Date(), "yyyy-MM-dd"),
      })
      setIsDialogOpen(false)
      await fetchData()
    } catch (error) {
      console.error("Error adding budget:", error)
      setFormError("Failed to add budget. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return

    try {
      await deleteDoc(doc(db, "budgets", budgetId))
      setBudgets(prev => prev.filter(b => b.id !== budgetId))
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  const calculateBudgetProgress = useCallback((budget: Budget) => {
    const categoryTransactions = transactions.filter(t => t.category === budget.category)
    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
    const progress = Math.min(Math.round((totalSpent / budget.amount) * 100), 100)

    return {
      spent: totalSpent,
      progress,
      remaining: Math.max(budget.amount - totalSpent, 0),
      isOverBudget: totalSpent > budget.amount,
    }
  }, [transactions])

  const budgetCategories = TRANSACTION_CATEGORIES.filter(c => c !== "Income")

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Budgets" text="Set and track your spending limits by category.">
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </DashboardHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                  <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
                </CardTitle>
                <CardDescription>
                  <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-4 w-full animate-pulse rounded bg-muted mb-2"></div>
                <div className="h-16 w-full animate-pulse rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Budgets" text="Set and track your spending limits by category.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>Set a spending limit for a specific category.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {formError && <div className="text-sm font-medium text-destructive">{formError}</div>}
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newBudget.category} 
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={newBudget.amount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={newBudget.period}
                    onValueChange={(value) => handleSelectChange("period", value)}
                  >
                    <SelectTrigger id="period">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newBudget.startDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Budget"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const { spent, progress, remaining, isOverBudget } = calculateBudgetProgress(budget)

            return (
              <Card key={budget.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{budget.category}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {formatCurrency(spent)} of {formatCurrency(budget.amount)}
                    </span>
                    <span className={`text-sm ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                      {progress}%
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className={isOverBudget ? "bg-destructive/20" : ""}
                    indicatorClassName={isOverBudget ? "bg-destructive" : ""}
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className={isOverBudget ? "text-destructive font-medium" : "font-medium"}>
                        {isOverBudget ? "Over budget" : formatCurrency(remaining)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Started:</span>
                      <span>{format(new Date(budget.startDate), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Budgets</CardTitle>
              <CardDescription>You haven't created any budgets yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create a budget to start tracking your spending against your financial goals.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Budget
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}