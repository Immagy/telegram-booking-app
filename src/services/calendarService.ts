import { TimeSlot } from '../types';
import { loadConfig } from '../config';

export async function fetchGoogleCalendarEvents(date: Date) {
  console.log('[fetchGoogleCalendarEvents] Входная дата:', date);
  const { GOOGLE_CALENDAR_API_KEY, GOOGLE_CALENDAR_ID } = await loadConfig();
  console.log('[fetchGoogleCalendarEvents] Ключ:', GOOGLE_CALENDAR_API_KEY, 'ID:', GOOGLE_CALENDAR_ID);
  const timeMin = new Date(date.setHours(0,0,0,0)).toISOString();
  const timeMax = new Date(date.setHours(23,59,59,999)).toISOString();
  console.log('[fetchGoogleCalendarEvents] timeMin:', timeMin, 'timeMax:', timeMax);
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?key=${GOOGLE_CALENDAR_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
  console.log('[fetchGoogleCalendarEvents] URL:', url);
  const response = await fetch(url);
  console.log('[fetchGoogleCalendarEvents] response.ok:', response.ok);
  if (!response.ok) throw new Error('Ошибка загрузки событий Google Calendar');
  const data = await response.json();
  console.log('[fetchGoogleCalendarEvents] data.items:', data.items);
  return data.items; // массив событий
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