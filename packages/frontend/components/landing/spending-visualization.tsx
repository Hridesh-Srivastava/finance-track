"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const monthlyData = [
  { name: "Jan", amount: 1200 },
  { name: "Feb", amount: 1900 },
  { name: "Mar", amount: 1500 },
  { name: "Apr", amount: 1700 },
  { name: "May", amount: 1400 },
  { name: "Jun", amount: 2000 },
]

const categoryData = [
  { name: "Housing", value: 1200 },
  { name: "Food", value: 800 },
  { name: "Transportation", value: 500 },
  { name: "Entertainment", value: 300 },
  { name: "Utilities", value: 400 },
  { name: "Other", value: 200 },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function SpendingVisualization() {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const handlePieLeave = () => {
    setActiveIndex(null)
  }

  if (!isClient) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-6">
        <div className="w-full h-full max-w-md flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Visualize Your Spending</h2>
            <p className="mb-6">
              Interactive charts and AI-powered insights help you understand where your money goes.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Visualize Your Spending</CardTitle>
            <Tabs value={chartType} className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="bar" onClick={() => setChartType("bar")} className="h-7 px-3">
                  Bar
                </TabsTrigger>
                <TabsTrigger value="pie" onClick={() => setChartType("pie")} className="h-7 px-3">
                  Pie
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive charts and AI-powered insights help you understand where your money goes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartType === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1500}
                    onMouseEnter={handlePieEnter}
                    onMouseLeave={handlePieLeave}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={activeIndex === index ? "hsl(var(--foreground))" : "transparent"}
                        strokeWidth={activeIndex === index ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Monthly Average:</span>
              <span className="font-bold">{formatCurrency(1616)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Top Category:</span>
              <span className="font-bold">Housing (37%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">AI Insight:</span>
              <span className="text-primary font-medium">Reduce food spending by 15%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

