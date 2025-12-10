/**
 * Auth Service - Quản lý đăng nhập, đăng ký, refresh token
 */
import { httpClient, setTokens, clearTokens } from './httpClient';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export const authService = {
    /**
     * Đăng nhập
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await httpClient.post<AuthResponse>(
            '/api/auth/login',
            credentials,
            { skipAuth: true }
        );
        setTokens(response.accessToken, response.refreshToken);
        return response;
    },

    /**
     * Đăng ký tài khoản mới
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await httpClient.post<AuthResponse>(
            '/api/auth/register',
            data,
            { skipAuth: true }
        );
        setTokens(response.accessToken, response.refreshToken);
        return response;
    },

    /**
     * Lấy thông tin user hiện tại
     */
    async getCurrentUser(): Promise<User> {
        return httpClient.get<User>('/api/auth/me');
    },

    /**
     * Đăng xuất
     */
    async logout(): Promise<void> {
        try {
            await httpClient.post('/api/auth/logout');
        } finally {
            clearTokens();
        }
    },

    /**
     * Kiểm tra đã đăng nhập (client-side)
     */
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('access_token');
    },
};

export default authService;
