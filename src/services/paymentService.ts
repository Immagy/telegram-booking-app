interface PaymentDetails {
  userId?: number;
  eventId: string;
  amount: number;
  currency: string;
  method: 'card' | 'invoice';
}

// Mock payment processing service
export const processPayment = async (details: PaymentDetails): Promise<{ success: boolean, transactionId: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate failure in 10% of cases
  if (Math.random() < 0.1) {
    throw new Error('Payment processing failed');
  }
  
  // Generate a mock transaction ID
  const transactionId = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
  
  return {
    success: true,
    transactionId
  };
};