import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "muted" | "teal" | "amber" | "slate";
}

const toneStyles = {
  primary: "from-primary/18 via-primary/10 to-transparent text-primary",
  teal: "from-primary/18 via-primary/10 to-transparent text-primary",
  secondary: "from-secondary/22 via-secondary/10 to-transparent text-secondary-foreground",
  amber: "from-secondary/22 via-secondary/10 to-transparent text-secondary-foreground",
  muted: "from-muted/85 via-accent/55 to-transparent text-foreground",
  slate: "from-muted/85 via-accent/55 to-transparent text-foreground"
} as const;

export function MetricCard({ title, value, trend, icon: Icon, tone = "primary" }: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card/95">
      <CardContent className="relative p-5">
        <div className={cn("absolute inset-x-0 top-0 h-20 bg-gradient-to-br", toneStyles[tone])} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--success-ink))]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {trend}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/90 p-3 shadow-sm">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
