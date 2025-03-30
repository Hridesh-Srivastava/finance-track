"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Import icons as simple function components to avoid hydration issues
function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2 h-4 w-4"
    >
      <path d="m12 19-7-7 7-7"></path>
      <path d="M19 12H5"></path>
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-green-500"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  )
}

function AlertCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  )
}

function NewspaperIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
      <path d="M18 14h-8"></path>
      <path d="M15 18h-5"></path>
      <path d="M10 6h8v4h-8V6Z"></path>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary"
    >
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  )
}

export default function NewsletterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [frequency, setFrequency] = useState("weekly")
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInterestChange = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest)
      } else {
        return [...prev, interest]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email,
        name,
        frequency,
        interests,
        createdAt: serverTimestamp(),
      })

      setSuccess(true)
      setEmail("")
      setName("")
      setFrequency("weekly")
      setInterests([])
    } catch (err: any) {
      console.error("Error subscribing to newsletter:", err)
      setError(err.message || "Failed to subscribe. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-primary">Blink-Bank</span>
          </Link>
          <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container py-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <NewspaperIcon className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Blink-Bank Newsletter</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Stay updated with the latest financial insights, tips, and exclusive offers.
            </p>
          </div>

          <Tabs defaultValue="subscribe" className="mx-auto max-w-2xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="subscribe" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscribe to Our Newsletter</CardTitle>
                  <CardDescription>Get financial insights delivered to your inbox</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircleIcon />
                        <AlertDescription>
                          Thank you for subscribing! You'll start receiving our newsletter soon.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (Optional)</Label>
                      <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Interests</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="investing"
                            checked={interests.includes("investing")}
                            onCheckedChange={() => handleInterestChange("investing")}
                          />
                          <Label htmlFor="investing" className="text-sm font-normal">
                            Investing
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="budgeting"
                            checked={interests.includes("budgeting")}
                            onCheckedChange={() => handleInterestChange("budgeting")}
                          />
                          <Label htmlFor="budgeting" className="text-sm font-normal">
                            Budgeting
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saving"
                            checked={interests.includes("saving")}
                            onCheckedChange={() => handleInterestChange("saving")}
                          />
                          <Label htmlFor="saving" className="text-sm font-normal">
                            Saving
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="credit"
                            checked={interests.includes("credit")}
                            onCheckedChange={() => handleInterestChange("credit")}
                          />
                          <Label htmlFor="credit" className="text-sm font-normal">
                            Credit
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Benefits</CardTitle>
                  <CardDescription>Why you should subscribe to our newsletter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <BellIcon />
                      </div>
                      <div>
                        <h3 className="font-medium">Latest Updates</h3>
                        <p className="text-sm text-muted-foreground">
                          Stay informed about the latest financial trends, market updates, and economic news.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <MailIcon />
                      </div>
                      <div>
                        <h3 className="font-medium">Exclusive Content</h3>
                        <p className="text-sm text-muted-foreground">
                          Get access to exclusive financial tips, guides, and resources not available elsewhere.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <CheckCircleIcon />
                      </div>
                      <div>
                        <h3 className="font-medium">Personalized Insights</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive personalized financial insights and recommendations based on your interests.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <NewspaperIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Special Offers</h3>
                        <p className="text-sm text-muted-foreground">
                          Be the first to know about special offers, promotions, and new features.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                {/* <CardFooter>
                  <Button
                    onClick={() => document.querySelector('[data-value="subscribe"]')?.click()}
                    className="w-full"
                  >
                    Subscribe Now
                  </Button>
                </CardFooter> */}
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Past Newsletter Highlights</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">5 Tips for Better Budgeting</CardTitle>
                  <CardDescription>March 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Learn how to create a budget that actually works and helps you save more money.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investing for Beginners</CardTitle>
                  <CardDescription>February 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive guide to start investing with as little as $100.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Fund Essentials</CardTitle>
                  <CardDescription>January 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Why you need an emergency fund and how to build one quickly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

