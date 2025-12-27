import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  interests: string[];
  learningStyle: string | null;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setInterests: (interests: string[]) => void;
  setLearningStyle: (style: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      interests: [],
      learningStyle: null,
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),
      setInterests: (interests) => set({ interests }),
      setLearningStyle: (style) => set({ learningStyle: style }),
      reset: () => set({ hasCompletedOnboarding: false, interests: [], learningStyle: null }),
    }),
    {
      name: 'relatify-onboarding',
    }
  )
);
