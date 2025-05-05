import React, { useEffect } from 'react';
import { Check, Calendar, Clock, MapPin } from 'lucide-react';
import { EventSlot } from '../types';
import { useTelegram } from '../context/TelegramContext';

interface BookingConfirmationProps {
  slot: EventSlot;
  onDone: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ slot, onDone }) => {
  const { telegram } = useTelegram();
  
  useEffect(() => {
    if (telegram?.MainButton) {
      telegram.MainButton.text = "Done";
      telegram.MainButton.onClick(onDone);
      telegram.MainButton.show();
    }

    return () => {
      if (telegram?.MainButton) {
        telegram.MainButton.hide();
        telegram.MainButton.offClick(onDone);
      }
    };
  }, [telegram, onDone]);

  // Generate a random booking ID
  const bookingId = Math.random().toString(36).substring(2, 10).toUpperCase();

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
      <div className="bg-green-600 p-8 text-white text-center">
        <div className="mx-auto flex items-center justify-center bg-white bg-opacity-20 rounded-full w-16 h-16 mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Booking Confirmed!</h2>
        <p className="mt-1">Your spot has been reserved</p>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="text-center border-b border-gray-200 pb-4">
          <p className="text-gray-500">Booking Reference</p>
          <p className="text-lg font-mono font-bold">{bookingId}</p>
        </div>
        
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-lg">{slot.title}</h3>
          
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-gray-600">{formatDate(slot.startTime)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-gray-600">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
            </div>
          </div>
          
          {slot.location && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-gray-600">{slot.location}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
          <p className="text-sm text-gray-600">
            A confirmation email has been sent with all the details. You can also find this booking in your Telegram account.
          </p>
        </div>
      </div>
      
      {/* If not using Telegram MainButton */}
      {!telegram?.MainButton && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onDone}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;