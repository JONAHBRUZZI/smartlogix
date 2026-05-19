import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Badge variant="info" className="border-transparent bg-primary/10 text-primary">
          {eyebrow}
        </Badge>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-balance sm:mt-3 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0 self-start md:self-auto">{action}</div> : null}
    </div>
  );
}