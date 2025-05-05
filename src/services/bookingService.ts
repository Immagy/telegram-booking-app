import { format } from 'date-fns';
import { TimeSlot } from '../types';
import { addHours, isBefore, startOfDay, endOfDay } from 'date-fns';

const CONSULTATION_PRICE = 50; // Fixed price in USD

export const isSlotInPast = (slot: TimeSlot): boolean => {
  return isBefore(slot.endTime, new Date());
};

export const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = startOfDay(date);
  const endTime = endOfDay(date);
  const now = new Date();

  // Генерируем слоты с 9:00 до 18:00
  for (let hour = 9; hour < 18; hour++) {
    const slotStart = addHours(startTime, hour);
    const slotEnd = addHours(startTime, hour + 1);

    // Проверяем, не в прошлом ли слот
    const isAvailable = !isBefore(slotEnd, now);

    slots.push({
      id: `${date.toISOString()}-${hour}`,
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable,
      price: 50
    });
  }

  return slots;
};

export const createInvoice = async (slot: TimeSlot) => {
  // Здесь будет реальная интеграция с платежной системой
  return {
    title: 'Consultation Booking',
    description: `1-hour consultation on ${slot.startTime.toLocaleDateString()} at ${slot.startTime.toLocaleTimeString()}`,
    payload: JSON.stringify({
      slotId: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString()
    }),
    currency: 'USD',
    prices: [{ label: 'Consultation', amount: slot.price * 100 }]
  };
};