import React, { useState, useEffect } from 'react';
import { format, isBefore } from 'date-fns';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { TimeSlot, BookingDetails, BookingStep } from '../types';
import { fetchAvailableSlots } from '../services/calendarService';
import Spinner from '../components/ui/Spinner';
import Calendar from '../components/Calendar';
import BackButton from '../components/BackButton';

const BookingView: React.FC = () => {
  const { telegram } = useTelegram();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>('slots');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingDetails, setBookingDetails] = useState<Partial<BookingDetails>>({
    name: '',
    topic: '',
    price: 50
  });
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    loadTimeSlots();
  }, [selectedDate]);

  useEffect(() => {
    if (telegram?.BackButton) {
      if (currentStep !== 'slots') {
        telegram.BackButton.show();
        telegram.BackButton.onClick(handleBack);
      } else {
        telegram.BackButton.hide();
      }
    }

    return () => {
      if (telegram?.BackButton) {
        telegram.BackButton.offClick(handleBack);
      }
    };
  }, [currentStep, telegram?.BackButton]);

  const loadTimeSlots = async () => {
    setIsLoading(true);
    try {
      const slots = await fetchAvailableSlots(selectedDate);
      const validSlots = slots.filter(slot => !isBefore(slot.endTime, new Date()));
      setTimeSlots(validSlots);
      setDebugInfo({
        selectedDate: selectedDate,
        allSlots: slots,
        validSlots: validSlots
      });
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      setDebugInfo({
        selectedDate: selectedDate,
        error: error instanceof Error ? error.message : error
      });
      telegram?.showAlert('Не удалось загрузить доступные слоты. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      telegram?.showAlert('Этот слот уже недоступен.');
      return;
    }
    setSelectedSlot(slot);
    setBookingDetails(prev => ({
      ...prev,
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price
    }));
    setCurrentStep('details');
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, new Date())) {
      telegram?.showAlert('Пожалуйста, выберите будущую дату.');
      return;
    }
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleBack = () => {
    switch (currentStep) {
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
        setCurrentStep('slots');
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      // Здесь должна быть интеграция с оплатой
      setCurrentStep('payment');
    } catch (error) {
      console.error('Ошибка создания оплаты:', error);
      telegram?.showAlert('Не удалось создать оплату. Попробуйте ещё раз.');
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Spinner />
        <p className="mt-4 text-gray-600">Загрузка доступных слотов...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Запись на консультацию</h1>
      
      {currentStep === 'slots' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center space-x-2 mb-2 hover:text-blue-600 transition-colors"
          >
            <CalendarIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              {selectedDate.toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).replace(/^./, str => str.toUpperCase())}
            </h2>
          </button>
          
          {showCalendar && (
            <div className="mb-4">
              <Calendar onSelectDate={handleDateSelect} selectedDate={selectedDate} />
            </div>
          )}
          
          <p className="text-gray-600 mb-4">1 час консультации — 50 ₽</p>
          
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleSlotSelect(slot)}
                disabled={!slot.isAvailable}
                className={`
                  w-full p-4 rounded-lg border transition-all
                  flex items-center justify-between
                  ${slot.isAvailable 
                    ? 'border-blue-200 hover:border-blue-500 hover:bg-blue-50' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'}
                `}
              >
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-blue-500" />
                  <span className={slot.isAvailable ? 'text-gray-900' : 'text-gray-500'}>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  slot.isAvailable ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {slot.isAvailable ? 'Доступно' : 'Занято'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'details' && selectedSlot && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <BackButton onClick={handleBack} show={true} />
          <h2 className="text-lg font-semibold mb-4">Детали бронирования</h2>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {format(selectedSlot.startTime, 'EEEE, d MMMM', {locale: undefined})} в {formatTime(selectedSlot.startTime)}
            </p>
          </div>
          
          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ваше имя
              </label>
              <input
                type="text"
                id="name"
                required
                value={bookingDetails.name}
                onChange={(e) => setBookingDetails(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите ваше имя"
              />
            </div>
            
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Тема консультации
              </label>
              <textarea
                id="topic"
                required
                value={bookingDetails.topic}
                onChange={(e) => setBookingDetails(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Опишите, что хотите обсудить"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Перейти к оплате
            </button>
          </form>
        </div>
      )}

      {currentStep === 'payment' && selectedSlot && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <BackButton onClick={handleBack} show={true} />
          <h2 className="text-lg font-semibold mb-4">Оплата</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Детали бронирования</h3>
              <p className="text-sm text-gray-600">
                {format(selectedSlot.startTime, 'EEEE, d MMMM', {locale: undefined})} в {formatTime(selectedSlot.startTime)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                1 час консультации, клиент: {bookingDetails.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Тема: {bookingDetails.topic}
              </p>
            </div>
            
            <div className="flex justify-between items-center py-2 border-t border-b border-gray-200">
              <span className="font-medium">Итого</span>
              <span className="text-xl font-bold">${bookingDetails.price}</span>
            </div>
            
            <p className="text-sm text-gray-500 text-center">
              Оплата будет обработана через Telegram
            </p>
          </div>
        </div>
      )}

      {/* Блок отладки */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-800">
        <b>Отладка:</b>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    </div>
  );
};

export default BookingView;