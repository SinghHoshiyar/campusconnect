import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.token && !socket) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Join personal room on connect
      newSocket.on('connect', () => {
        newSocket.emit('joinRoom', user._id || (JSON.parse(localStorage.getItem('user') || '{}'))._id); // fallback if Context id missing
      });

      // Listen for incoming notifications
      newSocket.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        // Could also pop a toast here
      });

      // Initial fetch of unread DB notifications
      fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch(`http://localhost:5000/api/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
