import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useApiQuery } from "@/hooks/use-api-query";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder } from "@/types/api";

const mockOrders: ApiOrder[] = [
  {
    id: 1,
    customerId: 10,
    sku: "COCA-2L",
    quantity: 5,
    status: "EN_PREPARACION",
    createdAt: "2026-05-01T10:00:00Z",
    assignedTo: null,
    cancelReason: null
  }
];

const transformMock = (data: ApiOrder[]) => data;

describe("useApiQuery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("inicia en estado loading", () => {
    globalThis.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() =>
      useApiQuery({ path: "/api/orders", transform: transformMock })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.source).toBe("live");
  });

  it("carga datos exitosamente y actualiza estados", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockOrders), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const { result } = renderHook(() =>
      useApiQuery({ path: "/api/orders", transform: transformMock })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockOrders);
    expect(result.current.error).toBeNull();
    expect(result.current.source).toBe("live");
  });

  it("maneja error de red correctamente", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new ApiRequestError("Not Found", 404)
    );

    const { result } = renderHook(() =>
      useApiQuery({ path: "/api/orders", transform: transformMock })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBe("error");
    expect(result.current.error).toBeTruthy();
  });

  it("maneja error 401 con mensaje de sesion expirada", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new ApiRequestError("Unauthorized", 401)
    );

    const { result } = renderHook(() =>
      useApiQuery({ path: "/api/orders", transform: transformMock })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain("Sesion expirada");
  });

  it("maneja error 403 con mensaje de permisos", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new ApiRequestError("Forbidden", 403)
    );

    const { result } = renderHook(() =>
      useApiQuery({ path: "/api/orders", transform: transformMock })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain("permisos");
  });

  it("maneja error 408 con mensaje de timeout", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new ApiRequestError("Timeout", 408)
    );

    const { result } = renderHook(() =>
      useApiQuery({ path: "/api/orders", transform: transformMock })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain("no respondio a tiempo");
  });

  it("no hace fetch cuando enabled es false", () => {
    globalThis.fetch = vi.fn();

    const { result } = renderHook(() =>
      useApiQuery({ path: "/api/orders", transform: transformMock, enabled: false })
    );

    expect(result.current.loading).toBe(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
