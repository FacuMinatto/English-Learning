import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Preferences } from '@capacitor/preferences';

// Backward compatibility helper to migrate old data and sync with native Android Preferences
const migrateOldSettings = async () => {
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
      const payload = JSON.stringify({ state: migrated, version: 0 });
      localStorage.setItem('app-settings-storage', payload);
      try { await Preferences.set({ key: 'app-settings-storage', value: payload }); } catch {}
      useSettingsStore.setState(migrated);
      return;
    }

    // Check if Preferences has backup if localStorage was empty
    const currentLocal = localStorage.getItem('app-settings-storage');
    if (!currentLocal) {
      try {
        const { value } = await Preferences.get({ key: 'app-settings-storage' });
        if (value) {
          localStorage.setItem('app-settings-storage', value);
          const parsed = JSON.parse(value);
          if (parsed?.state) {
            useSettingsStore.setState(parsed.state);
          }
        }
      } catch {}
    } else {
      try {
        await Preferences.set({ key: 'app-settings-storage', value: currentLocal });
      } catch {}
    }
  } catch {}
};

// Immediate synchronous migration for legacy keys
try {
  const oldKeys = [
    'app_themeMode', 'app_themeColor', 'app_wordsPerDay', 
    'app_phrasesPerDay', 'app_voiceSpeed', 'app_soundFx', 
    'app_reminderEnabled', 'app_reminderSchedule'
  ];
  let hasOldData = false;
  const migrated = {};
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
} catch {}

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

// Synchronize state changes to native Preferences in background
useSettingsStore.subscribe((state) => {
  try {
    const payload = JSON.stringify({
      state: {
        themeMode: state.themeMode,
        themeColor: state.themeColor,
        wordsPerDay: state.wordsPerDay,
        phrasesPerDay: state.phrasesPerDay,
        voiceSpeed: state.voiceSpeed,
        soundEnabled: state.soundEnabled,
        reminderEnabled: state.reminderEnabled,
        reminderSchedule: state.reminderSchedule,
        voiceStrictMode: state.voiceStrictMode
      },
      version: 0
    });
    Preferences.set({ key: 'app-settings-storage', value: payload }).catch(() => {});
  } catch {}
});

// Run async check on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    migrateOldSettings();
  }, 100);
}
