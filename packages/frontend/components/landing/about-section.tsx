import { Users, Award, TrendingUp, Heart } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">About Us</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Our mission is to simplify personal finance
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              We're a team of finance experts and technology enthusiasts dedicated to helping people take control of
              their financial lives.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
            <p className="text-muted-foreground mb-6">
              Finance Tracker was founded in 2023 with a simple mission: to make personal finance management accessible
              to everyone. We noticed that while there were many financial tools available, most were either too complex
              or didn't provide actionable insights.
            </p>
            <p className="text-muted-foreground">
              Our team of finance experts and developers came together to create a solution that combines powerful
              analytics with an intuitive interface, making it easy for anyone to understand and improve their financial
              health.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg border">
                <div className="mb-2 text-primary">{value.icon}</div>
                <h4 className="font-bold">{value.title}</h4>
                <p className="text-sm text-muted-foreground mt-2">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-10">Meet Our Team</h3>
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
            {team.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted mb-4 overflow-hidden">
                  <img
                    src={`/placeholder.svg?height=96&width=96&text=${member.name.charAt(0)}`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const values = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Customer First",
    description: "We prioritize our users' needs in everything we build.",
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Excellence",
    description: "We strive for excellence in our product and service.",
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Innovation",
    description: "We continuously innovate to provide the best financial tools.",
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Integrity",
    description: "We handle your financial data with the utmost integrity and security.",
  },
]

const team = [
  {
    name: "Alex Johnson",
    role: "CEO & Founder",
  },
  {
    name: "Sarah Chen",
    role: "CTO",
  },
  {
    name: "Michael Rodriguez",
    role: "Head of Finance",
  },
  {
    name: "Emily Williams",
    role: "Lead Designer",
  },
]

