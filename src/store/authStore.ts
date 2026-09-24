import { create } from 'zustand';
import { getDatabase } from '../database/database';
import { authApi } from '../services/authApi';
import { setAccessToken } from '../services/apiClient';
import { RegisterInput, User } from '../types/auth.types';

type AuthState = {
  user: User | null;
  refreshToken: string | null;
  loading: boolean;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateProfile: (input: { name?: string; timezone?: string; currency?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const persist = async (session: { accessToken: string; refreshToken: string; expiresIn: number; user: User }) => {
  const db = await getDatabase();
  await db.executeSql('INSERT OR REPLACE INTO auth_session (id, access_token, refresh_token, expires_in, user_json) VALUES (1, ?, ?, ?, ?)', [session.accessToken, session.refreshToken, session.expiresIn, JSON.stringify(session.user)]);
  setAccessToken(session.accessToken);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  refreshToken: null,
  loading: false,
  restoreSession: async () => {
    const db = await getDatabase();
    const [result] = await db.executeSql('SELECT * FROM auth_session WHERE id = 1');
    if (!result.rows.length) return;
    const row = result.rows.item(0);
    if (!row.access_token || !row.refresh_token || !row.user_json) return;
    let user: User;
    try { user = JSON.parse(row.user_json); } catch { return; }
    setAccessToken(row.access_token);
    set({ user, refreshToken: row.refresh_token });
    try {
      let currentUser: User;
      try {
        currentUser = await authApi.me();
      } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        const refreshed = await authApi.refresh(row.refresh_token);
        setAccessToken(refreshed.accessToken);
        await db.executeSql('UPDATE auth_session SET access_token = ?, expires_in = ? WHERE id = 1', [refreshed.accessToken, refreshed.expiresIn]);
        currentUser = await authApi.me();
      }
      set({ user: currentUser });
      await db.executeSql('UPDATE auth_session SET user_json = ? WHERE id = 1', [JSON.stringify(currentUser)]);
    } catch {
      // Keep the cached user for offline startup. A later API request can refresh the token.
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const session = await authApi.login(email, password);
      await persist(session);
      set({ user: session.user, refreshToken: session.refreshToken, loading: false });
    } catch (error) { set({ loading: false }); throw error; }
  },
  register: async input => {
    set({ loading: true });
    try {
      const session = await authApi.register(input);
      await persist(session);
      set({ user: session.user, refreshToken: session.refreshToken, loading: false });
    } catch (error) { set({ loading: false }); throw error; }
  },
  updateProfile: async input => {
    const user = await authApi.updateProfile(input);
    set({ user });
    const db = await getDatabase();
    await db.executeSql('UPDATE auth_session SET user_json = ? WHERE id = 1', [JSON.stringify(user)]);
  },
  logout: async () => {
    try { if (get().refreshToken) await authApi.logout(get().refreshToken!); } catch {}
    const db = await getDatabase();
    await db.executeSql('DELETE FROM auth_session WHERE id = 1');
    setAccessToken(null);
    set({ user: null, refreshToken: null });
  },
}));
