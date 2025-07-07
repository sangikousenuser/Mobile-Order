'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { X, Bell } from 'lucide-react';

export default function NotificationBanner() {
  const { notifications, newOrders, clearNotification, clearOrderNotification } = useNotifications();
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/admin/tables');
        const data = await response.json();
        setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, []);

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.number : '不明';
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      assistance: 'お手伝い',
      payment: 'お会計',
      cleaning: '清掃',
      other: 'その他'
    };
    return types[type] || type;
  };

  if (notifications.length === 0 && newOrders.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* 新規注文通知 */}
      {newOrders.map((order) => (
        <div
          key={`order-${order.id}`}
          className="bg-green-500 text-white p-4 rounded-lg shadow-lg animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 animate-bounce" />
              <div>
                <div className="font-semibold">
                  新規注文 - テーブル {getTableNumber(order.tableId)}
                </div>
                <div className="text-sm opacity-90">
                  ¥{order.totalAmount.toLocaleString()} ({order.items.length}品)
                </div>
                <div className="text-xs opacity-70">
                  {new Date(order.createdAt).toLocaleTimeString('ja-JP')}
                </div>
              </div>
            </div>
            <button
              onClick={() => clearOrderNotification(order.id)}
              className="text-white hover:text-gray-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* スタッフ呼び出し通知 */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-red-500 text-white p-4 rounded-lg shadow-lg animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 animate-bounce" />
              <div>
                <div className="font-semibold">
                  スタッフ呼び出し - テーブル {getTableNumber(notification.tableId)}
                </div>
                <div className="text-sm opacity-90">
                  {getTypeLabel(notification.type)}
                </div>
                {notification.message && (
                  <div className="text-xs opacity-80 mt-1">
                    {notification.message}
                  </div>
                )}
                <div className="text-xs opacity-70">
                  {new Date(notification.createdAt).toLocaleTimeString('ja-JP')}
                </div>
              </div>
            </div>
            <button
              onClick={() => clearNotification(notification.id)}
              className="text-white hover:text-gray-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {(notifications.length > 0 || newOrders.length > 0) && (
        <div className="text-center">
          <a
            href="/admin/orders"
            className="inline-block bg-white text-green-500 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors mr-2"
          >
            注文管理
          </a>
          {notifications.length > 0 && (
            <a
              href="/admin/staff-calls"
              className="inline-block bg-white text-red-500 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              呼び出し対応
            </a>
          )}
        </div>
      )}
    </div>
  );
}
