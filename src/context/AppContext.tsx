import React, { createContext, useContext, useState } from 'react';
import { EventSlot } from '../types';

interface AppContextType {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedSlot: EventSlot | null;
  setSelectedSlot: (slot: EventSlot | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  currentStep: 'calendar' | 'slots' | 'details' | 'payment' | 'confirmation';
  setCurrentStep: (step: 'calendar' | 'slots' | 'details' | 'payment' | 'confirmation') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<EventSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'calendar' | 'slots' | 'details' | 'payment' | 'confirmation'>('calendar');

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedSlot,
        setSelectedSlot,
        isLoading,
        setIsLoading,
        currentStep,
        setCurrentStep
      }}
    >
      {children}
    </AppContext.Provider>
  );
};