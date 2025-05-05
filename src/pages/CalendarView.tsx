import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTelegram } from '../context/TelegramContext';
import Calendar from '../components/Calendar';
import SlotList from '../components/SlotList';
import EventDetails from '../components/EventDetails';
import PaymentConfirmation from '../components/PaymentConfirmation';
import BookingConfirmation from '../components/BookingConfirmation';
import { fetchAvailableSlots } from '../services/calendarService';
import { isBefore } from 'date-fns';
import BackButton from '../components/BackButton';

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
        telegram?.showAlert('Пожалуйста, выберите будущую дату.');
        return;
      }
      loadSlots(selectedDate);
      setCurrentStep('slots');
    }
  }, [selectedDate]);

  const loadSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      const slots = await fetchAvailableSlots(date);
      const validSlots = slots.filter(slot => !isBefore(slot.endTime, new Date()));
      setAvailableSlots(validSlots);
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      telegram?.showAlert('Не удалось загрузить доступные слоты. Попробуйте ещё раз.');
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
          <h1 className="text-2xl font-bold text-center">Запись на встречу</h1>
          <p className="text-center text-gray-600">Выберите дату, чтобы увидеть доступные слоты</p>
          <Calendar />
        </div>
      )}

      {currentStep === 'slots' && (
        <SlotList 
          slots={availableSlots} 
          isLoading={isLoading}
          onSelectSlot={(slot) => {
            if (isBefore(slot.endTime, new Date())) {
              telegram?.showAlert('Этот слот уже недоступен.');
              return;
            }
            setSelectedSlot(slot);
            setCurrentStep('details');
          }}
          date={selectedDate}
        />
      )}

      {currentStep === 'details' && selectedSlot && (
        <>
          <BackButton onClick={handleBack} show={true} />
          <EventDetails 
            slot={selectedSlot}
            onProceedToPayment={() => setCurrentStep('payment')}
          />
        </>
      )}

      {currentStep === 'payment' && selectedSlot && (
        <>
          <BackButton onClick={handleBack} show={true} />
          <PaymentConfirmation 
            slot={selectedSlot}
            onPaymentComplete={() => setCurrentStep('confirmation')}
          />
        </>
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