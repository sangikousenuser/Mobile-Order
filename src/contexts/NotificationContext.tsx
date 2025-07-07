'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StaffCall, Order } from '@/types';

interface NotificationContextType {
  notifications: StaffCall[];
  newOrders: Order[];
  clearNotification: (id: string) => void;
  clearOrderNotification: (id: string) => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<StaffCall[]>([]);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [lastOrderCheck, setLastOrderCheck] = useState<Date>(new Date());

  // 通知音を再生する関数
  const playNotificationSound = () => {
    // Web Audio APIを使って通知音を生成
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (frequency: number, duration: number, delay: number = 0) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }, delay);
    };

    // 3回ビープ音を鳴らす
    playBeep(800, 0.2, 0);
    playBeep(800, 0.2, 300);
    playBeep(800, 0.2, 600);
  };

  // スタッフ呼び出しをポーリングで監視
  useEffect(() => {
    const checkForNewCalls = async () => {
      try {
        const response = await fetch('/api/admin/staff-calls');
        const staffCalls: StaffCall[] = await response.json();
        
        // 未対応の呼び出しのみフィルタ
        const pendingCalls = staffCalls.filter(call => call.status === 'pending');
        
        // 新しい呼び出しをチェック
        const newCalls = pendingCalls.filter(call => 
          new Date(call.createdAt) > lastCheck
        );

        if (newCalls.length > 0) {
          setNotifications(prevNotifications => {
            const existingIds = prevNotifications.map(n => n.id);
            const uniqueNewCalls = newCalls.filter(call => !existingIds.includes(call.id));
            
            if (uniqueNewCalls.length > 0) {
              playNotificationSound();
            }
            
            return [...prevNotifications, ...uniqueNewCalls];
          });
        }

        // 解決済みの通知を削除
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => 
            pendingCalls.some(call => call.id === notification.id)
          )
        );

        setLastCheck(new Date());
      } catch (error) {
        // ログを削減
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking for staff calls:', error);
        }
      }
    };

    // 最初の呼び出し
    checkForNewCalls();

    // 5秒間隔でポーリング
    const interval = setInterval(checkForNewCalls, 5000); // 5秒 = 5,000ms

    return () => clearInterval(interval);
  }, []); // 依存配列を空にして初回のみ実行

  // 新規注文をポーリングで監視
  useEffect(() => {
    const checkForNewOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const orders: Order[] = await response.json();
        
        // 新しい注文をチェック（pending状態のもののみ）
        const newPendingOrders = orders.filter(order => 
          order.status === 'pending' && new Date(order.createdAt) > lastOrderCheck
        );

        if (newPendingOrders.length > 0) {
          setNewOrders(prevOrders => {
            const existingIds = prevOrders.map(o => o.id);
            const uniqueNewOrders = newPendingOrders.filter(order => !existingIds.includes(order.id));
            
            if (uniqueNewOrders.length > 0) {
              playNotificationSound();
            }
            
            return [...prevOrders, ...uniqueNewOrders];
          });
        }

        setLastOrderCheck(new Date());
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking for new orders:', error);
        }
      }
    };

    // 最初の呼び出し
    checkForNewOrders();

    // 5秒間隔でポーリング
    const orderInterval = setInterval(checkForNewOrders, 5000);

    return () => clearInterval(orderInterval);
  }, []); // 依存配列を空にして初回のみ実行

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearOrderNotification = (id: string) => {
    setNewOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      newOrders,
      clearNotification,
      clearOrderNotification,
      playNotificationSound
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
