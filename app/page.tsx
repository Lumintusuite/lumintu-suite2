import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/design/cards";
import { H1, H2, H3, Lead, Body } from "@/components/design/typography";
import { Check, Zap, Shield, TrendingUp, Star, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold">Lumintu Suite</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Benefits
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Testimonials
              </Link>
              <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm">
            <span className="text-primary">New</span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-muted-foreground">Build. Automate. Scale.</span>
          </div>
          <H1 className="mb-6">Build Your Digital Business</H1>
          <Lead className="mb-8 max-w-2xl mx-auto">
            Sell digital products, manage licenses, grow with affiliates, and automate your business from one platform.
          </Lead>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <H2 className="mb-4">Everything You Need</H2>
            <Lead>Powerful features to help you sell, manage, and grow your digital business.</Lead>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card variant="bordered" className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <H3 className="mb-2">Instant Delivery</H3>
              <Body className="text-muted-foreground">
                Automatically deliver digital products and licenses to customers immediately after purchase.
              </Body>
            </Card>
            <Card variant="bordered" className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <H3 className="mb-2">License Management</H3>
              <Body className="text-muted-foreground">
                Generate, track, and manage software licenses with activation limits and expiration dates.
              </Body>
            </Card>
            <Card variant="bordered" className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <H3 className="mb-2">Affiliate System</H3>
              <Body className="text-muted-foreground">
                Grow your business with a built-in affiliate program and commission tracking.
              </Body>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <H2 className="mb-4">Why Choose Lumintu Suite?</H2>
            <Lead>Designed for modern digital businesses that need to scale.</Lead>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <H3 className="mb-1">Secure Payments</H3>
                  <Body className="text-muted-foreground">
                    Integrated with Midtrans for secure and reliable payment processing.
                  </Body>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <H3 className="mb-1">Real-time Analytics</H3>
                  <Body className="text-muted-foreground">
                    Track sales, revenue, and customer behavior with detailed dashboards.
                  </Body>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <H3 className="mb-1">Automated Workflows</H3>
                  <Body className="text-muted-foreground">
                    Automate license generation, email notifications, and more.
                  </Body>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <H3 className="mb-1">Role-based Access</H3>
                  <Body className="text-muted-foreground">
                    Separate admin and member dashboards with appropriate permissions.
                  </Body>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <H3 className="mb-1">Email Notifications</H3>
                  <Body className="text-muted-foreground">
                    Keep customers informed with automated email notifications.
                  </Body>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <H3 className="mb-1">Responsive Design</H3>
                  <Body className="text-muted-foreground">
                    Beautiful, responsive UI that works on all devices.
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <H2 className="mb-4">Loved by Digital Businesses</H2>
            <Lead>See what our customers have to say about Lumintu Suite.</Lead>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card variant="bordered" className="p-6">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <Body className="mb-4">
                "Lumintu Suite has transformed how we sell our software. The affiliate system alone has doubled our revenue."
              </Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">CEO, TechStart</p>
                </div>
              </div>
            </Card>
            <Card variant="bordered" className="p-6">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <Body className="mb-4">
                "The license management system is incredible. We've saved countless hours on manual license generation."
              </Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <p className="font-medium">Michael Chen</p>
                  <p className="text-sm text-muted-foreground">Founder, SoftDev</p>
                </div>
              </div>
            </Card>
            <Card variant="bordered" className="p-6">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <Body className="mb-4">
                "Clean, professional, and powerful. Exactly what we needed for our digital product business."
              </Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <p className="font-medium">Emily Davis</p>
                  <p className="text-sm text-muted-foreground">Owner, DigitalGoods</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <H2 className="mb-4">Frequently Asked Questions</H2>
              <Lead>Everything you need to know about Lumintu Suite.</Lead>
            </div>
            <div className="space-y-4">
              <Card variant="bordered" className="p-6">
                <H3 className="mb-2">What is Lumintu Suite?</H3>
                <Body className="text-muted-foreground">
                  Lumintu Suite is an all-in-one platform for selling digital products, managing licenses, running affiliate programs, and automating your digital business.
                </Body>
              </Card>
              <Card variant="bordered" className="p-6">
                <H3 className="mb-2">How does the affiliate system work?</H3>
                <Body className="text-muted-foreground">
                  Users can register as affiliates and receive unique referral links. When someone makes a purchase through their link, they earn a commission on the sale.
                </Body>
              </Card>
              <Card variant="bordered" className="p-6">
                <H3 className="mb-2">Can I customize the commission rates?</H3>
                <Body className="text-muted-foreground">
                  Yes, admins can set custom commission rates for each affiliate, with a default rate of 10% for all new affiliates.
                </Body>
              </Card>
              <Card variant="bordered" className="p-6">
                <H3 className="mb-2">Is my data secure?</H3>
                <Body className="text-muted-foreground">
                  Yes, we use Supabase for secure data storage with row-level security policies to ensure your data is protected.
                </Body>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <H2 className="mb-4">Ready to Get Started?</H2>
            <Lead className="mb-8">
              Join thousands of digital businesses using Lumintu Suite to grow their revenue.
            </Lead>
            <Button size="lg" className="text-base" asChild>
              <Link href="/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <span className="text-xl font-bold">Lumintu Suite</span>
              </div>
              <Body className="text-muted-foreground">
                Build. Automate. Scale.
              </Body>
            </div>
            <div>
              <H3 className="mb-4">Product</H3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#changelog" className="text-sm text-muted-foreground hover:text-foreground">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <H3 className="mb-4">Company</H3>
              <ul className="space-y-2">
                <li>
                  <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#blog" className="text-sm text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#careers" className="text-sm text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <H3 className="mb-4">Legal</H3>
              <ul className="space-y-2">
                <li>
                  <Link href="#privacy" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#security" className="text-sm text-muted-foreground hover:text-foreground">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center">
            <Body className="text-muted-foreground">
              © {new Date().getFullYear()} Lumintu Suite. All rights reserved.
            </Body>
          </div>
        </div>
      </footer>
    </div>
  );
}
