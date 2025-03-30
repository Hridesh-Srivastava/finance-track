"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SpendingChartProps {
  isLoading: boolean
}

export function SpendingChart({ isLoading }: SpendingChartProps) {
  const [view, setView] = useState<"bar" | "line">("bar")
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("weekly")

  // Sample data
  const weeklyData = [
    { name: "Mon", amount: 120 },
    { name: "Tue", amount: 85 },
    { name: "Wed", amount: 190 },
    { name: "Thu", amount: 140 },
    { name: "Fri", amount: 230 },
    { name: "Sat", amount: 310 },
    { name: "Sun", amount: 170 },
  ]

  const monthlyData = [
    { name: "Week 1", amount: 850 },
    { name: "Week 2", amount: 720 },
    { name: "Week 3", amount: 910 },
    { name: "Week 4", amount: 780 },
  ]

  const yearlyData = [
    { name: "Jan", amount: 2400 },
    { name: "Feb", amount: 1980 },
    { name: "Mar", amount: 2800 },
    { name: "Apr", amount: 2350 },
    { name: "May", amount: 3100 },
    { name: "Jun", amount: 2700 },
    { name: "Jul", amount: 3200 },
    { name: "Aug", amount: 2950 },
    { name: "Sep", amount: 2800 },
    { name: "Oct", amount: 3300 },
    { name: "Nov", amount: 3500 },
    { name: "Dec", amount: 4200 },
  ]

  const getChartData = () => {
    switch (period) {
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      case "yearly":
        return yearlyData
      default:
        return weeklyData
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Your spending patterns over time</CardDescription>
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getChartData()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

