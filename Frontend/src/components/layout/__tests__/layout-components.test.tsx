import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import type { Role } from "@/types/domain";

const roles: Role[] = ["owner", "ops", "warehouse", "shipper", "vendor", "support", "customer"];

// ─── MobileNav ────────────────────────────────────────────────

describe("MobileNav", () => {
  it("renderiza items de navegacion para owner", () => {
    render(
      <MemoryRouter>
        <MobileNav role="owner" />
      </MemoryRouter>
    );
    expect(screen.getByText("Inicio")).toBeDefined();
    expect(screen.getByText("Vender")).toBeDefined();
    expect(screen.getByText("Stock")).toBeDefined();
    expect(screen.getByText("Pedidos")).toBeDefined();
  });

  it("solo muestra 4 items (mobile)", () => {
    render(
      <MemoryRouter>
        <MobileNav role="owner" />
      </MemoryRouter>
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
  });

  it("shipper ve items permitidos", () => {
    render(
      <MemoryRouter>
        <MobileNav role="shipper" />
      </MemoryRouter>
    );
    // shipper no tiene mobile items visibles - nav vacio es valido
    const nav = document.querySelector("nav");
    expect(nav).toBeTruthy();
  });

  it("todos los roles renderizan sin errores", () => {
    for (const role of roles) {
      const { unmount } = render(
        <MemoryRouter>
          <MobileNav role={role} />
        </MemoryRouter>
      );
      const nav = document.querySelector("nav");
      expect(nav).toBeTruthy();
      unmount();
    }
  });

  it("enlaces tienen hrefs validos", () => {
    render(
      <MemoryRouter>
        <MobileNav role="owner" />
      </MemoryRouter>
    );
    const links = screen.getAllByRole("link") as HTMLAnchorElement[];
    const paths = links.map(l => new URL(l.href).pathname);
    expect(paths).toContain("/dashboard");
    expect(paths).toContain("/pos");
    expect(paths).toContain("/inventory");
    expect(paths).toContain("/orders");
  });
});

// ─── Sidebar ──────────────────────────────────────────────────

describe("Sidebar", () => {
  it("renderiza branding SmartLogix", () => {
    render(
      <MemoryRouter>
        <Sidebar role="owner" />
      </MemoryRouter>
    );
    expect(screen.getByText("SmartLogix")).toBeDefined();
  });

  it("renderiza items de navegacion", () => {
    render(
      <MemoryRouter>
        <Sidebar role="owner" />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Pedidos")).toBeDefined();
    expect(screen.getByText("Inventario")).toBeDefined();
  });

  it("todos los roles renderizan sin error", () => {
    for (const role of roles) {
      const { unmount } = render(
        <MemoryRouter>
          <Sidebar role={role} />
        </MemoryRouter>
      );
      expect(screen.getByText("SmartLogix")).toBeDefined();
      unmount();
    }
  });

  it("muestra barra de almacenamiento", () => {
    render(
      <MemoryRouter>
        <Sidebar role="owner" />
      </MemoryRouter>
    );
    expect(screen.getByText("Almacenamiento")).toBeDefined();
    expect(screen.getByText("6.2 GB / 10 GB usado")).toBeDefined();
  });

  it("el icono 'S' existe", () => {
    render(
      <MemoryRouter>
        <Sidebar role="owner" />
      </MemoryRouter>
    );
    expect(screen.getByText("S")).toBeDefined();
  });
});
