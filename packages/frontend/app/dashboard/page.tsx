"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { AIChatbot } from "@/components/dashboard/ai-chatbot"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      // Simulate data loading
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="View and manage your financial overview." />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SpendingChart isLoading={isLoading} />
        </div>
        <div className="xl:col-span-2">
          <AIChatbot />
        </div>
      </div>
    </DashboardShell>
  )
}

function DashboardSkeleton() {
  return (
    <DashboardShell>
      <div className="flex items-center">
        <Skeleton className="h-8 w-[200px]" />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-full">
          <Skeleton className="h-[120px] w-full" />
        </div>
        <div className="xl:col-span-2">
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="xl:row-span-2">
          <Skeleton className="h-[500px] w-full" />
        </div>
        <div className="xl:col-span-2">
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </DashboardShell>
  )
}

