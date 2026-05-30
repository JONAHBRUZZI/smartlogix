import { describe, it, expect, beforeEach } from "vitest";
import { readApiConfig, writeApiConfig, clearApiConfig } from "@/lib/api-config";

const BASE_URL_KEY = "smartlogix-api-base-url";
const TOKEN_KEY = "smartlogix-api-token";

beforeEach(() => {
  localStorage.clear();
  // Simular entorno NO local
  Object.defineProperty(window, "location", {
    value: { hostname: "smartlogix-five.vercel.app" },
    writable: true,
  });
});

describe("api-config", () => {
  it("readApiConfig devuelve defaults sin datos", () => {
    const config = readApiConfig();
    expect(config.baseUrl).toBe("");
    expect(config.token).toBe("");
  });

  it("writeApiConfig guarda baseUrl y token", () => {
    writeApiConfig({ baseUrl: "http://104.248.60.29", token: "tok-abc" });
    expect(localStorage.getItem(BASE_URL_KEY)).toBe("http://104.248.60.29");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok-abc");
  });

  it("readApiConfig lee lo guardado", () => {
    writeApiConfig({ baseUrl: "http://test.local", token: "secret" });
    const config = readApiConfig();
    expect(config.baseUrl).toBe("http://test.local");
    expect(config.token).toBe("secret");
  });

  it("writeApiConfig en localhost no guarda baseUrl", () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    writeApiConfig({ baseUrl: "http://x.com", token: "tok" });
    expect(localStorage.getItem(BASE_URL_KEY)).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok"); // token si se guarda
  });

  it("clearApiConfig limpia ambos", () => {
    writeApiConfig({ baseUrl: "http://url", token: "tok" });
    clearApiConfig();
    expect(localStorage.getItem(BASE_URL_KEY)).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("token vacio se guarda", () => {
    writeApiConfig({ baseUrl: "http://url", token: "" });
    expect(localStorage.getItem(TOKEN_KEY)).toBe("");
  });
});
