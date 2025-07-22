import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextEnhanced';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  persistent?: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationsContextType extends NotificationsState {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = 'talento_digital_notifications';

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true
  });

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${user?.id || 'guest'}`);
        const notifications = saved ? JSON.parse(saved) : [];
        const unreadCount = notifications.filter((n: Notification) => !n.read).length;

        setState({
          notifications,
          unreadCount,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (isAuthenticated && user) {
      loadNotifications();
    } else {
      setState({
        notifications: [],
        unreadCount: 0,
        isLoading: false
      });
    }
  }, [isAuthenticated, user]);

  // Auto-save notifications
  const saveNotifications = useCallback((notifications: Notification[]) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [user]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setState(prev => {
      const updated = [notification, ...prev.notifications];
      const unreadCount = updated.filter(n => !n.read).length;
      
      // Auto-save
      setTimeout(() => saveNotifications(updated), 0);
      
      return {
        ...prev,
        notifications: updated,
        unreadCount
      };
    });

    // Auto-remove non-persistent notifications after 5 seconds
    if (!notificationData.persistent) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  }, [saveNotifications]);

  const markAsRead = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = updated.filter(n => !n.read).length;
      
      setTimeout(() => saveNotifications(updated), 0);
      
      return {
        ...prev,
        notifications: updated,
        unreadCount
      };
    });
  }, [saveNotifications]);

  const markAllAsRead = useCallback(() => {
    setState(prev => {
      const updated = prev.notifications.map(n => ({ ...n, read: true }));
      
      setTimeout(() => saveNotifications(updated), 0);
      
      return {
        ...prev,
        notifications: updated,
        unreadCount: 0
      };
    });
  }, [saveNotifications]);

  const removeNotification = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.notifications.filter(n => n.id !== id);
      const unreadCount = updated.filter(n => !n.read).length;
      
      setTimeout(() => saveNotifications(updated), 0);
      
      return {
        ...prev,
        notifications: updated,
        unreadCount
      };
    });
  }, [saveNotifications]);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }));
    
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
    }
  }, [user]);

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return state.notifications.filter(n => n.type === type);
  }, [state.notifications]);

  return (
    <NotificationsContext.Provider value={{
      ...state,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      getNotificationsByType
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};