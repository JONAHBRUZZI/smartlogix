import { ArrowLeft, ShieldX } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDefaultPathForRole } from "@/app/access";
import { useAuth } from "@/app/auth";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AccessDeniedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  const requestedPath = (location.state as { from?: string } | null)?.from;
  const fallbackPath = session ? getDefaultPathForRole(session.role) : "/dashboard";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Seguridad"
        title="Acceso denegado"
        description="Tu usuario no tiene permisos para consultar este recurso operativo."
      />

      <Card className="border-red-200 bg-red-50/80">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3 text-red-800">
            <div className="rounded-2xl bg-red-100 p-2">
              <ShieldX className="h-5 w-5" />
            </div>
            <p className="font-semibold">Permiso insuficiente para esta vista</p>
          </div>

          <p className="text-sm text-red-900">
            {requestedPath
              ? `El backend rechazó el acceso al recurso ${requestedPath}. Solicita permisos al equipo administrador o usa un perfil autorizado.`
              : "El backend rechazó el acceso al recurso solicitado. Solicita permisos al equipo administrador o usa un perfil autorizado."}
          </p>

          <Button
            variant="outline"
            onClick={() => {
              navigate(fallbackPath, { replace: true });
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a una sección permitida
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
