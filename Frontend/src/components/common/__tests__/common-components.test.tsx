import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { InstallAppButton } from "@/components/common/install-app-button";
import { Package, Truck, Boxes, BarChart3 } from "lucide-react";

// ─── MetricCard ───────────────────────────────────────────────

describe("MetricCard", () => {
  it("renderiza titulo, valor y tendencia", () => {
    render(<MetricCard title="Pedidos" value="42" trend="+12%" icon={Package} />);
    expect(screen.getByText("Pedidos")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("+12%")).toBeDefined();
  });

  it("renderiza con tone primary por defecto", () => {
    const { container } = render(<MetricCard title="T" value="0" trend="0" icon={Package} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renderiza con tone amber", () => {
    const { container } = render(<MetricCard title="T" value="0" trend="0" icon={Truck} tone="amber" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renderiza con tone teal", () => {
    const { container } = render(<MetricCard title="T" value="0" trend="0" icon={Boxes} tone="teal" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renderiza con tone muted", () => {
    const { container } = render(<MetricCard title="T" value="0" trend="0" icon={BarChart3} tone="muted" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renderiza con tone slate", () => {
    const { container } = render(<MetricCard title="T" value="0" trend="0" icon={BarChart3} tone="slate" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("muestra icono", () => {
    const { container } = render(<MetricCard title="Stock" value="150" trend="+5" icon={Boxes} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});

// ─── PageHeader ───────────────────────────────────────────────

describe("PageHeader", () => {
  it("renderiza eyebrow, titulo y descripcion", () => {
    render(<PageHeader eyebrow="Gestion" title="Pedidos" description="Administra tus pedidos" />);
    expect(screen.getByText("Gestion")).toBeDefined();
    expect(screen.getByText("Pedidos")).toBeDefined();
    expect(screen.getByText("Administra tus pedidos")).toBeDefined();
  });

  it("renderiza sin accion", () => {
    const { container } = render(<PageHeader eyebrow="Test" title="Test" description="Test" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renderiza con accion opcional", () => {
    render(
      <PageHeader
        eyebrow="Test"
        title="Test"
        description="Test"
        action={<button data-testid="action-btn">Accion</button>}
      />
    );
    expect(screen.getByTestId("action-btn")).toBeDefined();
  });
});

// ─── InstallAppButton ─────────────────────────────────────────

describe("InstallAppButton", () => {
  it("habilitado cuando canInstall=true", () => {
    render(<InstallAppButton canInstall={true} />);
    const btn = screen.getByRole("button");
    expect(btn).toBeEnabled();
    expect(screen.getByText("Instalar app")).toBeDefined();
  });

  it("deshabilitado cuando canInstall=false", () => {
    render(<InstallAppButton canInstall={false} />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("modo compacto muestra 'Instalar'", () => {
    render(<InstallAppButton canInstall={true} compact />);
    expect(screen.getByText("Instalar")).toBeDefined();
  });

  it("llama onInstall al hacer clic", () => {
    const onInstall = vi.fn();
    render(<InstallAppButton canInstall={true} onInstall={onInstall} />);
    screen.getByRole("button").click();
    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it("no llama onInstall si deshabilitado", () => {
    const onInstall = vi.fn();
    render(<InstallAppButton canInstall={false} onInstall={onInstall} />);
    screen.getByRole("button").click();
    expect(onInstall).not.toHaveBeenCalled();
  });

  it("acepta className custom", () => {
    const { container } = render(<InstallAppButton canInstall={true} className="custom-class" />);
    expect(container.querySelector(".custom-class")).toBeTruthy();
  });

  it("titulo tooltip en deshabilitado", () => {
    render(<InstallAppButton canInstall={false} />);
    expect(screen.getByTitle("La instalacion no esta disponible en este momento")).toBeDefined();
  });
});
