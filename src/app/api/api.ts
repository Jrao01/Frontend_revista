// src/app/api/api.ts
/**
 * Centralized API helper object.
 * Every request to the backend should go through this module.
 */

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** Helper to handle fetch requests uniformly */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const isFormData = options?.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed with status ${response.status}: ${text}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  const json = await response.json();
  // Unwrap { ok, message, data } envelope if present
  if (json && typeof json === "object" && "data" in json && "ok" in json) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  articulos: {
    fetchAll: () => request<any[]>("/api/articulos"),
    fetchApproved: (revId?: number | string) => revId ? request<any[]>(`/api/articulos/aprobados?revistaId=${revId}`) : request<any[]>("/api/articulos/aprobados"),
    fetchPublicados: (revId?: number | string) => revId ? request<any[]>(`/api/articulos/publicados?revistaId=${revId}`) : request<any[]>("/api/articulos/publicados"),
    fetchById: (id: string) => request<any>(`/api/articulos/${id}`),
    fetchAdminDetail: (id: number | string) => request<any>(`/api/articulos/${id}/admin`),
    fetchBySlug: (slug: string) => request<any>(`/api/articulos/slug/${slug}`),
    fetchRelated: (id: string) => request<any[]>(`/api/articulos/${id}/relacionados`),
    create: (data: any) => request<any>("/api/articulos", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/articulos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/articulos/${id}`, { method: "DELETE" }),
    assign: (id: number | string, numeroRevistaId: number | string, doi?: string) => request<any>(`/api/articulos/${id}/asignar`, { method: "PUT", body: JSON.stringify({ numero_revista_id: numeroRevistaId, doi }) }),
    fetchByNumero: (numId: number | string) => request<any[]>(`/api/articulos?numero_revista_id=${numId}`),
    register: (formData: FormData) => request<any>("/api/articulos/registrar", { method: "POST", body: formData }),
    fetchMyManuscripts: () => request<any[]>("/api/articulos/mis-manuscritos"),
    fetchMyEvaluations: (id: number | string) => request<any[]>(`/api/articulos/${id}/mis-evaluaciones`),
    rechazar: (id: number | string, data: any) => request<any>(`/api/articulos/${id}/rechazar`, { method: "POST", body: JSON.stringify(data) }),
    reUpload: (id: number | string, formData: FormData) => request<any>(`/api/articulos/${id}/re-upload`, { method: "POST", body: formData }),
  },
  usuarios: {
    fetchAll: () => request<any[]>("/api/usuarios/todos"),
    fetchById: (id: string) => request<any>(`/api/usuarios/${id}`),
    fetchMyProfile: () => request<any>("/api/usuarios/profile"),
    uploadCv: (formData: FormData) => request<any>("/api/usuarios/profile/cv", { method: "PUT", body: formData }),
    login: (credentials: any) => request<any>("/api/usuarios/login", { method: "POST", body: JSON.stringify(credentials) }),
  },
  revistas: {
    fetchAll: () => request<any[]>("/api/revistas"),
    fetchAllAdmin: () => request<any[]>("/api/revistas/admin/all"),
    fetchById: (id: number | string) => request<any>(`/api/revistas/${id}`),
    fetchVolumenes: (revId: number | string) => request<any[]>(`/api/revistas/${revId}/volumenes`),
    fetchNumeros: (revId: number | string, volId: number | string) => request<any[]>(`/api/revistas/${revId}/volumenes/${volId}/numeros`),
    updateNumero: (revId: number | string, volId: number | string, numId: number | string, data: any) => request<any>(`/api/revistas/${revId}/volumenes/${volId}/numeros/${numId}`, { method: "PUT", body: JSON.stringify(data) }),
    create: (payload: any) => request<any>("/api/revistas", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number | string, payload: any) => request<any>(`/api/revistas/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deactivate: (id: number | string) => request<void>(`/api/revistas/${id}/desactivar`, { method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
    activate: (id: number | string) => request<void>(`/api/revistas/${id}/activar`, { method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
  },
  lineas: {
    fetchAll: () => request<any[]>("/api/lineas"),
    fetchById: (id: number | string) => request<any>(`/api/lineas/${id}`),
    create: (data: any) => request<any>("/api/lineas", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number | string, data: any) => request<any>(`/api/lineas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number | string) => request<void>(`/api/lineas/${id}`, { method: "DELETE" }),
  },
  areas: {
    fetchAll: () => request<any[]>("/api/areas"),
    fetchById: (id: number | string) => request<any>(`/api/areas/${id}`),
    create: (data: any) => request<any>("/api/areas", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number | string, data: any) => request<any>(`/api/areas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number | string) => request<void>(`/api/areas/${id}`, { method: "DELETE" }),
  },
  programas: {
    fetchAll: () => request<any[]>("/api/programas"),
    fetchById: (id: number | string) => request<any>(`/api/programas/${id}`),
    create: (data: any) => request<any>("/api/programas", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number | string, data: any) => request<any>(`/api/programas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number | string) => request<void>(`/api/programas/${id}`, { method: "DELETE" }),
  },
  autores: {
    fetchAll: () => request<any[]>("/api/autores"),
    fetchProfile: (id: number | string) => request<any>(`/api/autores/${id}`),
  },
  evaluaciones: {
    fetchByArticulo: (articuloId: number | string) => request<any[]>(`/api/evaluaciones/articulo/${articuloId}`),
    fetchByRevisor: (revisorId: number) => request<any[]>(`/api/evaluaciones?revisor_id=${revisorId}`),
  },
  editor: {
    cambiarStatus: (id: number | string, status: string) => request<any>(`/api/editor/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },
  stats: {
    dashboard: () => request<any>("/api/stats/dashboard"),
  },
  statsContent: {
    incrementArticleView: (id: number | string) => request<any>(`/api/stats-content/articulos/${id}/view`, { method: "POST" }),
    incrementNumeroDownload: (numId: number | string) => request<any>(`/api/stats-content/numeros/${numId}/download`, { method: "POST" }),
    getRevistaStats: (revId: number | string) => request<any>(`/api/stats-content/revistas/${revId}/stats`),
  },
  galerada: {
    verHTML: (id: number | string) => `${BASE_URL}/api/galerada/articulos/${id}/galerada`,
    descargarPDF: (id: number | string) => `${BASE_URL}/api/galerada/articulos/${id}/download-galerada`,
    descargarJATS: (id: number | string) => `${BASE_URL}/api/galerada/articulos/${id}/jats`,
    verHTML5: (id: number | string) => `${BASE_URL}/api/galerada/articulos/${id}/html5`,
    descargarNumeroPDF: (numId: number | string) => `${BASE_URL}/api/galerada/numeros/${numId}/download-pdf`,
    publicarArticulo: (id: number | string, data: any) => request<any>(`/api/galerada/articulos/${id}/publicar`, { method: "POST", body: JSON.stringify(data) }),
    publicarNumero: (numId: number | string, data?: any) => request<any>(`/api/galerada/numeros/${numId}/publicar`, { method: "POST", body: JSON.stringify(data || {}) }),
  },
};
