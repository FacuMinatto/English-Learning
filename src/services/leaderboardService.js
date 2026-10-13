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
 * Agrega un amigo a la lista local
 * Retorna true si se agregó con éxito, false si es el propio usuario o ya existía
 */
export function addFriendLocally(friend) {
  if (!friend || !friend.userId) return false;
  const myId = getOrCreateUserId();

  // No permitir auto-agregarse como amigo
  if (friend.userId === myId) return false;

  const friends = getSavedFriends();
  if (friends.some(f => f.userId === friend.userId)) return false;

  friends.push({
    userId: friend.userId,
    name: friend.name || 'Amigo',
    avatar: friend.avatar || '⚡',
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
  const friends = getSavedFriends().filter(f => f.userId !== userId);
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
  if (isConfigured && db) {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), userId: docSnap.id });
      });

      // Asegurar que el usuario actual figure en la lista si no está en el top 50
      if (myScore && !list.some(u => u.userId === myScore.userId)) {
        list.push(myScore);
      }

      return list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } catch (err) {
      console.warn('[Leaderboard] Error al consultar ranking global en Firebase:', err);
    }
  }

  // Sin usuarios simulados: solo el usuario actual si no hay conexión o no hay más usuarios
  return myScore ? [myScore] : [];
}

/**
 * Obtiene el Ranking de Amigos
 */
export async function getFriendsLeaderboard(myScore) {
  const friends = getSavedFriends();
  const myUserId = myScore?.userId || getOrCreateUserId();
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
            list.push({ ...docSnap.data(), userId: docSnap.id });
          } else {
            list.push({ userId: f.userId, name: f.name, avatar: f.avatar, xp: 0, streak: 0 });
          }
        } catch {}
      }

      if (myScore) {
        list.push(myScore);
      }

      return list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } catch (err) {
      console.warn('[Leaderboard] Fallback amigos:', err);
    }
  }

  // Fallback local: amigos reales agregados por el usuario
  const localList = validFriends.map(f => ({
    userId: f.userId,
    name: f.name,
    avatar: f.avatar,
    xp: f.xp || 0,
    streak: f.streak || 0
  }));

  if (myScore) localList.push(myScore);
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
