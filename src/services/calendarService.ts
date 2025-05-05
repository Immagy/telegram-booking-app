// Добавлена ссылка на сервер проекта
const SERVER_URL = 'https://telegram-booking-app.onrender.com';

import { TimeSlot } from '../types';
import { loadConfig } from '../config';
import readline from 'readline';

// Replaced the Node.js-specific 'open' module with a browser-compatible alternative
function openAuthUrl(authUrl: string) {
  if (typeof window !== 'undefined') {
    // Open the URL in a new browser tab in a browser environment
    window.open(authUrl, '_blank');
  } else {
    // Log a message for environments where 'window' is not available
    console.log('Please open the following URL in your browser:', authUrl);
  }
}

async function getRefreshToken() {
  const clientId = '973855272619-2l1i91lipmjbp2d6i2ns22l6n5c9mss6.apps.googleusercontent.com';
  const clientSecret = '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';
  const redirectUri = 'https://telegram-booking-app.onrender.com'; // Укажите ваш redirect URI

  // Сформируйте URL для авторизации
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events offline_access&` +
    `access_type=offline&` +
    `prompt=consent`;

  console.log('Откройте следующую ссылку в браузере для авторизации:');
  console.log(authUrl);

  // Открыть ссылку в браузере автоматически
  openAuthUrl(authUrl);

  console.log('После авторизации введите полученный код:');
  const code = await new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const input = window.prompt('Введите код:');
      resolve(input || '');
    } else {
      throw new Error('process.stdin недоступен в браузерной среде');
    }
  });

  // Обменять authorization code на токены
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Не удалось получить refresh token');
  }

  const data = await response.json();
  console.log('Ваш refresh token:', data.refresh_token);
  return data.refresh_token;
}

async function getAccessToken() {
  const clientId = '973855272619-2l1i91lipmjbp2d6i2ns22l6n5c9mss6.apps.googleusercontent.com';
  const clientSecret = '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';
  const refreshToken = await getRefreshToken(); // Динамическое получение refresh token через API

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchGoogleCalendarEvents(date: Date) {
  console.log('[fetchGoogleCalendarEvents] Входная дата:', date);
  const { GOOGLE_CALENDAR_ID } = await loadConfig();
  if (!GOOGLE_CALENDAR_ID) {
    throw new Error('Отсутствует ID календаря. Проверьте конфигурацию.');
  }

  console.log('[fetchGoogleCalendarEvents] ID:', GOOGLE_CALENDAR_ID);
  const timeMin = new Date(date.setHours(0, 0, 0, 0)).toISOString();
  const timeMax = new Date(date.setHours(23, 59, 59, 999)).toISOString();
  console.log('[fetchGoogleCalendarEvents] timeMin:', timeMin, 'timeMax:', timeMax);

  const accessToken = await getAccessToken();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
  console.log('[fetchGoogleCalendarEvents] URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('[fetchGoogleCalendarEvents] response.ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fetchGoogleCalendarEvents] Ошибка ответа API:', errorText);
      throw new Error(`Ошибка загрузки событий Google Calendar: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[fetchGoogleCalendarEvents] data.items:', data.items);
    return data.items; // массив событий
  } catch (error) {
    console.error('[fetchGoogleCalendarEvents] Ошибка при запросе:', error);
    throw new Error('Не удалось загрузить события из Google Calendar. Проверьте подключение и параметры.');
  }
}

export async function fetchAvailableSlots(date: Date): Promise<TimeSlot[]> {
  console.log('[fetchAvailableSlots] Входная дата:', date);
  const events = await fetchGoogleCalendarEvents(new Date(date));
  console.log('[fetchAvailableSlots] События:', events);
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    const isBusy = events.some((event: any) => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      const overlap = (slotStart < eventEnd && slotEnd > eventStart);
      if (overlap) {
        console.log(`[fetchAvailableSlots] Слот ${hour}: занят событием`, event);
      }
      return overlap;
    });
    slots.push({
      id: `${date.toISOString()}-${hour}`,
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable: !isBusy,
      price: 50
    });
  }
  console.log('[fetchAvailableSlots] Сформированные слоты:', slots);
  return slots;
}