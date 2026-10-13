// src/services/firebaseConfig.js
// Configuración de Google Firebase Firestore
// Puedes rellenar estas variables aquí o mediante un archivo .env en la raíz del proyecto.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

/**
 * Permite guardar o sobreescribir la configuración de Firebase en localStorage
 * para que el usuario pueda vincular su proyecto sin tener que recompilar código.
 */
export function getSavedFirebaseConfig() {
  try {
    const custom = localStorage.getItem('app_firebase_custom_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch {}
  return firebaseConfig;
}

export function saveFirebaseCustomConfig(newConfig) {
  try {
    if (newConfig && newConfig.projectId) {
      localStorage.setItem('app_firebase_custom_config', JSON.stringify(newConfig));
      return true;
    }
  } catch {}
  return false;
}
