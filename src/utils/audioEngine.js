import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';

// Clean text helper for flexible voice matching
export const cleanVoiceText = (str) => {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const checkPronunciationMatch = (targetWord, heardAlternatives, strictMode = false) => {
  if (!targetWord || !heardAlternatives || heardAlternatives.length === 0) {
    return { matched: false, heard: '' };
  }

  const cleanTarget = cleanVoiceText(targetWord);
  const targetWords = cleanTarget.split(' ').filter(w => w.length > 1);

  const targetVariants = [cleanTarget];
  if (!strictMode && cleanTarget.startsWith('to ')) {
    targetVariants.push(cleanTarget.replace(/^to\s+/, ''));
  }

  for (const alt of heardAlternatives) {
    const cleanAlt = cleanVoiceText(alt);
    if (!cleanAlt) continue;

    for (const variant of targetVariants) {
      if (cleanAlt === variant) return { matched: true, heard: alt };
      if (!strictMode) {
        if (cleanAlt.includes(variant) || variant.includes(cleanAlt)) {
          return { matched: true, heard: alt };
        }
        const altWords = cleanAlt.split(' ');
        if (altWords.includes(variant)) {
          return { matched: true, heard: alt };
        }
      }
    }

    if (!strictMode && targetWords.length > 1 && targetWords.every(tw => cleanAlt.includes(tw))) {
      return { matched: true, heard: alt };
    }
  }

  return { matched: false, heard: heardAlternatives[0] || '' };
};

export const startListeningAudio = async ({ language = 'en-US' } = {}) => {
  const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const perm = await SpeechRecognition.checkPermissions();
      if (perm.speechRecognition !== 'granted') {
        const req = await SpeechRecognition.requestPermissions();
        if (req.speechRecognition !== 'granted') {
          return { success: false, error: "Permiso de micrófono denegado. Habilitalo en los ajustes de la aplicación." };
        }
      }

      const hasService = await SpeechRecognition.available();
      if (!hasService.available) {
        return { success: false, error: "El servicio de voz de Google no está disponible en este dispositivo." };
      }

      const result = await SpeechRecognition.start({
        language,
        maxResults: 5,
        popup: false,
        partialResults: false
      });

      return {
        success: true,
        matches: (result && result.matches && result.matches.length > 0) ? result.matches : []
      };
    } catch (err) {
      return { success: false, error: err.message || "Error al iniciar el reconocimiento de voz." };
    }
  }

  return new Promise((resolve) => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      resolve({ success: false, error: "El reconocimiento de voz no está soportado en este navegador web." });
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = language;
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;

      let resolved = false;

      recognition.onresult = (event) => {
        if (resolved) return;
        resolved = true;
        const matches = [];
        if (event.results && event.results[0]) {
          for (let i = 0; i < event.results[0].length; i++) {
            if (event.results[0][i].transcript) matches.push(event.results[0][i].transcript);
          }
        }
        resolve({ success: true, matches });
      };

      recognition.onerror = (event) => {
        if (resolved) return;
        resolved = true;
        resolve({ success: false, error: event.error || "No se detectó audio." });
      };

      recognition.onend = () => {
        if (!resolved) {
          resolved = true;
          resolve({ success: false, error: "La escucha terminó sin resultados." });
        }
      };

      recognition.start();
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
};

export const stopListeningAudio = async () => {
  const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform();
  if (isNative) {
    try { await SpeechRecognition.stop(); } catch { }
  }
};

let sharedAudioCtx = null;
export const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

export const playFxSound = (type, soundEnabled = true) => {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'fanfare') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.12, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.32);
      });
    } else if (type === 'again') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }
  } catch {}
};
