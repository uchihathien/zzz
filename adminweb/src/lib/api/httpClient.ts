/**
 * HTTP Client - Axios instance với interceptors cho JWT authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Lấy token từ localStorage
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Alias for OAuth callback compatibility
export const saveTokens = setTokens;

// API Error class
export class ApiError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(message: string, status: number, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

// Request options interface
interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    skipAuth?: boolean;
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint, API_URL);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.append(key, String(value));
            }
        });
    }
    return url.toString();
}

// Retry logic for token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            clearTokens();
            return null;
        }

        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    } catch {
        clearTokens();
        return null;
    }
}

// Main HTTP request function
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, skipAuth = false, ...fetchOptions } = options;

    const url = buildUrl(endpoint, params);
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    // Add auth header if not skipped
    if (!skipAuth) {
        const token = getAccessToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }

    const config: RequestInit = {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    // Debug log
    console.log('[HTTP]', fetchOptions.method, url);
    if (body) console.log('[HTTP] Body:', body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    config.signal = controller.signal;

    try {
        let response = await fetch(url, config);
        clearTimeout(timeoutId);

        console.log('[HTTP] Response:', response.status);

        // Handle 401 - try to refresh token
        if (response.status === 401 && !skipAuth) {
            if (!isRefreshing) {
                isRefreshing = true;
                const newToken = await refreshAccessToken();
                isRefreshing = false;

                if (newToken) {
                    onRefreshed(newToken);
                    // Retry with new token
                    (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
                    response = await fetch(url, { ...config, headers });
                } else {
                    // Redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/signin';
                    }
                    throw new ApiError('Phiên đăng nhập hết hạn', 401);
                }
            } else {
                // Wait for refresh to complete
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(async (token) => {
                        try {
                            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
                            const retryResponse = await fetch(url, { ...config, headers });
                            if (!retryResponse.ok) {
                                reject(new ApiError('Request failed after refresh', retryResponse.status));
                            }
                            resolve(await retryResponse.json());
                        } catch (err) {
                            reject(err);
                        }
                    });
                });
            }
        }

        // Handle error responses
        if (!response.ok) {
            let errorData: { message?: string; errors?: Record<string, string[]> } = {};
            try {
                errorData = await response.json();
                console.log('[HTTP] Error response:', errorData);
            } catch {
                // Response không phải JSON
            }
            throw new ApiError(
                errorData.message || `HTTP ${response.status}`,
                response.status,
                errorData.errors
            );
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) throw error;
        if ((error as Error).name === 'AbortError') {
            throw new ApiError('Request timeout', 408);
        }
        throw new ApiError('Lỗi kết nối mạng', 0);
    }
}

// HTTP methods
export const httpClient = {
    get: <T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'POST', body }),

    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'PUT', body }),

    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'PATCH', body }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Upload file function (for images)
export async function uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file'
): Promise<T> {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append(fieldName, file);

    const url = buildUrl(endpoint);
    console.log('[Upload] URL:', url);
    console.log('[Upload] File:', file.name, file.size, file.type);

    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        console.log('[Upload] Response status:', response.status);

        if (!response.ok) {
            let errorData: { message?: string; error?: string } = {};
            try {
                errorData = await response.json();
                console.log('[Upload] Error data:', errorData);
            } catch {
                const text = await response.text();
                console.log('[Upload] Error text:', text);
            }
            throw new ApiError(
                errorData.message || errorData.error || `Upload failed: HTTP ${response.status}`,
                response.status
            );
        }

        const result = await response.json();
        console.log('[Upload] Success:', result);
        return result;
    } catch (err) {
        console.error('[Upload] Error:', err);
        throw err;
    }
}

export default httpClient;
