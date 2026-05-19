const BASE_URL_KEY = "smartlogix-api-base-url";
const TOKEN_KEY = "smartlogix-api-token";

export interface ApiConfig {
  baseUrl: string;
  token: string;
}

export function getDefaultApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

export function readApiConfig(): ApiConfig {
  if (typeof window === "undefined") {
    return { baseUrl: getDefaultApiBaseUrl(), token: "" };
  }

  const storedBaseUrl = window.localStorage.getItem(BASE_URL_KEY);
  const isLocalEnv = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  // En desarrollo local, siempre usar URL relativa (pasa por proxy Vite)
  if (isLocalEnv && storedBaseUrl) {
    window.localStorage.removeItem(BASE_URL_KEY);
  }

  return {
    baseUrl: (!isLocalEnv ? storedBaseUrl : null) ?? getDefaultApiBaseUrl(),
    token: window.localStorage.getItem(TOKEN_KEY) ?? ""
  };
}

export function writeApiConfig(config: ApiConfig) {
  const isLocalEnv = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!isLocalEnv) {
    window.localStorage.setItem(BASE_URL_KEY, config.baseUrl.trim() || getDefaultApiBaseUrl());
  }
  window.localStorage.setItem(TOKEN_KEY, config.token.trim());
}

export function clearApiConfig() {
  window.localStorage.removeItem(BASE_URL_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}