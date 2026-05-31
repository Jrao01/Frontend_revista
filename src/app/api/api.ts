// src/app/api/api.ts
/**
 * Centralized API helper object.
 * Every request to the backend should go through this module.
 */

const BASE_URL = "http://localhost:3000";

/** Helper to handle fetch requests uniformly */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed with status ${response.status}: ${text}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  return response.json();
}

export const api = {
  articulos: {
    fetchAll: () => request<any[]>("/api/articulos"),
    fetchApproved: (revId?: number | string) => revId ? request<any[]>(`/api/articulos/aprobados?revistaId=${revId}`) : request<any[]>("/api/articulos/aprobados"),
    fetchById: (id: string) => request<any>(`/api/articulos/${id}`),
    create: (data: any) => request<any>("/api/articulos", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/articulos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/articulos/${id}`, { method: "DELETE" }),
  },
  usuarios: {
    fetchAll: () => request<any[]>("/api/usuarios"),
    fetchById: (id: string) => request<any>(`/api/usuarios/${id}`),
    login: (credentials: any) => request<any>("/api/usuarios/login", { method: "POST", body: JSON.stringify(credentials) }),
  },
  revistas: {
    fetchAll: () => request<any[]>("/api/revistas"),
    fetchNumeros: (id: number | string) => request<any[]>(`/api/revistas/${id}/numeros`),
    create: (payload: any) => request<any>("/api/revistas", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number | string, payload: any) => request<any>(`/api/revistas/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deactivate: (id: number | string) => request<void>(`/api/revistas/${id}/desactivar`, { method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
  },
  lineas: {
    fetchAll: () => request<any[]>("/api/lineas"),
  },
};
