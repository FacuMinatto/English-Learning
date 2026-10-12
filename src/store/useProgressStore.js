import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getTodayStr } from '../utils/helpers';

// Backward compatibility helper to migrate old data
const migrateOldProgress = () => {
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
      localStorage.setItem('app-progress-storage', JSON.stringify({ state: migrated, version: 0 }));
    }
  } catch(e) {}
};

migrateOldProgress();

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
