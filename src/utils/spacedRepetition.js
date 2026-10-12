const MIN_30 = 30 / (24 * 60);
const HOUR_1 = 1 / 24;
const HOUR_4 = 4 / 24;

export const getIntervals = (currentInterval, easeFactor = 2.5) => {
  // Classic intervals fallback, but now incorporating ease factor
  if (!currentInterval || currentInterval === 0) {
    return { again: 0, hard: MIN_30, good: HOUR_1, easy: 1.0, newEase: easeFactor }; 
  }
  
  if (currentInterval < 0.9) {
    return { again: 0, hard: HOUR_4, good: 1.0, easy: 2.0, newEase: easeFactor };
  }
  
  // SM-2 Inspired Algorithm
  const hardInterval = Math.max(currentInterval * 1.2, currentInterval + 1);
  const goodInterval = Math.max(currentInterval * easeFactor, hardInterval + 1);
  const easyInterval = Math.max(currentInterval * easeFactor * 1.3, goodInterval + 1);

  return { 
    again: 0, 
    hard: Math.round(hardInterval * 10) / 10, 
    good: Math.round(goodInterval * 10) / 10, 
    easy: Math.round(easyInterval * 10) / 10,
    newEase: easeFactor 
  };
};

export const updateEaseFactor = (currentEase = 2.5, rating) => {
  // rating: 1 (again), 2 (hard), 3 (good), 4 (easy)
  let newEase = currentEase + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02));
  if (newEase < 1.3) newEase = 1.3;
  return newEase;
};

export const formatInterval = (days) => {
  if (!days || days === 0) return '<1m';
  if (days < 0.035) return `${Math.round(days * 24 * 60)}m`;
  if (days < 0.95) return `${Math.round(days * 24)}h`;
  if (days === 1) return '1d';
  if (days < 1.9) {
    const d = Math.round(days * 10) / 10;
    return d === 1 ? '1d' : `${d}d`;
  }
  if (days < 7) return `${Math.round(days)}d`;
  if (days < 30) return `${Math.round(days / 7)} sem`;
  return `${Math.round(days / 30)} mes`;
};

export const getTimeUntilReview = (nextReview) => {
  if (!nextReview) return 'Nueva';
  const diffMs = nextReview - Date.now();
  if (diffMs <= 0) return 'Toca Repaso';
  
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) return `En ${Math.max(1, diffMinutes)}m`;
  if (diffHours < 24) return `En ${diffHours}h`;
  if (diffDays === 1) return 'En 1 día';
  if (diffDays < 7) return `En ${diffDays} días`;
  if (diffDays < 30) return `En ${Math.round(diffDays / 7)} sem`;
  return `En ${Math.round(diffDays / 30)} mes`;
};

export const getDetailedReviewDate = (nextReview) => {
  if (!nextReview) return 'Aún no repasada';
  if (nextReview <= Date.now()) return '¡Toca repasar hoy!';
  const date = new Date(nextReview);
  const diffHours = (nextReview - Date.now()) / (1000 * 60 * 60);
  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  
  if (diffHours < 24 && date.getDate() === new Date().getDate()) {
    return `${getTimeUntilReview(nextReview)} (Hoy a las ${timeStr})`;
  }
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  return `${getTimeUntilReview(nextReview)} (${dayName} ${dayNum} de ${monthName})`;
};
