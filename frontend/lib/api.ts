import type { Discussion, Lead, LeadStatus, User } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("leadflow_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.detail || "Something went wrong", response.status);
  }
  return response.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>("/api/auth/me"),
  leads: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== "All") params.set("status", status);
    if (search) params.set("search", search);
    return request<Lead[]>(`/api/leads?${params}`);
  },
  createLead: (data: { name: string; company?: string; phone?: string; email?: string }) =>
    request<Lead>("/api/leads", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: number, status: LeadStatus) =>
    request<Lead>(`/api/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  discussions: (id: number) => request<Discussion[]>(`/api/leads/${id}/discussions`),
  addDiscussion: (id: number, data: { note: string; follow_up_at?: string }) =>
    request<Discussion>(`/api/leads/${id}/discussions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
