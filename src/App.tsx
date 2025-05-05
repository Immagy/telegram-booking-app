import React from 'react';
import { TelegramProvider } from './context/TelegramContext';
import Layout from './components/Layout';
import BookingView from './pages/BookingView';

function App() {
  return (
    <TelegramProvider>
      <Layout>
        <BookingView />
      </Layout>
    </TelegramProvider>
  );
}

export default App;