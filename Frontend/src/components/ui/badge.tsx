import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  neutral: "border border-border bg-muted text-muted-foreground",
  success: "border border-success/20 bg-success/10 text-[hsl(var(--success-ink))]",
  warning: "border border-warning/25 bg-warning/10 text-[hsl(var(--warning-ink))]",
  danger: "border border-danger/20 bg-danger/10 text-[hsl(var(--danger-ink))]",
  info: "border border-info/20 bg-info/10 text-[hsl(var(--info-ink))]"
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}