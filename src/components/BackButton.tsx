import React, { useEffect } from 'react';
import { useTelegram } from '../context/TelegramContext';

interface BackButtonProps {
  onClick: () => void;
  show: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, show }) => {
  const { telegram } = useTelegram();

  useEffect(() => {
    if (telegram?.BackButton && show) {
      telegram.BackButton.show();
      telegram.BackButton.onClick(onClick);
      return () => {
        telegram.BackButton.hide();
        telegram.BackButton.offClick(onClick);
      };
    }
    // eslint-disable-next-line
  }, [show, telegram]);

  // Если не в Telegram, показываем обычную кнопку
  if (!telegram?.BackButton && show) {
    return (
      <button
        onClick={onClick}
        className="mb-4 text-blue-600 hover:underline flex items-center"
        type="button"
      >
        <span style={{ fontSize: 20, marginRight: 6 }}>←</span> Назад
      </button>
    );
  }
  return null;
};

export default BackButton; 