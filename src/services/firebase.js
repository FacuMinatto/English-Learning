// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getSavedFirebaseConfig } from './firebaseConfig';

let app = null;
let db = null;
let auth = null;
let isConfigured = false;
let authInitPromise = null;

function initFirebaseInstances(config) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    isConfigured = true;

    // Iniciar sesión anónima en segundo plano
    authInitPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            resolve(cred.user);
          } catch (err) {
            console.warn('[Firebase Auth] Autenticación anónima pendiente de habilitar en consola:', err.message);
            resolve(null);
          }
        }
      });
    });
  } catch (error) {
    console.warn('[Firebase] Error al inicializar instancias:', error.message);
    isConfigured = false;
  }
}

try {
  const config = getSavedFirebaseConfig();
  if (config && config.projectId && config.apiKey) {
    initFirebaseInstances(config);
  }
} catch (error) {
  console.warn('[Firebase] Initializing fallback mode:', error.message);
  isConfigured = false;
}

/**
 * Garantiza que exista una sesión autenticada (anónima) antes de escribir en Firestore.
 * Retorna el usuario autenticado o null si está offline o no configurado.
 */
export async function ensureAuthUser() {
  if (!isConfigured || !auth) return null;
  if (auth.currentUser) return auth.currentUser;
  if (authInitPromise) {
    try {
      const user = await authInitPromise;
      if (user) return user;
    } catch {}
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('[Firebase Auth] Fallback ensureAuthUser:', err.message);
    return null;
  }
}

export function reinitializeFirebase() {
  try {
    const config = getSavedFirebaseConfig();
    if (config && config.projectId && config.apiKey) {
      initFirebaseInstances(config);
      return true;
    }
  } catch (e) {
    console.warn('[Firebase] Reinit failed:', e);
  }
  return false;
}

export { app, db, auth, isConfigured };

