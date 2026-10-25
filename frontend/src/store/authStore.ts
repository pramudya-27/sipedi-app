import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'CITIZEN' | 'ADMIN' | 'OFFICER' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profile_picture?: string;
  phone?: string;
  nik?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  citizenUser: User | null;
  adminUser: User | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  syncPortalSession: () => void;
}

const isPathAdmin = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin');
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      citizenUser: null,
      adminUser: null,
      isAuthenticated: false,

      login: (userData: User, token?: string) => {
        const isAdmin = userData.role === 'ADMIN' || userData.role === 'OFFICER';
        if (isAdmin) {
          if (token) {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('token', token);
          }
          const currentIsAdmin = isPathAdmin();
          set({
            adminUser: userData,
            ...(currentIsAdmin ? { user: userData, isAuthenticated: true } : {})
          });
        } else {
          if (token) {
            localStorage.setItem('citizen_token', token);
            localStorage.setItem('token', token);
          }
          const currentIsAdmin = isPathAdmin();
          set({
            citizenUser: userData,
            ...(!currentIsAdmin ? { user: userData, isAuthenticated: true } : {})
          });
        }
      },

      logout: () => {
        const currentIsAdmin = isPathAdmin();
        if (currentIsAdmin) {
          localStorage.removeItem('admin_token');
          set(state => ({
            adminUser: null,
            user: state.citizenUser,
            isAuthenticated: !!state.citizenUser
          }));
        } else {
          localStorage.removeItem('citizen_token');
          set(state => ({
            citizenUser: null,
            user: state.adminUser,
            isAuthenticated: !!state.adminUser
          }));
        }
      },

      syncPortalSession: () => {
        const isAdmin = isPathAdmin();
        const state = get();
        const active = isAdmin ? state.adminUser : state.citizenUser;
        const currentId = state.user?.id;
        const activeId = active?.id;
        if (currentId !== activeId || state.isAuthenticated !== !!active) {
          set({
            user: active || null,
            isAuthenticated: !!active
          });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
