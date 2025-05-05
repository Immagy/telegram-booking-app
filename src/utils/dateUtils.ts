export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// In a real app, this would check with Google Calendar API
export const checkDateHasEvents = async (date: Date): Promise<boolean> => {
  // For demo purposes, randomly determine if a date has events
  // Weekends (Saturday and Sunday) are more likely to have events
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const randomChance = isWeekend ? 0.6 : 0.3;
  
  return Math.random() < randomChance;
};

export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};