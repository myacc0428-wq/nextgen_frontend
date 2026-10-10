export type Role = "user" | "admin";

export type ApiUser = {
  id: string;
  email: string;
  name?: string;
  role: Role;
  hasPaidSubscription?: boolean;
};

export type Drama = {
  id: string;
  name: string;
  description: string;
  genre: string;
  url: string;
  path?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Review = { id: string; rating: number; comment?: string | null; createdAt: string; user: { name: string } };
export type ReviewSummary = { reviews: Review[]; averageRating: number; total: number };

export type Genre = {
  id: string;
  name: string;
};

export type AuthSession = {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    const errorBody = payload.data as { message?: string } | undefined;
    throw new Error(payload.message || errorBody?.message || "The request could not be completed.");
  }

  return (payload.data ?? payload) as T;
}

export function readSession(): AuthSession | null {
  try {
    return JSON.parse(localStorage.getItem("cinegen_api_session") || "null") as AuthSession | null;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession | null) {
  if (session) localStorage.setItem("cinegen_api_session", JSON.stringify(session));
  else localStorage.removeItem("cinegen_api_session");
}
