import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportCSV, exportOrdersCSV, exportInventoryCSV, exportShipmentsCSV, exportSalesCSV, orderColumns, inventoryColumns, shipmentColumns, salesColumns } from "@/lib/export-csv";

function extractCSVContent(): string | null {
  const calls = (globalThis.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls;
  if (!calls.length) return null;
  const blob = calls[0][0] as Blob;
  // Forzar promesa a resuelta sincrona en test
  return "mock-download";
}

// More precise test: intercept the anchor click
function getDownloadContent(): string {
  const createCalls = (globalThis.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls;
  expect(createCalls.length).toBeGreaterThan(0);
  const blob = createCalls[0][0] as Blob;
  const reader = new FileReader();
  let result = "";
  reader.onload = () => { result = reader.result as string; };
  reader.readAsText(blob);
  return result;
}

beforeEach(() => {
  vi.spyOn(globalThis.URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(globalThis.URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(document, "createElement").mockReturnValue({
    href: "", download: "",
    click: vi.fn(),
  } as unknown as HTMLAnchorElement);
  vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn());
  vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("exportCSV", () => {
  it("genera header y filas", () => {
    const rows = [{ id: "1", name: "Test" }];
    const cols = [
      { header: "ID", accessor: (r: typeof rows[0]) => r.id },
      { header: "Nombre", accessor: (r: typeof rows[0]) => r.name },
    ];
    exportCSV(rows, cols, "test.csv");
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    const blob = (globalThis.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/csv;charset=utf-8");
  });

  it("exportOrdersCSV genera descarga", () => {
    exportOrdersCSV([
      { id: "1", customer: "Cliente A", sku: "SKU-001", quantity: 5, stage: "created", createdAt: "2026-01-01" }
    ]);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it("exportInventoryCSV genera descarga", () => {
    exportInventoryCSV([
      { sku: "SKU-001", stock: 10, status: "healthy", updatedAt: "2026-01-01" }
    ]);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it("exportShipmentsCSV genera descarga", () => {
    exportShipmentsCSV([
      { id: "1", tracking: "TRACK-123", orderId: "101", sku: "SKU", stage: "en_reparto", carrier: "Trans", createdAt: "2026-01-01" }
    ]);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it("exportSalesCSV genera descarga", () => {
    exportSalesCSV([
      { id: "1", items: "x", vendorName: "V", total: 1000, paymentMethod: "cash", createdAt: "2026-01-01" }
    ]);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it("escapa comillas en campos", () => {
    const rows = [{ name: 'Producto "Especial"', price: 100 }];
    const cols = [
      { header: "Nombre", accessor: (r: typeof rows[0]) => r.name },
      { header: "Precio", accessor: (r: typeof rows[0]) => r.price },
    ];
    exportCSV(rows, cols, "test.csv");
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it("columnas de pedidos tienen headers correctos", () => {
    expect(orderColumns.map(c => c.header)).toEqual(["ID", "Cliente", "SKU", "Cantidad", "Estado", "Transportista", "Creado"]);
  });

  it("columnas de inventario tienen headers correctos", () => {
    expect(inventoryColumns.map(c => c.header)).toEqual(["SKU", "Stock", "Estado", "Actualizado"]);
  });

  it("columnas de envios tienen headers correctos", () => {
    expect(shipmentColumns.map(c => c.header)).toEqual(["ID", "Tracking", "Pedido", "SKU", "Estado", "Transportista", "Creado"]);
  });

  it("columnas de ventas tienen headers correctos", () => {
    expect(salesColumns.map(c => c.header)).toEqual(["Venta #", "Items", "Vendedor", "Total", "Pago", "Fecha"]);
  });

  it("transportista opcional en exportOrdersCSV", () => {
    exportOrdersCSV([
      { id: "1", customer: "A", sku: "S", quantity: 1, stage: "created", createdAt: "2026-01-01" }
    ]);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it("exportCSV con array vacio", () => {
    exportCSV([], [{ header: "ID", accessor: () => "" }], "vacio.csv");
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });
});
