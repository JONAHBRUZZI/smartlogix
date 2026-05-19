import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { TimelineEvent } from "@/types/domain";

const variantByState = {
  healthy: "success",
  warning: "warning",
  critical: "danger",
  offline: "warning",
  done: "info"
} as const;

export function TimelineTracker({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event, index) => (
        <li key={event.id} className="relative pl-8">
          <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-primary" />
          {index !== events.length - 1 ? <span className="absolute left-[6px] top-5 h-[calc(100%+10px)] w-px bg-border" /> : null}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">{event.title}</p>
              <Badge variant={variantByState[event.state]}>{formatDate(event.timestamp)}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{event.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
