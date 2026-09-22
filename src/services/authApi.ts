import { apiClient } from './apiClient';
import { LoginResponse, RegisterInput } from '../types/auth.types';

export const authApi = {
  async register(input: RegisterInput): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', input);
    return response.data.data;
  },
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data.data;
  },
  async logout(refreshToken: string) {
    await apiClient.post('/auth/logout', { refreshToken });
  },
  async me() {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
  async updateProfile(input: { name?: string; timezone?: string; currency?: string }) {
    const response = await apiClient.put('/auth/me', input);
    return response.data.data;
  },
};
