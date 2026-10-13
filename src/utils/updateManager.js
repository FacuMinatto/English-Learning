import { Capacitor } from '@capacitor/core';

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.3.1';
export const APP_COMMIT = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : '1a9d629';
export const APP_BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '';

export const GITHUB_REPO = 'FacuMinatto/English-Learning';
export const APK_DIRECT_URL = 'https://github.com/FacuMinatto/English-Learning/releases/latest/download/EnglishLearning.apk';
export const GITHUB_RELEASES_URL = 'https://github.com/FacuMinatto/English-Learning/releases';
export const REMOTE_VERSION_URL = 'https://facuminatto.github.io/English-Learning/version.json';

/**
 * Returns current local application build info
 */
export function getAppInfo() {
  const isNative = Capacitor.isNativePlatform();
  return {
    version: APP_VERSION,
    commit: APP_COMMIT,
    buildDate: APP_BUILD_DATE,
    platform: isNative ? 'Android APK' : 'Web / PWA',
    isNative
  };
}

/**
 * Checks GitHub for newer commits or releases
 */
export async function checkAppUpdates() {
  const isNative = Capacitor.isNativePlatform();

  try {
    // 1. Check latest commit from GitHub's public API
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits/main`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const latestSha = (data.sha || '').substring(0, 7);
      const commitMsg = data.commit?.message?.split('\n')[0] || '';
      const commitDate = data.commit?.committer?.date || '';

      // Compare with currently installed commit
      const current = APP_COMMIT;
      const hasUpdate = Boolean(
        latestSha && 
        current && 
        current !== 'dev' && 
        current !== 'latest' &&
        !latestSha.startsWith(current) && 
        !current.startsWith(latestSha)
      );

      return {
        success: true,
        hasUpdate,
        currentCommit: current,
        latestCommit: latestSha,
        commitMessage: commitMsg,
        commitDate,
        apkUrl: APK_DIRECT_URL,
        releasesUrl: GITHUB_RELEASES_URL,
        isNative
      };
    }

    // 2. Fallback to hosted version.json if GitHub API is rate-limited
    const versionUrl = isNative ? `${REMOTE_VERSION_URL}?t=${Date.now()}` : `./version.json?t=${Date.now()}`;
    const vRes = await fetch(versionUrl, { cache: 'no-store' });
    if (vRes.ok) {
      const vData = await vRes.json();
      const remoteCommit = (vData.commit || '').substring(0, 7);
      const hasUpdate = Boolean(
        remoteCommit && 
        APP_COMMIT && 
        APP_COMMIT !== 'dev' && 
        APP_COMMIT !== 'latest' &&
        !remoteCommit.startsWith(APP_COMMIT) &&
        !APP_COMMIT.startsWith(remoteCommit)
      );

      return {
        success: true,
        hasUpdate,
        currentCommit: APP_COMMIT,
        latestCommit: remoteCommit,
        commitMessage: 'Nueva versión disponible en la web',
        commitDate: vData.buildDate,
        apkUrl: vData.apkUrl || APK_DIRECT_URL,
        releasesUrl: vData.releasesUrl || GITHUB_RELEASES_URL,
        isNative
      };
    }

    throw new Error('No se pudo obtener información del servidor de actualizaciones.');
  } catch (err) {
    console.warn('Update check failed:', err);

    // If web, check if Service Worker has a pending update
    if (!isNative && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting) {
            return {
              success: true,
              hasUpdate: true,
              currentCommit: APP_COMMIT,
              latestCommit: 'Nueva versión PWA',
              commitMessage: 'Actualización en segundo plano lista para aplicar',
              isNative
            };
          }
        }
      } catch (swErr) {}
    }

    return {
      success: false,
      error: 'No se pudo conectar con el servidor de actualizaciones. Verifica tu conexión a internet.',
      isNative
    };
  }
}

/**
 * Triggers the update process
 */
export async function executeUpdate(updateInfo) {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // Open the download link directly in Android default browser/system
    const targetUrl = updateInfo?.apkUrl || APK_DIRECT_URL;
    window.open(targetUrl, '_system');
    return;
  }

  // Web / PWA: Force service worker update and refresh
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        await reg.update();
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.location.reload(true);
    }, 400);
  }
}
