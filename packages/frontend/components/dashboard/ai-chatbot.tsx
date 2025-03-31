"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User } from "lucide-react"
import { useAuth } from "@/lib/auth" // Import auth context/hook

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function AIChatbot() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI financial assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth() // Get current user from auth context

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call the API endpoint with authenticated userId
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user?.id || "anonymous", // Use authenticated user ID or fallback
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server responded with status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      }

      // Add assistant message to UI
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      // Add more specific error message
      const errorMessage =
        error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again later."

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `Error: ${errorMessage}. Make sure the Python backend is running on port 5010.`,
          role: "assistant",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Blink-Bank Assistant</CardTitle>
        <CardDescription>Ask questions about your finances and get AI-powered insights</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div className="flex items-start max-w-[80%] space-x-2">
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <AvatarFallback className="text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start max-w-[80%] space-x-2">
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarFallback className="text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

