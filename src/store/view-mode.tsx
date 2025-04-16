import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { PersistOptions } from 'zustand/middleware';

type ViewModeType = 'list' | 'grid';

interface ViewModeState {
  mode: ViewModeType;
  setMode: (mode: ViewModeType) => void;
  expiresAt: number | null;
  randomizeMode: () => void;
}

const EXPIRE_TIME = 24 * 60 * 60 * 1000;

type ViewModePersist = Pick<ViewModeState, 'mode' | 'expiresAt'>;

const persistOptions: PersistOptions<ViewModeState, ViewModePersist> = {
  name: 'view-mode-storage',
  partialize: (state) => ({
    mode: state.mode,
    expiresAt: state.expiresAt,
  }),
};

export const useViewMode = create<ViewModeState>()(
  persist(
    (set, get) => ({
      mode: 'grid',
      expiresAt: null,

      setMode: (mode) => set({ mode }),

      randomizeMode: () => {
        const now = Date.now();
        const state = get();

        if (!state.expiresAt || now > state.expiresAt) {
          const randomMode = Math.random() < 0.5 ? 'grid' : 'list';
          const newExpiresAt = now + EXPIRE_TIME;

          set({
            mode: randomMode,
            expiresAt: newExpiresAt,
          });
        }
      },
    }),
    persistOptions,
  ),
);
