import type React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { pricingPlans } from "@/components/landing/pricing-section"

// Import icons as simple function components to avoid hydration issues
function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
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
      {...props}
    >
      <path d="m12 19-7-7 7-7"></path>
      <path d="M19 12H5"></path>
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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
      className="h-5 w-5 text-green-500 mr-2"
      {...props}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

export function generateStaticParams() {
  return pricingPlans.map((plan) => ({
    plan: plan.id,
  }))
}

export default function PricingPlanPage({ params }: { params: { plan: string } }) {
  const plan = pricingPlans.find((p) => p.id === params.plan)

  if (!plan) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-primary">Blink-Bank</span>
          </Link>
          <Link
            href="/#pricing"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon />
            <span>Back to Pricing</span>
          </Link>
        </div>
      </header>

      <main className="container py-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{plan.title} Plan</h1>
            <p className="mt-4 text-lg text-muted-foreground">{plan.description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className={plan.featured ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>Everything included in the {plan.title} plan</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  ${plan.price}
                  <span className="ml-1 text-xl font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Benefits</CardTitle>
                  <CardDescription>Why choose the {plan.title} plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getPlanBenefits(plan.id).map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                          <CheckIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFAQs(plan.id).map((faq, index) => (
                      <div key={index}>
                        <h3 className="font-medium">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Compare with Other Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b p-4 text-left">Feature</th>
                    {pricingPlans.map((p) => (
                      <th key={p.id} className={`border-b p-4 text-center ${p.id === plan.id ? "bg-primary/10" : ""}`}>
                        {p.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getComparisonFeatures().map((feature, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                      <td className="border-b p-4">{feature.name}</td>
                      {pricingPlans.map((p) => (
                        <td
                          key={p.id}
                          className={`border-b p-4 text-center ${p.id === plan.id ? "bg-primary/10" : ""}`}
                        >
                          {feature.availability[p.id] ? (
                            <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <Link href="/signup">
              <Button size="lg">Get Started with {plan.title}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function getPlanBenefits(planId: string) {
  const benefits = {
    free: [
      {
        title: "Perfect for Beginners",
        description:
          "Ideal for individuals who are just starting their financial journey and want to track basic expenses.",
      },
      {
        title: "No Cost Commitment",
        description: "Get started with financial tracking without any financial investment.",
      },
      {
        title: "Basic Insights",
        description: "Understand your spending patterns with simple monthly reports.",
      },
    ],
    premium: [
      {
        title: "Advanced Financial Insights",
        description: "Get detailed analytics and AI-powered recommendations to optimize your spending.",
      },
      {
        title: "Unlimited History",
        description: "Access your complete financial history without any time limitations.",
      },
      {
        title: "Real-time Alerts",
        description: "Stay on top of your finances with instant notifications about unusual spending.",
      },
      {
        title: "Comprehensive Budgeting",
        description: "Create and track detailed budgets across multiple categories.",
      },
    ],
    family: [
      {
        title: "Family Financial Management",
        description: "Manage finances for your entire family with multiple user accounts.",
      },
      {
        title: "Shared Goals",
        description: "Set and track financial goals together with your family members.",
      },
      {
        title: "Bill Management",
        description: "Never miss a payment with bill reminders and tracking for the whole family.",
      },
      {
        title: "Premium Support",
        description: "Get priority 24/7 support for any questions or issues.",
      },
    ],
  }

  return benefits[planId as keyof typeof benefits] || []
}

function getFAQs(planId: string) {
  const faqs = {
    free: [
      {
        question: "Is the Free plan really free?",
        answer: "Yes, the Free plan is completely free to use with no hidden costs or credit card required.",
      },
      {
        question: "Can I upgrade to a paid plan later?",
        answer: "You can upgrade to Premium or Family plan at any time without losing your data.",
      },
      {
        question: "What are the limitations of the Free plan?",
        answer: "The Free plan allows you to connect up to 2 accounts and provides 30-day transaction history.",
      },
    ],
    premium: [
      {
        question: "How does the Premium plan differ from Free?",
        answer:
          "Premium offers unlimited account connections, advanced AI insights, real-time alerts, and unlimited transaction history.",
      },
      {
        question: "Can I cancel my Premium subscription?",
        answer:
          "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
      },
      {
        question: "Is there a discount for annual billing?",
        answer: "Yes, we offer a 20% discount when you choose annual billing instead of monthly.",
      },
    ],
    family: [
      {
        question: "How many family members can I add?",
        answer:
          "The Family plan allows up to 5 user accounts, perfect for managing finances with your spouse and children.",
      },
      {
        question: "Can family members see each other's transactions?",
        answer:
          "By default, all family members can see shared accounts. You can also set privacy settings for individual accounts.",
      },
      {
        question: "Can we set shared financial goals?",
        answer:
          "Yes, the Family plan allows you to create and track shared goals like saving for a vacation or a new home.",
      },
    ],
  }

  return faqs[planId as keyof typeof faqs] || []
}

function getComparisonFeatures() {
  return [
    {
      name: "Number of connected accounts",
      availability: { free: "2", premium: "Unlimited", family: "Unlimited" },
    },
    {
      name: "Transaction history",
      availability: { free: "30 days", premium: "Unlimited", family: "Unlimited" },
    },
    {
      name: "AI-powered categorization",
      availability: { free: false, premium: true, family: true },
    },
    {
      name: "Real-time alerts",
      availability: { free: false, premium: true, family: true },
    },
    {
      name: "Budget creation",
      availability: { free: "Basic", premium: "Advanced", family: "Advanced" },
    },
    {
      name: "Multiple user accounts",
      availability: { free: false, premium: false, family: "Up to 5" },
    },
    {
      name: "Bill reminders",
      availability: { free: false, premium: true, family: true },
    },
    {
      name: "Priority support",
      availability: { free: false, premium: "Email", family: "24/7" },
    },
  ]
}

