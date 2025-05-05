import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTelegram } from '../context/TelegramContext';
import Calendar from '../components/Calendar';
import SlotList from '../components/SlotList';
import EventDetails from '../components/EventDetails';
import PaymentConfirmation from '../components/PaymentConfirmation';
import BookingConfirmation from '../components/BookingConfirmation';
import { fetchMockEvents } from '../services/calendarService';
import { isBefore } from 'date-fns';

const CalendarView: React.FC = () => {
  const { 
    currentStep, 
    setCurrentStep,
    selectedDate, 
    selectedSlot,
    setSelectedSlot,
    isLoading, 
    setIsLoading 
  } = useApp();
  const { telegram } = useTelegram();
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (telegram?.BackButton) {
      if (currentStep !== 'calendar') {
        telegram.BackButton.show();
        telegram.BackButton.onClick(() => handleBack());
      } else {
        telegram.BackButton.hide();
      }
    }

    return () => {
      telegram?.BackButton.offClick?.(() => handleBack());
    };
  }, [currentStep, telegram?.BackButton]);

  useEffect(() => {
    if (selectedDate && currentStep === 'calendar') {
      if (isBefore(selectedDate, new Date())) {
        telegram?.showAlert('Please select a future date.');
        return;
      }
      loadSlots(selectedDate);
      setCurrentStep('slots');
    }
  }, [selectedDate]);

  const loadSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch from Google Calendar API
      const slots = await fetchMockEvents(date);
      const validSlots = slots.filter(slot => !isBefore(slot.endTime, new Date()));
      setAvailableSlots(validSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      telegram?.showAlert('Failed to load available time slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'slots':
        setCurrentStep('calendar');
        setSelectedSlot(null);
        break;
      case 'details':
        setCurrentStep('slots');
        setSelectedSlot(null);
        break;
      case 'payment':
        setCurrentStep('details');
        break;
      case 'confirmation':
        setCurrentStep('payment');
        break;
      default:
        setCurrentStep('calendar');
        setSelectedSlot(null);
    }
  };

  return (
    <div className="space-y-4">
      {currentStep === 'calendar' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-center">Book an Event</h1>
          <p className="text-center text-gray-600">Select a date to see available slots</p>
          <Calendar />
        </div>
      )}

      {currentStep === 'slots' && (
        <SlotList 
          slots={availableSlots} 
          isLoading={isLoading}
          onSelectSlot={(slot) => {
            if (isBefore(slot.endTime, new Date())) {
              telegram?.showAlert('This time slot is no longer available.');
              return;
            }
            setSelectedSlot(slot);
            setCurrentStep('details');
          }}
          date={selectedDate}
        />
      )}

      {currentStep === 'details' && selectedSlot && (
        <EventDetails 
          slot={selectedSlot}
          onProceedToPayment={() => setCurrentStep('payment')}
        />
      )}

      {currentStep === 'payment' && selectedSlot && (
        <PaymentConfirmation 
          slot={selectedSlot}
          onPaymentComplete={() => setCurrentStep('confirmation')}
        />
      )}

      {currentStep === 'confirmation' && selectedSlot && (
        <BookingConfirmation 
          slot={selectedSlot}
          onDone={() => {
            setCurrentStep('calendar');
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;