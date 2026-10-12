import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const STREAK_CHANNEL_ID = 'streak-reminders';

/**
 * Initializes the native Android notification channel for streak reminders.
 */
export async function initNotificationChannel() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.createChannel({
        id: STREAK_CHANNEL_ID,
        name: 'Recordatorios de Racha',
        description: 'Avisos para no perder tu racha diaria de inglés',
        importance: 4, // High importance (heads-up notification & sound)
        visibility: 1, // Public visibility on lockscreen
        vibration: true,
        lights: true,
        lightColor: '#28C28C'
      });
    } catch (err) {
      console.warn('Error creating notification channel:', err);
    }
  }
}

/**
 * Checks current notification permission status.
 * @returns {Promise<'granted' | 'denied' | 'default' | 'unsupported'>}
 */
export async function checkNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'default';
    } catch (err) {
      console.warn('Error checking native notification permissions:', err);
      return 'default';
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }

  return 'unsupported';
}

/**
 * Prompts user for system / OS notification permission.
 * On Android 13+, this triggers the native POST_NOTIFICATIONS runtime dialog.
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (err) {
      console.warn('Error requesting native notification permission:', err);
      return false;
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (err) {
      console.warn('Error requesting web notification permission:', err);
      return false;
    }
  }

  return false;
}

/**
 * Triggers an immediate sample / test notification.
 */
export async function sendImmediateNotification(title, body) {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 900000) + 100000,
            title,
            body,
            channelId: STREAK_CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 800), allowWhileIdle: true }
          }
        ]
      });
      return true;
    } catch (err) {
      console.warn('Error scheduling immediate native notification:', err);
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
      return true;
    } catch (err) {
      console.warn('Error dispatching web notification:', err);
    }
  }

  return false;
}

/**
 * Generates an appropriate motivational title and message depending on the hour.
 */
function getReminderMessageForHour(hour, streakCount = 1) {
  if (hour < 13) {
    return {
      title: '☀️ ¡Empezá el día con tu racha!',
      body: `Hacé un Quiz de 1 min o repasá 5 frases para asegurar tus ${streakCount} días de racha temprano.`
    };
  } else if (hour < 19) {
    return {
      title: '⏰ ¡Aviso de la tarde: tu racha te espera!',
      body: `Todavía tenés pendiente tu meta de hoy. ¡Mantené tus ${streakCount} días de inglés activos!`
    };
  } else if (hour < 22) {
    return {
      title: '🌙 ¡Aviso nocturno: no pierdas tu racha!',
      body: 'Se va terminando el día. Completá un repaso rápido de 8 preguntas o 5 frases antes de dormir.'
    };
  } else {
    return {
      title: '🚨 ¡Último aviso: tu racha está por terminar!',
      body: 'Queda poco para la medianoche. ¡Hacé tu repaso antes de que se reinicie tu contador!'
    };
  }
}

/**
 * Synchronizes background OS alarms for the next 7 days.
 * These notifications will fire at exact scheduled hours EVEN WHEN THE APP IS CLOSED.
 */
export async function syncScheduledReminders({
  reminderEnabled = true,
  reminderSchedule = ['10:00', '14:00', '18:00', '21:00', '23:00'],
  streakCount = 1,
  isStreakMetToday = false
}) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Clear any previously scheduled notifications
    if (typeof LocalNotifications.cancelAll === 'function') {
      await LocalNotifications.cancelAll();
    } else {
      const pending = await LocalNotifications.getPending();
      if (pending?.notifications?.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    }

    if (!reminderEnabled || !Array.isArray(reminderSchedule) || reminderSchedule.length === 0) {
      return;
    }

    // 2. Build schedule for the next 7 days (today = 0, up to day 6)
    const now = new Date();
    const notificationsToSchedule = [];
    const DAYS_TO_SCHEDULE = 7;

    for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
      // If user already saved their streak today, skip all remaining alerts for today!
      if (dayOffset === 0 && isStreakMetToday) {
        continue;
      }

      for (const timeStr of reminderSchedule) {
        const [hourStr, minStr] = timeStr.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minStr, 10);

        if (isNaN(hour) || isNaN(minute)) continue;

        const targetDate = new Date();
        targetDate.setDate(now.getDate() + dayOffset);
        targetDate.setHours(hour, minute, 0, 0);

        // Only schedule if it's strictly in the future
        if (targetDate.getTime() > now.getTime() + 10000) {
          const { title, body } = getReminderMessageForHour(hour, streakCount);
          // Generate deterministic unique 32-bit integer ID for this slot
          // (dayOffset 0-6, hour 0-23, min 0-59 -> max ~ 62359, well within 32-bit int)
          const notificationId = (dayOffset + 1) * 10000 + (hour * 100) + minute;

          notificationsToSchedule.push({
            id: notificationId,
            title,
            body,
            channelId: STREAK_CHANNEL_ID,
            schedule: {
              at: targetDate,
              allowWhileIdle: true
            }
          });
        }
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
    }
  } catch (err) {
    console.warn('Error synchronizing background notifications:', err);
  }
}
