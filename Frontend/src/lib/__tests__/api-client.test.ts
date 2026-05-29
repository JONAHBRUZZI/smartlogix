import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiClient, ApiRequestError } from "@/lib/api-client";

describe("ApiRequestError", () => {
  it("crea error con status", () => {
    const error = new ApiRequestError("Not Found", 404);

    expect(error.message).toBe("Not Found");
    expect(error.status).toBe(404);
    expect(error.name).toBe("ApiRequestError");
  });

  it("isUnauthorized detecta 401", () => {
    expect(new ApiRequestError("Unauthorized", 401).isUnauthorized).toBe(true);
    expect(new ApiRequestError("Forbidden", 403).isUnauthorized).toBe(false);
  });

  it("isForbidden detecta 403", () => {
    expect(new ApiRequestError("Forbidden", 403).isForbidden).toBe(true);
    expect(new ApiRequestError("Unauthorized", 401).isForbidden).toBe(false);
  });

  it("isTimeout detecta 408", () => {
    expect(new ApiRequestError("Timeout", 408).isTimeout).toBe(true);
    expect(new ApiRequestError("Error", 500).isTimeout).toBe(false);
  });
});

describe("ApiClient", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({ baseUrl: "http://test.local" });
    vi.restoreAllMocks();
  });

  it("inicializa con las dependencias dadas", () => {
    const c = new ApiClient({ baseUrl: "http://api.local", token: "tk-abc", timeoutMs: 5000 });

    expect(c).toBeDefined();
  });

  it("permite cambiar el token en runtime", () => {
    client.setToken("nuevo-token");

    expect(client).toBeDefined();
  });

  it("permite setear listener de error de auth", () => {
    const listener = vi.fn();
    client.setAuthErrorListener(listener);

    expect(client).toBeDefined();
  });

  it("permite setear handler de refresh", () => {
    const handler = vi.fn().mockResolvedValue("refreshed-token");
    client.setAuthRefreshHandler(handler);

    expect(client).toBeDefined();
  });

  it("fetch exitoso retorna datos JSON", async () => {
    const mockResponse = { orders: [{ id: 1 }] };
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const result = await client.fetch<{ orders: Array<{ id: number }> }>("/api/orders");

    expect(result).toEqual(mockResponse);
  });

  it("fetch con error 404 lanza ApiRequestError", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Not Found" }), { status: 404 })
    );

    await expect(client.fetch("/api/orders")).rejects.toThrow(ApiRequestError);
  });

  it("fetch con 401 llama al listener de auth-error", async () => {
    const listener = vi.fn();
    client.setAuthErrorListener(listener);

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    await expect(client.fetch("/api/orders")).rejects.toThrow(ApiRequestError);
    expect(listener).toHaveBeenCalledWith(401);
  });

  it("fetch con 204 retorna undefined", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 204 })
    );

    const result = await client.fetch("/api/orders/1");

    expect(result).toBeUndefined();
  });

  it("fetch con respuesta sin content-length retorna undefined", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: { "content-length": "0" }
      })
    );

    const result = await client.fetch("/api/orders");

    expect(result).toBeUndefined();
  });

  it("intenta refresh cuando recibe 401 y tiene handler", async () => {
    const refreshedToken = "tk-refreshed";
    const handler = vi.fn().mockResolvedValue(refreshedToken);
    client.setAuthRefreshHandler(handler);

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "expired" }), { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ orders: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );

    const result = await client.fetch("/api/orders");

    expect(handler).toHaveBeenCalledOnce();
    expect(result).toEqual({ orders: [] });
  });

  it("no intenta refresh si no hay handler configurado", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    await expect(client.fetch("/api/orders")).rejects.toThrow(ApiRequestError);
  });

  it("maneja respuesta de error sin cuerpo JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", { status: 500 })
    );

    await expect(client.fetch("/api/orders")).rejects.toThrow("Error 500");
  });
});
