import * as functions from "firebase-functions/v1"
import * as admin from "firebase-admin"

// Initialize Firebase Admin
admin.initializeApp()

// Firestore references
const db = admin.firestore()

// Collection names
const COLLECTION_NAMES = {
  USERS: "users",
  TRANSACTIONS: "transactions",
  FINANCIAL_SUMMARIES: "financialSummaries",
  BUDGETS: "budgets",
  INSIGHTS: "insights",
}

// Error messages
const ERROR_MESSAGES = {
  UNAUTHENTICATED: "You must be logged in to perform this action",
  UNAUTHORIZED: "You are not authorized to perform this action",
  INVALID_INPUT: "Invalid input provided",
  SERVER_ERROR: "An unexpected error occurred",
}

/**
 * Process new transactions and store in vector database
 */
export const processTransaction = functions.firestore
  .document(`${COLLECTION_NAMES.TRANSACTIONS}/{transactionId}`)
  .onCreate(async (snapshot, context) => {
    const transaction = snapshot.data()
    const userId = transaction.userId

    try {
      // Log the transaction for processing
      console.log(`Processing new transaction: ${context.params.transactionId}`)

      // Here we would integrate with Pathway's vector store
      // This is a placeholder for the actual implementation
      await storeTransactionVector(transaction)

      // Update user's financial summary
      await updateUserFinancialSummary(userId, transaction)

      return { success: true }
    } catch (error) {
      console.error("Error processing transaction:", error)
      return { success: false, error: (error as Error).message }
    }
  })

/**
 * Natural language query processing
 */
export const processNaturalLanguageQuery = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context?.auth) {
    throw new functions.https.HttpsError("unauthenticated", ERROR_MESSAGES.UNAUTHENTICATED)
  }

  const { query } = data as { query: string }
  const userId = context.auth.uid

  try {
    // Fetch user's transaction data
    const transactionsSnapshot = await db
      .collection(COLLECTION_NAMES.TRANSACTIONS)
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .limit(100)
      .get()

    const transactions = transactionsSnapshot.docs.map((doc) => doc.data())

    // Here we would integrate with Fetch AI's agents
    // This is a placeholder for the actual implementation
    const response = await processQueryWithAI(query, transactions)

    return { success: true, response }
  } catch (error) {
    console.error("Error processing query:", error)
    throw new functions.https.HttpsError("internal", (error as Error).message)
  }
})

/**
 * Generate financial insights
 */
export const generateFinancialInsights = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  try {
    // Get all users
    const usersSnapshot = await db.collection(COLLECTION_NAMES.USERS).get()

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id

      // Get user's recent transactions
      const transactionsSnapshot = await db
        .collection(COLLECTION_NAMES.TRANSACTIONS)
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(100)
        .get()

      const transactions = transactionsSnapshot.docs.map((doc) => doc.data())

      // Generate insights using AI
      const insights = await generateInsightsWithAI(transactions)

      // Store insights in Firestore
      await db.collection(COLLECTION_NAMES.INSIGHTS).doc(userId).set({
        insights,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }

    return null
  } catch (error) {
    console.error("Error generating insights:", error)
    return null
  }
})

/**
 * Create budget
 */
export const createBudget = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context?.auth) {
    throw new functions.https.HttpsError("unauthenticated", ERROR_MESSAGES.UNAUTHENTICATED)
  }

  const userId = context.auth.uid
  const { category, amount, period, startDate } = data as {
    category: string
    amount: number
    period: "daily" | "weekly" | "monthly" | "yearly"
    startDate: string
  }

  // Validate input
  if (!category || !amount || !period || !startDate) {
    throw new functions.https.HttpsError("invalid-argument", ERROR_MESSAGES.INVALID_INPUT)
  }

  try {
    const budgetRef = await db.collection(COLLECTION_NAMES.BUDGETS).add({
      userId,
      category,
      amount: Number(amount),
      period,
      startDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: true, budgetId: budgetRef.id }
  } catch (error) {
    console.error("Error creating budget:", error)
    throw new functions.https.HttpsError("internal", ERROR_MESSAGES.SERVER_ERROR)
  }
})

/**
 * Get budget progress
 */
export const getBudgetProgress = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context?.auth) {
    throw new functions.https.HttpsError("unauthenticated", ERROR_MESSAGES.UNAUTHENTICATED)
  }

  const userId = context.auth.uid
  const { budgetId } = data as { budgetId: string }

  try {
    // Get budget
    const budgetDoc = await db.collection(COLLECTION_NAMES.BUDGETS).doc(budgetId).get()

    if (!budgetDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Budget not found")
    }

    const budget = budgetDoc.data()

    // Verify ownership
    if (budget?.userId !== userId) {
      throw new functions.https.HttpsError("permission-denied", ERROR_MESSAGES.UNAUTHORIZED)
    }

    // Get transactions for this category in the current period
    const startDate = new Date(budget.startDate)
    const now = new Date()

    let endDate = new Date(startDate)
    switch (budget.period) {
      case "daily":
        endDate.setDate(startDate.getDate() + 1)
        break
      case "weekly":
        endDate.setDate(startDate.getDate() + 7)
        break
      case "monthly":
        endDate.setMonth(startDate.getMonth() + 1)
        break
      case "yearly":
        endDate.setFullYear(startDate.getFullYear() + 1)
        break
    }

    // If we're still within the budget period, use current date for calculations
    if (now < endDate) {
      endDate = now
    }

    const transactionsSnapshot = await db
      .collection(COLLECTION_NAMES.TRANSACTIONS)
      .where("userId", "==", userId)
      .where("category", "==", budget.category)
      .where("type", "==", "expense")
      .where("date", ">=", startDate.toISOString().split("T")[0])
      .where("date", "<=", endDate.toISOString().split("T")[0])
      .get()

    const transactions = transactionsSnapshot.docs.map((doc) => doc.data())
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
    const progress = Math.min(Math.round((totalSpent / budget.amount) * 100), 100)

    return {
      success: true,
      budget: {
        ...budget,
        spent: totalSpent,
        remaining: Math.max(budget.amount - totalSpent, 0),
        progress,
        isOverBudget: totalSpent > budget.amount,
      },
    }
  } catch (error) {
    console.error("Error getting budget progress:", error)
    throw new functions.https.HttpsError("internal", ERROR_MESSAGES.SERVER_ERROR)
  }
})

// Helper functions (placeholders for actual implementations)

async function storeTransactionVector(transaction: any) {
  // This would integrate with Pathway's vector store
  console.log("Storing transaction in vector database:", transaction.id)
  // Implementation would depend on Pathway's API
}

async function updateUserFinancialSummary(userId: string, transaction: any) {
  // Update user's financial summary in Firestore
  const summaryRef = db.collection(COLLECTION_NAMES.FINANCIAL_SUMMARIES).doc(userId)

  // Get current summary
  const summaryDoc = await summaryRef.get()

  if (!summaryDoc.exists) {
    // Create new summary if it doesn't exist
    await summaryRef.set({
      totalIncome: transaction.type === "income" ? transaction.amount : 0,
      totalExpenses: transaction.type === "expense" ? transaction.amount : 0,
      balance: transaction.type === "income" ? transaction.amount : -transaction.amount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    })
  } else {
    // Update existing summary
    if (transaction.type === "income") {
      await summaryRef.update({
        totalIncome: admin.firestore.FieldValue.increment(transaction.amount),
        balance: admin.firestore.FieldValue.increment(transaction.amount),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      })
    } else if (transaction.type === "expense") {
      await summaryRef.update({
        totalExpenses: admin.firestore.FieldValue.increment(transaction.amount),
        balance: admin.firestore.FieldValue.increment(-transaction.amount),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
  }
}

async function processQueryWithAI(query: string, transactions: any[]) {
  // This would integrate with Fetch AI's agents
  console.log("Processing query with AI:", query)

  // Simple mock implementation
  if (query.toLowerCase().includes("spend") && query.toLowerCase().includes("food")) {
    const foodTransactions = transactions.filter(
      (t) => t.category.toLowerCase().includes("food") && t.type === "expense",
    )

    const totalSpent = foodTransactions.reduce((sum, t) => sum + t.amount, 0)

    return `You've spent $${totalSpent.toFixed(2)} on food recently.`
  }

  if (query.toLowerCase().includes("afford") && query.toLowerCase().includes("purchase")) {
    // Extract amount from query (simplified)
    const amountMatch = query.match(/\$(\d+)/)
    const amount = amountMatch ? Number.parseFloat(amountMatch[1]) : 50

    // Get total balance
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    if (balance > amount * 3) {
      return `Yes, you can afford a $${amount} purchase. You have approximately $${balance.toFixed(2)} available.`
    } else {
      return `A $${amount} purchase might be tight right now. You have approximately $${balance.toFixed(2)} available.`
    }
  }

  return "I've analyzed your financial data. Could you please be more specific about what you'd like to know?"
}

async function generateInsightsWithAI(transactions: any[]) {
  // This would integrate with Fetch AI's agents
  console.log("Generating insights with AI for transactions")

  // Simple mock implementation
  const insights = []

  // Calculate spending by category
  const categories: Record<string, number> = {}
  transactions.forEach((t) => {
    if (t.type === "expense") {
      if (!categories[t.category]) {
        categories[t.category] = 0
      }
      categories[t.category] += t.amount
    }
  })

  // Find top spending category
  let topCategory = null
  let topAmount = 0

  for (const [category, amount] of Object.entries(categories)) {
    if (amount > topAmount) {
      topCategory = category
      topAmount = amount
    }
  }

  if (topCategory) {
    insights.push({
      type: "spending",
      title: "Top Spending Category",
      description: `Your highest spending category is ${topCategory} at $${topAmount.toFixed(2)}.`,
    })
  }

  // Check for unusual spending
  // (In a real implementation, this would compare to historical data)
  insights.push({
    type: "anomaly",
    title: "Spending Pattern",
    description: "Your spending pattern appears normal compared to your historical data.",
  })

  // Savings recommendation
  insights.push({
    type: "recommendation",
    title: "Savings Opportunity",
    description: "Consider setting aside 20% of your income for long-term savings goals.",
  })

  return insights
}

