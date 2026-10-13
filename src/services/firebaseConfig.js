// src/services/firebaseConfig.js
// Configuración de Google Firebase Firestore
// Puedes rellenar estas variables aquí o mediante un archivo .env en la raíz del proyecto.

export const firebaseConfig = {
  apiKey: "AIzaSyA3D7JH6fzW77bSr7J_uZ9qKFNi54tcEE4",
  authDomain: "english-learning-a2f31.firebaseapp.com",
  projectId: "english-learning-a2f31",
  storageBucket: "english-learning-a2f31.firebasestorage.app",
  messagingSenderId: "736415300851",
  appId: "1:736415300851:web:6a082771d0198d5794cb86",
  measurementId: "G-HN5CV94YJJ"
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
