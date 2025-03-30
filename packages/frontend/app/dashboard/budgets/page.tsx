"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
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
import { TRANSACTION_CATEGORIES, formatCurrency } from "@finance-tracker/shared"
import { format } from "date-fns"

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

  // New budget form state
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    startDate: format(new Date(), "yyyy-MM-dd"),
  })
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchBudgets()
      fetchTransactions()
    }
  }, [user, loading, router])

  const fetchBudgets = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const q = query(collection(db, "budgets"), where("userId", "==", user.uid))

      const querySnapshot = await getDocs(q)
      const fetchedBudgets: Budget[] = []

      querySnapshot.forEach((doc) => {
        fetchedBudgets.push({
          id: doc.id,
          ...(doc.data() as Omit<Budget, "id">),
        })
      })

      setBudgets(fetchedBudgets)
    } catch (error) {
      console.error("Error fetching budgets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return

    try {
      // Get transactions for the current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("date", ">=", startOfMonth.toISOString().split("T")[0]),
        where("type", "==", "expense"),
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
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBudget({
      ...newBudget,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewBudget({
      ...newBudget,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!newBudget.category) {
      setFormError("Please select a category")
      return
    }

    if (!newBudget.amount || isNaN(Number(newBudget.amount)) || Number(newBudget.amount) <= 0) {
      setFormError("Please enter a valid amount")
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, "budgets"), {
        userId: user?.uid,
        category: newBudget.category,
        amount: Number(newBudget.amount),
        period: newBudget.period,
        startDate: newBudget.startDate,
        createdAt: serverTimestamp(),
      })

      // Reset form and close dialog
      setNewBudget({
        category: "",
        amount: "",
        period: "monthly",
        startDate: format(new Date(), "yyyy-MM-dd"),
      })

      setIsDialogOpen(false)

      // Refresh budgets
      fetchBudgets()
    } catch (error) {
      console.error("Error adding budget:", error)
      setFormError("Failed to add budget. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) {
      return
    }

    try {
      await deleteDoc(doc(db, "budgets", budgetId))
      fetchBudgets()
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  // Calculate budget progress
  const calculateBudgetProgress = (budget: Budget) => {
    const categoryTransactions = transactions.filter((t) => t.category === budget.category)
    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
    const progress = Math.min(Math.round((totalSpent / budget.amount) * 100), 100)

    return {
      spent: totalSpent,
      progress,
      remaining: Math.max(budget.amount - totalSpent, 0),
      isOverBudget: totalSpent > budget.amount,
    }
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
                  <Select value={newBudget.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_CATEGORIES.filter((c) => c !== "Income").map((category) => (
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
                    onValueChange={(value) =>
                      handleSelectChange("period", value as "daily" | "weekly" | "monthly" | "yearly")
                    }
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
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
          ))
        ) : budgets.length > 0 ? (
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

