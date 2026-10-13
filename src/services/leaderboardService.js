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
 */
export function getSavedFriends() {
  try {
    const raw = localStorage.getItem(STORAGE_FRIENDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Agrega un amigo a la lista local
 */
export function addFriendLocally(friend) {
  if (!friend || !friend.userId) return false;
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
 * Simulación de comunidad activa realista si Firebase aún no fue conectado
 */
function getSimulatedCommunity(myScore) {
  const baseSimulated = [
    { userId: 'sim_1', name: 'Facu Minatto 👑', avatar: '🦁', streak: 12, xp: Math.max(2250, (myScore?.xp || 0) + 420), wordsMastered: 110, phrasesMastered: 45 },
    { userId: 'sim_2', name: 'Santi Dev', avatar: '🚀', streak: 9, xp: Math.max(1840, (myScore?.xp || 0) + 150), wordsMastered: 92, phrasesMastered: 35 },
    { userId: 'sim_3', name: 'Elena R.', avatar: '🦉', streak: 7, xp: Math.max(1420, (myScore?.xp || 0) - 80), wordsMastered: 74, phrasesMastered: 28 },
    { userId: 'sim_4', name: 'Lucas_English', avatar: '⚡', streak: 5, xp: Math.max(1150, (myScore?.xp || 0) - 220), wordsMastered: 60, phrasesMastered: 20 },
    { userId: 'sim_5', name: 'Sofía M.', avatar: '🦊', streak: 4, xp: Math.max(980, (myScore?.xp || 0) - 350), wordsMastered: 52, phrasesMastered: 16 },
    { userId: 'sim_6', name: 'Martín B.', avatar: '☕', streak: 3, xp: Math.max(760, (myScore?.xp || 0) - 490), wordsMastered: 40, phrasesMastered: 12 },
    { userId: 'sim_7', name: 'Camila G.', avatar: '💎', streak: 2, xp: Math.max(540, (myScore?.xp || 0) - 620), wordsMastered: 30, phrasesMastered: 10 }
  ];

  // Insertar al usuario actual
  const all = [...baseSimulated];
  if (myScore) {
    const existingIdx = all.findIndex(u => u.userId === myScore.userId);
    if (existingIdx >= 0) all[existingIdx] = myScore;
    else all.push(myScore);
  }

  // Ordenar por XP descendente
  return all.sort((a, b) => (b.xp || 0) - (a.xp || 0));
}

/**
 * Obtiene el Ranking Global
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
      console.warn('[Leaderboard] Fallback a datos locales:', err);
    }
  }

  return getSimulatedCommunity(myScore);
}

/**
 * Obtiene el Ranking de Amigos
 */
export async function getFriendsLeaderboard(myScore) {
  const friends = getSavedFriends();
  const friendIds = friends.map(f => f.userId);

  if (isConfigured && db && friendIds.length > 0) {
    try {
      const list = [];
      for (const f of friends) {
        try {
          const docSnap = await getDoc(doc(db, 'leaderboard', f.userId));
          if (docSnap.exists()) {
            list.push({ ...docSnap.data(), userId: docSnap.id });
          } else {
            list.push({ userId: f.userId, name: f.name, avatar: f.avatar, xp: 100, streak: 1 });
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

  // Fallback local
  const localList = friends.map(f => ({
    userId: f.userId,
    name: f.name,
    avatar: f.avatar,
    xp: 350,
    streak: 3
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
