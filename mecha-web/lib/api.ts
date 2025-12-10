// lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Re-export types for backward compatibility
export type {
  UserRole,
  AuthProvider,
  AccountStatus,
  UserDto,
  AuthResponse,
  ServiceType,
  ServiceStatus,
  BookingStatus,
  ProductStatus,
  CategoryDto,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  TierPriceDto,
  ProductDto,
  ProductCreateRequest,
  ProductUpdateRequest,
  ServiceDto,
  ServiceCreateRequest,
  ServiceUpdateRequest,
  BookingDto,
  BookingCreateRequest,
  BookingUpdateStatusRequest,
  BookingAssignTechnicianRequest,
  PageRequest,
  PageResponse,
} from "./types";


// Error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generic fetch wrapper
async function fetchJson<TResponse>(
  path: string,
  options?: RequestInit
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = text;

    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.error || text;
    } catch {
      // Text is not JSON, use as-is
    }

    throw new ApiError(res.status, errorMessage || `Request failed: ${res.status}`, text);
  }

  // Handle empty responses
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  return {} as TResponse;
}

// GET request
export async function getJson<TResponse>(
  path: string,
  options?: RequestInit
): Promise<TResponse> {
  return fetchJson<TResponse>(path, {
    method: "GET",
    ...options,
  });
}

// POST request
export async function postJson<TRequest, TResponse>(
  path: string,
  body: TRequest,
  options?: RequestInit
): Promise<TResponse> {
  return fetchJson<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

// PUT request
export async function putJson<TRequest, TResponse>(
  path: string,
  body: TRequest,
  options?: RequestInit
): Promise<TResponse> {
  return fetchJson<TResponse>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
}

// DELETE request
export async function deleteJson<TResponse>(
  path: string,
  options?: RequestInit
): Promise<TResponse> {
  return fetchJson<TResponse>(path, {
    method: "DELETE",
    ...options,
  });
}

// PATCH request
export async function patchJson<TRequest, TResponse>(
  path: string,
  body: TRequest,
  options?: RequestInit
): Promise<TResponse> {
  return fetchJson<TResponse>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
}

