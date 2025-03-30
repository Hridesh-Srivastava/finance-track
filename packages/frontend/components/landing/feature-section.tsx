import { BarChart3, BrainCircuit, Clock, CreditCard, LineChart, MessageSquare } from "lucide-react"

export function FeatureSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Everything you need to manage your finances
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Our platform combines real-time data processing with AI-powered insights to give you complete control over
              your financial life.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center space-y-2 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-2">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: <CreditCard className="h-6 w-6 text-primary" />,
    title: "Transaction Tracking",
    description: "Automatically categorize and track all your financial transactions in real-time.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: "Interactive Charts",
    description: "Visualize your spending patterns with interactive and customizable charts.",
  },
  {
    icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    title: "AI-Powered Insights",
    description: "Get personalized financial insights and recommendations powered by AI.",
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: "Natural Language Queries",
    description: "Ask questions about your finances in plain English and get instant answers.",
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Real-Time Updates",
    description: "See your financial data update in real-time as new transactions occur.",
  },
  {
    icon: <LineChart className="h-6 w-6 text-primary" />,
    title: "Trend Analysis",
    description: "Identify spending trends and patterns to optimize your financial decisions.",
  },
]

