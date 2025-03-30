"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, doc, setDoc, getDoc, runTransaction } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserForm from "@/components/bank-components/user-form"
import TransactionForm from "@/components/bank-components/transaction-form"
import TransactionHistory from "@/components/bank-components/transaction-history"
import type { BankUser, BankTransaction } from "../../../shared/src/types/banking"

export default function BankingSimulator() {
  const [user, setUser] = useState<BankUser | null>(null)
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [activeTab, setActiveTab] = useState("account")
  const [loading, setLoading] = useState(true)

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true)
      const savedAccountNumber = localStorage.getItem("bankAccountNumber")

      if (savedAccountNumber) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "bankUsers", savedAccountNumber))

          if (userDoc.exists()) {
            const userData = userDoc.data() as BankUser
            setUser(userData)
            await fetchTransactions(userData.accountNumber)
          } else {
            // Clear localStorage if user doesn't exist in Firestore
            localStorage.removeItem("bankAccountNumber")
          }
        } catch (error) {
          console.error("Error loading user data:", error)
          localStorage.removeItem("bankAccountNumber")
        }
      }

      setLoading(false)
    }

    loadUserData()
  }, [])

  const fetchTransactions = async (accountNumber: string) => {
    try {
      const q = query(
        collection(db, "bankTransactions"),
        where("accountNumber", "==", accountNumber),
        orderBy("timestamp", "desc"),
      )

      const querySnapshot = await getDocs(q)
      const transactionData: BankTransaction[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        transactionData.push({
          id: doc.id,
          accountNumber: data.accountNumber,
          type: data.type,
          amount: data.amount,
          balance: data.balance,
          timestamp: data.timestamp.toDate(),
          description: data.description,
        })
      })

      setTransactions(transactionData)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  const handleUserCreated = async (newUser: BankUser) => {
    try {
      // Store user in Firestore
      await setDoc(doc(db, "bankUsers", newUser.accountNumber), newUser)

      // Save account number to localStorage
      localStorage.setItem("bankAccountNumber", newUser.accountNumber)

      // Update state
      setUser(newUser)
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Failed to create account. Please try again.")
    }
  }

  const handleTransaction = async (
    type: "deposit" | "withdrawal",
    amount: number,
    description: string,
    pin: string,
  ) => {
    if (!user) return

    // Verify PIN
    if (pin !== user.pin) {
      alert("Incorrect PIN")
      return
    }

    try {
      // Use a transaction to ensure consistency
      await runTransaction(db, async (transaction) => {
        // Get the latest user data
        const userRef = doc(db, "bankUsers", user.accountNumber)
        const userDoc = await transaction.get(userRef)

        if (!userDoc.exists()) {
          throw new Error("User account not found")
        }

        const userData = userDoc.data() as BankUser
        const currentBalance = userData.balance

        // Calculate new balance
        const newBalance = type === "deposit" ? currentBalance + amount : currentBalance - amount

        // Don't allow negative balance
        if (newBalance < 0) {
          throw new Error("Insufficient funds")
        }

        // Update user balance in Firestore
        transaction.update(userRef, { balance: newBalance })

        // Create transaction document
        const transactionData: BankTransaction = {
          accountNumber: user.accountNumber,
          type,
          amount,
          balance: newBalance,
          timestamp: new Date(),
          description,
        }

        // Add transaction to Firestore
        const transactionRef = doc(collection(db, "bankTransactions"))
        transaction.set(transactionRef, transactionData)

        // Update local state
        setUser({
          ...user,
          balance: newBalance,
        })

        // Add the new transaction to the state
        setTransactions([
          {
            ...transactionData,
            id: transactionRef.id,
          },
          ...transactions,
        ])
      })

      // Switch to history tab
      setActiveTab("history")
    } catch (error) {
      console.error("Transaction failed:", error)
      alert(error instanceof Error ? error.message : "Transaction failed")
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      {!user ? (
        <UserForm onUserCreated={handleUserCreated} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>Account: {user.accountNumber}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">${user.balance.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <TransactionForm onTransaction={handleTransaction} />
              </TabsContent>
              <TabsContent value="history">
                <TransactionHistory transactions={transactions} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

