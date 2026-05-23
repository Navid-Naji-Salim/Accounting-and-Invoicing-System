import type { Admin, Contact, Item, Summary } from "./types";

type LoginResponse = {
  token: string;
  admin: Admin;
};

type MeResponse = {
  admin: Admin;
};

export class ApiError extends Error {}

export const request = async <T>(
  path: string,
  token: string | null,
  options: RequestInit = {},
) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(payload.error ?? "Request failed.");
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/api/auth/login", null, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: (token: string) => request<MeResponse>("/api/auth/me", token),
  summary: (token: string) => request<Summary>("/api/summary", token),
  items: (token: string) => request<Item[]>("/api/items", token),
  customers: (token: string) => request<Contact[]>("/api/customers", token),
  vendors: (token: string) => request<Contact[]>("/api/vendors", token),
  createItem: (token: string, payload: Record<string, FormDataEntryValue>) =>
    request<Item>("/api/items", token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createContact: (
    token: string,
    kind: "customers" | "vendors",
    payload: Record<string, FormDataEntryValue>,
  ) =>
    request<Contact>(`/api/${kind}`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
