import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense, lazy } from 'react';
import confetti from 'canvas-confetti';
import { 
  BookOpen, 
  MessageCircle, 
  Library, 
  Sun, 
  Moon, 
  Smartphone,
  Volume2, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Bell, 
  RotateCcw, 
  Globe, 
  Settings, 
  X,
  Target,
  Flame,
  Mic,
  ChevronDown,
  Download,
  Upload,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  Palette,
  Gamepad2,
  Trophy,
  ArrowLeft,
  RefreshCw,
  Copy
} from 'lucide-react';
import './App.css';
import { initialDictionary, initialPhrases } from './data';
import { getWordDetails } from './wordEnricher';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/facundo-manuel-minatto-225b77381/?isSelfProfile=true';

import { 
  getSaved, hexToRgb, adjustColorBrightness, shuffleArray, 
  getTodayStr, seededShuffle, triggerHaptic 
} from './utils/helpers';
import { 
  getIntervals, formatInterval, getTimeUntilReview, getDetailedReviewDate 
} from './utils/spacedRepetition';
import { useSettingsStore } from './store/useSettingsStore';
import { useProgressStore } from './store/useProgressStore';
const WordleGame = lazy(() => import('./components/WordleGame'));
const ListenWriteGame = lazy(() => import('./components/ListenWriteGame'));
const LeaderboardView = lazy(() => import('./components/LeaderboardView'));
import { addFriendLocally, getUserProfile } from './services/leaderboardService';

import { 
  checkPronunciationMatch, 
  startListeningAudio, 
  stopListeningAudio, 
  playFxSound 
} from './utils/audioEngine';

import {
  initNotificationChannel,
  checkNotificationPermission,
  requestNotificationPermission as requestNativeNotificationPermission,
  sendImmediateNotification,
  syncScheduledReminders
} from './utils/notificationScheduler';
import { getAppInfo, checkAppUpdates, executeUpdate, APK_DIRECT_URL } from './utils/updateManager';

// Audio and Speech logic has been extracted to utils/audioEngine.js

const COLOR_PALETTES = [
  { name: 'Esmeralda', hex: '#28C28C' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Violeta', hex: '#8B5CF6' },
  { name: 'Cian', hex: '#06B6D4' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Azul', hex: '#3B82F6' }
];

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('friendId')) return 'leaderboard';
      } catch {}
    }
    const saved = getSaved('app_activeTab', 'daily');
    return saved === 'quiz' ? 'games' : saved;
  });
  
  // 3-state theme: 'system' | 'light' | 'dark'
  const { 
    themeMode, setThemeMode, 
    themeColor, setThemeColor, 
    wordsPerDay, setWordsPerDay, 
    phrasesPerDay, setPhrasesPerDay, 
    voiceSpeed, setVoiceSpeed, 
    soundEnabled, setSoundEnabled,
    reminderEnabled, setReminderEnabled,
    reminderSchedule, setReminderSchedule
  } = useSettingsStore();

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  
  // Multi-option Daily Streak Tracking
  const { streakData, setStreakData, wordProgress, setWordProgress, phraseProgress, setPhraseProgress, customWords, setCustomWords } = useProgressStore();

  // Modals state
  const [showSettings, setShowSettings] = useState(false);
  const [isClosingSettings, setIsClosingSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general'); // 'general' | 'alerts' | 'study'
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Dictionary state & Performance Optimization
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dictSortOrder, setDictSortOrder] = useState('random'); // 'random' | 'az'
  const [randomSeed, setRandomSeed] = useState(() => Math.floor(Math.random() * 1000));
  const [visibleCount, setVisibleCount] = useState(40);
  const [isTranslating, setIsTranslating] = useState(false);

  // Card transition animation state
  const [cardAnimClass, setCardAnimClass] = useState('card-anim-entering');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Optional Voice Recognition Practice
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState(null);

  // Daily Session Tab
  const [studyQueue, setStudyQueue] = useState([]);
  const [initialQueueLength, setInitialQueueLength] = useState(0);
  const [showStudyTranslation, setShowStudyTranslation] = useState(false);
  const [studyCompleted, setStudyCompleted] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  
  // Phrases Tab
  const [phraseQueue, setPhraseQueue] = useState([]);
  const [initialPhraseQueueLength, setInitialPhraseQueueLength] = useState(0);
  const [phraseStudyCompleted, setPhraseStudyCompleted] = useState(false);
  const [showPhraseTranslation, setShowPhraseTranslation] = useState(false);
  const [continuousPhraseMode, setContinuousPhraseMode] = useState(false);

  // Games Arcade State: null (Hub) | 'quiz' | 'voice' | 'scramble'
  const [selectedGame, setSelectedGame] = useState(null);

  // Quiz Mode State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizCurrentIdx, setQuizCurrentIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Voice Pronunciation Game State
  const [voiceWords, setVoiceWords] = useState([]);
  const [voiceCurrentIdx, setVoiceCurrentIdx] = useState(0);
  const [voiceScore, setVoiceScore] = useState(0);
  const [voiceIsListening, setVoiceIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'listening' | 'success' | 'retry'
  const [voiceHeardText, setVoiceHeardText] = useState('');
  const [voiceFeedbackMsg, setVoiceFeedbackMsg] = useState('');
  const [voiceFinished, setVoiceFinished] = useState(false);

  // Word Scramble Game State
  const [scrambleWords, setScrambleWords] = useState([]);
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleAvailableLetters, setScrambleAvailableLetters] = useState([]);
  const [scrambleSelectedLetters, setScrambleSelectedLetters] = useState([]);
  const [scrambleStatus, setScrambleStatus] = useState('playing'); // 'playing' | 'success' | 'wrong'
  const [scrambleFinished, setScrambleFinished] = useState(false);

  // Multi-Alert Daily Streak Notification State
  const [sentAlerts, setSentAlerts] = useState(() => {
    const saved = getSaved('app_sentAlerts', { date: getTodayStr(), times: [] });
    return saved.date === getTodayStr() ? saved : { date: getTodayStr(), times: [] };
  });
  const [newAlertTime, setNewAlertTime] = useState('16:00');
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Initialize notification channel and check current permission on mount
  useEffect(() => {
    initNotificationChannel();
    checkNotificationPermission().then(perm => {
      if (perm) setNotificationPermission(perm);
    });
  }, []);

  // Detect friend invite link from URL (?friendId=...&friendName=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const fId = params.get('friendId');
        const fName = params.get('friendName');
        const fAvatar = params.get('friendAvatar');
        if (fId) {
          const cleanFId = String(fId).trim().slice(0, 64);
          const cleanFName = String(fName || 'Amigo').trim().slice(0, 24);
          const cleanFAvatar = typeof fAvatar === 'string' && fAvatar.length <= 4 ? fAvatar.trim() : '⚡';
          const myProfile = getUserProfile();
          if (cleanFId && cleanFId !== myProfile.userId) {
            addFriendLocally({
              userId: cleanFId,
              name: cleanFName,
              avatar: cleanFAvatar
            });
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {}
    }
  }, []);

  // App Version & Update State
  const [updateState, setUpdateState] = useState({
    status: 'idle', // 'idle' | 'checking' | 'upToDate' | 'available' | 'error'
    info: null,
    errorMsg: ''
  });

  const handleCheckUpdates = useCallback(async () => {
    setUpdateState({ status: 'checking', info: null, errorMsg: '' });
    triggerHaptic(15);
    playFxSound('click', soundEnabled);
    try {
      const res = await checkAppUpdates();
      if (!res.success) {
        setUpdateState({ status: 'error', info: null, errorMsg: res.error });
      } else if (res.hasUpdate) {
        setUpdateState({ status: 'available', info: res, errorMsg: '' });
      } else {
        setUpdateState({ status: 'upToDate', info: res, errorMsg: '' });
      }
    } catch {
      setUpdateState({ status: 'error', info: null, errorMsg: 'Error al comprobar actualizaciones.' });
    }
  }, [soundEnabled]);

  const handleApplyUpdate = useCallback(async () => {
    triggerHaptic(25);
    playFxSound('success', soundEnabled);
    await executeUpdate(updateState.info);
  }, [soundEnabled, updateState.info]);

  // Celebration & Rich Details States
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [expandedWordId, setExpandedWordId] = useState(null);
  const [playingWordId, setPlayingWordId] = useState(null);

  // Native back button handling
  useEffect(() => {
    const handleBackButton = async () => {
      if (celebrationActive) {
        setCelebrationActive(false);
      } else if (showSettings) {
        setIsClosingSettings(true);
        setTimeout(() => setShowSettings(false), 300);
      } else if (showStreakModal) {
        setShowStreakModal(false);
      } else if (selectedGame) {
        setSelectedGame(null);
      } else if (expandedWordId) {
        setExpandedWordId(null);
      } else {
        try {
          await CapacitorApp.exitApp();
        } catch {
          // Ignore if not native
        }
      }
    };

    let backListener = null;
    const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform();
    
    if (isNative) {
      CapacitorApp.addListener('backButton', handleBackButton).then(listener => {
        backListener = listener;
      });
    }

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
    };
  }, [
    celebrationActive,
    showSettings,
    showStreakModal,
    selectedGame,
    expandedWordId
  ]);

  const fileInputRef = useRef(null);

  const fullDictionary = useMemo(() => [...customWords, ...initialDictionary], [customWords]);

  // System theme preference listener
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDarkActive = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  useEffect(() => {
    if (isDarkActive) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [themeMode, isDarkActive]);

  // Persist and apply dynamic theme styling across light and dark modes
  useEffect(() => { 
    const { r, g, b } = hexToRgb(themeColor);
    const glowAlpha = isDarkActive ? 0.35 : 0.25;
    const lightAlpha = isDarkActive ? 0.16 : 0.12;
    const primaryGlow = `rgba(${r}, ${g}, ${b}, ${glowAlpha})`;
    const primaryLight = `rgba(${r}, ${g}, ${b}, ${lightAlpha})`;
    const primaryDark = adjustColorBrightness(themeColor, isDarkActive ? 20 : -15);

    const elements = [document.documentElement, document.body];
    elements.forEach(el => {
      if (!el) return;
      el.style.setProperty('--primary-color', themeColor);
      el.style.setProperty('--primary-glow', primaryGlow);
      el.style.setProperty('--primary-light', primaryLight);
      el.style.setProperty('--primary-dark', primaryDark);
      el.style.setProperty('--success-color', themeColor);
    });
  }, [themeColor, isDarkActive]);

  // Periodic review clock: keeps review counts and overdue cards automatically synchronized
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimestamp(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const triggerConfetti = useCallback(() => {
    confetti({ 
      particleCount: 90, 
      spread: 70, 
      origin: { y: 0.6 }, 
      colors: [themeColor, '#60A5FA', '#FBBF24', '#F472B6'] 
    });
  }, [themeColor]);

  const startNewSession = useCallback((isAdvance = false, limitWords = wordsPerDay) => {
    const today = getTodayStr();
    if (!isAdvance && streakData.todayActivities?.date === today && streakData.todayActivities?.dailyCompleted) {
      setStudyCompleted(true);
      setStudyQueue([]);
      return;
    }

    const now = Date.now();
    const effectiveLimit = Math.max(limitWords || 5, 1);
    let newQueue = [];

    if (isAdvance) {
      // Advance session: pick upcoming scheduled words (randomized) + unlearned words
      const upcomingWords = shuffleArray(
        fullDictionary.filter(w => wordProgress[w.id] && wordProgress[w.id].nextReview > now)
      ).slice(0, effectiveLimit).map(w => ({ ...w, type: 'word' }));

      const unlearnedWords = fullDictionary.filter(w => !wordProgress[w.id]);
      const randomUnlearned = shuffleArray(unlearnedWords).slice(0, effectiveLimit).map(w => ({ ...w, type: 'word' }));

      if (upcomingWords.length > 0) {
        newQueue = shuffleArray(upcomingWords);
      } else if (randomUnlearned.length > 0) {
        newQueue = randomUnlearned;
      } else {
        newQueue = shuffleArray(fullDictionary).slice(0, effectiveLimit).map(w => ({ ...w, type: 'word' }));
      }
    } else {
      // 1. ALL words due for review today (spaced repetition) - NEVER CAPPED OR TRUNCATED!
      const dueWords = shuffleArray(
        fullDictionary
          .filter(w => wordProgress[w.id] && wordProgress[w.id].nextReview <= now)
          .map(w => ({ ...w, type: 'word' }))
      );

      // 2. New unlearned words strictly limited by wordsPerDay (e.g. 5)
      const unlearnedWords = fullDictionary.filter(w => !wordProgress[w.id]);
      const randomUnlearned = shuffleArray(unlearnedWords);
      const newWords = randomUnlearned.slice(0, effectiveLimit).map(w => ({ ...w, type: 'word' }));

      // 3. Combined queue: Interleaved and thoroughly randomized
      newQueue = shuffleArray([...dueWords, ...newWords]);

      // 4. Fallback if user already learned everything and nothing is currently due
      if (newQueue.length === 0) {
        newQueue = shuffleArray(fullDictionary).slice(0, effectiveLimit).map(w => ({ ...w, type: 'word' }));
      }
    }

    const shuffledQueue = shuffleArray(newQueue);

    if (shuffledQueue.length === 0) {
      setStudyCompleted(true);
      setStudyQueue([]);
    } else {
      setStudyQueue(shuffledQueue);
      setInitialQueueLength(shuffledQueue.length);
      setShowStudyTranslation(false);
      setStudyCompleted(false);
      setCardAnimClass('card-anim-entering');
      setSpeechFeedback(null);
    }
  }, [fullDictionary, wordProgress, streakData, wordsPerDay]);

  const startNewPhraseSession = useCallback((isExtra = false, limitPhrases = phrasesPerDay) => {
    const today = getTodayStr();
    if (!isExtra && streakData.todayActivities?.date === today && (streakData.todayActivities?.phrasesReviewed || 0) >= 5) {
      setPhraseStudyCompleted(true);
      setPhraseQueue([]);
      return;
    }

    const now = Date.now();
    const effectiveLimit = Math.max(limitPhrases || 5, 1);
    let batch = [];

    if (isExtra) {
      const upcomingPhrases = shuffleArray(
        initialPhrases.filter(p => phraseProgress[p.id] && phraseProgress[p.id].nextReview > now)
      ).slice(0, effectiveLimit);
      
      const unlearned = initialPhrases.filter(p => !phraseProgress[p.id]);
      const randomPhrases = shuffleArray(unlearned).slice(0, effectiveLimit);

      if (upcomingPhrases.length > 0) {
        batch = shuffleArray(upcomingPhrases);
      } else if (randomPhrases.length > 0) {
        batch = randomPhrases;
      } else {
        batch = shuffleArray(initialPhrases).slice(0, effectiveLimit);
      }
    } else {
      // 1. Spaced-repetition due phrases (ALL due phrases included, no capping!)
      const duePhrases = shuffleArray(
        initialPhrases.filter(p => phraseProgress[p.id] && phraseProgress[p.id].nextReview <= now)
      );
      
      // 2. New unlearned phrases strictly limited by limitPhrases
      const unlearned = initialPhrases.filter(p => !phraseProgress[p.id]);
      const randomPhrases = shuffleArray(unlearned);
      const newPhrases = randomPhrases.slice(0, effectiveLimit);

      batch = shuffleArray([...duePhrases, ...newPhrases]);

      // 3. Fallback if all learned and none due
      if (batch.length === 0) {
        batch = shuffleArray(initialPhrases).slice(0, effectiveLimit);
      }
    }

    const shuffled = shuffleArray(batch);
    setPhraseQueue(shuffled);
    setInitialPhraseQueueLength(shuffled.length);
    setPhraseStudyCompleted(false);
    setShowPhraseTranslation(false);
    setCardAnimClass('card-anim-entering');
    setSpeechFeedback(null);
  }, [phraseProgress, streakData, phrasesPerDay]);

  // Endless / Continuous Study Mode (Does not steal tomorrow's cards, keeps streak safe)
  const startContinuousSession = useCallback(() => {
    setContinuousMode(true);
    setStudyCompleted(false);
    setShowStudyTranslation(false);
    setSpeechFeedback(null);
    setCardAnimClass('card-anim-entering');

    // ONLY select unlearned words so we NEVER touch or steal future scheduled reviews!
    const unlearnedWords = fullDictionary.filter(w => !wordProgress[w.id]);
    const randomUnlearned = shuffleArray(unlearnedWords);
    
    let batch = [];
    if (randomUnlearned.length > 0) {
      batch = randomUnlearned.slice(0, 12).map(w => ({ ...w, type: 'word' }));
    } else {
      // If user literally learned all words in dictionary, pick random for free practice
      batch = shuffleArray(fullDictionary).slice(0, 12).map(w => ({ ...w, type: 'word' }));
    }

    setStudyQueue(batch);
    setInitialQueueLength(batch.length);
  }, [fullDictionary, wordProgress]);

  const stopContinuousSession = useCallback((type = 'word') => {
    if (type === 'word') {
      setContinuousMode(false);
      setStudyCompleted(true);
      setStudyQueue([]);
      setCelebrationMessage('¡Sesión libre finalizada! Tus palabras aprendidas y racha quedaron 100% guardadas. 🔥');
    } else {
      setContinuousPhraseMode(false);
      setPhraseStudyCompleted(true);
      setPhraseQueue([]);
      setCelebrationMessage('¡Sesión libre de frases finalizada! Tu progreso quedó 100% guardado. 🔥');
    }
    setCelebrationActive(true);
    playFxSound('fanfare', soundEnabled);
    triggerConfetti();
    triggerHaptic(50);
  }, [soundEnabled, triggerConfetti]);

  const startContinuousPhraseSession = useCallback(() => {
    setContinuousPhraseMode(true);
    setPhraseStudyCompleted(false);
    setShowPhraseTranslation(false);
    setSpeechFeedback(null);
    setCardAnimClass('card-anim-entering');

    const unlearned = initialPhrases.filter(p => !phraseProgress[p.id]);
    const randomPhrases = shuffleArray(unlearned);
    
    let batch = [];
    if (randomPhrases.length > 0) {
      batch = randomPhrases.slice(0, 12);
    } else {
      batch = shuffleArray(initialPhrases).slice(0, 12);
    }

    setPhraseQueue(batch);
    setInitialPhraseQueueLength(batch.length);
  }, [phraseProgress]);

  const loadNewPhrases = useCallback((limit = phrasesPerDay || 5) => {
    const unlearned = initialPhrases.filter(p => !phraseProgress[p.id]);
    const randomPhrases = shuffleArray(unlearned);
    let batch = [];
    if (randomPhrases.length > 0) {
      batch = randomPhrases.slice(0, Math.max(limit, 1));
    } else {
      batch = shuffleArray(initialPhrases).slice(0, Math.max(limit, 1));
    }
    setPhraseQueue(batch);
    setInitialPhraseQueueLength(batch.length);
    setPhraseStudyCompleted(false);
    setShowPhraseTranslation(false);
    setCardAnimClass('card-anim-entering');
    setSpeechFeedback(null);
    setContinuousPhraseMode(false);
  }, [phraseProgress, phrasesPerDay]);

  const reviewLearnedPhrases = useCallback((limit = phrasesPerDay || 5) => {
    const learned = initialPhrases.filter(p => phraseProgress[p.id]);
    let batch = [];
    if (learned.length > 0) {
      batch = shuffleArray(learned).slice(0, Math.max(limit, 1));
    } else {
      batch = shuffleArray(initialPhrases).slice(0, Math.max(limit, 1));
    }
    setPhraseQueue(batch);
    setInitialPhraseQueueLength(batch.length);
    setPhraseStudyCompleted(false);
    setShowPhraseTranslation(false);
    setCardAnimClass('card-anim-entering');
    setSpeechFeedback(null);
    setContinuousPhraseMode(false);
  }, [phraseProgress, phrasesPerDay]);

  // Initialize daily review queues only once on application mount (prevents queue wipe on rating)
  const hasInitializedSessions = useRef(false);
  useEffect(() => {
    if (!hasInitializedSessions.current) {
      hasInitializedSessions.current = true;
      startNewSession();
      startNewPhraseSession();
    }
  }, [startNewSession, startNewPhraseSession]);

  // Debounce search and reset pagination without cascading re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setVisibleCount(40);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [prevFilterParams, setPrevFilterParams] = useState({ categoryFilter, dictSortOrder, randomSeed });
  if (
    prevFilterParams.categoryFilter !== categoryFilter ||
    prevFilterParams.dictSortOrder !== dictSortOrder ||
    prevFilterParams.randomSeed !== randomSeed
  ) {
    setPrevFilterParams({ categoryFilter, dictSortOrder, randomSeed });
    setVisibleCount(40);
  }

  // Calculate if the daily streak requirement is met today (any of the 3 paths)
  const isStreakMetToday = useMemo(() => {
    const today = getTodayStr();
    if (streakData.lastDate === today) return true;
    const acts = streakData.todayActivities;
    if (!acts || acts.date !== today) return false;
    return acts.dailyCompleted || acts.quizCompleted || (acts.phrasesReviewed >= 5);
  }, [streakData]);

  // Pre-warm SpeechSynthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Flexible Multi-Path Streak Recorder
  const recordActivityAndCheckStreak = useCallback((activityType, incrementVal = 1) => {
    const today = getTodayStr();
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    setStreakData(prev => {
      const currentActs = (prev.todayActivities && prev.todayActivities.date === today)
        ? { ...prev.todayActivities }
        : { date: today, dailyCompleted: false, quizCompleted: false, phrasesReviewed: 0, cardsReviewedToday: 0 };

      currentActs.cardsReviewedToday = (currentActs.cardsReviewedToday || 0) + incrementVal;
      if (activityType === 'daily') currentActs.dailyCompleted = true;
      if (activityType === 'quiz') currentActs.quizCompleted = true;
      if (activityType === 'phrase') currentActs.phrasesReviewed += incrementVal;

      const fulfillsGoal = currentActs.dailyCompleted || currentActs.quizCompleted || currentActs.phrasesReviewed >= 5 || (currentActs.cardsReviewedToday >= (wordsPerDay || 10));

      let newCount = prev.count;
      let newLastDate = prev.lastDate;

      // First time meeting any goal today: increment streak and celebrate!
      if (fulfillsGoal && prev.lastDate !== today) {
        newLastDate = today;
        newCount = (prev.lastDate === yesterday) ? prev.count + 1 : (prev.count === 0 ? 1 : prev.count);
        playFxSound('fanfare', soundEnabled);
        triggerConfetti();
        triggerHaptic(50);
        setCelebrationMessage(`¡Racha de ${newCount} días asegurada! 🔥`);
        setCelebrationActive(true);
      }

      return {
        count: newCount,
        lastDate: newLastDate,
        todayActivities: currentActs
      };
    });
  }, [soundEnabled, wordsPerDay, triggerConfetti, setStreakData]);

  const cycleTheme = () => {
    if (themeMode === 'system') setThemeMode('light');
    else if (themeMode === 'light') setThemeMode('dark');
    else setThemeMode('system');
  };

  // We use a ref to track what's currently playing to allow toggling
  const currentlySpeakingRef = useRef(null);

  const stopAllAudio = useCallback(async () => {
    setIsPlayingAudio(false);
    currentlySpeakingRef.current = null;
    try {
      if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        await TextToSpeech.stop();
      }
    } catch {}
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakText = useCallback(async (text, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!text) return;

    const clean = text.trim();

    // Stop any previous audio before starting new one
    await stopAllAudio();

    setIsPlayingAudio(true);
    currentlySpeakingRef.current = clean;

    let nativeWorked = false;
    try {
      // 1. Android Native TTS via @capacitor-community/text-to-speech
      // Directly binds to android.speech.tts.TextToSpeech on the device
      await TextToSpeech.speak({
        text: clean,
        lang: 'en-US',
        rate: voiceSpeed || 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'playback'
      });
      nativeWorked = true;
      setIsPlayingAudio(false);
    } catch (pluginErr) {
      console.warn('Native TTS plugin fallback:', pluginErr);
    }

    if (!nativeWorked) {
      // Fallback for browser / PC dev mode
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel(); // Clears any queued utterances
          
          setTimeout(() => {
            window.speechSynthesis.resume();
            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.lang = 'en-US';
            utterance.rate = voiceSpeed || 1.0;
            const voices = window.speechSynthesis.getVoices();
            const enVoice = voices.find(v => v.lang && (v.lang === 'en-US' || v.lang.startsWith('en')));
            if (enVoice) utterance.voice = enVoice;
            utterance.onend = () => setIsPlayingAudio(false);
            utterance.onerror = () => setIsPlayingAudio(false);
            window.speechSynthesis.speak(utterance);
          }, 50);
        } catch {
          setIsPlayingAudio(false);
        }
      } else {
        setIsPlayingAudio(false);
      }
    }

    setTimeout(() => setIsPlayingAudio(false), 2200);
  }, [voiceSpeed, stopAllAudio]);

  // Optional Voice Recognition Practice on Flashcard
  const testPronunciation = async (targetWord, e) => {
    if (e) e.stopPropagation();
    if (isListening) {
      await stopListeningAudio();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setSpeechFeedback(null);

    const res = await startListeningAudio({ language: 'en-US' });
    setIsListening(false);

    if (res.success && res.matches && res.matches.length > 0) {
      const matchResult = checkPronunciationMatch(targetWord, res.matches);
      if (matchResult.matched) {
        setSpeechFeedback({ success: true, text: `¡Pronunciación excelente! 🎯 ("${matchResult.heard}")` });
        playFxSound('success', soundEnabled);
        triggerHaptic(50);
      } else {
        setSpeechFeedback({ success: false, text: `Escuchamos: "${matchResult.heard}". ¡Sigue practicando!` });
        playFxSound('again', soundEnabled);
        triggerHaptic(30);
      }
    } else if (res.error) {
      setSpeechFeedback({ success: false, text: res.error });
    }
  };

  const closeSettingsModal = () => {
    setIsClosingSettings(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsClosingSettings(false);
    }, 160);
  };

  // System / Native Notification Trigger
  const triggerSystemNotification = useCallback((title, body) => {
    return sendImmediateNotification(title, body);
  }, []);

  const requestNotificationPermission = async () => {
    const granted = await requestNativeNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      triggerSystemNotification(
        "¡Notificaciones activadas! 🔔",
        `Te avisaremos en tus horarios (${reminderSchedule.join(', ')}) para salvar tu racha, incluso con la app cerrada.`
      );
      playFxSound('success', soundEnabled);
      triggerHaptic(30);
      syncScheduledReminders({
        reminderEnabled: true,
        reminderSchedule,
        streakCount: streakData.count,
        isStreakMetToday
      });
    } else {
      alert("No se pudo obtener el permiso de notificaciones. Verificá los permisos de la app en los Ajustes de tu celular.");
    }
  };

  const testReminderNotification = async () => {
    if (notificationPermission !== 'granted') {
      const granted = await requestNativeNotificationPermission();
      if (!granted) {
        setNotificationPermission('denied');
        alert("Primero debés activar los permisos de notificación del celular.");
        return;
      }
      setNotificationPermission('granted');
    }
    await sendImmediateNotification(
      "🔥 ¡Salvá tu racha de inglés! (Prueba)",
      `Aún no practicaste hoy. Completá un Quiz, repasá 5 frases o hacé tu repaso para salvar tus ${streakData.count} días de racha.`
    );
    playFxSound('success', soundEnabled);
    triggerHaptic(40);
  };

  // Sync background OS alarms for the next 7 days.
  // These notifications will fire at exact scheduled hours EVEN WHEN THE APP IS CLOSED.
  useEffect(() => {
    syncScheduledReminders({
      reminderEnabled,
      reminderSchedule,
      streakCount: streakData.count,
      isStreakMetToday
    });
  }, [reminderEnabled, reminderSchedule, streakData.count, isStreakMetToday]);

  // Periodic Multi-Alert Streak Check (Runs every 30s)
  // CRITICAL: Once the user completes their streak today (isStreakMetToday === true),
  // ALL REMAINING ALERTS FOR THE DAY ARE SUPPRESSED!
  useEffect(() => {
    if (!reminderEnabled) return;

    const checkDailyReminders = () => {
      const today = getTodayStr();

      // If user fulfilled any streak task today (words, quiz, or 5 phrases), NO MORE ALERTS TODAY!
      if (isStreakMetToday) return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const todaySent = (sentAlerts.date === today) ? (sentAlerts.times || []) : [];

      const sortedTimes = [...reminderSchedule].sort();
      for (const targetTime of sortedTimes) {
        if (currentTimeStr >= targetTime && !todaySent.includes(targetTime)) {
          const hourNum = parseInt(targetTime.split(':')[0], 10);
          let title = "🔥 ¡Salvá tu racha de inglés!";
          let body = `Aún no practicaste hoy. Completá un Quiz, repasá 5 frases o hacé tu repaso para salvar tus ${streakData.count} días de racha.`;

          if (hourNum < 13) {
            title = "☀️ ¡Empezá el día con tu racha!";
            body = "Hacé un Quiz de 1 min o 5 frases para asegurar tu racha diaria temprano.";
          } else if (hourNum < 19) {
            title = "⏰ ¡Aviso de la tarde: tu racha te espera!";
            body = `Todavía tenés pendiente la tarea de hoy. ¡Mantené tus ${streakData.count} días activos!`;
          } else if (hourNum < 22) {
            title = "🌙 ¡Aviso nocturno: no pierdas tu racha!";
            body = "Se va terminando el día. Hacé un quiz rápido de 8 preguntas o 5 frases antes de dormir.";
          } else {
            title = "🚨 ¡Último aviso: tu racha está por terminar!";
            body = "Queda poco para la medianoche. ¡Hacé tu repaso antes de que se reinicie tu contador!";
          }

          const sent = triggerSystemNotification(title, body);
          if (sent) {
            setSentAlerts({ date: today, times: [...todaySent, targetTime] });
            break;
          }
        }
      }
    };

    checkDailyReminders();
    const interval = setInterval(checkDailyReminders, 30000);
    return () => clearInterval(interval);
  }, [reminderEnabled, reminderSchedule, isStreakMetToday, sentAlerts, streakData.count, triggerSystemNotification]);


  const resetProgress = () => {
    if (window.confirm("¿Seguro que deseas reiniciar tu progreso y vocabulario personalizado?")) {
      setWordProgress({});
      setPhraseProgress({});
      setCustomWords([]);
      setStreakData({
        count: 1,
        lastDate: null,
        todayActivities: {
          date: getTodayStr(),
          dailyCompleted: false,
          quizCompleted: false,
          phrasesReviewed: 0,
          cardsReviewedToday: 0
        }
      });
      setSentAlerts({ date: getTodayStr(), times: [] });
      alert("Progreso reiniciado correctamente.");
      window.location.reload();
    }
  };

  // Ultra-Fast 120ms transition handler with Multi-Option Streak check & Quick Celebration
  const handleRating = (daysToNext, isPhraseTab = false) => {
    const queue = isPhraseTab ? phraseQueue : studyQueue;
    const currentItem = queue[0];
    if (!currentItem) return;
    let newQueue = [...queue.slice(1)];

    // Sound FX & Haptic
    if (daysToNext === 0) {
      playFxSound('again', soundEnabled);
      triggerHaptic(40);
    } else {
      playFxSound('success', soundEnabled);
      triggerHaptic(30);
    }

    // Directional swipe animation (120ms)
    setCardAnimClass(daysToNext === 0 ? 'card-anim-exit-left' : 'card-anim-exit-right');
    setSpeechFeedback(null);

    // Count toward activity metrics and streak
    if (isPhraseTab) {
      recordActivityAndCheckStreak('phrase', 1);
    } else {
      recordActivityAndCheckStreak('card', 1);
    }

    setTimeout(() => {
      if (daysToNext === 0) {
        newQueue.push(currentItem);
      } else {
        const nextReviewTimestamp = Date.now() + Math.round(daysToNext * 24 * 60 * 60 * 1000);
        const updateData = { interval: daysToNext, nextReview: nextReviewTimestamp };

        if (currentItem.type === 'phrase' || isPhraseTab) {
          setPhraseProgress(prev => ({ ...prev, [currentItem.id]: updateData }));
          if (!isPhraseTab) {
            setPhraseQueue(pq => pq.filter(p => p.id !== currentItem.id));
          }
        } else {
          setWordProgress(prev => ({ ...prev, [currentItem.id]: updateData }));
        }
      }

      // Continuous unlimited mode: replenish seamlessly with unlearned items as cards are swiped
      if (!isPhraseTab && continuousMode) {
        recordActivityAndCheckStreak('daily', 1);
        const unlearnedRemaining = fullDictionary.filter(w => !wordProgress[w.id] && w.id !== currentItem.id && !newQueue.some(q => q.id === w.id));
        if (newQueue.length <= 2 && unlearnedRemaining.length > 0) {
          const nextChunk = shuffleArray(unlearnedRemaining).slice(0, 8).map(w => ({ ...w, type: 'word' }));
          newQueue = [...newQueue, ...nextChunk];
          setInitialQueueLength(prev => prev + nextChunk.length);
        }
      } else if (isPhraseTab && continuousPhraseMode) {
        recordActivityAndCheckStreak('phrase', 1);
        const unlearnedPhrases = initialPhrases.filter(p => !phraseProgress[p.id] && p.id !== currentItem.id && !newQueue.some(q => q.id === p.id));
        if (newQueue.length <= 2 && unlearnedPhrases.length > 0) {
          const nextChunk = shuffleArray(unlearnedPhrases).slice(0, 8);
          newQueue = [...newQueue, ...nextChunk];
          setInitialPhraseQueueLength(prev => prev + nextChunk.length);
        }
      }

      if (newQueue.length === 0) {
        setCardAnimClass('card-anim-entering');
        setShowPhraseTranslation(false);
        setShowStudyTranslation(false);
        if (!isPhraseTab) {
          recordActivityAndCheckStreak('daily');
          setStudyCompleted(true);
          setStudyQueue([]);
          setCelebrationMessage(continuousMode ? '¡Sesión libre finalizada! Racha asegurada 🔥' : '¡Meta diaria completada! 🚀');
          setContinuousMode(false);
        } else {
          recordActivityAndCheckStreak('phrase', 1);
          setPhraseStudyCompleted(true);
          setPhraseQueue([]);
          setCelebrationMessage(continuousPhraseMode ? '¡Sesión libre de frases finalizada! 🎯' : '¡Repaso de frases completado! 🎯');
          setContinuousPhraseMode(false);
        }
        setCelebrationActive(true);
        playFxSound('fanfare', soundEnabled);
        triggerConfetti();
        triggerHaptic(50);
        return;
      } 

      if (isPhraseTab) {
        setShowPhraseTranslation(false);
        setPhraseQueue(newQueue);
        setCardAnimClass('card-anim-entering');
      } else {
        setStudyQueue(newQueue);
        setShowStudyTranslation(false);
        setCardAnimClass('card-anim-entering');
      }
    }, 120);
  };

  const addNewWord = async () => {
    const cleanWord = searchTerm.trim();
    if (!cleanWord) return;

    if (fullDictionary.some(w => w.english.toLowerCase() === cleanWord.toLowerCase())) {
      alert(`La palabra "${cleanWord}" ya está en tu vocabulario o biblioteca.`);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|es`);
      const data = await res.json();
      const rawTranslation = data?.responseData?.translatedText;
      const isValid = data?.responseStatus === 200 && rawTranslation && !rawTranslation.toUpperCase().includes('MYMEMORY WARNING');

      if (isValid) {
        const translation = rawTranslation.trim();
        const newWord = {
          id: 'custom_' + Date.now(), 
          english: cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1),
          spanish: translation.charAt(0).toUpperCase() + translation.slice(1).toLowerCase(),
          type: 'word'
        };
        setCustomWords(prev => [newWord, ...prev]);
        setSearchTerm('');
        playFxSound('success', soundEnabled);
        alert(`¡"${newWord.english}" agregada con éxito!`);
      } else {
        alert("No se pudo obtener la traducción automática. Verifica la palabra o intenta de nuevo más tarde.");
      }
    } catch {
      alert("Error al contactar el servicio de traducción. Revisa tu conexión a internet.");
    }
    setIsTranslating(false);
  };

  // Quiz Mode Setup
  const startQuiz = useCallback(() => {
    const pool = [...fullDictionary, ...initialPhrases];
    const shuffled = shuffleArray(pool).slice(0, 8);
    
    const questions = shuffled.map(item => {
      const distractors = shuffleArray(pool.filter(d => d.id !== item.id))
        .slice(0, 3)
        .map(d => d.spanish);

      const options = shuffleArray([item.spanish, ...distractors]);
      return {
        prompt: item.english,
        correct: item.spanish,
        options
      };
    });

    setQuizQuestions(questions);
    setQuizCurrentIdx(0);
    setQuizScore(0);
    setQuizSelectedAnswer(null);
    setQuizFinished(false);
  }, [fullDictionary]);

  const handleQuizAnswer = (option) => {
    if (quizSelectedAnswer !== null) return;
    setQuizSelectedAnswer(option);
    
    const isCorrect = option === quizQuestions[quizCurrentIdx].correct;
    if (isCorrect) {
      setQuizScore(s => s + 1);
      playFxSound('success', soundEnabled);
      triggerHaptic(30);
    } else {
      playFxSound('again', soundEnabled);
      triggerHaptic(50);
    }

    setTimeout(() => {
      setQuizSelectedAnswer(null);
      if (quizCurrentIdx + 1 < quizQuestions.length) {
        setQuizCurrentIdx(i => i + 1);
      } else {
        setQuizFinished(true);
        // Fulfill streak via Quiz!
        recordActivityAndCheckStreak('quiz');
        playFxSound('fanfare', soundEnabled);
        triggerConfetti();
        setCelebrationMessage('¡Quiz completado con éxito! 🏆');
        setCelebrationActive(true);
      }
    }, 850);
  };

  // Helper to open Quiz mode inside Games Tab
  const openQuizGame = useCallback(() => {
    setActiveTab('games');
    setSelectedGame('quiz');
    if (quizQuestions.length === 0 || quizFinished) {
      startQuiz();
    }
  }, [quizQuestions.length, quizFinished, startQuiz]);

  // Voice Pronunciation Game Handlers
  const startVoiceGame = useCallback(() => {
    const pool = fullDictionary.filter(w => w.english && w.english.length >= 3 && !w.english.includes('/'));
    const chosen = shuffleArray(pool).slice(0, 6);
    setVoiceWords(chosen);
    setVoiceCurrentIdx(0);
    setVoiceScore(0);
    setVoiceIsListening(false);
    setVoiceStatus('idle');
    setVoiceHeardText('');
    setVoiceFeedbackMsg('');
    setVoiceFinished(false);
    setSelectedGame('voice');
  }, [fullDictionary]);

  const handleVoiceListen = async () => {
    if (voiceIsListening) {
      await stopListeningAudio();
      setVoiceIsListening(false);
      setVoiceStatus('idle');
      return;
    }

    const currentItem = voiceWords[voiceCurrentIdx];
    if (!currentItem) return;

    setVoiceIsListening(true);
    setVoiceStatus('listening');
    setVoiceFeedbackMsg('Escuchando... 🎙️ Hablá ahora en inglés');
    setVoiceHeardText('');

    const res = await startListeningAudio({ language: 'en-US' });
    setVoiceIsListening(false);

    if (res.success && res.matches && res.matches.length > 0) {
      const matchResult = checkPronunciationMatch(currentItem.english, res.matches);
      if (matchResult.matched) {
        setVoiceStatus('success');
        setVoiceScore(s => s + 1);
        setVoiceHeardText(matchResult.heard);
        setVoiceFeedbackMsg(`¡Pronunciación excelente! 🎯`);
        playFxSound('success', soundEnabled);
        triggerHaptic(50);
      } else {
        setVoiceStatus('retry');
        setVoiceHeardText(matchResult.heard);
        setVoiceFeedbackMsg(`Escuchamos: "${matchResult.heard}". ¡Casi! Intentá de nuevo.`);
        playFxSound('again', soundEnabled);
        triggerHaptic(35);
      }
    } else {
      setVoiceStatus('retry');
      setVoiceFeedbackMsg(res.error || 'No pudimos escuchar con claridad. Tocá el micrófono e intentá de nuevo.');
      playFxSound('again', soundEnabled);
    }
  };

  const nextVoiceWord = () => {
    if (voiceCurrentIdx + 1 < voiceWords.length) {
      setVoiceCurrentIdx(i => i + 1);
      setVoiceStatus('idle');
      setVoiceHeardText('');
      setVoiceFeedbackMsg('');
    } else {
      setVoiceFinished(true);
      recordActivityAndCheckStreak('quiz'); // Fulfills today's streak!
      playFxSound('fanfare', soundEnabled);
      triggerConfetti();
      setCelebrationMessage('¡Desafío de voz completado! 🎙️🔥');
      setCelebrationActive(true);
    }
  };

  // Word Scramble Game Handlers
  const initScrambleWord = (wordObj) => {
    const letters = wordObj.english.toUpperCase().split('');
    let shuffled = shuffleArray(letters);
    if (shuffled.join('') === wordObj.english.toUpperCase() && letters.length > 3) {
      shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
    }
    setScrambleAvailableLetters(shuffled.map((letter, idx) => ({ id: `${idx}_${letter}`, letter, used: false })));
    setScrambleSelectedLetters([]);
    setScrambleStatus('playing');
  };

  const startScrambleGame = useCallback(() => {
    const pool = fullDictionary.filter(w => w.english && w.english.length >= 4 && w.english.length <= 8 && !w.english.includes(' ') && !w.english.includes('/'));
    const chosen = shuffleArray(pool).slice(0, 5);
    setScrambleWords(chosen);
    setScrambleIdx(0);
    setScrambleScore(0);
    setScrambleFinished(false);
    if (chosen.length > 0) {
      initScrambleWord(chosen[0]);
    }
    setSelectedGame('scramble');
  }, [fullDictionary]);

  const handlePickLetter = (item) => {
    if (item.used || scrambleStatus === 'success') return;
    const currentWord = scrambleWords[scrambleIdx];
    const newSelected = [...scrambleSelectedLetters, item];
    const updatedAvailable = scrambleAvailableLetters.map(l => l.id === item.id ? { ...l, used: true } : l);
    
    setScrambleSelectedLetters(newSelected);
    setScrambleAvailableLetters(updatedAvailable);
    triggerHaptic(20);

    if (newSelected.length === currentWord.english.length) {
      const spelled = newSelected.map(l => l.letter).join('');
      if (spelled.toLowerCase() === currentWord.english.toLowerCase()) {
        setScrambleStatus('success');
        setScrambleScore(s => s + 1);
        playFxSound('success', soundEnabled);
        triggerHaptic(45);
      } else {
        setScrambleStatus('wrong');
        playFxSound('again', soundEnabled);
        triggerHaptic(50);
      }
    }
  };

  const handleRemoveLetter = (index) => {
    if (scrambleStatus === 'success') return;
    const removed = scrambleSelectedLetters[index];
    const newSelected = scrambleSelectedLetters.filter((_, i) => i !== index);
    const updatedAvailable = scrambleAvailableLetters.map(l => l.id === removed.id ? { ...l, used: false } : l);
    setScrambleSelectedLetters(newSelected);
    setScrambleAvailableLetters(updatedAvailable);
    setScrambleStatus('playing');
    triggerHaptic(20);
  };

  const handleClearScramble = () => {
    setScrambleSelectedLetters([]);
    setScrambleAvailableLetters(prev => prev.map(l => ({ ...l, used: false })));
    setScrambleStatus('playing');
    triggerHaptic(25);
  };

  const nextScrambleWord = () => {
    if (scrambleIdx + 1 < scrambleWords.length) {
      const nextIdx = scrambleIdx + 1;
      setScrambleIdx(nextIdx);
      initScrambleWord(scrambleWords[nextIdx]);
    } else {
      setScrambleFinished(true);
      recordActivityAndCheckStreak('quiz'); // Fulfills streak
      playFxSound('fanfare', soundEnabled);
      triggerConfetti();
      setCelebrationMessage('¡Juego de letras completado! 🧩🔥');
      setCelebrationActive(true);
    }
  };

  // Helper to compile backup data
  const generateBackupPayload = () => ({
    app_version: '2.0',
    exportedAt: new Date().toISOString(),
    wordProgress,
    phraseProgress,
    customWords,
    streakData,
    themeMode,
    themeColor,
    wordsPerDay,
    phrasesPerDay,
    voiceSpeed,
    soundEnabled,
    reminderEnabled,
    reminderSchedule
  });

  // Helper to apply imported data
  const applyBackupPayload = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Formato de copia de seguridad inválido.');
    }
    if (data.wordProgress && typeof data.wordProgress === 'object' && !Array.isArray(data.wordProgress)) {
      setWordProgress(data.wordProgress);
    }
    if (data.phraseProgress && typeof data.phraseProgress === 'object' && !Array.isArray(data.phraseProgress)) {
      setPhraseProgress(data.phraseProgress);
    }
    if (Array.isArray(data.customWords)) {
      const validCustomWords = data.customWords.filter(
        w => w && typeof w === 'object' && typeof w.english === 'string' && typeof w.spanish === 'string'
      );
      setCustomWords(validCustomWords);
    }
    if (data.streakData && typeof data.streakData === 'object' && !Array.isArray(data.streakData)) {
      setStreakData(prev => ({
        ...prev,
        ...data.streakData,
        count: typeof data.streakData.count === 'number' ? data.streakData.count : 1,
        todayActivities: (data.streakData.todayActivities && typeof data.streakData.todayActivities === 'object')
          ? data.streakData.todayActivities
          : { date: getTodayStr(), dailyCompleted: false, quizCompleted: false, phrasesReviewed: 0 }
      }));
    }
    if (typeof data.themeColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(data.themeColor)) {
      setThemeColor(data.themeColor);
    }
    if (['system', 'light', 'dark'].includes(data.themeMode)) {
      setThemeMode(data.themeMode);
    }
    if (typeof data.wordsPerDay === 'number' && data.wordsPerDay > 0) {
      setWordsPerDay(Math.min(50, Math.max(1, Math.floor(data.wordsPerDay))));
    }
    if (typeof data.phrasesPerDay === 'number' && data.phrasesPerDay > 0) {
      setPhrasesPerDay(Math.min(50, Math.max(1, Math.floor(data.phrasesPerDay))));
    }
    if (typeof data.voiceSpeed === 'number' && data.voiceSpeed >= 0.5 && data.voiceSpeed <= 2.0) {
      setVoiceSpeed(data.voiceSpeed);
    }
    if (typeof data.soundEnabled === 'boolean') {
      setSoundEnabled(data.soundEnabled);
    }
    if (typeof data.reminderEnabled === 'boolean') {
      setReminderEnabled(data.reminderEnabled);
    }
    if (Array.isArray(data.reminderSchedule)) {
      setReminderSchedule(data.reminderSchedule.filter(t => typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)));
    }

    playFxSound('fanfare', soundEnabled);
    alert("¡Copia de seguridad restaurada con éxito! 🎉 Tu progreso ha sido recuperado.");
    closeSettingsModal();
  };

  // Backup Export
  const handleExportBackup = async () => {
    triggerHaptic(20);
    playFxSound('click', soundEnabled);
    try {
      const backupData = generateBackupPayload();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const fileName = `english_learning_backup_${new Date().toISOString().slice(0, 10)}.json`;

      // 1. Android & iOS Native App (Capacitor FileSystem + Native Share Sheet)
      if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        try {
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: jsonStr,
            directory: Directory.Cache,
            encoding: Encoding.UTF8
          });

          await Share.share({
            title: 'Copia de seguridad - English Learning',
            text: 'Copia de seguridad de progreso y configuración de English Learning.',
            url: savedFile.uri,
            dialogTitle: 'Guardar o compartir copia de seguridad'
          });
          return;
        } catch (nativeErr) {
          const errStr = (nativeErr?.message || '').toLowerCase();
          if (errStr.includes('cancel') || nativeErr?.name === 'AbortError') {
            return;
          }
          console.warn('Native share failed, proceeding to web fallback:', nativeErr);
        }
      }

      // 2. Web Share API with file support (e.g. mobile Safari / browsers that support files)
      const blob = new Blob([jsonStr], { type: 'application/json' });
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const file = new File([blob], fileName, { type: 'application/json' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Copia de seguridad - English Learning',
              text: 'Copia de seguridad de progreso y configuración.',
              files: [file]
            });
            return;
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      // 3. Classic download fallback (Web Browsers)
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      alert('¡Copia de seguridad descargada con éxito! Revisa tu carpeta de Descargas.');
    } catch (err) {
      console.error('Error exporting backup:', err);
      alert('No se pudo generar la copia de seguridad.');
    }
  };

  // Copy Backup JSON to Clipboard
  const handleCopyBackupToClipboard = async () => {
    triggerHaptic(20);
    playFxSound('click', soundEnabled);
    try {
      const backupData = generateBackupPayload();
      const jsonStr = JSON.stringify(backupData, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      playFxSound('success', soundEnabled);
      alert('¡Copia de seguridad copiada al portapapeles! 📋 Puedes guardarla en tus notas o enviártela por mensaje.');
    } catch (err) {
      console.error('Error copying backup to clipboard:', err);
      alert('No se pudo copiar al portapapeles.');
    }
  };

  // Restore Backup from Copied Text
  const handleRestoreFromText = async () => {
    triggerHaptic(20);
    playFxSound('click', soundEnabled);
    try {
      let text = '';
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        try {
          text = await navigator.clipboard.readText();
        } catch {}
      }
      if (!text || !text.trim().startsWith('{')) {
        text = prompt('Pega aquí el código/texto de tu copia de seguridad JSON:');
      }
      if (!text || !text.trim()) return;

      const data = JSON.parse(text.trim());
      applyBackupPayload(data);
    } catch (err) {
      console.error('Error restoring backup from text:', err);
      alert('El texto pegado no es una copia de seguridad válida.');
    }
  };

  // Backup Import from File
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        applyBackupPayload(data);
      } catch (err) {
        console.error('Error importing backup:', err);
        alert('El archivo no es una copia de seguridad válida.');
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // High-Performance Filtering with Category & Sorting support
  const filteredDictionary = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    const now = currentTimestamp;

    let list = fullDictionary.filter(word => {
      if (categoryFilter === 'scheduled') {
        const p = wordProgress[word.id];
        if (!p || p.interval <= 0 || p.nextReview <= now) return false;
      } else if (categoryFilter === 'due') {
        const p = wordProgress[word.id];
        if (!p || p.nextReview > now) return false;
      } else if (categoryFilter === 'new') {
        const p = wordProgress[word.id];
        if (p && p.interval > 0) return false;
      } else if (categoryFilter === 'movie') {
        if (word.category !== 'movie') return false;
      } else if (categoryFilter === 'phrasal') {
        if (!word.hasPhrasal) return false;
      } else if (categoryFilter === 'daily') {
        if (word.category !== 'daily') return false;
      } else if (categoryFilter === 'verbs') {
        if (word.category !== 'verb') return false;
      } else if (categoryFilter === 'nouns') {
        if (word.category !== 'noun') return false;
      } else if (categoryFilter === 'adjectives') {
        if (word.category !== 'adjective') return false;
      } else if (categoryFilter === 'tech') {
        if (word.category !== 'tech' && (typeof word.id !== 'number' || word.id < 2000 || word.id >= 3000)) return false;
      } else if (categoryFilter === 'custom') {
        if (!String(word.id).startsWith('custom_')) return false;
      }

      if (!term) return true;
      return word.english.toLowerCase().includes(term) || word.spanish.toLowerCase().includes(term);
    });

    if (dictSortOrder === 'az') {
      return [...list].sort((a, b) => a.english.localeCompare(b.english));
    } else if (dictSortOrder === 'random') {
      return seededShuffle(list, randomSeed);
    }

    return list;
  }, [debouncedSearchTerm, fullDictionary, categoryFilter, wordProgress, dictSortOrder, randomSeed, currentTimestamp]);

  // Paginated slice for instant 60/120fps rendering
  const displayedWords = useMemo(() => {
    return filteredDictionary.slice(0, visibleCount);
  }, [filteredDictionary, visibleCount]);

  // Daily Goal Progress
  const dailyProgressPercent = useMemo(() => {
    if (studyCompleted) return 100;
    if (initialQueueLength > 0) {
      return Math.min(100, Math.round(((initialQueueLength - studyQueue.length) / initialQueueLength) * 100));
    }
    return 0;
  }, [studyCompleted, initialQueueLength, studyQueue.length]);

  // Single-pass memoized metrics calculation (cuts 7,000+ iterations per render)
  const { scheduledCount, dueReviewCount, duePhraseCount } = useMemo(() => {
    const now = currentTimestamp;
    let sched = 0;
    let dueW = 0;
    for (let i = 0; i < fullDictionary.length; i++) {
      const p = wordProgress[fullDictionary[i].id];
      if (p && p.interval > 0) {
        if (p.nextReview > now) sched++;
        else dueW++;
      }
    }
    let dueP = 0;
    for (let i = 0; i < initialPhrases.length; i++) {
      const p = phraseProgress[initialPhrases[i].id];
      if (p && p.nextReview <= now) dueP++;
    }
    return { scheduledCount: sched, dueReviewCount: dueW, duePhraseCount: dueP };
  }, [fullDictionary, wordProgress, phraseProgress, currentTimestamp]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <div className="header-top">
          <div>
            <h1 className="header-title">
              {activeTab === 'daily' ? 'Repaso Diario' : 
               activeTab === 'phrases' ? 'Frases Útiles' : 
               activeTab === 'leaderboard' ? 'Ranking & Amigos' :
               activeTab === 'games' ? (
                 selectedGame === 'quiz' ? 'Quiz Relámpago' :
                 selectedGame === 'voice' ? 'Desafío de Voz' :
                 selectedGame === 'scramble' ? 'Ordenar Letras' : 
                 selectedGame === 'wordle' ? 'Wordle Inglés' :
                 selectedGame === 'listen' ? 'Escucha y Escribe' : 'Zona de Juegos'
               ) : 'Diccionario'}
            </h1>
            {!(activeTab === 'games' && selectedGame) && (
              <p className="header-subtitle">
                {activeTab === 'daily' ? (
                  studyCompleted ? (
                    '¡Sesión de hoy completada! 🎉'
                  ) : (
                    studyQueue.length > 0 ? (
                      `${studyQueue.length} ${studyQueue.length === 1 ? 'palabra' : 'palabras'} en sesión (${dueReviewCount} a repasar + ${Math.min(wordsPerDay, fullDictionary.filter(w => !wordProgress[w.id]).length)} nuevas)`
                    ) : (
                      `${wordsPerDay} palabras nuevas hoy`
                    )
                  )
                ) : activeTab === 'phrases' ? (
                  phraseStudyCompleted ? (
                    '¡Tanda de frases completada! 🎉'
                  ) : (
                    `${phraseQueue.length} ${phraseQueue.length === 1 ? 'frase' : 'frases'} en tanda (${duePhraseCount} a repasar)`
                  )
                ) : activeTab === 'leaderboard' ? (
                  'Compara tu racha y nivel de inglés con otros estudiantes 🏆'
                ) : activeTab === 'games' ? (
                  'Elegí un juego para practicar y asegurar tu racha'
                ) : (
                  `${fullDictionary.length} términos disponibles`
                )}
              </p>
            )}
          </div>
          <div className="header-actions">
            {/* Clickable Multi-Option Daily Streak Badge */}
            <div 
              className={`streak-badge ${isStreakMetToday ? 'completed' : ''}`} 
              onClick={() => setShowStreakModal(true)}
              title="Toca para ver tus metas de racha"
            >
              <Flame size={15} color={isStreakMetToday ? "var(--primary-color)" : "#F59E0B"} fill={isStreakMetToday ? "var(--primary-color)" : "#F59E0B"} />
              <span>{streakData.count}d</span>
              {isStreakMetToday && <Check size={13} strokeWidth={3} />}
            </div>

            {/* Theme Button */}
            <button 
              onClick={cycleTheme} 
              className="btn-icon" 
              title={
                themeMode === 'system' 
                  ? 'Tema: Celular (Automático)' 
                  : themeMode === 'dark' 
                  ? 'Tema: Oscuro' 
                  : 'Tema: Claro'
              }
              aria-label="Toggle theme"
            >
              <span className="theme-toggle-icon" key={themeMode}>
                {themeMode === 'system' ? (
                  <Smartphone size={20} />
                ) : themeMode === 'dark' ? (
                  <Moon size={20} />
                ) : (
                  <Sun size={20} />
                )}
              </span>
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setShowSettings(true)} 
              className="btn-icon" 
              title="Configuración"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="content-area">
        <div className="tab-transition-container" key={activeTab}>
          {/* TAB 1: DAILY FLASHCARDS */}
          {activeTab === 'daily' && (
            <div>
              {studyCompleted ? (
                <div className="main-card card-anim-entering" style={{ textAlign: 'center', marginTop: '20px', padding: '40px 24px' }}>
                  <div className="celebration-icon-box">
                    <CheckCircle2 size={48} color="var(--primary-color)" />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>¡Sesión Completada! 🎉</h2>
                  <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: '1.5', marginBottom: '22px' }}>
                    ¡Meta cumplida y racha de hoy asegurada! 🔥<br/>
                    Podés seguir aprendiendo palabras nuevas sin límites ni alterar tus repasos de mañana.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%', maxWidth: '340px', margin: '0 auto' }}>
                    <button className="btn-primary" onClick={() => startContinuousSession()}>
                      <Sparkles size={16} /> ⚡ Seguir aprendiendo sin límite
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => { setActiveTab('games'); setSelectedGame(null); }}
                    >
                      <Gamepad2 size={15} /> Probar Juegos de Repaso
                    </button>
                  </div>
                </div>
              ) : (
                studyQueue.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {continuousMode && (
                      <div className="continuous-mode-banner">
                        <div className="continuous-mode-pill">
                          <Sparkles size={14} />
                          <span>Modo Continuo • {streakData.todayActivities?.cardsReviewedToday || 0} repasadas hoy</span>
                        </div>
                        <button 
                          className="btn-pause-continuous" 
                          onClick={() => stopContinuousSession('word')}
                          title="Terminar y guardar sesión libre"
                        >
                          Terminar por hoy ✕
                        </button>
                      </div>
                    )}
                    {/* Progress Capsule with Daily Streak Retention */}
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar ${dailyProgressPercent >= 100 ? 'progress-bar-completed' : ''}`} 
                        style={{ width: `${dailyProgressPercent}%` }}
                      ></div>
                    </div>
                    <div className="daily-goal-status-text">
                      {dailyProgressPercent >= 100 ? (
                        <span className="goal-complete-badge">
                          <Sparkles size={13} /> ¡Sesión de hoy 100% completada! Racha asegurada 🔥
                        </span>
                      ) : (
                        <span>
                          Progreso de la sesión: {dailyProgressPercent}% ({initialQueueLength > 0 ? (initialQueueLength - studyQueue.length) : 0}/{initialQueueLength || wordsPerDay})
                          {isStreakMetToday && <span style={{ color: 'var(--primary-color)', marginLeft: '6px' }}>• 🔥 Racha salvada</span>}
                        </span>
                      )}
                    </div>

                    {/* Queue Meta Header */}
                    <div className="queue-meta">
                      <span className="badge-tag">
                        {studyQueue[0].type === 'phrase' ? (
                          <MessageCircle size={14} />
                        ) : (
                          <BookOpen size={14} />
                        )}
                        {studyQueue[0].type === 'phrase'
                          ? 'Frase'
                          : (wordProgress[studyQueue[0].id]?.interval > 0 ? '⏰ Toca Repaso' : '✨ Palabra Nueva')}
                      </span>
                      <span className="queue-counter">
                        {initialQueueLength > 0 ? (initialQueueLength - studyQueue.length + 1) : 1} de {initialQueueLength || studyQueue.length}
                      </span>
                    </div>
                    
                    {/* Modern Active Flashcard */}
                    <div 
                      className={`main-card ${cardAnimClass} ${!showStudyTranslation ? 'main-card-clickable' : ''}`}
                      onClick={() => {
                        if (!showStudyTranslation) {
                          setShowStudyTranslation(true);
                        }
                      }}
                    >
                      <div className="card-actions-row" style={{ justifyContent: showStudyTranslation ? 'space-between' : 'flex-end', alignItems: 'center' }}>
                        {showStudyTranslation && (
                          <button 
                            className="card-toggle-answer-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowStudyTranslation(false);
                            }}
                            title="Ocultar respuesta y volver a la palabra en inglés"
                            aria-label="Volver a inglés"
                          >
                            <RotateCcw size={13} />
                            <span>Volver a inglés</span>
                          </button>
                        )}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* Optional Pronunciation Microphone */}
                          <button 
                            className={`card-mic-btn ${isListening ? 'mic-listening' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              testPronunciation(studyQueue[0].english, e);
                            }}
                            title="Practicar pronunciación (Opcional)"
                            aria-label="Practice speaking"
                          >
                            <Mic size={18} />
                          </button>

                          {/* Speaker Button */}
                          <button 
                            className={`card-audio-btn ${isPlayingAudio ? 'audio-playing' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(studyQueue[0].english, e);
                            }}
                            title="Escuchar pronunciación"
                            aria-label="Listen pronunciation"
                          >
                            <Volume2 size={20} />
                          </button>
                        </div>
                      </div>

                      {(() => {
                        const topDetails = getWordDetails(studyQueue[0]);
                        return (
                          <div 
                            className="card-word-title"
                            style={{ cursor: showStudyTranslation ? 'pointer' : 'default' }}
                            onClick={(e) => {
                              if (showStudyTranslation) {
                                e.stopPropagation();
                                setShowStudyTranslation(false);
                              }
                            }}
                            title={showStudyTranslation ? "Toca para volver a la palabra sola" : undefined}
                          >
                            {studyQueue[0].english}
                            {topDetails.ipa && <span className="word-ipa">{topDetails.ipa}</span>}
                            {topDetails.cefr && <span className="word-cefr-badge">{topDetails.cefr}</span>}
                          </div>
                        );
                      })()}

                      {/* Optional Voice Evaluation Feedback Chip */}
                      {speechFeedback && (
                        <div style={{ textAlign: 'center' }}>
                          <span className={`speech-feedback-chip ${speechFeedback.success ? 'feedback-success' : 'feedback-trying'}`}>
                            {speechFeedback.text}
                          </span>
                        </div>
                      )}
                      
                      {showStudyTranslation ? (
                        (() => {
                          const currentProg = studyQueue[0].type === 'word' ? wordProgress[studyQueue[0].id] : phraseProgress[studyQueue[0].id];
                          const intervals = getIntervals(currentProg?.interval || 0);
                          const details = getWordDetails(studyQueue[0]);

                          return (
                            <div className="translation-reveal-area">
                              <div className="card-translation">
                                {studyQueue[0].spanish}
                              </div>

                              {/* Category Badge */}
                              {details.category && (
                                <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
                                  <span className="word-category-badge">{details.category}</span>
                                </div>
                              )}

                              {/* Grammar Block: Adjectives (Comparatives & Superlatives) */}
                              {studyQueue[0].category === 'adjective' && (studyQueue[0].comparative || studyQueue[0].superlative) && (
                                <div className="grammar-degrees-box">
                                  <div className="grammar-degrees-title">
                                    <Sparkles size={13} />
                                    <span>Grados del Adjetivo</span>
                                  </div>
                                  <div className="grammar-degrees-grid">
                                    <div className="grammar-degree-item">
                                      <span className="degree-label">Base</span>
                                      <span className="degree-val">{studyQueue[0].english}</span>
                                      <span className="degree-es">{studyQueue[0].spanish}</span>
                                    </div>
                                    <div className="grammar-degree-item">
                                      <span className="degree-label">Comparativo</span>
                                      <span className="degree-val">{studyQueue[0].comparative}</span>
                                      <span className="degree-es">{studyQueue[0].comparativeEs || 'Más...'}</span>
                                    </div>
                                    <div className="grammar-degree-item">
                                      <span className="degree-label">Superlativo</span>
                                      <span className="degree-val">{studyQueue[0].superlative}</span>
                                      <span className="degree-es">{studyQueue[0].superlativeEs || 'El más...'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Grammar Block: Verbs (Past & Participle) */}
                              {studyQueue[0].category === 'verb' && (studyQueue[0].past || studyQueue[0].participle) && (
                                <div className="grammar-degrees-box">
                                  <div className="grammar-degrees-title">
                                    <Sparkles size={13} />
                                    <span>Formas Verbales Clave</span>
                                  </div>
                                  <div className="grammar-degrees-grid">
                                    <div className="grammar-degree-item">
                                      <span className="degree-label">Infinitivo / Presente</span>
                                      <span className="degree-val">{studyQueue[0].english}</span>
                                    </div>
                                    <div className="grammar-degree-item">
                                      <span className="degree-label">Pasado Simple</span>
                                      <span className="degree-val">{studyQueue[0].past}</span>
                                    </div>
                                    <div className="grammar-degree-item">
                                      <span className="degree-label">Participio Pasado</span>
                                      <span className="degree-val">{studyQueue[0].participle}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Grammar Block: Nouns (Plural) */}
                              {studyQueue[0].category === 'noun' && studyQueue[0].plural && (
                                <div className="grammar-pill-info">
                                  <span className="grammar-pill-tag">Plural:</span>
                                  <span className="grammar-pill-text">{studyQueue[0].plural}</span>
                                </div>
                              )}

                              {/* Rich Meaning / Explanation Box */}
                              {details.explanation && (
                                <div className="explanation-box">
                                  <div className="explanation-header">
                                    <Sparkles size={13} />
                                    <span>¿Qué significa?</span>
                                  </div>
                                  <p className="explanation-text">{details.explanation}</p>
                                </div>
                              )}

                              {/* Authentic Context Example Box */}
                              {details.exampleEn && (
                                <div className="example-sentence-box">
                                  <div className="example-sentence-header">
                                    <span>Ejemplo en inglés:</span>
                                  </div>
                                  <div className="example-sentence-en">
                                    <span>"{details.exampleEn}"</span>
                                    <button 
                                      onClick={(e) => speakText(details.exampleEn, e)}
                                      className="example-speak-btn"
                                      title="Escuchar frase completa"
                                    >
                                      <Volume2 size={15} />
                                    </button>
                                  </div>
                                  <div className="example-sentence-es">
                                    {details.exampleEs}
                                  </div>
                                </div>
                              )}

                              {/* Phrasal Verbs & Context Box in Study Card */}
                              {details.phrasalExamples && details.phrasalExamples.length > 0 && (
                                <div className="phrasal-context-box">
                                  <div className="phrasal-context-header">
                                    <Sparkles size={13} />
                                    <span>💡 Sola vs. En Frases (¡Ojo al contexto!)</span>
                                  </div>
                                  <div className="phrasal-alone-pill">
                                    <strong>Sola significa:</strong> {details.aloneMeaning || studyQueue[0].spanish}
                                    {details.contextNote && (
                                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {details.contextNote}
                                      </div>
                                    )}
                                  </div>
                                  <div className="phrasal-list">
                                    {details.phrasalExamples.map((item, idx) => (
                                      <div key={idx} className="phrasal-item">
                                        <div className="phrasal-item-top">
                                          <span className="phrasal-phrase">{item.phrase}</span>
                                          <span className="phrasal-arrow">➔</span>
                                          <span className="phrasal-meaning">{item.meaning}</span>
                                          <button 
                                            className="phrasal-audio-btn" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              speakText(item.phrase, e);
                                            }}
                                            title="Escuchar frase"
                                            aria-label="Escuchar pronunciación"
                                          >
                                            <Volume2 size={13} />
                                          </button>
                                        </div>
                                        {item.example && (
                                          <div className="phrasal-example">
                                            "{item.example}"
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Synonyms & Antonyms in Study Card */}
                              {(details.synonyms?.length > 0 || details.antonyms?.length > 0) && (
                                <div className="synonyms-box">
                                  {details.synonyms?.length > 0 && (
                                    <div className="synonyms-row">
                                      <span className="synonym-tag">🔄 Sinónimos:</span>
                                      <span className="synonym-list">{details.synonyms.join(', ')}</span>
                                    </div>
                                  )}
                                  {details.antonyms?.length > 0 && (
                                    <div className="antonyms-row">
                                      <span className="antonym-tag">⚡ Antónimos:</span>
                                      <span className="antonym-list">{details.antonyms.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flashcard-author-watermark">
                                <a 
                                  href={LINKEDIN_PROFILE_URL}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: 'inherit', textDecoration: 'none' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Hecha por <strong>Facundo Minatto</strong>
                                </a>
                              </div>
                              
                              <div className="rating-buttons-grid">
                                <button 
                                  className="btn-rating-pill rating-again" 
                                  onClick={() => handleRating(intervals.again, false)}
                                >
                                  Repetir
                                  <span className="interval-badge">{formatInterval(intervals.again)}</span>
                                </button>
                                <button 
                                  className="btn-rating-pill rating-hard" 
                                  onClick={() => handleRating(intervals.hard, false)}
                                >
                                  Difícil
                                  <span className="interval-badge">{formatInterval(intervals.hard)}</span>
                                </button>
                                <button 
                                  className="btn-rating-pill rating-good" 
                                  onClick={() => handleRating(intervals.good, false)}
                                >
                                  Bien
                                  <span className="interval-badge">{formatInterval(intervals.good)}</span>
                                </button>
                                <button 
                                  className="btn-rating-pill rating-easy" 
                                  onClick={() => handleRating(intervals.easy, false)}
                                >
                                  Fácil
                                  <span className="interval-badge">{formatInterval(intervals.easy)}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <button className="btn-primary" onClick={() => setShowStudyTranslation(true)}>
                          Mostrar Respuesta
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Subtle footer watermark */}
              <div className="subtle-footer-watermark">
                <a 
                  href={LINKEDIN_PROFILE_URL}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="subtle-watermark-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>English Learning • Hecha por <strong>Facundo Minatto</strong></span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: PHRASES */}
          {activeTab === 'phrases' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {phraseStudyCompleted || !phraseQueue || phraseQueue.length === 0 ? (
                <div className="main-card card-anim-entering" style={{ textAlign: 'center', marginTop: '20px', padding: '36px 22px' }}>
                  <div className="celebration-icon-box">
                    <CheckCircle2 size={48} color="var(--primary-color)" />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                    {(streakData.todayActivities?.phrasesReviewed || 0) >= 5 ? '¡Frases de hoy completadas! 🎉' : '¡Sesión de frases lista! 🌟'}
                  </h2>
                  <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: '1.5', marginBottom: '22px' }}>
                    {(streakData.todayActivities?.phrasesReviewed || 0) >= 5 
                      ? '¡Meta de 5 frases cumplida y racha diaria asegurada! 🔥' 
                      : 'No tenés frases pendientes en esta tanda.'}
                    <br/>
                    Elegí cómo te gustaría continuar:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', alignItems: 'center', width: '100%', maxWidth: '340px', margin: '0 auto' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => loadNewPhrases(5)}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Sparkles size={16} /> ✨ Ver 5 frases nuevas
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => reviewLearnedPhrases(5)}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <RotateCcw size={15} /> 🔄 Repasar frases ya aprendidas
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => startContinuousPhraseSession()}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Flame size={15} /> ⚡ Modo libre continuo (sin límites)
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => { setActiveTab('games'); setSelectedGame(null); }}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Gamepad2 size={15} /> 🎮 Probar Juegos de Repaso
                    </button>
                  </div>
                </div>
              ) : (() => {
                const currentPhrase = phraseQueue[0];
                if (!currentPhrase) {
                  return (
                    <div className="main-card card-anim-entering" style={{ textAlign: 'center', marginTop: '20px', padding: '36px 22px' }}>
                      <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>No hay frases disponibles en este momento.</p>
                      <button className="btn-primary" onClick={() => loadNewPhrases(5)}>
                        <Sparkles size={16} /> Ver 5 frases nuevas
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    {continuousPhraseMode && (
                      <div className="continuous-mode-banner">
                        <div className="continuous-mode-pill">
                          <Sparkles size={14} />
                          <span>Modo Frases Continuo • {streakData.todayActivities?.phrasesReviewed || 0} frases hoy</span>
                        </div>
                        <button 
                          className="btn-pause-continuous" 
                          onClick={() => stopContinuousSession('phrase')}
                          title="Terminar y guardar sesión libre"
                        >
                          Terminar por hoy ✕
                        </button>
                      </div>
                    )}
                    {/* Progress Capsule for Current Phrases Batch */}
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar ${(streakData.todayActivities?.phrasesReviewed || 0) >= 5 ? 'progress-bar-completed' : ''}`} 
                        style={{ 
                          width: `${initialPhraseQueueLength > 0 ? Math.round(((initialPhraseQueueLength - phraseQueue.length) / initialPhraseQueueLength) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="daily-goal-status-text">
                      {(streakData.todayActivities?.phrasesReviewed || 0) >= 5 ? (
                        <span className="goal-complete-badge">
                          <Sparkles size={13} /> ¡Meta de frases cumplida! Racha asegurada 🔥
                        </span>
                      ) : (
                        <span>
                          Meta de racha: {streakData.todayActivities?.phrasesReviewed || 0}/5 frases hoy
                        </span>
                      )}
                    </div>

                    <div className="queue-meta">
                      <span className="badge-tag">
                        <MessageCircle size={14} /> Frase {initialPhraseQueueLength > 0 ? (initialPhraseQueueLength - phraseQueue.length + 1) : 1} de {initialPhraseQueueLength || phraseQueue.length}
                      </span>
                      <span className="queue-counter">
                        Quedan {phraseQueue.length}
                      </span>
                    </div>
                    
                    {/* Modern Active Phrase Flashcard matching the word card */}
                    <div 
                      className={`main-card ${cardAnimClass || 'card-anim-entering'} ${!showPhraseTranslation ? 'main-card-clickable' : ''}`} 
                      onClick={() => {
                        if (!showPhraseTranslation) {
                          setShowPhraseTranslation(true);
                        }
                      }}
                    >
                      <div className="card-actions-row" style={{ justifyContent: showPhraseTranslation ? 'space-between' : 'flex-end', alignItems: 'center' }}>
                        {showPhraseTranslation && (
                          <button 
                            className="card-toggle-answer-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPhraseTranslation(false);
                            }}
                            title="Ocultar respuesta y volver a la frase en inglés"
                            aria-label="Volver a inglés"
                          >
                            <RotateCcw size={13} />
                            <span>Volver a inglés</span>
                          </button>
                        )}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            className={`card-mic-btn ${isListening ? 'mic-listening' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              testPronunciation(currentPhrase.english, e);
                            }}
                            title="Practicar pronunciación (Opcional)"
                            aria-label="Practice speaking"
                          >
                            <Mic size={18} />
                          </button>

                          <button 
                            className={`card-audio-btn ${isPlayingAudio ? 'audio-playing' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(currentPhrase.english, e);
                            }}
                            title="Escuchar pronunciación"
                            aria-label="Listen pronunciation"
                          >
                            <Volume2 size={20} />
                          </button>
                        </div>
                      </div>

                      <div 
                        className="card-word-title" 
                        style={{ 
                          fontSize: 'clamp(23px, 6vw, 29px)', 
                          lineHeight: 1.35, 
                          margin: '18px 0 16px',
                          cursor: showPhraseTranslation ? 'pointer' : 'default',
                          textAlign: 'center'
                        }}
                        onClick={(e) => {
                          if (showPhraseTranslation) {
                            e.stopPropagation();
                            setShowPhraseTranslation(false);
                          }
                        }}
                        title={showPhraseTranslation ? "Toca para volver a la frase en inglés" : undefined}
                      >
                        {currentPhrase.english}
                      </div>
                      
                      {/* Voice Evaluation Feedback Chip */}
                      {speechFeedback && (
                        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                          <span className={`speech-feedback-chip ${speechFeedback.success ? 'feedback-success' : 'feedback-trying'}`}>
                            {speechFeedback.text}
                          </span>
                        </div>
                      )}

                      {showPhraseTranslation ? (
                        (() => {
                          const currentProg = phraseProgress[currentPhrase.id];
                          const intervals = getIntervals(currentProg?.interval || 0);
                          const details = getWordDetails(currentPhrase);

                          return (
                            <div className="translation-reveal-area">
                              <div className="card-translation" style={{ fontSize: 'clamp(19px, 5.5vw, 24px)', margin: '4px 0 14px' }}>
                                {currentPhrase.spanish}
                              </div>

                              {/* Category Badge */}
                              <div style={{ textAlign: 'center', margin: '4px 0 12px' }}>
                                <span className="word-category-badge">{details.category || "🗣️ Expresión / Frase"}</span>
                              </div>

                              {/* Rich Meaning / Explanation Box */}
                              {details.explanation && (
                                <div className="explanation-box" style={{ margin: '14px 0 16px' }}>
                                  <div className="explanation-header">
                                    <Sparkles size={13} />
                                    <span>¿Cuándo se usa?</span>
                                  </div>
                                  <p className="explanation-text">{details.explanation}</p>
                                </div>
                              )}

                              {/* Authentic Context Example Box */}
                              {details.exampleEn && (
                                <div className="example-sentence-box" style={{ margin: '14px 0 16px' }}>
                                  <div className="example-sentence-header">
                                    <span>Ejemplo en inglés:</span>
                                  </div>
                                  <div className="example-sentence-en">
                                    <span>"{details.exampleEn}"</span>
                                    <button 
                                      onClick={(e) => speakText(details.exampleEn, e)}
                                      className="example-speak-btn"
                                      title="Escuchar frase completa"
                                    >
                                      <Volume2 size={15} />
                                    </button>
                                  </div>
                                  <div className="example-sentence-es">
                                    {details.exampleEs}
                                  </div>
                                </div>
                              )}

                              <div className="flashcard-author-watermark" style={{ margin: '16px 0 12px' }}>
                                <a 
                                  href={LINKEDIN_PROFILE_URL}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                  Hecha por <strong>Facundo Minatto</strong>
                                </a>
                              </div>
                              
                              <div className="rating-buttons-grid">
                                <button 
                                  className="btn-rating-pill rating-again" 
                                  onClick={() => handleRating(intervals.again, true)}
                                >
                                  Repetir
                                  <span className="interval-badge">{formatInterval(intervals.again)}</span>
                                </button>
                                <button 
                                  className="btn-rating-pill rating-hard" 
                                  onClick={() => handleRating(intervals.hard, true)}
                                >
                                  Difícil
                                  <span className="interval-badge">{formatInterval(intervals.hard)}</span>
                                </button>
                                <button 
                                  className="btn-rating-pill rating-good" 
                                  onClick={() => handleRating(intervals.good, true)}
                                >
                                  Bien
                                  <span className="interval-badge">{formatInterval(intervals.good)}</span>
                                </button>
                                <button 
                                  className="btn-rating-pill rating-easy" 
                                  onClick={() => handleRating(intervals.easy, true)}
                                >
                                  Fácil
                                  <span className="interval-badge">{formatInterval(intervals.easy)}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <button 
                          className="btn-primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPhraseTranslation(true);
                          }}
                          style={{ width: '100%', marginTop: 'auto' }}
                        >
                          Mostrar Respuesta
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Subtle footer watermark */}
              <div className="subtle-footer-watermark">
                <a 
                  href={LINKEDIN_PROFILE_URL}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="subtle-watermark-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>English Learning • Hecha por <strong>Facundo Minatto</strong></span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: GAMES MODE (ARCADE HUB, VOICE GAME, QUIZ, SCRAMBLE) */}
          {activeTab === 'games' && (
            <div>
              {/* SUB-VIEW 0: GAMES HUB SELECTOR */}
              {selectedGame === null && (
                <div className="games-hub-container card-anim-entering">
                  <div className="games-hero-banner">
                    <div className="games-hero-title">
                      <Gamepad2 size={24} color="var(--primary-color)" />
                      <span>Zona de Juegos</span>
                    </div>
                    <p className="games-hero-subtitle">
                      Practicá inglés de forma divertida. ¡Cualquier juego que completes cumple tu racha de hoy! 🔥
                    </p>
                  </div>

                  <div className="games-grid">
                    {/* GAME 1: Desafío de Voz (Pronunciación con Micrófono) */}
                    <div className="game-hub-card" onClick={startVoiceGame}>
                      <div className="game-hub-icon-box game-hub-icon-voice">
                        <Mic size={26} />
                      </div>
                      <div className="game-hub-content">
                        <div className="game-hub-header-row">
                          <span className="game-hub-title">Desafío de Voz</span>
                          <span className="game-hub-badge game-hub-badge-highlight">🎙️ Con Micrófono</span>
                        </div>
                        <p className="game-hub-desc">
                          Decí la palabra en inglés en voz alta. El reconocedor detecta tu pronunciación al instante.
                        </p>
                      </div>
                      <ArrowRight size={18} className="game-hub-arrow" />
                    </div>

                    {/* GAME 2: Quiz Clásico (Trivia) */}
                    <div className="game-hub-card" onClick={openQuizGame}>
                      <div className="game-hub-icon-box game-hub-icon-quiz">
                        <Target size={26} />
                      </div>
                      <div className="game-hub-content">
                        <div className="game-hub-header-row">
                          <span className="game-hub-title">Quiz Relámpago</span>
                          <span className="game-hub-badge">8 Preguntas</span>
                        </div>
                        <p className="game-hub-desc">
                          Elegí la traducción correcta entre 4 opciones y poné a prueba tu comprensión rápida.
                        </p>
                      </div>
                      <ArrowRight size={18} className="game-hub-arrow" />
                    </div>

                    {/* GAME 4: Wordle (Nuevo) */}
                    <div className="game-hub-card" onClick={() => setSelectedGame('wordle')}>
                      <div className="game-hub-icon-box" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                        <Target size={26} color="#fff" />
                      </div>
                      <div className="game-hub-content">
                        <div className="game-hub-header-row">
                          <span className="game-hub-title">Wordle Inglés</span>
                          <span className="game-hub-badge">5 Letras</span>
                        </div>
                        <p className="game-hub-desc">
                          El clásico juego. Adiviná la palabra en 6 intentos y repasá su significado.
                        </p>
                      </div>
                      <ArrowRight size={18} className="game-hub-arrow" />
                    </div>

                    {/* GAME 3: Ordenar Letras (Word Scramble) */}
                    <div className="game-hub-card" onClick={startScrambleGame}>
                      <div className="game-hub-icon-box game-hub-icon-scramble">
                        <Sparkles size={26} />
                      </div>
                      <div className="game-hub-content">
                        <div className="game-hub-header-row">
                          <span className="game-hub-title">Ordenar Letras</span>
                          <span className="game-hub-badge">Spelling</span>
                        </div>
                        <p className="game-hub-desc">
                          Ordená las letras desordenadas para formar la palabra correcta en inglés.
                        </p>
                      </div>
                      <ArrowRight size={18} className="game-hub-arrow" />
                    </div>

                    {/* GAME 5: Escucha y Escribe (Listen & Write) */}
                    <div className="game-hub-card" onClick={() => setSelectedGame('listen')}>
                      <div className="game-hub-icon-box" style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                        <Volume2 size={26} color="#fff" />
                      </div>
                      <div className="game-hub-content">
                        <div className="game-hub-header-row">
                          <span className="game-hub-title">Escucha y Escribe</span>
                          <span className="game-hub-badge">Frases</span>
                        </div>
                        <p className="game-hub-desc">
                          Entrená tu oído. Escuchá la frase y escribíla correctamente. Con pistas de ayuda.
                        </p>
                      </div>
                      <ArrowRight size={18} className="game-hub-arrow" />
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-VIEW 1: VOICE PRONUNCIATION GAME */}
              {selectedGame === 'voice' && (
                <div className="card-anim-entering">
                  <div className="game-top-bar">
                    <button className="btn-game-back" onClick={() => setSelectedGame(null)}>
                      <ArrowLeft size={14} /> Volver a Juegos
                    </button>
                    {!voiceFinished && voiceWords.length > 0 && (
                      <span className="badge-tag" style={{ margin: 0 }}>
                        {voiceCurrentIdx + 1} de {voiceWords.length}
                      </span>
                    )}
                  </div>

                  {voiceFinished ? (
                    <div className="main-card card-anim-entering" style={{ textAlign: 'center', padding: '36px 20px' }}>
                      <div style={{ display: 'inline-flex', padding: '18px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', marginBottom: '16px' }}>
                        <Mic size={44} color="#10B981" />
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                        ¡Desafío de Voz Completado! 🎙️🎉
                      </h2>
                      <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.5', marginBottom: '22px' }}>
                        ¡Excelente pronunciación! Acertaste {voiceScore} de {voiceWords.length} palabras.
                        <br />
                        <strong style={{ color: 'var(--primary-color)' }}>🔥 ¡Tu racha de hoy está asegurada!</strong>
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', maxWidth: '280px', margin: '0 auto' }}>
                        <button className="btn-primary" onClick={startVoiceGame}>
                          Jugar otra ronda 🎙️
                        </button>
                        <button className="btn-secondary" onClick={() => setSelectedGame(null)}>
                          Volver a Juegos
                        </button>
                      </div>
                    </div>
                  ) : voiceWords[voiceCurrentIdx] && (
                    <div className="main-card card-anim-entering">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="badge-tag">
                          <Mic size={14} /> Pronunciá con tu voz
                        </span>
                        <span className="queue-counter">
                          Aciertos: {voiceScore}
                        </span>
                      </div>

                      <div style={{ textAlign: 'center', margin: '14px 0 6px' }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '4px' }}>
                          Significado: <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>{voiceWords[voiceCurrentIdx].spanish}</strong>
                        </div>
                        <div className="card-word-title" style={{ fontSize: '30px', margin: '8px 0' }}>
                          {voiceWords[voiceCurrentIdx].english}
                        </div>
                        {getWordDetails(voiceWords[voiceCurrentIdx]).phonetic && (
                          <div style={{ fontSize: '13px', color: 'var(--primary-color)', fontFamily: 'monospace' }}>
                            /{getWordDetails(voiceWords[voiceCurrentIdx]).phonetic}/
                          </div>
                        )}
                      </div>

                      {/* Listen to native audio button */}
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 16px' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ fontSize: '12.5px', padding: '6px 14px', borderRadius: '999px' }}
                          onClick={(e) => speakText(voiceWords[voiceCurrentIdx].english, e)}
                        >
                          <Volume2 size={15} /> Escuchar cómo suena
                        </button>
                      </div>

                      {/* Big Hero Microphone Button */}
                      <div className="voice-hero-mic-container">
                        <button 
                          className={`voice-mic-main-btn ${voiceIsListening ? 'listening' : ''}`}
                          onClick={handleVoiceListen}
                          title={voiceIsListening ? 'Detener escucha' : 'Tocá y hablá'}
                        >
                          <Mic size={38} />
                        </button>
                        <div className="voice-mic-hint">
                          {voiceIsListening ? '🎙️ Escuchando... ¡hablá ahora!' : 'Tocá el micrófono para hablar'}
                        </div>
                        <div className="voice-mic-subhint">
                          {voiceIsListening ? 'Decí la palabra claramente en inglés' : 'Pronunciá la palabra en inglés'}
                        </div>
                      </div>

                      {/* Feedback Card */}
                      {voiceStatus === 'success' && (
                        <div className="voice-feedback-card success">
                          <div style={{ fontWeight: '800', fontSize: '15px' }}>
                            🎉 ¡Excelente pronunciación!
                          </div>
                          {voiceHeardText && (
                            <div style={{ fontSize: '13px' }}>
                              Reconocido: "<strong>{voiceHeardText}</strong>"
                            </div>
                          )}
                          <button 
                            className="btn-primary" 
                            style={{ marginTop: '8px', padding: '10px 16px', fontSize: '13.5px' }}
                            onClick={nextVoiceWord}
                          >
                            Siguiente palabra →
                          </button>
                        </div>
                      )}

                      {voiceStatus === 'retry' && (
                        <div className="voice-feedback-card retry">
                          <div style={{ fontWeight: '800', fontSize: '14px' }}>
                            {voiceFeedbackMsg}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '8px 14px', fontSize: '13px' }}
                              onClick={handleVoiceListen}
                            >
                              Reintentar 🎙️
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '8px 14px', fontSize: '13px' }}
                              onClick={nextVoiceWord}
                            >
                              Saltar ⏭️
                            </button>
                          </div>
                        </div>
                      )}

                      {voiceStatus === 'idle' && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ fontSize: '12px', opacity: 0.7, padding: '6px 12px' }}
                            onClick={nextVoiceWord}
                          >
                            Saltar palabra →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-VIEW 2: QUIZ CLÁSICO */}
              {selectedGame === 'quiz' && (
                <div className="card-anim-entering">
                  <div className="game-top-bar">
                    <button className="btn-game-back" onClick={() => setSelectedGame(null)}>
                      <ArrowLeft size={14} /> Volver a Juegos
                    </button>
                    {!quizFinished && quizQuestions.length > 0 && (
                      <span className="badge-tag" style={{ margin: 0 }}>
                        {quizCurrentIdx + 1} de {quizQuestions.length}
                      </span>
                    )}
                  </div>

                  {quizQuestions.length === 0 || quizFinished ? (
                    <div className="main-card card-anim-entering" style={{ textAlign: 'center', padding: '36px 20px' }}>
                      <div style={{ display: 'inline-flex', padding: '18px', borderRadius: '50%', background: 'var(--primary-light)', marginBottom: '16px' }}>
                        <Target size={44} color="var(--primary-color)" />
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                        {quizFinished ? `¡Quiz Terminado! 🎉` : 'Quiz Relámpago'}
                      </h2>
                      <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.5', marginBottom: '22px' }}>
                        {quizFinished 
                          ? `¡Excelente! Obtuviste ${quizScore} de ${quizQuestions.length} aciertos. ¡Tu racha de hoy está asegurada con este quiz!`
                          : 'Completar este quiz de 8 preguntas cumple tu racha de hoy automáticamente (¡sin necesidad de hacer palabras!).'}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', maxWidth: '280px', margin: '0 auto' }}>
                        <button className="btn-primary" onClick={startQuiz}>
                          {quizFinished ? 'Jugar otra vez' : 'Comenzar Desafío 🚀'}
                        </button>
                        <button className="btn-secondary" onClick={() => setSelectedGame(null)}>
                          Volver a Juegos
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="main-card card-anim-entering">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span className="badge-tag">
                          <Target size={14} /> Pregunta {quizCurrentIdx + 1} de {quizQuestions.length}
                        </span>
                        <span className="queue-counter">
                          Aciertos: {quizScore}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="card-audio-btn" 
                          onClick={(e) => speakText(quizQuestions[quizCurrentIdx].prompt, e)}
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>

                      <div className="card-word-title" style={{ fontSize: '28px', margin: '10px 0 20px' }}>
                        {quizQuestions[quizCurrentIdx].prompt}
                      </div>

                      <div className="quiz-options-container">
                        {quizQuestions[quizCurrentIdx].options.map((opt, i) => {
                          let btnStateClass = '';
                          if (quizSelectedAnswer !== null) {
                            if (opt === quizQuestions[quizCurrentIdx].correct) btnStateClass = 'quiz-correct';
                            else if (opt === quizSelectedAnswer) btnStateClass = 'quiz-wrong';
                          }

                          return (
                            <button 
                              key={i}
                              onClick={() => handleQuizAnswer(opt)}
                              className={`quiz-option-btn ${btnStateClass}`}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-VIEW 3: WORD SCRAMBLE GAME */}
              {selectedGame === 'scramble' && (
                <div className="card-anim-entering">
                  <div className="game-top-bar">
                    <button className="btn-game-back" onClick={() => setSelectedGame(null)}>
                      <ArrowLeft size={14} /> Volver a Juegos
                    </button>
                    {!scrambleFinished && scrambleWords.length > 0 && (
                      <span className="badge-tag" style={{ margin: 0 }}>
                        {scrambleIdx + 1} de {scrambleWords.length}
                      </span>
                    )}
                  </div>

                  {scrambleFinished ? (
                    <div className="main-card card-anim-entering" style={{ textAlign: 'center', padding: '36px 20px' }}>
                      <div style={{ display: 'inline-flex', padding: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', marginBottom: '16px' }}>
                        <Sparkles size={44} color="#F59E0B" />
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                        ¡Letras Ordenadas con Éxito! 🧩🎉
                      </h2>
                      <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.5', marginBottom: '22px' }}>
                        ¡Completaste todas las palabras! Acertaste {scrambleScore} de {scrambleWords.length}.
                        <br />
                        <strong style={{ color: 'var(--primary-color)' }}>🔥 ¡Tu racha diaria de hoy está cumplida!</strong>
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', maxWidth: '280px', margin: '0 auto' }}>
                        <button className="btn-primary" onClick={startScrambleGame}>
                          Jugar otra ronda 🧩
                        </button>
                        <button className="btn-secondary" onClick={() => setSelectedGame(null)}>
                          Volver a Juegos
                        </button>
                      </div>
                    </div>
                  ) : scrambleWords[scrambleIdx] && (
                    <div className="main-card card-anim-entering">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="badge-tag">
                          <Sparkles size={14} /> Ordenar Letras
                        </span>
                        <span className="queue-counter">
                          Aciertos: {scrambleScore}
                        </span>
                      </div>

                      <div style={{ textAlign: 'center', margin: '8px 0 14px' }}>
                        <div style={{ fontSize: '13.5px', color: 'var(--text-light)' }}>
                          Significado: <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>{scrambleWords[scrambleIdx].spanish}</strong>
                        </div>
                      </div>

                      {/* Target Letter Slots */}
                      <div className="scramble-slots-container">
                        {Array.from({ length: scrambleWords[scrambleIdx].english.length }).map((_, i) => {
                          const filled = scrambleSelectedLetters[i];
                          let slotClass = '';
                          if (filled) slotClass = 'filled';
                          if (scrambleStatus === 'success') slotClass = 'correct';
                          else if (scrambleStatus === 'wrong') slotClass = 'wrong';

                          return (
                            <div 
                              key={i} 
                              className={`scramble-slot ${slotClass}`}
                              onClick={() => filled && handleRemoveLetter(i)}
                            >
                              {filled ? filled.letter : ''}
                            </div>
                          );
                        })}
                      </div>

                      {/* Audio Hint & Clear Controls */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '999px' }}
                          onClick={(e) => speakText(scrambleWords[scrambleIdx].english, e)}
                        >
                          <Volume2 size={14} /> Pista de Audio
                        </button>
                        {scrambleSelectedLetters.length > 0 && scrambleStatus !== 'success' && (
                          <button 
                            className="btn-secondary" 
                            style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '999px' }}
                            onClick={handleClearScramble}
                          >
                            <RefreshCw size={14} /> Borrar
                          </button>
                        )}
                      </div>

                      {/* Status Feedback */}
                      {scrambleStatus === 'success' && (
                        <div className="voice-feedback-card success" style={{ marginBottom: '14px' }}>
                          <div style={{ fontWeight: '800', fontSize: '15px' }}>
                            ¡Correcto! 🎉 "{scrambleWords[scrambleIdx].english}"
                          </div>
                          <button 
                            className="btn-primary" 
                            style={{ marginTop: '6px', padding: '8px 14px' }}
                            onClick={nextScrambleWord}
                          >
                            Siguiente palabra →
                          </button>
                        </div>
                      )}

                      {scrambleStatus === 'wrong' && (
                        <div className="voice-feedback-card retry" style={{ marginBottom: '14px' }}>
                          <div style={{ fontWeight: '800', fontSize: '13.5px' }}>
                            ¡Casi! Probá ordenar las letras de nuevo.
                          </div>
                          <button 
                            className="btn-secondary" 
                            style={{ marginTop: '6px', padding: '6px 12px', fontSize: '12.5px' }}
                            onClick={handleClearScramble}
                          >
                            Reintentar
                          </button>
                        </div>
                      )}

                      {/* Letter Tiles Grid */}
                      <div className="scramble-letters-grid">
                        {scrambleAvailableLetters.map((item) => (
                          <button 
                            key={item.id}
                            className={`scramble-letter-btn ${item.used ? 'used' : ''}`}
                            onClick={() => handlePickLetter(item)}
                            disabled={item.used || scrambleStatus === 'success'}
                          >
                            {item.letter}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedGame === 'wordle' && (
                <Suspense fallback={<div style={{padding: '20px', textAlign: 'center'}}>Cargando juego...</div>}>
                  <WordleGame 
                    dictionary={fullDictionary}
                    onClose={() => setSelectedGame(null)}
                    onWin={() => {
                      // Update streak data for playing a game
                      setStreakData(prev => {
                        const today = getTodayStr();
                        const currentActs = (prev.todayActivities && prev.todayActivities.date === today)
                          ? { ...prev.todayActivities }
                          : { date: today, dailyCompleted: false, quizCompleted: false, phrasesReviewed: 0, cardsReviewedToday: 0 };
                        
                        currentActs.quizCompleted = true; // Mark game as completed
                        
                        let newLastDate = prev.lastDate;
                        let newCount = prev.count;
                        
                        if (prev.lastDate !== today) {
                          newLastDate = today;
                          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                          newCount = (prev.lastDate === yesterday) ? prev.count + 1 : (prev.count === 0 ? 1 : prev.count);
                          playFxSound('fanfare', soundEnabled);
                          triggerConfetti();
                          triggerHaptic(50);
                          setCelebrationMessage(`¡Racha de ${newCount} días asegurada! 🔥`);
                          setCelebrationActive(true);
                        }
                        
                        return { count: newCount, lastDate: newLastDate, todayActivities: currentActs };
                      });
                    }}
                    playFx={(type) => playFxSound(type, soundEnabled)}
                    speak={(text) => speakText(text, null)}
                  />
                </Suspense>
              )}

              {selectedGame === 'listen' && (
                <Suspense fallback={<div style={{padding: '20px', textAlign: 'center'}}>Cargando juego...</div>}>
                  <ListenWriteGame 
                    dictionary={fullDictionary}
                    onClose={() => setSelectedGame(null)}
                    onWin={() => {
                      setStreakData(prev => {
                        const today = getTodayStr();
                        const currentActs = (prev.todayActivities && prev.todayActivities.date === today)
                          ? { ...prev.todayActivities }
                          : { date: today, dailyCompleted: false, quizCompleted: false, phrasesReviewed: 0, cardsReviewedToday: 0 };
                        
                        currentActs.quizCompleted = true; // Mark as game completed
                        
                        let newLastDate = prev.lastDate;
                        let newCount = prev.count;
                        
                        if (prev.lastDate !== today) {
                          newLastDate = today;
                          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                          newCount = (prev.lastDate === yesterday) ? prev.count + 1 : (prev.count === 0 ? 1 : prev.count);
                          playFxSound('fanfare', soundEnabled);
                          triggerConfetti();
                          triggerHaptic(50);
                          setCelebrationMessage(`¡Racha de ${newCount} días asegurada! 🔥`);
                          setCelebrationActive(true);
                        }
                        
                        return { count: newCount, lastDate: newLastDate, todayActivities: currentActs };
                      });
                    }}
                    playFx={(type) => playFxSound(type, soundEnabled)}
                    speak={(text) => speakText(text, null)}
                  />
                </Suspense>
              )}

              {/* Subtle footer watermark */}
              <div className="subtle-footer-watermark">
                <a 
                  href={LINKEDIN_PROFILE_URL}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="subtle-watermark-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>English Learning • Hecha por <strong>Facundo Minatto</strong></span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: DICTIONARY & SEARCH */}
          {activeTab === 'dictionary' && (
            <div>
              {/* Search Input Bar */}
              <div className="search-wrapper">
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="search-input-field" 
                  placeholder="Buscar palabra o traducir..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                {searchTerm && (
                  <button 
                    className="search-clear-btn" 
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Horizontal Category Pill Filter Chips */}
              <div className="category-chips-scroll">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'movie', label: '🎬 Cine & Series (250+)' },
                  { id: 'phrasal', label: '🔄 En Frases (Phrasal Verbs)' },
                  { id: 'daily', label: '☕ Día a Día (180+)' },
                  { id: 'verbs', label: '🏃‍♂️ Verbos (100+)' },
                  { id: 'nouns', label: '📦 Sustantivos (100+)' },
                  { id: 'adjectives', label: '🌟 Adjetivos & Superlativos (100+)' },
                  { id: 'tech', label: '🔬 Ciencias & Tecnología (360+)' },
                  { id: 'scheduled', label: '⏳ En Memoria (Próximas)' },
                  { id: 'due', label: '⏰ Toca Repaso' },
                  { id: 'new', label: '✨ Nuevas' },
                  { id: 'custom', label: '⭐ Mis Palabras' }
                ].map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`category-chip ${categoryFilter === cat.id ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Metrics Bar */}
              <div className="stats-pill-grid">
                <div className="stats-pill">
                  <span className="stats-pill-val">{scheduledCount}</span>
                  <span className="stats-pill-lbl">En Memoria</span>
                </div>
                <div className="stats-pill">
                  <span className="stats-pill-val" style={{ color: dueReviewCount > 0 ? 'var(--btn-orange-txt)' : 'inherit' }}>
                    {dueReviewCount}
                  </span>
                  <span className="stats-pill-lbl">Toca Repaso</span>
                </div>
                <div className="stats-pill">
                  <span className="stats-pill-val">{fullDictionary.length}</span>
                  <span className="stats-pill-lbl">Total</span>
                </div>
              </div>

              {/* Random / A-Z Sorting & Counter Bar */}
              <div className="dict-sort-bar">
                <span className="dict-sort-count">
                  {filteredDictionary.length} {filteredDictionary.length === 1 ? 'palabra' : 'palabras'}
                </span>
                <div className="dict-sort-actions">
                  <button 
                    className={`dict-sort-btn ${dictSortOrder === 'random' ? 'active' : ''}`}
                    onClick={() => {
                      setDictSortOrder('random');
                      setRandomSeed(s => s + 1);
                    }}
                    title="Mezclar palabras aleatoriamente"
                  >
                    <Sparkles size={13} />
                    <span>Mezclar Aleatorio</span>
                  </button>
                  <button 
                    className={`dict-sort-btn ${dictSortOrder === 'az' ? 'active' : ''}`}
                    onClick={() => setDictSortOrder('az')}
                    title="Ordenar de la A a la Z"
                  >
                    <span>A-Z</span>
                  </button>
                </div>
              </div>

              {/* High-Performance Sliced Word List with Expandable Explanations */}
              <ul className="word-list">
                {displayedWords.map((word) => {
                  const prog = wordProgress[word.id];
                  const details = getWordDetails(word);
                  const isExpanded = expandedWordId === word.id;
                  let statusLabel = 'Nueva';
                  let chipClass = 'chip-new';
                  
                  if (prog && prog.interval > 0) {
                    statusLabel = getTimeUntilReview(prog.nextReview);
                    chipClass = statusLabel === 'Toca Repaso' ? 'chip-review' : 'chip-scheduled';
                  }

                  return (
                    <li 
                      key={word.id} 
                      className={`word-card-row ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                    >
                      <div className="word-card-row-main">
                        <div style={{ flex: 1 }}>
                          <div className="word-card-en">
                            <span>{word.english}</span>
                            {details.ipa && <span className="word-ipa">{details.ipa}</span>}
                            {details.cefr && <span className="word-cefr-badge">{details.cefr}</span>}
                            <button 
                              className={`word-audio-btn ${playingWordId === word.id ? 'audio-active-pulse' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingWordId(word.id);
                                speakText(word.english, e);
                                setTimeout(() => setPlayingWordId(null), 1200);
                              }} 
                              title="Escuchar pronunciación"
                              aria-label="Escuchar pronunciación"
                            >
                              <Volume2 size={18} />
                            </button>
                          </div>
                          <div className="word-card-es">{word.spanish}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`status-chip ${chipClass}`}>
                            {statusLabel}
                          </span>
                          <ChevronDown 
                            size={16} 
                            color="var(--text-muted)" 
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} 
                          />
                        </div>
                      </div>

                      {/* Expandable Meaning & Real Context */}
                      {isExpanded && (
                        <div className="word-card-expanded-content" onClick={(e) => e.stopPropagation()}>
                          {details.category && (
                            <div>
                              <span className="word-category-badge">{details.category}</span>
                            </div>
                          )}

                          {/* Grammar Block: Adjectives (Comparatives & Superlatives) */}
                          {word.category === 'adjective' && (word.comparative || word.superlative) && (
                            <div className="grammar-degrees-box">
                              <div className="grammar-degrees-title">
                                <Sparkles size={13} />
                                <span>Grados del Adjetivo</span>
                              </div>
                              <div className="grammar-degrees-grid">
                                <div className="grammar-degree-item">
                                  <span className="degree-label">Base</span>
                                  <span className="degree-val">{word.english}</span>
                                  <span className="degree-es">{word.spanish}</span>
                                </div>
                                <div className="grammar-degree-item">
                                  <span className="degree-label">Comparativo</span>
                                  <span className="degree-val">{word.comparative}</span>
                                  <span className="degree-es">{word.comparativeEs || 'Más...'}</span>
                                </div>
                                <div className="grammar-degree-item">
                                  <span className="degree-label">Superlativo</span>
                                  <span className="degree-val">{word.superlative}</span>
                                  <span className="degree-es">{word.superlativeEs || 'El más...'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Grammar Block: Verbs (Past & Participle) */}
                          {word.category === 'verb' && (word.past || word.participle) && (
                            <div className="grammar-degrees-box">
                              <div className="grammar-degrees-title">
                                <Sparkles size={13} />
                                <span>Formas Verbales Clave</span>
                              </div>
                              <div className="grammar-degrees-grid">
                                <div className="grammar-degree-item">
                                  <span className="degree-label">Infinitivo / Presente</span>
                                  <span className="degree-val">{word.english}</span>
                                </div>
                                <div className="grammar-degree-item">
                                  <span className="degree-label">Pasado Simple</span>
                                  <span className="degree-val">{word.past}</span>
                                </div>
                                <div className="grammar-degree-item">
                                  <span className="degree-label">Participio Pasado</span>
                                  <span className="degree-val">{word.participle}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Grammar Block: Nouns (Plural) */}
                          {word.category === 'noun' && word.plural && (
                            <div className="grammar-pill-info">
                              <span className="grammar-pill-tag">Plural:</span>
                              <span className="grammar-pill-text">{word.plural}</span>
                            </div>
                          )}
                          {details.explanation && (
                            <div className="explanation-box" style={{ margin: '4px 0' }}>
                              <div className="explanation-header">
                                <Sparkles size={13} />
                                <span>¿Qué significa y para qué sirve?</span>
                              </div>
                              <p className="explanation-text">{details.explanation}</p>
                            </div>
                          )}
                          {details.exampleEn && (
                            <div className="example-sentence-box" style={{ margin: '4px 0' }}>
                              <div className="example-sentence-header">
                                <span>Ejemplo en contexto real:</span>
                              </div>
                              <div className="example-sentence-en">
                                <span>"{details.exampleEn}"</span>
                                <button 
                                  onClick={(e) => speakText(details.exampleEn, e)}
                                  className="example-speak-btn"
                                  title="Escuchar frase completa"
                                >
                                  <Volume2 size={15} />
                                </button>
                              </div>
                              <div className="example-sentence-es">
                                {details.exampleEs}
                              </div>
                            </div>
                          )}

                          {/* Phrasal Verbs & Context Box (Sola vs. En Frases) */}
                          {details.phrasalExamples && details.phrasalExamples.length > 0 && (
                            <div className="phrasal-context-box">
                              <div className="phrasal-context-header">
                                <Sparkles size={13} />
                                <span>💡 Sola vs. En Frases (¡Ojo al contexto!)</span>
                              </div>
                              <div className="phrasal-alone-pill">
                                <strong>Sola significa:</strong> {details.aloneMeaning || word.spanish}
                                {details.contextNote && (
                                  <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {details.contextNote}
                                  </div>
                                )}
                              </div>
                              <div className="phrasal-list">
                                {details.phrasalExamples.map((item, idx) => (
                                  <div key={idx} className="phrasal-item">
                                    <div className="phrasal-item-top">
                                      <span className="phrasal-phrase">{item.phrase}</span>
                                      <span className="phrasal-arrow">➔</span>
                                      <span className="phrasal-meaning">{item.meaning}</span>
                                      <button 
                                        className="phrasal-audio-btn" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          speakText(item.phrase, e);
                                        }}
                                        title="Escuchar frase"
                                        aria-label="Escuchar pronunciación"
                                      >
                                        <Volume2 size={13} />
                                      </button>
                                    </div>
                                    {item.example && (
                                      <div className="phrasal-example">
                                        "{item.example}"
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Synonyms & Antonyms */}
                          {(details.synonyms?.length > 0 || details.antonyms?.length > 0) && (
                            <div className="synonyms-box">
                              {details.synonyms?.length > 0 && (
                                <div className="synonyms-row">
                                  <span className="synonym-tag">🔄 Sinónimos:</span>
                                  <span className="synonym-list">{details.synonyms.join(', ')}</span>
                                </div>
                              )}
                              {details.antonyms?.length > 0 && (
                                <div className="antonyms-row">
                                  <span className="antonym-tag">⚡ Antónimos:</span>
                                  <span className="antonym-list">{details.antonyms.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Spaced Repetition Schedule Detail Box */}
                          {prog && prog.interval > 0 && (
                            <div className="word-repetition-box">
                              <div className="repetition-header">
                                <Clock size={13} color="var(--primary-color)" />
                                <span>Cronograma de Repaso (SM-2)</span>
                              </div>
                              <div className="repetition-details-grid">
                                <div className="repetition-pill">
                                  <span className="repetition-lbl">Próxima aparición:</span>
                                  <span className="repetition-val">{getDetailedReviewDate(prog.nextReview)}</span>
                                </div>
                                <div className="repetition-pill">
                                  <span className="repetition-lbl">Intervalo de memoria:</span>
                                  <span className="repetition-val">{prog.interval} {prog.interval === 1 ? 'día' : 'días'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="word-author-watermark">
                            <Sparkles size={12} color="var(--primary-color)" />
                            <a 
                              href={LINKEDIN_PROFILE_URL}
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              English Learning • Hecha por <strong>Facundo Minatto</strong>
                            </a>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Load More Pagination Button */}
              {filteredDictionary.length > visibleCount && (
                <div style={{ textAlign: 'center' }}>
                  <button 
                    className="btn-load-more" 
                    onClick={() => setVisibleCount(c => c + 40)}
                  >
                    <span>Cargar más palabras ({filteredDictionary.length - visibleCount} restantes)</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
                
              {/* If Word Not Found: Infinite Translation Card */}
              {searchTerm.trim() !== '' && filteredDictionary.length === 0 && (
                <div className="main-card card-anim-entering" style={{ textAlign: 'center', marginTop: '20px', borderStyle: 'dashed' }}>
                  <Globe size={40} color="var(--primary-color)" style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>
                    "{searchTerm}" no está en tu lista local.
                  </p>
                  <p style={{ color: 'var(--text-light)', fontSize: '13.5px', marginBottom: '18px' }}>
                    Podemos traducirla al instante y agregarla permanentemente a tu mazo.
                  </p>
                  <button 
                    className="btn-primary" 
                    onClick={addNewWord} 
                    disabled={isTranslating} 
                    style={{ margin: '0 auto', maxWidth: '300px' }}
                  >
                    {isTranslating ? 'Traduciendo...' : '🌐 Traducir y Guardar'}
                  </button>
                </div>
              )}

              {/* Subtle footer watermark */}
              <div className="subtle-footer-watermark">
                <a 
                  href={LINKEDIN_PROFILE_URL}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="subtle-watermark-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>English Learning • Hecha por <strong>Facundo Minatto</strong></span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: LEADERBOARD & FRIENDS COMMUNITY */}
          {activeTab === 'leaderboard' && (
            <Suspense fallback={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <RefreshCw size={26} className="spin-animation" color="var(--primary-color)" />
                <span style={{ marginTop: '12px', fontSize: '13px' }}>Cargando ranking de la comunidad...</span>
              </div>
            }>
              <LeaderboardView 
                streakCount={streakData.count}
                wordsMastered={scheduledCount}
                phrasesMastered={Object.values(phraseProgress || {}).filter(p => p && p.interval > 0).length}
                todayActivities={streakData.todayActivities}
              />
            </Suspense>
          )}
        </div>
      </main>

      {/* Floating Bottom Navigation (5 tabs dock) */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'daily' ? 'active' : ''}`} 
          onClick={() => {
            setActiveTab('daily');
            setCardAnimClass('card-anim-entering');
            setShowStudyTranslation(false);
            if ((!studyQueue || studyQueue.length === 0) && !studyCompleted) {
              startNewSession(false);
            }
          }}
        >
          <BookOpen size={18} strokeWidth={activeTab === 'daily' ? 2.5 : 2} />
          <span>Repaso</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'phrases' ? 'active' : ''}`} 
          onClick={() => {
            setActiveTab('phrases');
            setCardAnimClass('card-anim-entering');
            setShowPhraseTranslation(false);
            if ((!phraseQueue || phraseQueue.length === 0) && !phraseStudyCompleted) {
              startNewPhraseSession(false);
            }
          }}
        >
          <MessageCircle size={18} strokeWidth={activeTab === 'phrases' ? 2.5 : 2} />
          <span>Frases</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={18} strokeWidth={activeTab === 'leaderboard' ? 2.5 : 2} />
          <span>Ranking</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'games' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('games'); setSelectedGame(null); }}
        >
          <Gamepad2 size={18} strokeWidth={activeTab === 'games' ? 2.5 : 2} />
          <span>Juegos</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'dictionary' ? 'active' : ''}`} 
          onClick={() => setActiveTab('dictionary')}
        >
          <Library size={18} strokeWidth={activeTab === 'dictionary' ? 2.5 : 2} />
          <span>Diccionario</span>
        </button>
      </nav>

      {/* Streak Goals Detail Modal */}
      {showStreakModal && (
        <div className="modal-overlay" onClick={() => setShowStreakModal(false)}>
          <div className="modal-sheet animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sheet-drag-handle" />
            
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={24} color="#F59E0B" fill="#F59E0B" />
                <h2 className="modal-title">Racha: {streakData.count} días</h2>
              </div>
              <button 
                onClick={() => setShowStreakModal(false)} 
                className="btn-icon" 
                style={{ width: '38px', height: '38px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.4', marginBottom: '16px' }}>
              {isStreakMetToday 
                ? '🎉 ¡Tu racha de hoy ya está asegurada! Cumpliste uno de tus objetivos diarios.' 
                : 'Cumplí CUALQUIERA de estas 3 opciones para mantener encendido tu fuego de hoy:'}
            </p>

            <div className="streak-goals-list">
              {/* Option 1: Daily Words */}
              <div className={`streak-goal-item ${streakData.todayActivities?.dailyCompleted ? 'done' : ''}`}>
                <div style={{ flex: 1 }}>
                  <div className="streak-goal-title">1. Repaso de Palabras</div>
                  <div className="streak-goal-desc">Completar la lección programada de hoy</div>
                </div>
                <span className={`streak-goal-badge ${streakData.todayActivities?.dailyCompleted ? 'goal-status-done' : 'goal-status-pending'}`}>
                  {streakData.todayActivities?.dailyCompleted ? 'Listo ✓' : 'Pendiente'}
                </span>
              </div>

              {/* Option 2: Quiz / Games */}
              <div 
                className={`streak-goal-item ${streakData.todayActivities?.quizCompleted ? 'done' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => { setShowStreakModal(false); setActiveTab('games'); setSelectedGame(null); }}
              >
                <div style={{ flex: 1 }}>
                  <div className="streak-goal-title">2. Juegos (Voz o Quiz)</div>
                  <div className="streak-goal-desc">Completar el Desafío de Voz o un Quiz</div>
                </div>
                <span className={`streak-goal-badge ${streakData.todayActivities?.quizCompleted ? 'goal-status-done' : 'goal-status-pending'}`}>
                  {streakData.todayActivities?.quizCompleted ? 'Listo ✓' : 'Pendiente'}
                </span>
              </div>

              {/* Option 3: 5 Phrases */}
              <div className={`streak-goal-item ${(streakData.todayActivities?.phrasesReviewed || 0) >= 5 ? 'done' : ''}`}>
                <div style={{ flex: 1 }}>
                  <div className="streak-goal-title">3. Repasar 5 Frases</div>
                  <div className="streak-goal-desc">
                    Progreso: {Math.min(streakData.todayActivities?.phrasesReviewed || 0, 5)} / 5 frases repasadas
                  </div>
                </div>
                <span className={`streak-goal-badge ${(streakData.todayActivities?.phrasesReviewed || 0) >= 5 ? 'goal-status-done' : 'goal-status-pending'}`}>
                  {(streakData.todayActivities?.phrasesReviewed || 0) >= 5 ? 'Listo ✓' : `${streakData.todayActivities?.phrasesReviewed || 0}/5`}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg-elevated)', borderRadius: '16px', padding: '12px 14px', marginTop: '16px', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              💡 <strong>Regla flexible:</strong> Con completar <strong>solo una</strong> de las tres alternativas, tu racha queda salvada. Las otras son opcionales si querés seguir aprendiendo.
            </div>

            <button 
              className="btn-primary" 
              style={{ marginTop: '18px' }} 
              onClick={() => setShowStreakModal(false)}
            >
              Entendido 👍
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (High-End iOS Bottom Sheet) */}
      {showSettings && (
        <div 
          className={`modal-overlay ${isClosingSettings ? 'closing' : ''}`} 
          onClick={closeSettingsModal}
        >
          <div 
            className={`modal-sheet ${isClosingSettings ? 'closing' : ''}`} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Pill Handle */}
            <div className="sheet-drag-handle" />

            {/* Modal Title Row */}
            <div className="modal-header">
              <h2 className="modal-title">Ajustes</h2>
              <button 
                onClick={closeSettingsModal} 
                className="btn-icon" 
                style={{ width: '38px', height: '38px' }}
                aria-label="Cerrar ajustes"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Clean Segmented Navigation Tabs */}
            <div className="settings-nav-tabs">
              <button 
                className={`settings-nav-tab ${settingsTab === 'general' ? 'active' : ''}`}
                onClick={() => setSettingsTab('general')}
              >
                <Palette size={15} />
                <span>Aspecto</span>
              </button>
              <button 
                className={`settings-nav-tab ${settingsTab === 'alerts' ? 'active' : ''}`}
                onClick={() => setSettingsTab('alerts')}
              >
                <Bell size={15} />
                <span>Alertas</span>
                {reminderEnabled && <span className="tab-indicator-dot" />}
              </button>
              <button 
                className={`settings-nav-tab ${settingsTab === 'study' ? 'active' : ''}`}
                onClick={() => setSettingsTab('study')}
              >
                <BookOpen size={15} />
                <span>Estudio</span>
              </button>
            </div>

            {/* TAB 1: Aspecto y Diseño */}
            {settingsTab === 'general' && (
              <div className="settings-tab-content animate-fade-in">
                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Tema de apariencia</span>
                  </div>
                  <div className="segmented-control">
                    <button 
                      onClick={() => setThemeMode('system')} 
                      className={`segmented-option ${themeMode === 'system' ? 'active' : ''}`}
                    >
                      <Smartphone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Celular
                    </button>
                    <button 
                      onClick={() => setThemeMode('light')} 
                      className={`segmented-option ${themeMode === 'light' ? 'active' : ''}`}
                    >
                      <Sun size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Claro
                    </button>
                    <button 
                      onClick={() => setThemeMode('dark')} 
                      className={`segmented-option ${themeMode === 'dark' ? 'active' : ''}`}
                    >
                      <Moon size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Oscuro
                    </button>
                  </div>
                </div>

                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Color de acento</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {COLOR_PALETTES.find(c => c.hex.toLowerCase() === (themeColor || '').toLowerCase())?.name || 'Elegido'}
                    </span>
                  </div>
                  <div className="color-swatches-grid">
                    {COLOR_PALETTES.map((c) => {
                      const isSelected = (themeColor || '').toLowerCase() === c.hex.toLowerCase();
                      return (
                        <button 
                          key={c.hex}
                          type="button"
                          onClick={() => {
                            setThemeColor(c.hex);
                            playFxSound('click', soundEnabled);
                            triggerHaptic(20);
                          }}
                          className={`color-swatch-circle ${isSelected ? 'selected' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                          aria-label={c.name}
                        >
                          {isSelected && (
                            <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 'bold', lineHeight: 1 }}>
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Efectos de sonido (Audio FX)</span>
                  </div>
                  <div className="segmented-control">
                    <button 
                      onClick={() => setSoundEnabled(true)} 
                      className={`segmented-option ${soundEnabled ? 'active' : ''}`}
                    >
                      Activados 🔔
                    </button>
                    <button 
                      onClick={() => setSoundEnabled(false)} 
                      className={`segmented-option ${!soundEnabled ? 'active' : ''}`}
                    >
                      Silencio 🔕
                    </button>
                  </div>
                </div>

                {/* Setting Card: Versión y Actualizaciones */}
                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={15} color="var(--primary-color)" />
                      <span>Versión y Actualizaciones</span>
                    </div>
                    <span className="update-platform-pill">
                      {getAppInfo().platform} • v{getAppInfo().version}
                    </span>
                  </div>

                  <div className="update-card-content">
                    <div className="update-info-row">
                      <span style={{ color: 'var(--text-muted)' }}>Compilación instalada:</span>
                      <code style={{ fontSize: '11.5px', background: 'var(--tag-bg)', padding: '2px 6px', borderRadius: '6px' }}>
                        {getAppInfo().commit}
                      </code>
                    </div>

                    {updateState.status === 'idle' && (
                      <button 
                        className="btn-update-action secondary"
                        onClick={handleCheckUpdates}
                      >
                        <RefreshCw size={15} />
                        <span>Revisar si hay actualizaciones</span>
                      </button>
                    )}

                    {updateState.status === 'checking' && (
                      <button 
                        className="btn-update-action secondary"
                        disabled
                        style={{ opacity: 0.8 }}
                      >
                        <RefreshCw size={15} className="spin-animation" />
                        <span>Buscando versión más reciente...</span>
                      </button>
                    )}

                    {updateState.status === 'upToDate' && (
                      <div className="update-box-result up-to-date">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: '700' }}>
                          <CheckCircle2 size={16} color="var(--primary-color)" />
                          <span>¡Tu aplicación está al día!</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                          Tienes instalada la versión más reciente ({updateState.info?.currentCommit || getAppInfo().commit}).
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button 
                            className="btn-update-action secondary" 
                            style={{ padding: '8px 12px', fontSize: '12px' }}
                            onClick={handleCheckUpdates}
                          >
                            <RefreshCw size={13} />
                            <span>Volver a comprobar</span>
                          </button>
                          {getAppInfo().isNative && (
                            <button 
                              className="btn-update-action secondary" 
                              style={{ padding: '8px 12px', fontSize: '12px' }}
                              onClick={() => window.open(updateState.info?.apkUrl || APK_DIRECT_URL, '_system')}
                            >
                              <Download size={13} />
                              <span>Descargar APK</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {updateState.status === 'available' && (
                      <div className="update-box-result available">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: '800', color: '#D97706' }}>
                          <Sparkles size={16} />
                          <span>¡Nueva versión encontrada!</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px' }}>
                          {updateState.info?.commitMessage ? (
                            <><strong>Cambios:</strong> {updateState.info.commitMessage}</>
                          ) : 'Hay nuevas mejoras y optimizaciones disponibles.'}
                        </p>
                        <button 
                          className="btn-update-action primary"
                          onClick={handleApplyUpdate}
                        >
                          {getAppInfo().isNative ? (
                            <>
                              <Download size={16} />
                              <span>Descargar e Instalar APK</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw size={16} />
                              <span>Actualizar aplicación ahora</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {updateState.status === 'error' && (
                      <div className="update-box-result error">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: '700', color: '#DC2626' }}>
                          <X size={16} />
                          <span>No se pudo comprobar</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                          {updateState.errorMsg || 'Verifica tu conexión a internet.'}
                        </p>
                        <button 
                          className="btn-update-action secondary"
                          style={{ padding: '8px 12px', fontSize: '12px' }}
                          onClick={handleCheckUpdates}
                        >
                          <RefreshCw size={13} />
                          <span>Reintentar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="settings-author-credit-container">
                  <a 
                    href={LINKEDIN_PROFILE_URL}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="settings-author-credit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Sparkles size={14} color="var(--primary-color)" />
                    <span>Hecha por <strong>Facundo Minatto</strong></span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: Alertas de Racha */}
            {settingsTab === 'alerts' && (
              <div className="settings-tab-content animate-fade-in">
                {/* Real-time Status Banner */}
                <div className={`alerts-status-banner ${isStreakMetToday ? 'completed' : 'pending'}`}>
                  {isStreakMetToday ? (
                    <>
                      <Check size={16} strokeWidth={3} />
                      <span>¡Racha salvada hoy! Las alertas están en pausa.</span>
                    </>
                  ) : (
                    <>
                      <Flame size={16} />
                      <span>Racha pendiente. Recibirás avisos hasta completarla.</span>
                    </>
                  )}
                </div>

                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Estado de alertas</span>
                    <span style={{ fontSize: '11px', color: reminderEnabled ? 'var(--success-color)' : 'var(--text-muted)', fontWeight: '700' }}>
                      {reminderEnabled ? `${reminderSchedule.length} AVISOS ACTIVOS` : 'DESACTIVADO'}
                    </span>
                  </div>

                  <div className="segmented-control">
                    <button 
                      onClick={() => {
                        setReminderEnabled(true);
                        if (notificationPermission !== 'granted') requestNotificationPermission();
                      }} 
                      className={`segmented-option ${reminderEnabled ? 'active' : ''}`}
                    >
                      Activadas 🔔
                    </button>
                    <button 
                      onClick={() => setReminderEnabled(false)} 
                      className={`segmented-option ${!reminderEnabled ? 'active' : ''}`}
                    >
                      Desactivadas 🔕
                    </button>
                  </div>
                </div>

                {reminderEnabled && (
                  <div className="setting-group-card">
                    <div className="setting-card-header">
                      <span>Frecuencia diaria</span>
                    </div>

                    <div className="preset-buttons-row">
                      <button 
                        className={`btn-preset-chip ${reminderSchedule.length === 5 ? 'active' : ''}`}
                        onClick={() => setReminderSchedule(['10:00', '14:00', '18:00', '21:00', '23:00'])}
                      >
                        Intensivo (5)
                      </button>
                      <button 
                        className={`btn-preset-chip ${reminderSchedule.length === 3 ? 'active' : ''}`}
                        onClick={() => setReminderSchedule(['12:00', '18:00', '21:00'])}
                      >
                        Moderado (3)
                      </button>
                      <button 
                        className={`btn-preset-chip ${reminderSchedule.length === 2 ? 'active' : ''}`}
                        onClick={() => setReminderSchedule(['20:00', '22:30'])}
                      >
                        Noche (2)
                      </button>
                    </div>

                    <div style={{ marginTop: '4px' }}>
                      <div className="schedule-chips-grid">
                        {reminderSchedule.map(time => {
                          const isAlreadySent = sentAlerts.date === getTodayStr() && sentAlerts.times?.includes(time);
                          return (
                            <span key={time} className={`schedule-chip ${isAlreadySent ? 'sent' : ''}`} title={isAlreadySent ? 'Ya enviado hoy' : 'Pendiente'}>
                              <Clock size={12} />
                              <span>{time}</span>
                              {reminderSchedule.length > 1 && (
                                <button 
                                  className="chip-remove-btn" 
                                  onClick={() => setReminderSchedule(prev => prev.filter(t => t !== time))}
                                  title="Quitar horario"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="add-alert-time-row">
                      <input 
                        type="time" 
                        value={newAlertTime} 
                        onChange={(e) => setNewAlertTime(e.target.value)} 
                        className="time-picker-input-small"
                      />
                      <button 
                        className="btn-add-time"
                        onClick={() => {
                          if (newAlertTime && !reminderSchedule.includes(newAlertTime)) {
                            setReminderSchedule(prev => [...prev, newAlertTime].sort());
                          }
                        }}
                      >
                        + Agregar horario
                      </button>
                    </div>

                    {notificationPermission !== 'granted' ? (
                      <button className="btn-enable-notif" onClick={requestNotificationPermission}>
                        <Bell size={15} /> Activar permisos de notificación del celular
                      </button>
                    ) : (
                      <button className="btn-test-notif" onClick={testReminderNotification}>
                        <span>Probar alerta de muestra</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    <div style={{ marginTop: '10px', fontSize: '11.5px', color: 'var(--text-light)', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '6px', textAlign: 'left' }}>
                      <Sparkles size={14} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>
                        Las notificaciones quedan programadas en el sistema de tu celular y <strong>sonarán en los horarios elegidos incluso con la app cerrada</strong>.
                      </span>
                    </div>
                  </div>
                )}

                <div className="settings-author-credit-container">
                  <a 
                    href={LINKEDIN_PROFILE_URL}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="settings-author-credit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Sparkles size={14} color="var(--primary-color)" />
                    <span>Hecha por <strong>Facundo Minatto</strong></span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: Estudio y Datos */}
            {settingsTab === 'study' && (
              <div className="settings-tab-content animate-fade-in">
                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Palabras nuevas por día</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {wordsPerDay} nuevas/día
                    </span>
                  </div>
                  <div className="segmented-control">
                    {[3, 5, 10, 15, 20].map((num) => (
                      <button 
                        key={num}
                        onClick={() => {
                          setWordsPerDay(num);
                          if (!studyCompleted && (!streakData.todayActivities?.cardsReviewedToday || streakData.todayActivities?.cardsReviewedToday === 0)) {
                            startNewSession(false, num);
                          }
                        }}
                        className={`segmented-option ${wordsPerDay === num ? 'active' : ''}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                    💡 <strong>Límite de palabras nuevas:</strong> Cada día recibirás hasta esta cantidad de palabras nuevas. Los repasos pendientes se acumulan y se suman automáticamente arriba de este límite para que no pierdas memoria.
                  </p>
                </div>

                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Frases nuevas por tanda</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {phrasesPerDay} nuevas/tanda
                    </span>
                  </div>
                  <div className="segmented-control">
                    {[3, 5, 10, 15].map((num) => (
                      <button 
                        key={num}
                        onClick={() => {
                          setPhrasesPerDay(num);
                          if (!phraseStudyCompleted && (!streakData.todayActivities?.phrasesReviewed || streakData.todayActivities?.phrasesReviewed === 0)) {
                            startNewPhraseSession(false, num);
                          }
                        }}
                        className={`segmented-option ${phrasesPerDay === num ? 'active' : ''}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                    💡 Se sumarán las frases nuevas elegidas junto a todas las que te toquen repasar hoy.
                  </p>
                </div>

                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Velocidad de pronunciación</span>
                  </div>
                  <div className="segmented-control">
                    {[
                      { label: '0.6x', val: 0.6 },
                      { label: '0.85x', val: 0.85 },
                      { label: '1.1x', val: 1.1 }
                    ].map((s) => (
                      <button 
                        key={s.val}
                        onClick={() => setVoiceSpeed(s.val)}
                        className={`segmented-option ${voiceSpeed === s.val ? 'active' : ''}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group-card">
                  <div className="setting-card-header">
                    <span>Copia de seguridad</span>
                  </div>
                  <div className="backup-row">
                    <button className="btn-backup" onClick={handleExportBackup} title="Exportar copia de seguridad">
                      <Download size={15} />
                      <span>Exportar</span>
                    </button>
                    <button className="btn-backup" onClick={() => fileInputRef.current?.click()} title="Importar copia desde archivo">
                      <Upload size={15} />
                      <span>Importar</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept=".json,application/json,text/plain,*/*"
                      onChange={handleImportBackup} 
                    />
                  </div>
                  <div className="backup-row secondary-row" style={{ marginTop: '8px' }}>
                    <button className="btn-backup secondary" onClick={handleCopyBackupToClipboard} title="Copiar copia de seguridad al portapapeles">
                      <Copy size={13} />
                      <span>Copiar datos</span>
                    </button>
                    <button className="btn-backup secondary" onClick={handleRestoreFromText} title="Restaurar copia pegando texto">
                      <Upload size={13} />
                      <span>Pegar datos</span>
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                    💡 Guarda tu progreso para transferirlo a otro celular o tener un respaldo seguro.
                  </p>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button 
                    className="btn-danger-pill"
                    onClick={() => { closeSettingsModal(); resetProgress(); }}
                  >
                    <Trash2 size={16} />
                    <span>Reiniciar Progreso y Datos</span>
                  </button>
                </div>

                <div className="settings-author-credit-container">
                  <a 
                    href={LINKEDIN_PROFILE_URL}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="settings-author-credit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Sparkles size={14} color="var(--primary-color)" />
                    <span>Hecha por <strong>Facundo Minatto</strong></span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Celebration Overlay - 2.4s auto-dismiss & returns smoothly to study view */}
      {celebrationActive && (
        <div className="celebration-overlay" onClick={() => setCelebrationActive(false)}>
          <div className="celebration-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-burst-icon">🎉</div>
            <h3 className="celebration-modal-title">{celebrationMessage || '¡Sesión Completada!'}</h3>
            <p className="celebration-modal-desc">
              Tu racha de hoy está guardada y tu meta diaria asegurada. 🔥
            </p>
            <div className="celebration-timer-bar">
              <div className="celebration-timer-fill"></div>
            </div>
            <button className="celebration-continue-btn" onClick={() => setCelebrationActive(false)}>
              Continuar repasando 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
