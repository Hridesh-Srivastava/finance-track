import { ArrowRight, CheckCircle, Upload, PieChart, Zap, Shield } from "lucide-react"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Simple steps to financial clarity</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Our platform makes it easy to track, analyze, and optimize your finances in just a few steps.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <ArrowRight className="mt-8 h-6 w-6 text-muted-foreground hidden md:block" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-10">Why Choose Our Platform?</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 rounded-lg border p-6">
                <div className="mt-1 text-primary">{feature.icon}</div>
                <div>
                  <h4 className="font-bold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: <Upload className="h-8 w-8 text-primary" />,
    title: "Connect Your Accounts",
    description:
      "Securely link your bank accounts, credit cards, and other financial accounts to get a complete picture.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-primary" />,
    title: "Analyze Your Finances",
    description:
      "Our AI automatically categorizes transactions and provides visual insights into your spending habits.",
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Optimize Your Money",
    description: "Get personalized recommendations to save more, reduce debt, and achieve your financial goals.",
  },
]

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Bank-Level Security",
    description: "Your data is protected with 256-bit encryption and we never store your banking credentials.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-Time Updates",
    description: "See your financial data update in real-time as new transactions occur.",
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: "Automated Categorization",
    description: "Our AI automatically categorizes your transactions so you don't have to.",
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    title: "Detailed Analytics",
    description: "Get insights into your spending patterns with interactive charts and reports.",
  },
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Easy Setup",
    description: "Connect your accounts in minutes and start tracking your finances right away.",
  },
  {
    icon: <ArrowRight className="h-6 w-6" />,
    title: "Goal Tracking",
    description: "Set financial goals and track your progress over time.",
  },
]

