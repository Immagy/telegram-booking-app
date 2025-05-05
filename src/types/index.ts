export type BookingStep = 'slots' | 'details' | 'payment' | 'confirmation';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  price: number;
}

export interface BookingDetails {
  slotId: string;
  name: string;
  topic: string;
  startTime: Date;
  endTime: Date;
  price: number;
}