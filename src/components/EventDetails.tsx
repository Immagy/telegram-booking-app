import React, { useEffect } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { EventSlot } from '../types';
import { useTelegram } from '../context/TelegramContext';

interface EventDetailsProps {
  slot: EventSlot;
  onProceedToPayment: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ slot, onProceedToPayment }) => {
  const { telegram } = useTelegram();

  useEffect(() => {
    if (telegram?.MainButton) {
      telegram.MainButton.text = `Book for ${slot.price} ${slot.currency}`;
      telegram.MainButton.onClick(onProceedToPayment);
      telegram.MainButton.show();
    }

    return () => {
      if (telegram?.MainButton) {
        telegram.MainButton.hide();
        telegram.MainButton.offClick(onProceedToPayment);
      }
    };
  }, [telegram, slot, onProceedToPayment]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 p-4 text-white">
        <h2 className="text-xl font-bold">{slot.title}</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <p className="text-gray-700">{slot.description}</p>
        
        <div className="space-y-3 pt-2">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-gray-600">{formatDate(slot.startTime)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-gray-600">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
            </div>
          </div>
          
          {slot.location && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-gray-600">{slot.location}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Availability</p>
              <p className="text-gray-600">
                {slot.availableSpots} of {slot.totalSpots} spots available
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium">Price</span>
            <span className="text-xl font-bold text-blue-600">
              {slot.price} {slot.currency}
            </span>
          </div>
        </div>
      </div>
      
      {/* If not using Telegram MainButton */}
      {!telegram?.MainButton && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onProceedToPayment}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Book for {slot.price} {slot.currency}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetails;