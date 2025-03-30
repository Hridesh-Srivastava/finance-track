"use client"

import type React from "react"

import { useState } from "react"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"

export function NaturalLanguageQuery() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResult(null)

    try {
      // Call Firebase Function
      const processQuery = httpsCallable(functions, "processNaturalLanguageQuery")
      const response = await processQuery({ query })

      // @ts-ignore
      setResult(response.data.response)
    } catch (error) {
      console.error("Error processing query:", error)
      setResult("Sorry, I couldn't process your query. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask About Your Finances</CardTitle>
        <CardDescription>Ask natural language questions about your financial situation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            placeholder="E.g., 'Can I afford a $50 purchase?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
        {result && (
          <div className="mt-4 rounded-md bg-muted p-4">
            <p>{result}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Powered by AI to analyze your financial data and provide personalized insights.
      </CardFooter>
    </Card>
  )
}

