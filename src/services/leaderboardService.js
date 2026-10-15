// src/services/leaderboardService.js
import { db, isConfigured } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

const STORAGE_USER_ID_KEY = 'el_user_id';
const STORAGE_PROFILE_KEY = 'el_user_profile';
const STORAGE_FRIENDS_KEY = 'el_friends_list';

export const AVATAR_LIST = [
  '🦉', '🦁', '🦊', '🚀', '⚡', '👑', '🎯', '🔥', '🏆', 
  '💎', '🌟', '🐬', '🐱', '🐼', '🐺', '🦄', '🦖', '☕'
];

/**
 * Obtiene o genera un identificador único persistente para este navegador/dispositivo
 */
export function getOrCreateUserId() {
  try {
    let id = localStorage.getItem(STORAGE_USER_ID_KEY);
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_USER_ID_KEY, id);
    }
    return id;
  } catch {
    return 'user_' + Date.now();
  }
}

/**
 * Retorna el perfil local del usuario
 */
export function getUserProfile() {
  const userId = getOrCreateUserId();
  const defaultProfile = {
    userId,
    name: 'Estudiante',
    avatar: '🦉',
    hasCustomized: false
  };

  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultProfile, ...parsed, userId };
    }
  } catch {}

  return defaultProfile;
}

/**
 * Guarda el perfil del usuario (Nombre y Avatar)
 */
export async function saveUserProfile(name, avatar) {
  const userId = getOrCreateUserId();
  const cleanName = (name || 'Estudiante').trim().slice(0, 24);
  const cleanAvatar = avatar || '🦉';

  const profile = {
    userId,
    name: cleanName,
    avatar: cleanAvatar,
    hasCustomized: true,
    updatedAt: Date.now()
  };

  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch {}

  // Sincronizar en Firebase si está configurado
  if (isConfigured && db) {
    try {
      const userRef = doc(db, 'leaderboard', userId);
      await setDoc(userRef, {
        userId,
        name: cleanName,
        avatar: cleanAvatar,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.warn('[Leaderboard] Error actualizando perfil en Firebase:', err);
    }
  }

  return profile;
}

/**
 * Calcula los puntos de experiencia (XP) basados en el progreso
 */
export function calculateXp({ streak = 0, wordsMastered = 0, phrasesMastered = 0, todayActivities = {} }) {
  const wordsXp = wordsMastered * 10;
  const phrasesXp = phrasesMastered * 15;
  const streakXp = streak * 60;
  const todayBonus = ((todayActivities?.cardsReviewedToday || 0) * 5) + ((todayActivities?.phrasesReviewed || 0) * 5);
  return Math.max(10, wordsXp + phrasesXp + streakXp + todayBonus);
}

/**
 * Sincroniza el puntaje actual del usuario en la base de datos
 */
export async function syncUserProgress({ streak = 0, wordsMastered = 0, phrasesMastered = 0, todayActivities = {} }) {
  const profile = getUserProfile();
  const xp = calculateXp({ streak, wordsMastered, phrasesMastered, todayActivities });

  const scoreData = {
    userId: profile.userId,
    name: profile.name,
    avatar: profile.avatar,
    streak: Number(streak) || 0,
    wordsMastered: Number(wordsMastered) || 0,
    phrasesMastered: Number(phrasesMastered) || 0,
    xp,
    lastActive: Date.now()
  };

  // Guardar copia local del último puntaje
  try {
    localStorage.setItem('el_my_cached_score', JSON.stringify(scoreData));
  } catch {}

  if (isConfigured && db) {
    try {
      const userRef = doc(db, 'leaderboard', profile.userId);
      await setDoc(userRef, scoreData, { merge: true });
    } catch (err) {
      console.warn('[Leaderboard] Error al sincronizar puntaje en Firebase:', err);
    }
  }

  return scoreData;
}

/**
 * Obtiene la lista de amigos guardados localmente
 * (Filtra automáticamente al propio usuario para evitar que se auto-agregue)
 */
export function getSavedFriends() {
  const myId = getOrCreateUserId();
  try {
    const raw = localStorage.getItem(STORAGE_FRIENDS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    
    // Purgar cualquier entrada que sea el propio usuario
    const cleaned = list.filter(f => f && f.userId && f.userId !== myId);
    if (cleaned.length !== list.length) {
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

/**
 * Sanitiza y valida rigurosamente los datos de un usuario del ranking
 * para evitar inyecciones, desbordes o fallos de renderizado en React.
 */
export function sanitizeLeaderboardEntry(raw, fallbackId = '') {
  if (!raw || typeof raw !== 'object') return null;
  const rawId = typeof raw.userId === 'string' && raw.userId ? raw.userId : fallbackId;
  const userId = String(rawId || '').trim().slice(0, 64);
  if (!userId) return null;

  const rawName = typeof raw.name === 'string' ? raw.name.trim() : 'Estudiante';
  const name = rawName.slice(0, 24) || 'Estudiante';

  const rawAvatar = typeof raw.avatar === 'string' ? raw.avatar.trim() : '🦉';
  const avatar = rawAvatar.slice(0, 4) || '🦉';

  const xp = typeof raw.xp === 'number' && Number.isFinite(raw.xp)
    ? Math.max(0, Math.min(Math.floor(raw.xp), 5000000))
    : 0;

  const streak = typeof raw.streak === 'number' && Number.isFinite(raw.streak)
    ? Math.max(0, Math.min(Math.floor(raw.streak), 5000))
    : 0;

  const wordsMastered = typeof raw.wordsMastered === 'number' && Number.isFinite(raw.wordsMastered)
    ? Math.max(0, Math.floor(raw.wordsMastered))
    : 0;

  const phrasesMastered = typeof raw.phrasesMastered === 'number' && Number.isFinite(raw.phrasesMastered)
    ? Math.max(0, Math.floor(raw.phrasesMastered))
    : 0;

  const lastActive = typeof raw.lastActive === 'number' && Number.isFinite(raw.lastActive)
    ? raw.lastActive
    : Date.now();

  return {
    userId,
    name,
    avatar,
    xp,
    streak,
    wordsMastered,
    phrasesMastered,
    lastActive
  };
}

/**
 * Agrega un amigo a la lista local
 * Retorna true si se agregó con éxito, false si es el propio usuario o ya existía
 */
export function addFriendLocally(friend) {
  if (!friend || typeof friend !== 'object' || !friend.userId || typeof friend.userId !== 'string') return false;
  const myId = getOrCreateUserId();
  const cleanId = friend.userId.trim().slice(0, 64);
  if (!cleanId || cleanId === myId) return false;

  const friends = getSavedFriends();
  if (friends.some(f => f.userId === cleanId)) return false;

  const cleanName = typeof friend.name === 'string' ? friend.name.trim().slice(0, 24) || 'Amigo' : 'Amigo';
  const cleanAvatar = typeof friend.avatar === 'string' && friend.avatar.length <= 4 ? friend.avatar.trim() : '⚡';

  friends.push({
    userId: cleanId,
    name: cleanName,
    avatar: cleanAvatar,
    addedAt: Date.now()
  });

  try {
    localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(friends));
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina un amigo de la lista local
 */
export function removeFriendLocally(userId) {
  const cleanId = String(userId || '').trim().slice(0, 64);
  const friends = getSavedFriends().filter(f => f.userId !== cleanId);
  try {
    localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(friends));
  } catch {}
  return friends;
}

/**
 * Obtiene el Ranking Global
 * Retorna únicamente usuarios reales registrados en Firebase (o el usuario actual).
 */
export async function getGlobalLeaderboard(myScore) {
  const sanitizedMyScore = myScore ? sanitizeLeaderboardEntry(myScore, myScore.userId) : null;

  if (isConfigured && db) {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((docSnap) => {
        const item = sanitizeLeaderboardEntry(docSnap.data(), docSnap.id);
        if (item) list.push(item);
      });

      // Asegurar que el usuario actual figure en la lista si no está en el top 50
      if (sanitizedMyScore && !list.some(u => u.userId === sanitizedMyScore.userId)) {
        list.push(sanitizedMyScore);
      }

      return list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } catch (err) {
      console.warn('[Leaderboard] Error al consultar ranking global en Firebase:', err);
    }
  }

  // Sin usuarios simulados: solo el usuario actual si no hay conexión o no hay más usuarios
  return sanitizedMyScore ? [sanitizedMyScore] : [];
}

/**
 * Obtiene el Ranking de Amigos
 */
export async function getFriendsLeaderboard(myScore) {
  const friends = getSavedFriends();
  const sanitizedMyScore = myScore ? sanitizeLeaderboardEntry(myScore, myScore.userId) : null;
  const myUserId = sanitizedMyScore?.userId || getOrCreateUserId();
  // Amigos reales excluyendo al usuario actual
  const validFriends = friends.filter(f => f && f.userId && f.userId !== myUserId);
  const friendIds = validFriends.map(f => f.userId);

  if (isConfigured && db && friendIds.length > 0) {
    try {
      const list = [];
      for (const f of validFriends) {
        try {
          const docSnap = await getDoc(doc(db, 'leaderboard', f.userId));
          if (docSnap.exists()) {
            const item = sanitizeLeaderboardEntry(docSnap.data(), docSnap.id);
            if (item) list.push(item);
          } else {
            list.push({
              userId: f.userId,
              name: String(f.name || 'Amigo').slice(0, 24),
              avatar: String(f.avatar || '⚡').slice(0, 4),
              xp: 0,
              streak: 0,
              wordsMastered: 0,
              phrasesMastered: 0
            });
          }
        } catch {}
      }

      if (sanitizedMyScore) {
        list.push(sanitizedMyScore);
      }

      return list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } catch (err) {
      console.warn('[Leaderboard] Fallback amigos:', err);
    }
  }

  // Fallback local: amigos reales agregados por el usuario
  const localList = validFriends.map(f => ({
    userId: f.userId,
    name: String(f.name || 'Amigo').slice(0, 24),
    avatar: String(f.avatar || '⚡').slice(0, 4),
    xp: Number(f.xp) || 0,
    streak: Number(f.streak) || 0,
    wordsMastered: Number(f.wordsMastered) || 0,
    phrasesMastered: Number(f.phrasesMastered) || 0
  }));

  if (sanitizedMyScore) localList.push(sanitizedMyScore);
  return localList.sort((a, b) => (b.xp || 0) - (a.xp || 0));
}

/**
 * Genera el enlace de invitación para amigos
 */
export function generateFriendShareData() {
  const profile = getUserProfile();
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://facuminatto.github.io/English-Learning/';
  const url = `${origin}?friendId=${encodeURIComponent(profile.userId)}&friendName=${encodeURIComponent(profile.name)}&friendAvatar=${encodeURIComponent(profile.avatar)}`;
  
  return {
    title: '¡Compitamos en English Learning!',
    text: `¡Hola! Te invito a agregarme en English Learning para comparar nuestras rachas y practicar juntos. Mi usuario es ${profile.avatar} ${profile.name}.`,
    url
  };
}
