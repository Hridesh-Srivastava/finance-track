"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface TransactionFormProps {
  onTransaction: (type: "deposit" | "withdrawal", amount: number, description: string, pin: string) => Promise<void>
}

export default function TransactionForm({ onTransaction }: TransactionFormProps) {
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate amount
    const amountValue = Number.parseFloat(amount)
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Validate PIN
    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError("PIN must be a 4-digit number")
      return
    }

    try {
      setIsSubmitting(true)
      // Process transaction with all required fields
      await onTransaction(type, amountValue, description, pin)

      // Reset form on success
      setAmount("")
      setDescription("")
      setPin("")
      setError("")
    } catch (error) {
      console.error("Transaction error:", error)
      setError(error instanceof Error ? error.message : "Transaction failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Transaction Type</Label>
        <RadioGroup
          value={type}
          onValueChange={(value) => {
            // Add console log to verify the value is changing
            console.log("Transaction type changed to:", value)
            setType(value as "deposit" | "withdrawal")
          }}
          className="flex space-x-4"
          required
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="deposit" id="deposit" />
            <Label htmlFor="deposit">Deposit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="withdrawal" id="withdrawal" />
            <Label htmlFor="withdrawal">Withdrawal</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this transaction for?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pin">Enter PIN to confirm</Label>
        <Input
          id="pin"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="****"
          maxLength={4}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
      </Button>
    </form>
  )
}