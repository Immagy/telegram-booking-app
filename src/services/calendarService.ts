import { EventSlot } from '../types';

// In a real app, this would connect to Google Calendar API
export const fetchMockEvents = async (date: Date): Promise<EventSlot[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Generate 0-4 random events for the selected date
  const numEvents = Math.floor(Math.random() * 5);
  const events: EventSlot[] = [];
  
  for (let i = 0; i < numEvents; i++) {
    const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
    const startTime = new Date(year, month, day, startHour, 0, 0);
    const endTime = new Date(year, month, day, startHour + 1, 0, 0);
    
    events.push({
      id: `event-${date.toISOString()}-${i}`,
      title: sampleEventTitles[Math.floor(Math.random() * sampleEventTitles.length)],
      description: "Join us for this exciting event. Learn new skills, meet interesting people, and have fun!",
      startTime,
      endTime,
      price: 10 + Math.floor(Math.random() * 40), // $10 to $50
      currency: "USD",
      availableSpots: 1 + Math.floor(Math.random() * 10), // 1 to 10 spots
      totalSpots: 10,
      location: Math.random() > 0.3 ? sampleLocations[Math.floor(Math.random() * sampleLocations.length)] : undefined
    });
  }
  
  return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

const sampleEventTitles = [
  "Yoga Session",
  "Business Workshop",
  "Photography Class",
  "Cooking Masterclass",
  "Language Exchange",
  "Web Development Basics",
  "Meditation Group",
  "Art Exhibition",
  "Dance Workshop",
  "Financial Planning Seminar"
];

const sampleLocations = [
  "Online (Zoom)",
  "Community Center",
  "Downtown Studio",
  "Innovation Hub",
  "Central Park",
  "Business Center"
];