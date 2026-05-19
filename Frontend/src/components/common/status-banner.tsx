import { CloudOff, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatusBanner({ online }: { online: boolean }) {
  return (
    <Card className={cn(online ? "border-success/25 bg-success/10" : "border-warning/30 bg-warning/10")}>
      <CardContent className="flex items-center gap-3 p-3 sm:items-start sm:p-4">
        <div className={cn("rounded-2xl p-2 sm:p-2.5", online ? "bg-success/15 text-[hsl(var(--success-ink))]" : "bg-warning/15 text-[hsl(var(--warning-ink))]")}>
          {online ? <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" /> : <CloudOff className="h-4 w-4 sm:h-5 sm:w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{online ? "Operacion estable" : "Modo degradado PWA"}</p>
            <Badge variant={online ? "success" : "warning"}>{online ? "Online" : "Conexion parcial"}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:hidden">
            {online ? "Microservicios sincronizados." : "Puedes seguir trabajando con datos locales."}
          </p>
          <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
            {online
              ? "Las consultas en tiempo real y los microservicios estan sincronizados."
              : "Puedes seguir revisando datos cacheados y acciones locales mientras vuelve la conectividad."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}