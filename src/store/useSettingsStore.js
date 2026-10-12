import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Backward compatibility helper to migrate old data
const migrateOldSettings = () => {
  const oldKeys = [
    'app_themeMode', 'app_themeColor', 'app_wordsPerDay', 
    'app_phrasesPerDay', 'app_voiceSpeed', 'app_soundFx', 
    'app_reminderEnabled', 'app_reminderSchedule'
  ];
  
  let hasOldData = false;
  const migrated = {};

  try {
    oldKeys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val !== null) {
        hasOldData = true;
        const parsed = JSON.parse(val);
        const newKey = key.replace('app_', '');
        if (newKey === 'soundFx') migrated.soundEnabled = parsed;
        else migrated[newKey] = parsed;
      }
    });

    if (hasOldData && !localStorage.getItem('app-settings-storage')) {
      localStorage.setItem('app-settings-storage', JSON.stringify({ state: migrated, version: 0 }));
    }
  } catch(e) {}
};

migrateOldSettings();

export const useSettingsStore = create(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),

      themeColor: '#28C28C',
      setThemeColor: (color) => set({ themeColor: color }),

      wordsPerDay: 5,
      setWordsPerDay: (words) => set((state) => ({ wordsPerDay: typeof words === 'function' ? words(state.wordsPerDay) : words })),

      phrasesPerDay: 5,
      setPhrasesPerDay: (phrases) => set((state) => ({ phrasesPerDay: typeof phrases === 'function' ? phrases(state.phrasesPerDay) : phrases })),

      voiceSpeed: 0.85,
      setVoiceSpeed: (speed) => set((state) => ({ voiceSpeed: typeof speed === 'function' ? speed(state.voiceSpeed) : speed })),

      soundEnabled: true,
      setSoundEnabled: (enabled) => set((state) => ({ soundEnabled: typeof enabled === 'function' ? enabled(state.soundEnabled) : enabled })),

      reminderEnabled: true,
      setReminderEnabled: (enabled) => set((state) => ({ reminderEnabled: typeof enabled === 'function' ? enabled(state.reminderEnabled) : enabled })),

      reminderSchedule: ['10:00', '14:00', '18:00', '21:00', '23:00'],
      setReminderSchedule: (schedule) => set((state) => ({ reminderSchedule: typeof schedule === 'function' ? schedule(state.reminderSchedule) : schedule })),
      
      voiceStrictMode: false,
      setVoiceStrictMode: (strict) => set((state) => ({ voiceStrictMode: typeof strict === 'function' ? strict(state.voiceStrictMode) : strict })),
    }),
    {
      name: 'app-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
