import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Chart } from "./chart"

const chartData = [
  { name: "Jan", amount: 2400 },
  { name: "Feb", amount: 1800 },
  { name: "Mar", amount: 2800 },
  { name: "Apr", amount: 2200 },
  { name: "May", amount: 3000 },
  { name: "Jun", amount: 2500 },
]

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Real-Time Personal Finance Tracker
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Take control of your finances with real-time insights, AI-powered analysis, and interactive
                visualizations.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup" passHref>
                <Button size="lg" className="w-full min-[400px]:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="#features" passHref>
                <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-muted">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-6">
                <div className="w-full h-full max-w-md">
                  <h2 className="text-2xl font-bold mb-4 text-center">Visualize Your Spending</h2>
                  <p className="text-center mb-6">
                    Interactive charts and AI-powered insights help you understand where your money goes.
                  </p>
                  <Chart data={chartData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}