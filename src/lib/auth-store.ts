import { create } from "zustand";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogoUrl: string | null;
  storePrimaryColor: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{ accessToken: string }>("/api/v1/auth/login", {
        email,
        password,
      });

      localStorage.setItem("auth_token", data.accessToken);
      set({ token: data.accessToken });

      // Load user profile
      await get().loadUser();
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  loadUser: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await api.get<UserProfile>("/api/v1/auth/me");
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("auth_token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
