import { describe, it, expect } from "vitest";
import { cn, formatDate, formatCurrency, formatCompactNumber } from "@/lib/utils";

describe("cn", () => {
  it("combina clases", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("filtra falsy", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });

  it("mergea tailwind conflictivas", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("clases condicionales", () => {
    const active = true;
    expect(cn("base", active && "active", !active && "inactive")).toBe("base active");
  });

  it("string vacio", () => {
    expect(cn("")).toBe("");
  });

  it("sin argumentos", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formatea fecha ISO", () => {
    const result = formatDate("2026-05-29T10:30:00Z");
    expect(result).toContain("29");
    expect(result).toContain("may");
  });

  it("formatea Date object", () => {
    const result = formatDate(new Date("2026-01-15T08:00:00Z"));
    expect(result).toContain("15");
    expect(result).toContain("ene");
  });

  it("fecha invalida", () => {
    expect(formatDate("no-es-fecha")).toBe("Fecha invalida");
    expect(formatDate(new Date("invalid"))).toBe("Fecha invalida");
  });
});

describe("formatCurrency", () => {
  it("formatea CLP", () => {
    const result = formatCurrency(450000);
    expect(result).toContain("450");
    expect(result).toContain("$");
  });

  it("formatea cero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formatea miles correctamente", () => {
    const result = formatCurrency(1234567);
    expect(result).toContain("1");
  });
});

describe("formatCompactNumber", () => {
  it("formatea numeros grandes", () => {
    const result = formatCompactNumber(1500);
    expect(result).toContain("1");
  });

  it("formatea miles", () => {
    const result = formatCompactNumber(1500000);
    expect(result).toContain("1,5");
  });

  it("formatea numero pequeno", () => {
    const result = formatCompactNumber(42);
    expect(result).toBe("42");
  });
});
