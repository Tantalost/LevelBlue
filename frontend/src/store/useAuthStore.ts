import { create } from 'zustand';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  roleLabel?: string;
  section?: string;
  status?: string;
  technical?: boolean;
  pre?: number;
  post?: number;
  sessions?: number;
  points?: number;
  mastery?: {
    Phishing?: number;
    Smishing?: number;
    Vishing?: number;
    Pretexting?: number;
    Baiting?: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateMastery: (topic: keyof NonNullable<User['mastery']>, probabilityKnown: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
  updateMastery: (topic, probabilityKnown) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          mastery: {
            ...state.user.mastery,
            [topic]: probabilityKnown,
          },
        },
      };
    }),
}));
