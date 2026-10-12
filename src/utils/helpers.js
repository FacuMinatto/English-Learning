export const getSaved = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch {
    return defaultVal;
  }
};

export const hexToRgb = (hex) => {
  let c = (hex || '#28C28C').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
};

export const adjustColorBrightness = (hex, percent) => {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (val) => Math.min(255, Math.max(0, Math.round(val + (val * percent / 100))));
  const r2 = adjust(r).toString(16).padStart(2, '0');
  const g2 = adjust(g).toString(16).padStart(2, '0');
  const b2 = adjust(b).toString(16).padStart(2, '0');
  return `#${r2}${g2}${b2}`;
};

export const getRandomFloat = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const uint32 = new Uint32Array(1);
    window.crypto.getRandomValues(uint32);
    return uint32[0] / (0xffffffff + 1);
  }
  return Math.random();
};

export const shuffleArray = (array) => {
  if (!array || array.length <= 1) return [...(array || [])];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(getRandomFloat() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
};

export const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const mulberry32 = (a) => () => {
  let t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const seededShuffle = (array, seed) => {
  if (!array || array.length <= 1) return [...(array || [])];
  const rng = mulberry32(seed);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};

export const triggerHaptic = (ms = 35) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(ms); } catch {}
  }
};
