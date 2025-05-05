import { TimeSlot } from '../types';
import { loadConfig } from '../config';

export async function fetchGoogleCalendarEvents(date: Date) {
  const { GOOGLE_CALENDAR_API_KEY, GOOGLE_CALENDAR_ID } = await loadConfig();
  const timeMin = new Date(date.setHours(0,0,0,0)).toISOString();
  const timeMax = new Date(date.setHours(23,59,59,999)).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?key=${GOOGLE_CALENDAR_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка загрузки событий Google Calendar');
  const data = await response.json();
  return data.items; // массив событий
}

export async function fetchAvailableSlots(date: Date): Promise<TimeSlot[]> {
  const events = await fetchGoogleCalendarEvents(new Date(date));
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    const isBusy = events.some((event: any) => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      return (slotStart < eventEnd && slotEnd > eventStart);
    });
    slots.push({
      id: `${date.toISOString()}-${hour}`,
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable: !isBusy,
      price: 50
    });
  }
  return slots;
}