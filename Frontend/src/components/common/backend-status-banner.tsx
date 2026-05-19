import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ApiSource } from "@/hooks/use-api-query";

interface BackendStatusBannerProps {
  source: ApiSource;
  error: string | null;
  entity: string;
}

export function BackendStatusBanner({ source, error, entity }: BackendStatusBannerProps) {
  const hasForbiddenError = Boolean(error && error.includes("(403)"));
  const hasUnauthorizedError = Boolean(error && error.includes("(401)"));

  if (source === "live") {
    return (
      <Card className="border-success/25 bg-success/10">
        <CardContent className="flex items-center justify-between gap-3 p-3 text-xs text-foreground sm:p-4 sm:text-sm">
          <p className="leading-snug">{entity} conectado al backend local de microservicios.</p>
          <Badge variant="success">Live</Badge>
        </CardContent>
      </Card>
    );
  }

  if (hasForbiddenError) {
    return (
      <Card className="border-danger/25 bg-danger/10">
        <CardContent className="flex flex-col gap-2 p-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:p-4 sm:text-sm">
          <p className="leading-snug">{entity} sin permisos para el recurso solicitado. Verifica rol del usuario en el backend.</p>
          <Badge variant="danger">403 Forbidden</Badge>
        </CardContent>
      </Card>
    );
  }

  if (hasUnauthorizedError) {
    return (
      <Card className="border-danger/25 bg-danger/10">
        <CardContent className="flex flex-col gap-2 p-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:p-4 sm:text-sm">
          <p className="leading-snug">{entity} requiere autenticacion valida. Inicia sesion nuevamente.</p>
          <Badge variant="danger">401 Unauthorized</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-warning/30 bg-warning/10")}>
      <CardContent className="flex flex-col gap-2 p-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:p-4 sm:text-sm">
        <p className="leading-snug">{entity} usando datos demo. {error ?? "Configura el backend local para probar los endpoints reales."}</p>
        <Badge variant="warning">Demo fallback</Badge>
      </CardContent>
    </Card>
  );
}