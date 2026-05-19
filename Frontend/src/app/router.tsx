import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "@/app/auth";
import { AppShell } from "@/components/layout/app-shell";
import { AccessDeniedPage } from "@/pages/access-denied-page";
import { CalendarPage } from "@/pages/calendar-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { InventoryDetailPage } from "@/pages/inventory-detail-page";
import { InventoryPage } from "@/pages/inventory-page";
import { LoginPage } from "@/pages/login-page";
import { NotificationsPage } from "@/pages/notifications-page";
import { OrderDetailPage } from "@/pages/order-detail-page";
import { OrdersPage } from "@/pages/orders-page";
import { ProfilePage } from "@/pages/profile-page";
import { ReportsPage } from "@/pages/reports-page";
import { ShipmentsPage } from "@/pages/shipments-page";
import { UsersPage } from "@/pages/users-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/inventory", element: <InventoryPage /> },
          { path: "/inventory/:productId", element: <InventoryDetailPage /> },
          { path: "/orders", element: <OrdersPage /> },
          { path: "/orders/:orderId", element: <OrderDetailPage /> },
          { path: "/shipments", element: <ShipmentsPage /> },
          { path: "/alerts", element: <Navigate to="/notifications" replace /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/users", element: <UsersPage /> },
          { path: "/access-denied", element: <AccessDeniedPage /> }
        ]
      }
    ]
  }
]);