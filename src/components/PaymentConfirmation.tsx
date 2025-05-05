import React, { useEffect, useState } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { EventSlot } from '../types';
import { processPayment } from '../services/paymentService';

interface PaymentConfirmationProps {
  slot: EventSlot;
  onPaymentComplete: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({ 
  slot, 
  onPaymentComplete 
}) => {
  const { telegram, user } = useTelegram();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card');

  useEffect(() => {
    if (telegram?.MainButton) {
      telegram.MainButton.text = "Pay Now";
      telegram.MainButton.onClick(handlePayment);
      telegram.MainButton.show();
    }

    return () => {
      if (telegram?.MainButton) {
        telegram.MainButton.hide();
        telegram.MainButton.offClick(handlePayment);
      }
    };
  }, [telegram, paymentMethod]);

  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    if (telegram?.MainButton) {
      telegram.MainButton.showProgress(true);
      telegram.MainButton.disable();
    }
    
    try {
      // In a real app, this would connect to a payment processor
      await processPayment({
        userId: user?.id,
        eventId: slot.id,
        amount: slot.price,
        currency: slot.currency,
        method: paymentMethod
      });
      
      // Payment successful
      onPaymentComplete();
    } catch (error) {
      console.error('Payment failed:', error);
      telegram?.showAlert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
      
      if (telegram?.MainButton) {
        telegram.MainButton.hideProgress();
        telegram.MainButton.enable();
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 p-4 text-white">
        <h2 className="text-xl font-bold">Payment Details</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-medium mb-2">Event</h3>
          <p className="text-gray-800">{slot.title}</p>
          <p className="text-gray-600 text-sm">
            {slot.startTime.toLocaleDateString()} at {slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-medium mb-2">Payment Method</h3>
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 px-4 rounded-md border transition-all ${
                paymentMethod === 'card' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              Card Payment
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md border transition-all ${
                paymentMethod === 'invoice' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('invoice')}
            >
              Invoice
            </button>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total</span>
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
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;