import type { Role } from "@/types/domain";

export type AppPermission =
  | "dashboard.view"
  | "inventory.view"
  | "inventory.adjust"
  | "orders.view"
  | "orders.create"
  | "orders.review"
  | "shipments.view"
  | "shipments.dispatch"
  | "shipments.update"
  | "alerts.view"
  | "users.view"
  | "users.manage";

export interface RoleAccessProfile {
  label: string;
  summary: string;
  defaultPath: string;
  paths: string[];
  permissions: AppPermission[];
}

const basePaths = ["/access-denied", "/profile", "/notifications", "/calendar", "/reports"];

export const roleProfiles: Record<Role, RoleAccessProfile> = {
  owner: {
    label: "Administrador",
    summary: "Control completo de la operacion, seguimiento transversal y gestion de usuarios del negocio.",
    defaultPath: "/dashboard",
    paths: ["/dashboard", "/inventory", "/orders", "/shipments", "/alerts", "/users", ...basePaths],
    permissions: [
      "dashboard.view",
      "inventory.view",
      "inventory.adjust",
      "orders.view",
      "orders.create",
      "orders.review",
      "shipments.view",
      "shipments.dispatch",
      "shipments.update",
      "alerts.view",
      "users.view",
      "users.manage"
    ]
  },
  ops: {
    label: "Operaciones",
    summary: "Gestiona el flujo diario: crea pedidos, revisa incidencias y coordina despacho.",
    defaultPath: "/orders",
    paths: ["/dashboard", "/inventory", "/orders", "/shipments", "/alerts", ...basePaths],
    permissions: [
      "dashboard.view",
      "inventory.view",
      "orders.view",
      "orders.create",
      "orders.review",
      "shipments.view",
      "shipments.dispatch",
      "shipments.update",
      "alerts.view"
    ]
  },
  warehouse: {
    label: "Bodega",
    summary: "Controla stock, confirma disponibilidad y responde a quiebres o ajustes de inventario.",
    defaultPath: "/inventory",
    paths: ["/dashboard", "/inventory", "/orders", "/alerts", ...basePaths],
    permissions: [
      "dashboard.view",
      "inventory.view",
      "inventory.adjust",
      "orders.view",
      "orders.review",
      "alerts.view"
    ]
  },
  support: {
    label: "Soporte",
    summary: "Monitorea continuidad operativa, revisa trazabilidad y escala incidentes sin ejecutar cambios de negocio.",
    defaultPath: "/alerts",
    paths: ["/dashboard", "/orders", "/shipments", "/alerts", ...basePaths],
    permissions: [
      "dashboard.view",
      "orders.view",
      "shipments.view",
      "alerts.view"
    ]
  },
  customer: {
    label: "Cliente",
    summary: "Consulta pedidos y envios sin intervenir la operacion interna.",
    defaultPath: "/orders",
    paths: ["/orders", "/shipments", ...basePaths],
    permissions: [
      "orders.view",
      "shipments.view"
    ]
  },
  shipper: {
    label: "Transportista",
    summary: "Gestiona las entregas asignadas, actualiza estados de ruta y reporta retrasos operativos.",
    defaultPath: "/shipments",
    paths: ["/shipments", "/alerts", ...basePaths],
    permissions: [
      "shipments.view",
      "shipments.update",
      "alerts.view"
    ]
  }
};

export function getRoleProfile(role: Role) {
  return roleProfiles[role];
}

export function getAllowedPaths(role: Role) {
  return roleProfiles[role].paths;
}

export function getDefaultPathForRole(role: Role): string {
  return roleProfiles[role].defaultPath;
}

export function isPathAllowedForRole(role: Role, pathname: string) {
  return roleProfiles[role].paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function hasPermission(role: Role, permission: AppPermission) {
  return roleProfiles[role].permissions.includes(permission);
}