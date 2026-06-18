import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glass" | "elevated";
  hover?: boolean;
}

export function PremiumCard({ className, variant = "default", hover = false, children, ...props }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card text-card-foreground transition-all duration-300",
        variant === "default" && "border border-border/50 shadow-sm",
        variant === "gradient" && "bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50",
        variant === "glass" && "bg-background/80 backdrop-blur-xl border border-border/50",
        variant === "elevated" && "shadow-xl border border-border/50",
        hover && "hover:shadow-lg hover:border-border hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: boolean;
}

export function FeatureCard({ icon, title, description, gradient = false }: FeatureCardProps) {
  return (
    <PremiumCard variant={gradient ? "gradient" : "default"} hover className="p-8">
      <div className={cn(
        "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl",
        gradient ? "bg-primary/10" : "bg-primary/5"
      )}>
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="mb-3 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </PremiumCard>
  );
}

interface StatCardProps {
  value: string | number;
  label: string;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}

export function StatCard({ value, label, change, positive = true, icon }: StatCardProps) {
  return (
    <PremiumCard variant="glass" className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <p className="text-4xl font-bold tracking-tight mb-2">{value}</p>
          {change && (
            <p className={cn(
              "text-sm font-medium",
              positive ? "text-green-600" : "text-red-600"
            )}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground/50">
            {icon}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export function PricingCard({ name, price, description, features, popular = false, cta }: PricingCardProps) {
  return (
    <PremiumCard variant={popular ? "gradient" : "default"} className={cn(
      "relative p-8",
      popular && "border-primary/50 shadow-lg"
    )}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
            Popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">{name}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            </div>
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <button className={cn(
        "w-full rounded-xl py-3 font-medium transition-colors",
        popular
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted text-foreground hover:bg-muted/80"
      )}>
        {cta}
      </button>
    </PremiumCard>
  );
}
