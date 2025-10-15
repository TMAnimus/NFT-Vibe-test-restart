import { useState, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import Marketplace from './components/Marketplace';
import NotificationToast from './components/NotificationToast';
import { io } from 'socket.io-client';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const isAuthenticated = () => {
    return localStorage.getItem('jwt_token') !== null;
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated()) return;

    // Setup global Socket.IO for notifications
    const socket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('jwt_token'),
      },
    });

    socket.on('connect', () => {
      console.log('Connected to notification system');
    });

    // Listen for auction notifications
    socket.on('notification', (data: any) => {
      let title = 'Auction Update';
      let type: 'success' | 'error' | 'info' | 'warning' = 'info';

      switch (data.type) {
        case 'outbid':
          title = 'You\'ve been outbid!';
          type = 'warning';
          break;
        case 'auctionWon':
          title = 'Congratulations!';
          type = 'success';
          break;
        case 'auctionSold':
          title = 'Auction Sold';
          type = 'success';
          break;
        case 'bidPlaced':
          title = 'New Bid';
          type = 'info';
          break;
        case 'auctionEnded':
          title = 'Auction Ended';
          type = 'info';
          break;
      }

      addNotification({
        type,
        title,
        message: data.message,
        duration: 8000
      });
    });

    // Listen for global notifications
    socket.on('globalNotification', (data: any) => {
      addNotification({
        type: 'info',
        title: 'Market Update',
        message: data.message,
        duration: 6000
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={isAuthenticated() ? <Marketplace /> : <Navigate to="/login" />}
        />
      </Routes>
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
      />
    </Router>
  );
}

export default App;
