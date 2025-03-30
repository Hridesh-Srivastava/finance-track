import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingSection() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Pricing</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Simple, transparent pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Choose the plan that's right for you and start taking control of your finances today.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card key={plan.title} className={plan.featured ? "border-primary shadow-lg" : ""}>
              {plan.featured && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  ${plan.price}
                  <span className="ml-1 text-xl font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${plan.featured ? "" : "variant-outline"}`}>Get Started</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  )
}

const pricingPlans = [
  {
    title: "Free",
    description: "Perfect for individuals just starting out",
    price: "0",
    featured: false,
    features: [
      "Connect up to 2 accounts",
      "Basic transaction categorization",
      "Monthly spending reports",
      "30-day transaction history",
      "Email support",
    ],
  },
  {
    title: "Premium",
    description: "For individuals who want more insights",
    price: "9.99",
    featured: true,
    features: [
      "Connect unlimited accounts",
      "Advanced AI categorization",
      "Real-time spending alerts",
      "Unlimited transaction history",
      "Budget creation and tracking",
      "Priority email support",
    ],
  },
  {
    title: "Family",
    description: "Share finances with your family",
    price: "19.99",
    featured: false,
    features: [
      "All Premium features",
      "Up to 5 user accounts",
      "Family budget planning",
      "Shared financial goals",
      "Bill reminders and tracking",
      "24/7 priority support",
    ],
  },
]

