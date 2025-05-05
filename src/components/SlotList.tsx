import * as React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { TimeSlot } from '../types';
import Spinner from './ui/Spinner';
import { JSX } from 'react';

interface SlotListProps {
  slots: TimeSlot[];
  isLoading: boolean;
  onSelectSlot: (slot: TimeSlot) => void;
  date: Date | null;
}

const SlotList: React.FC<SlotListProps> = ({ slots, isLoading, onSelectSlot, date }: SlotListProps) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner />
        <p className="mt-4 text-gray-600">Загрузка доступных слотов...</p>
      </div>
    );
  }

  if (!date) {
    return <div>Пожалуйста, выберите дату</div>;
  }

  const formattedDate = date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Доступные слоты</h2>
        <p className="text-gray-600">{formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}</p>
      </div>
      
      {slots.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">Нет доступных слотов на эту дату</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map(slot => (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-left">{slot.title || 'Консультация'}</h3>
                <span className="text-blue-600 font-medium">
                  {slot.price} ₽
                </span>
              </div>
              
              <div className="mt-2 flex items-center text-gray-600 text-sm">
                <Clock size={16} className="mr-1" />
                <span>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </span>
              </div>
              
              {slot.location && (
                <div className="mt-1 flex items-center text-gray-600 text-sm">
                  <MapPin size={16} className="mr-1" />
                  <span>{slot.location}</span>
                </div>
              )}
              
              <div className="mt-2 text-sm text-left">
                <span className={`px-2 py-1 rounded-full ${
                  slot.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {slot.isAvailable ? 'Доступно' : 'Занято'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlotList;