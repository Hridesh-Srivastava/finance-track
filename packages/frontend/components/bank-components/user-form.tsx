"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { BankUser } from "../../../shared/src/types/banking"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserFormProps {
  onUserCreated: (user: BankUser) => void
}

export default function UserForm({ onUserCreated }: UserFormProps) {
  const [name, setName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!name || !accountNumber || !pin) {
      setError("All fields are required")
      return
    }

    if (pin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError("PIN must be a 4-digit number")
      return
    }

    if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
      setError("Account number must be a 10-digit number")
      return
    }

    setIsSubmitting(true)

    try {
      // Check if account number already exists
      const q = query(collection(db, "bankUsers"), where("accountNumber", "==", accountNumber))

      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setError("Account number already exists")
        setIsSubmitting(false)
        return
      }

      // Create user
      const newUser: BankUser = {
        name,
        accountNumber,
        pin,
        balance: 0,
      }

      await onUserCreated(newUser)
    } catch (error) {
      console.error("Error creating account:", error)
      setError("Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Setup</CardTitle>
        <CardDescription>Enter your details to start using the banking simulator</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number (10 digits)</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="1234567890"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN (4 digits)</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="****"
              maxLength={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="****"
              maxLength={4}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

