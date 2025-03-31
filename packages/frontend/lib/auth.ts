"use client"

import { createContext, useContext } from "react"

interface AuthContextType {
  user: {
    id: string | null
    // Add other user properties as needed
  } | null
}

const AuthContext = createContext<AuthContextType>({
  user: { id: "anonymous" }, // Provide a default value
})

export const AuthProvider = AuthContext.Provider

export const useAuth = () => useContext(AuthContext)

