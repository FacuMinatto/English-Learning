import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getTodayStr } from '../utils/helpers';
import { Preferences } from '@capacitor/preferences';

// Backward compatibility helper to migrate old data and sync with native Android Preferences
const migrateOldProgress = async () => {
  try {
    let hasOldData = false;
    const migrated = {};

    const streak = localStorage.getItem('app_streak');
    if (streak) { hasOldData = true; migrated.streakData = JSON.parse(streak); }
    
    const wProg = localStorage.getItem('app_wordProgress');
    if (wProg) { hasOldData = true; migrated.wordProgress = JSON.parse(wProg); }
    
    const pProg = localStorage.getItem('app_phraseProgress');
    if (pProg) { hasOldData = true; migrated.phraseProgress = JSON.parse(pProg); }
    
    const cWords = localStorage.getItem('app_customWords');
    if (cWords) { hasOldData = true; migrated.customWords = JSON.parse(cWords); }

    if (hasOldData && !localStorage.getItem('app-progress-storage')) {
      const payload = JSON.stringify({ state: migrated, version: 0 });
      localStorage.setItem('app-progress-storage', payload);
      try { await Preferences.set({ key: 'app-progress-storage', value: payload }); } catch {}
      useProgressStore.setState(migrated);
      return;
    }

    // Check if Preferences has backup if localStorage was empty or default
    const currentLocal = localStorage.getItem('app-progress-storage');
    let hasActiveLocalData = false;
    if (currentLocal) {
      try {
        const parsedLocal = JSON.parse(currentLocal);
        hasActiveLocalData = parsedLocal?.state && (
          (parsedLocal.state.wordProgress && Object.keys(parsedLocal.state.wordProgress).length > 0) ||
          (parsedLocal.state.phraseProgress && Object.keys(parsedLocal.state.phraseProgress).length > 0) ||
          (parsedLocal.state.streakData?.count > 1)
        );
      } catch {}
    }

    if (!hasActiveLocalData) {
      try {
        const { value } = await Preferences.get({ key: 'app-progress-storage' });
        if (value) {
          const parsedPref = JSON.parse(value);
          if (parsedPref?.state && (
            (parsedPref.state.wordProgress && Object.keys(parsedPref.state.wordProgress).length > 0) ||
            (parsedPref.state.phraseProgress && Object.keys(parsedPref.state.phraseProgress).length > 0)
          )) {
            localStorage.setItem('app-progress-storage', value);
            useProgressStore.setState(parsedPref.state);
          }
        }
      } catch {}
    } else {
      // Mirror active local progress to native Preferences for safekeeping
      try {
        await Preferences.set({ key: 'app-progress-storage', value: currentLocal });
      } catch {}
    }
  } catch {}
};

// Run migration synchronously for immediate localStorage check
try {
  const streak = localStorage.getItem('app_streak');
  const wProg = localStorage.getItem('app_wordProgress');
  const pProg = localStorage.getItem('app_phraseProgress');
  const cWords = localStorage.getItem('app_customWords');
  if ((streak || wProg || pProg || cWords) && !localStorage.getItem('app-progress-storage')) {
    const migrated = {};
    if (streak) migrated.streakData = JSON.parse(streak);
    if (wProg) migrated.wordProgress = JSON.parse(wProg);
    if (pProg) migrated.phraseProgress = JSON.parse(pProg);
    if (cWords) migrated.customWords = JSON.parse(cWords);
    localStorage.setItem('app-progress-storage', JSON.stringify({ state: migrated, version: 0 }));
  }
} catch {}

export const useProgressStore = create(
  persist(
    (set) => ({
      streakData: {
        count: 1,
        lastDate: null,
        todayActivities: {
          date: getTodayStr(),
          dailyCompleted: false,
          quizCompleted: false,
          phrasesReviewed: 0
        }
      },
      setStreakData: (data) => set((state) => ({ 
        streakData: typeof data === 'function' ? data(state.streakData) : data 
      })),

      wordProgress: {},
      setWordProgress: (progress) => set((state) => ({
        wordProgress: typeof progress === 'function' ? progress(state.wordProgress) : progress
      })),

      phraseProgress: {},
      setPhraseProgress: (progress) => set((state) => ({
        phraseProgress: typeof progress === 'function' ? progress(state.phraseProgress) : progress
      })),

      customWords: [],
      setCustomWords: (words) => set((state) => ({
        customWords: typeof words === 'function' ? words(state.customWords) : words
      }))
    }),
    {
      name: 'app-progress-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.streakData) {
          if (!state.streakData.todayActivities || state.streakData.todayActivities.date !== getTodayStr()) {
            state.streakData.todayActivities = {
              date: getTodayStr(),
              dailyCompleted: false,
              quizCompleted: false,
              phrasesReviewed: 0
            };
          }
        }
      }
    }
  )
);

// Synchronize state changes to native Preferences in background
useProgressStore.subscribe((state) => {
  try {
    const payload = JSON.stringify({
      state: {
        streakData: state.streakData,
        wordProgress: state.wordProgress,
        phraseProgress: state.phraseProgress,
        customWords: state.customWords
      },
      version: 0
    });
    Preferences.set({ key: 'app-progress-storage', value: payload }).catch(() => {});
  } catch {}
});

// Run async check & recovery on app start
if (typeof window !== 'undefined') {
  setTimeout(() => {
    migrateOldProgress();
  }, 100);
}
