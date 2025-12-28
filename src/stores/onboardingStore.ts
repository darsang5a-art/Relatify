import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  interests: string[];
  setHasCompletedOnboarding: (completed: boolean) => void;
  setInterests: (interests: string[]) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      interests: [],
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),
      setInterests: (interests) => set({ interests }),
      reset: () => set({ hasCompletedOnboarding: false, interests: [] }),
    }),
    {
      name: 'relatify-onboarding',
    }
  )
);
