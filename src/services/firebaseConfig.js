// src/services/firebaseConfig.js
// Configuración oficial de Google Firebase (Firestore y Auth)

export const firebaseConfig = {
  apiKey: "AIzaSyA3D7JH6fzW77bSr7J_uZ9qKFNi54tcEE4",
  authDomain: "english-learning-a2f31.firebaseapp.com",
  projectId: "english-learning-a2f31",
  storageBucket: "english-learning-a2f31.firebasestorage.app",
  messagingSenderId: "736415300851",
  appId: "1:736415300851:web:6a082771d0198d5794cb86",
  measurementId: "G-HN5CV94YJJ"
};

export function getSavedFirebaseConfig() {
  return firebaseConfig;
}

