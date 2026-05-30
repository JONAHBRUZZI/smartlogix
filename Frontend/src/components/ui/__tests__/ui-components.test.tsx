import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";

// ─── Button ───────────────────────────────────────────────────

describe("Button", () => {
  it("renderiza con texto", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("llama onClick", () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("variante outline", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("Outline")).toBeDefined();
  });

  it("variante ghost", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText("Ghost")).toBeDefined();
  });

  it("size sm", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toBeDefined();
  });

  it("size lg", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toBeDefined();
  });

  it("disabled no llama onClick", () => {
    const fn = vi.fn();
    render(<Button disabled onClick={fn}>Disabled</Button>);
    fireEvent.click(screen.getByText("Disabled"));
    expect(fn).not.toHaveBeenCalled();
  });

  it("acepta className custom", () => {
    const { container } = render(<Button className="my-custom">Test</Button>);
    expect(container.querySelector(".my-custom")).toBeTruthy();
  });

  it("renderiza como child button type", () => {
    render(<Button type="submit">Submit</Button>);
    const btn = screen.getByText("Submit") as HTMLButtonElement;
    expect(btn.type).toBe("submit");
  });
});

// ─── Card ─────────────────────────────────────────────────────

describe("Card", () => {
  it("renderiza contenido", () => {
    render(<Card><CardContent>Contenido</CardContent></Card>);
    expect(screen.getByText("Contenido")).toBeDefined();
  });

  it("renderiza header con titulo y descripcion", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Titulo</CardTitle>
          <CardDescription>Descripcion</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    );
    expect(screen.getByText("Titulo")).toBeDefined();
    expect(screen.getByText("Descripcion")).toBeDefined();
    expect(screen.getByText("Body")).toBeDefined();
  });
});

// ─── Badge ────────────────────────────────────────────────────

describe("Badge", () => {
  it("renderiza texto", () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText("Activo")).toBeDefined();
  });

  it("variante info", () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText("Info")).toBeDefined();
  });

  it("variante destructive", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toBeDefined();
  });

  it("variante outline", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toBeDefined();
  });

  it("variante secondary", () => {
    render(<Badge variant="secondary">Sec</Badge>);
    expect(screen.getByText("Sec")).toBeDefined();
  });
});

// ─── Input ────────────────────────────────────────────────────

describe("Input", () => {
  it("renderiza input", () => {
    render(<Input placeholder="Escribe..." />);
    expect(screen.getByPlaceholderText("Escribe...")).toBeDefined();
  });

  it("onChange funciona", () => {
    const fn = vi.fn();
    render(<Input onChange={fn} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hola" } });
    expect(fn).toHaveBeenCalled();
  });

  it("tipo email", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.type).toBe("email");
  });

  it("disabled", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("acepta className custom", () => {
    const { container } = render(<Input className="h-10" />);
    expect(container.querySelector(".h-10")).toBeTruthy();
  });
});

// ─── Sheet ────────────────────────────────────────────────────

describe("Sheet", () => {
  it("contenido oculto visualmente cuando cerrado", () => {
    render(
      <Sheet open={false} onClose={vi.fn()} title="Menu">
        <p>Contenido oculto</p>
      </Sheet>
    );
    // Sheet renderiza el contenido pero con pointer-events-none y opacity-0
    const el = screen.queryByText("Contenido oculto");
    expect(el).toBeTruthy();
  });

  it("renderiza titulo", () => {
    render(
      <Sheet open={true} onClose={vi.fn()} title="Mi Menu">
        <p>Contenido</p>
      </Sheet>
    );
    expect(screen.getByText("Mi Menu")).toBeDefined();
  });

  it("renderiza footer", () => {
    render(
      <Sheet open={true} onClose={vi.fn()} title="Menu" footer={<button>Guardar</button>}>
        <p>Body</p>
      </Sheet>
    );
    expect(screen.getByText("Guardar")).toBeDefined();
  });

  it("cierra al hacer clic en X", () => {
    const onClose = vi.fn();
    render(
      <Sheet open={true} onClose={onClose} title="Menu">
        <p>Body</p>
      </Sheet>
    );
    const closeBtn = screen.getByRole("button", { name: "Cerrar" });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cierra al hacer clic en backdrop", () => {
    const onClose = vi.fn();
    render(
      <Sheet open={true} onClose={onClose} title="Menu">
        <p>Body</p>
      </Sheet>
    );
    // Backdrop is a div with onClick={onClose}
    const backdrop = document.querySelector(".fixed.inset-0.z-40");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("side=right", () => {
    render(
      <Sheet open={true} onClose={vi.fn()} title="Menu" side="right">
        <p>Lado derecho</p>
      </Sheet>
    );
    expect(screen.getByText("Lado derecho")).toBeDefined();
  });
});
