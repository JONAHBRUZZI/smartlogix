import { describe, it, expect, beforeEach } from "vitest";
import { readHistory, addHistoryEntry, getOrderHistory, clearHistory, type HistoryEntry } from "@/lib/order-history";

beforeEach(() => {
  localStorage.clear();
});

describe("order-history", () => {
  it("readHistory devuelve array vacio sin datos", () => {
    expect(readHistory()).toEqual([]);
  });

  it("addHistoryEntry agrega entrada", () => {
    addHistoryEntry({ orderId: "101", action: "created", actor: "Admin", actorRole: "owner", detail: "Pedido creado para test" });
    const h = readHistory();
    expect(h).toHaveLength(1);
    expect(h[0].orderId).toBe("101");
    expect(h[0].action).toBe("created");
    expect(h[0].actor).toBe("Admin");
    expect(h[0].actorRole).toBe("owner");
    expect(h[0].detail).toBe("Pedido creado para test");
  });

  it("addHistoryEntry genera id y timestamp", () => {
    addHistoryEntry({ orderId: "101", action: "confirmed", actor: "Admin", actorRole: "owner", detail: "x" });
    const h = readHistory();
    expect(h[0].id).toMatch(/^hist-/);
    expect(h[0].timestamp).toBeTruthy();
    expect(new Date(h[0].timestamp).getTime()).toBeGreaterThan(0);
  });

  it("getOrderHistory filtra por orderId", () => {
    addHistoryEntry({ orderId: "101", action: "created", actor: "A", actorRole: "owner", detail: "d1" });
    addHistoryEntry({ orderId: "102", action: "created", actor: "B", actorRole: "owner", detail: "d2" });
    addHistoryEntry({ orderId: "101", action: "confirmed", actor: "A", actorRole: "owner", detail: "d3" });
    expect(getOrderHistory("101")).toHaveLength(2);
    expect(getOrderHistory("102")).toHaveLength(1);
    expect(getOrderHistory("999")).toHaveLength(0);
  });

  it("addHistoryEntry inserta al inicio (unshift)", () => {
    addHistoryEntry({ orderId: "101", action: "created", actor: "A", actorRole: "owner", detail: "primero" });
    addHistoryEntry({ orderId: "101", action: "confirmed", actor: "A", actorRole: "owner", detail: "segundo" });
    expect(readHistory()[0].detail).toBe("segundo");
    expect(readHistory()[1].detail).toBe("primero");
  });

  it("clearHistory limpia todo", () => {
    addHistoryEntry({ orderId: "101", action: "created", actor: "A", actorRole: "owner", detail: "d" });
    clearHistory();
    expect(readHistory()).toEqual([]);
  });

  it("limite de 200 entradas", () => {
    for (let i = 0; i < 250; i++) {
      addHistoryEntry({ orderId: String(i), action: "created", actor: "A", actorRole: "owner", detail: `d${i}` });
    }
    expect(readHistory().length).toBeLessThanOrEqual(200);
  });

  it("readHistory maneja JSON corrupto", () => {
    localStorage.setItem("smartlogix-order-history", "{corrupto");
    expect(readHistory()).toEqual([]);
  });
});
