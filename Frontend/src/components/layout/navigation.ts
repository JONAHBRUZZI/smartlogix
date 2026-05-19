import { BarChart3, Boxes, Calendar, Gauge, Package, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { hasPermission, type AppPermission } from "@/app/access";
import type { Role } from "@/types/domain";

export interface NavItem {
  title: string;
  mobileTitle?: string;
  path: string;
  icon: LucideIcon;
  mobile?: boolean;
  permission: AppPermission;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", mobileTitle: "Inicio", path: "/dashboard", icon: Gauge, mobile: true, permission: "dashboard.view" },
  { title: "Inventario", mobileTitle: "Stock", path: "/inventory", icon: Boxes, mobile: true, permission: "inventory.view" },
  { title: "Pedidos", mobileTitle: "Pedidos", path: "/orders", icon: Package, mobile: true, permission: "orders.view" },
  { title: "Envios", mobileTitle: "Envios", path: "/shipments", icon: Truck, mobile: true, permission: "shipments.view" },
  { title: "Calendario", path: "/calendar", icon: Calendar, permission: "shipments.view" },
  { title: "Reportes", path: "/reports", icon: BarChart3, permission: "dashboard.view" },
  { title: "Usuarios", path: "/users", icon: ShieldCheck, permission: "users.view" }
];

export function getVisibleNavItems(role: Role) {
  return navItems.filter((item) => hasPermission(role, item.permission));
}