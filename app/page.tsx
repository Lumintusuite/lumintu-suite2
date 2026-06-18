import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/design/cards";
import { PremiumCard, FeatureCard, StatCard, PricingCard } from "@/components/design/premium-cards";
import { H1, H2, H3, Lead, Body } from "@/components/design/typography";
import { 
  Check, Zap, Shield, TrendingUp, Star, ArrowRight, 
  Package, CreditCard, BarChart3, Mail, Users, 
  Upload, ShoppingCart, Key, ArrowUpRight, Play,
  ChevronRight, CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80" />
              <span className="text-xl font-bold tracking-tight">Lumintu Suite</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="shadow-lg shadow-primary/25" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-border/50 bg-background/50 backdrop-blur px-4 py-2 text-sm">
                <span className="text-primary font-medium">New</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">Build. Automate. Scale.</span>
              </div>
              <H1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Build Your Digital Business
              </H1>
              <Lead className="text-xl md:text-2xl text-muted-foreground max-w-xl">
                Sell digital products, manage licenses, grow with affiliates, and automate your business from one powerful platform.
              </Lead>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-base shadow-xl shadow-primary/25" asChild>
                  <Link href="/register">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base" asChild>
                  <Link href="#features">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>
            
            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-50" />
              <PremiumCard variant="glass" className="relative p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-muted-foreground">Dashboard</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                    <div className="text-lg font-bold">$12,450</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Orders</div>
                    <div className="text-lg font-bold">234</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Licenses</div>
                    <div className="text-lg font-bold">892</div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2">Recent Sales</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Product A</span>
                      <span className="font-medium">$49.00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Product B</span>
                      <span className="font-medium">$99.00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Product C</span>
                      <span className="font-medium">$149.00</span>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="10K+" label="Products Sold" change="+25%" positive icon={<Package className="h-5 w-5" />} />
            <StatCard value="5K+" label="Active Members" change="+18%" positive icon={<Users className="h-5 w-5" />} />
            <StatCard value="50K+" label="Licenses Generated" change="+32%" positive icon={<Key className="h-5 w-5" />} />
            <StatCard value="$2M+" label="Affiliate Sales" change="+45%" positive icon={<TrendingUp className="h-5 w-5" />} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-primary/5 px-4 py-2 text-sm mb-6">
              <span className="text-primary font-medium">Features</span>
            </div>
            <H2 className="mb-4">Everything You Need to Scale</H2>
            <Lead className="text-lg">Powerful features to help you sell, manage, and grow your digital business.</Lead>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap className="h-6 w-6" />}
              title="Instant Delivery"
              description="Automatically deliver digital products and licenses to customers immediately after purchase."
              gradient
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="License Management"
              description="Generate, track, and manage software licenses with activation limits and expiration dates."
              gradient
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Affiliate System"
              description="Grow your business with a built-in affiliate program and commission tracking."
              gradient
            />
            <FeatureCard 
              icon={<CreditCard className="h-6 w-6" />}
              title="Midtrans Payments"
              description="Integrated with Midtrans for secure and reliable payment processing in Indonesia."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analytics Dashboard"
              description="Track sales, revenue, and customer behavior with detailed dashboards and reports."
            />
            <FeatureCard 
              icon={<Mail className="h-6 w-6" />}
              title="Email Automation"
              description="Automate email notifications for purchases, licenses, and affiliate updates."
            />
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-primary/5 px-4 py-2 text-sm mb-6">
              <span className="text-primary font-medium">Dashboard</span>
            </div>
            <H2 className="mb-4">Powerful Dashboards</H2>
            <Lead className="text-lg">Admin and member dashboards designed for productivity.</Lead>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <PremiumCard variant="glass" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <H3 className="text-lg">Admin Dashboard</H3>
                  <p className="text-sm text-muted-foreground">Manage your business</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Revenue charts and analytics</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Order management</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Top products overview</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Recent sales activity</span>
                </li>
              </ul>
            </PremiumCard>
            <PremiumCard variant="glass" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <H3 className="text-lg">Member Dashboard</H3>
                  <p className="text-sm text-muted-foreground">Manage your purchases</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>View all licenses</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Download products</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Track affiliate earnings</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>View order history</span>
                </li>
              </ul>
            </PremiumCard>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-primary/5 px-4 py-2 text-sm mb-6">
              <span className="text-primary font-medium">How It Works</span>
            </div>
            <H2 className="mb-4">Get Started in 4 Steps</H2>
            <Lead className="text-lg">Launch your digital business in minutes, not days.</Lead>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Upload, title: "Upload Product", desc: "Add your digital products with pricing and descriptions" },
              { icon: ShoppingCart, title: "Receive Orders", desc: "Customers purchase through your storefront" },
              { icon: Key, title: "Generate License", desc: "Automatic license generation and delivery" },
              { icon: TrendingUp, title: "Grow with Affiliates", desc: "Expand reach with affiliate marketing" }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                  <H3 className="mb-2">{step.title}</H3>
                  <Body className="text-muted-foreground text-sm">{step.desc}</Body>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-primary/5 px-4 py-2 text-sm mb-6">
              <span className="text-primary font-medium">Testimonials</span>
            </div>
            <H2 className="mb-4">Loved by Digital Businesses</H2>
            <Lead className="text-lg">See what our customers have to say about Lumintu Suite.</Lead>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Johnson", role: "CEO, TechStart", quote: "Lumintu Suite has transformed how we sell our software. The affiliate system alone has doubled our revenue." },
              { name: "Michael Chen", role: "Founder, SoftDev", quote: "The license management system is incredible. We've saved countless hours on manual license generation." },
              { name: "Emily Davis", role: "Owner, DigitalGoods", quote: "Clean, professional, and powerful. Exactly what we needed for our digital product business." }
            ].map((testimonial, i) => (
              <PremiumCard key={i} variant="glass" className="p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Body className="mb-6">{testimonial.quote}</Body>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-primary/5 px-4 py-2 text-sm mb-6">
              <span className="text-primary font-medium">Pricing</span>
            </div>
            <H2 className="mb-4">Simple, Transparent Pricing</H2>
            <Lead className="text-lg">Choose the plan that fits your business needs.</Lead>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$29"
              description="Perfect for getting started"
              features={[
                "Up to 10 products",
                "100 licenses/month",
                "Basic analytics",
                "Email support"
              ]}
              cta="Get Started"
            />
            <PricingCard
              name="Pro"
              price="$79"
              description="For growing businesses"
              features={[
                "Unlimited products",
                "1,000 licenses/month",
                "Advanced analytics",
                "Priority support",
                "Affiliate system"
              ]}
              popular
              cta="Get Started"
            />
            <PricingCard
              name="Business"
              price="$199"
              description="For large scale operations"
              features={[
                "Unlimited everything",
                "10,000 licenses/month",
                "Custom branding",
                "Dedicated support",
                "API access"
              ]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full border border-border/50 bg-primary/5 px-4 py-2 text-sm mb-6">
                <span className="text-primary font-medium">FAQ</span>
              </div>
              <H2 className="mb-4">Frequently Asked Questions</H2>
              <Lead className="text-lg">Everything you need to know about Lumintu Suite.</Lead>
            </div>
            <div className="space-y-4">
              {[
                { q: "What is Lumintu Suite?", a: "Lumintu Suite is an all-in-one platform for selling digital products, managing licenses, running affiliate programs, and automating your digital business." },
                { q: "How does the affiliate system work?", a: "Users can register as affiliates and receive unique referral links. When someone makes a purchase through their link, they earn a commission on the sale." },
                { q: "Can I customize the commission rates?", a: "Yes, admins can set custom commission rates for each affiliate, with a default rate of 10% for all new affiliates." },
                { q: "Is my data secure?", a: "Yes, we use Supabase for secure data storage with row-level security policies to ensure your data is protected." }
              ].map((faq, i) => (
                <PremiumCard key={i} variant="glass" className="p-6">
                  <H3 className="mb-3">{faq.q}</H3>
                  <Body className="text-muted-foreground">{faq.a}</Body>
                </PremiumCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PremiumCard variant="gradient" className="max-w-4xl mx-auto p-12 text-center">
            <H2 className="mb-4 text-4xl md:text-5xl">Ready to Scale Your Digital Business?</H2>
            <Lead className="mb-8 text-xl">Join thousands of digital businesses using Lumintu Suite to grow their revenue.</Lead>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base shadow-xl shadow-primary/25" asChild>
                <Link href="/register">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link href="#features">
                  Learn More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80" />
                <span className="text-xl font-bold tracking-tight">Lumintu Suite</span>
              </div>
              <Body className="text-muted-foreground">Build. Automate. Scale.</Body>
            </div>
            <div>
              <H3 className="mb-4">Product</H3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <H3 className="mb-4">Company</H3>
              <ul className="space-y-2">
                <li><Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <H3 className="mb-4">Legal</H3>
              <ul className="space-y-2">
                <li><Link href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border/50 pt-8 text-center">
            <Body className="text-muted-foreground">© {new Date().getFullYear()} Lumintu Suite. All rights reserved.</Body>
          </div>
        </div>
      </footer>
    </div>
  );
}
