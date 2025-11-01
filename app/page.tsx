"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Clock, BarChart3, Users, Shield, Zap, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">PayFlow</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-xs sm:text-sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden px-4 py-12 sm:py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 sm:mb-6 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 sm:px-4 py-1.5 sm:py-2">
            <p className="text-xs sm:text-sm font-medium text-primary">Modern Payroll Management</p>
          </div>
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Payroll simplified for <span className="text-primary">modern teams</span>
          </h1>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground px-2">
            Streamline your payroll process with automated calculations, compliance tracking, and real-time insights.
            Built for businesses that demand accuracy and efficiency.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                View Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-12 sm:py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 sm:mb-12 md:mb-16 text-center">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Everything you need to manage payroll
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Powerful features designed to save time and reduce errors</p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border border-border p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">Automated Calculations</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Eliminate manual errors with automatic tax calculations and compliance updates.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-border p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">Time Tracking</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Integrated time management with Daily Time Records and attendance tracking.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-border p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">Real-Time Analytics</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get instant insights into payroll trends, costs, and departmental breakdowns.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-border p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">Compliance Built-in</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Stay compliant with automatic updates to tax laws and regulatory changes.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="border border-border p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">Team Collaboration</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Streamline approvals and communication across your HR and finance teams.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="border border-border p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">Scalable Solution</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Grow from 5 to 5000+ employees without changing systems or complexity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-12 sm:py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <p className="mb-2 text-2xl sm:text-3xl font-bold text-primary">98%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-2xl sm:text-3xl font-bold text-primary">5M+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Payrolls Processed</p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-2xl sm:text-3xl font-bold text-primary">24/7</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Support Available</p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-2xl sm:text-3xl font-bold text-primary">50ms</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Average Response</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-12 sm:py-20 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Ready to transform your payroll?</h2>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-muted-foreground">
            Join hundreds of companies that trust PayFlow for their payroll needs.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/50 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="font-bold text-foreground">PayFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">Modern payroll for modern teams.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>2025 PayFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
