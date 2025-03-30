// User types
export interface User {
    uid: string
    email: string
    displayName?: string
    photoURL?: string
    createdAt: string
  }
  
  // Transaction types
  export type TransactionType = "income" | "expense"
  
  export interface Transaction {
    id: string
    userId: string
    amount: number
    description: string
    category: string
    type: TransactionType
    date: string
    createdAt: string
  }
  
  // Financial summary types
  export interface FinancialSummary {
    userId: string
    totalIncome: number
    totalExpenses: number
    balance: number
    lastUpdated: string
  }
  
  // Budget types
  export interface Budget {
    id: string
    userId: string
    category: string
    amount: number
    period: "daily" | "weekly" | "monthly" | "yearly"
    startDate: string
    endDate?: string
    createdAt: string
  }
  
  // Insight types
  export interface Insight {
    type: "spending" | "saving" | "income" | "anomaly" | "recommendation"
    title: string
    description: string
  }
  
  export interface UserInsights {
    userId: string
    insights: Insight[]
    generatedAt: string
  }
  
  // Query types
  export interface NaturalLanguageQueryRequest {
    query: string
  }
  
  export interface NaturalLanguageQueryResponse {
    success: boolean
    response: string
  }
  
  