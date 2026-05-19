import { AlertTriangle, CheckCircle2, Inbox, LoaderCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StatePanelProps {
  type: "loading" | "empty" | "error" | "success" | "offline";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const iconMap = {
  loading: LoaderCircle,
  empty: Inbox,
  error: AlertTriangle,
  success: CheckCircle2,
  offline: WifiOff
} as const;

const toneMap = {
  loading: "text-[hsl(var(--info-ink))] bg-info/10",
  empty: "text-muted-foreground bg-muted",
  error: "text-[hsl(var(--danger-ink))] bg-danger/10",
  success: "text-[hsl(var(--success-ink))] bg-success/10",
  offline: "text-[hsl(var(--warning-ink))] bg-warning/10"
} as const;

export function StatePanel({ type, title, description, actionLabel, onAction }: StatePanelProps) {
  const Icon = iconMap[type];

  return (
    <Card className="border-dashed border-border bg-card/75">
      <CardContent className="flex flex-col items-start gap-4 p-5 sm:p-6">
        <div className={`rounded-2xl p-3 ${toneMap[type]}`}>
          <Icon className={`h-5 w-5 ${type === "loading" ? "animate-spin" : ""}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}
