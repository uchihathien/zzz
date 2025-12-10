import { httpClient } from './httpClient';
import { UserRole, AccountStatus } from '@/types';
import type { User } from '@/types';

export const customersService = {
    /**
     * [ADMIN] Lấy danh sách khách hàng
     */
    async getCustomers(): Promise<User[]> {
        return httpClient.get<User[]>('/api/admin/users', {
            params: { role: UserRole.USER },
        });
    },

    /**
     * [ADMIN] Lấy tất cả users (filter theo role nếu cần)
     */
    async getUsers(role?: UserRole): Promise<User[]> {
        return httpClient.get<User[]>('/api/admin/users', {
            params: role ? { role } : undefined,
        });
    },

    /**
     * [ADMIN] Cập nhật vai trò người dùng
     */
    async updateRole(userId: number, role: UserRole): Promise<User> {
        return httpClient.patch<User>(`/api/admin/users/${userId}/role`, null, {
            params: { role },
        });
    },

    /**
     * [ADMIN] Cập nhật trạng thái tài khoản (khóa/mở khóa)
     */
    async updateStatus(userId: number, status: AccountStatus): Promise<User> {
        return httpClient.patch<User>(`/api/admin/users/${userId}/status`, null, {
            params: { status },
        });
    },

    /**
     * [ADMIN] Khóa tài khoản
     */
    async lockAccount(userId: number): Promise<User> {
        return httpClient.patch<User>(`/api/admin/users/${userId}/status`, null, {
            params: { status: AccountStatus.SUSPENDED },
        });
    },

    /**
     * [ADMIN] Mở khóa tài khoản
     */
    async unlockAccount(userId: number): Promise<User> {
        return httpClient.patch<User>(`/api/admin/users/${userId}/status`, null, {
            params: { status: AccountStatus.ACTIVE },
        });
    },

    /**
     * [ADMIN] Đặt lại mật khẩu người dùng
     */
    async resetPassword(userId: number, newPassword: string): Promise<{ message: string; userId: string }> {
        return httpClient.patch<{ message: string; userId: string }>(
            `/api/admin/users/${userId}/reset-password`,
            { newPassword }
        );
    },
};

export default customersService;
