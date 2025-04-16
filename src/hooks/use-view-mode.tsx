'use client';

import { useEffect } from 'react';

import { useViewMode as useViewModeStore } from '@/store/view-mode';

export default function useViewMode() {
  const { mode, setMode, randomizeMode } = useViewModeStore();

  useEffect(() => {
    randomizeMode();
  }, [randomizeMode]);

  return {
    viewMode: mode,
    setViewMode: setMode,
  };
}
