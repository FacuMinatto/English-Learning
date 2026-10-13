// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getSavedFirebaseConfig } from './firebaseConfig';

let app = null;
let db = null;
let isConfigured = false;

try {
  const config = getSavedFirebaseConfig();
  if (config && config.projectId && config.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    db = getFirestore(app);
    isConfigured = true;
  }
} catch (error) {
  console.warn('[Firebase] Initializing fallback mode:', error.message);
  isConfigured = false;
}

export function reinitializeFirebase() {
  try {
    const config = getSavedFirebaseConfig();
    if (config && config.projectId && config.apiKey) {
      app = getApps().length > 0 ? getApp() : initializeApp(config);
      db = getFirestore(app);
      isConfigured = true;
      return true;
    }
  } catch (e) {
    console.warn('[Firebase] Reinit failed:', e);
  }
  return false;
}

export { app, db, isConfigured };
