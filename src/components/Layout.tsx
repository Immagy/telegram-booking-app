import React from 'react';
import { useTelegram } from '../context/TelegramContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { telegram } = useTelegram();
  
  // Use Telegram theme colors if available, otherwise use defaults
  const bgColor = telegram?.themeParams?.bg_color || '#ffffff';
  const textColor = telegram?.themeParams?.text_color || '#000000';
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <main className="flex-1 container mx-auto px-4 py-4 max-w-md">
        {children}
      </main>
    </div>
  );
};

export default Layout;