'use client';

import { useState, useEffect, useRef } from 'react';
import { Order, MenuItem } from '@/types';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [newOrderNotification, setNewOrderNotification] = useState<string | null>(null);
  const prevOrderCountRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 通知音を準備
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaU2PLLeSsFJXfH8N2PDRL/RQAA'); // シンプルなビープ音
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    
    // 30秒間隔で自動更新
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, dateFilter]);

  // 新規注文の検知
  useEffect(() => {
    if (orders.length > 0 && prevOrderCountRef.current > 0) {
      const currentPendingCount = orders.filter(order => order.status === 'pending').length;
      const prevPendingCount = prevOrderCountRef.current;
      
      if (currentPendingCount > prevPendingCount) {
        const newOrders = orders.filter(order => order.status === 'pending').slice(0, currentPendingCount - prevPendingCount);
        if (newOrders.length > 0) {
          const orderText = newOrders.length === 1 
            ? `新規注文: テーブル${newOrders[0].tableId.replace('table-', '')}`
            : `${newOrders.length}件の新規注文`;
          
          setNewOrderNotification(orderText);
          
          // 通知音を再生
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }
          
          // 5秒後に通知を消す
          setTimeout(() => setNewOrderNotification(null), 5000);
        }
      }
    }
    
    prevOrderCountRef.current = orders.filter(order => order.status === 'pending').length;
  }, [orders]);

  const filterOrders = () => {
    let filtered = [...orders];

    // ステータスフィルタ
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // 日付フィルタ
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (dateFilter === 'today') {
      filtered = filtered.filter(order => new Date(order.createdAt) >= today);
    } else if (dateFilter === 'yesterday') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= yesterday && orderDate < today;
      });
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(order => new Date(order.createdAt) >= thisWeek);
    }

    // フィルタリング後も完了・キャンセル済みを下に表示するソート
    const statusOrder = {
      'pending': 1,
      'confirmed': 2,
      'preparing': 3,
      'ready': 4,
      'completed': 5,
      'cancelled': 6
    };
    
    filtered.sort((a, b) => {
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 99;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 99;
      
      if (aStatus !== bStatus) {
        return aStatus - bStatus;
      }
      
      // 同じステータス内では新しいものが上
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredOrders(filtered);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      // ステータス別にソート：pending -> confirmed -> preparing -> ready -> completed -> cancelled
      const statusOrder = {
        'pending': 1,
        'confirmed': 2,
        'preparing': 3,
        'ready': 4,
        'completed': 5,
        'cancelled': 6
      };
      
      const sortedOrders = data.sort((a: Order, b: Order) => {
        // 完了・キャンセル済みは下に
        const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 99;
        const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 99;
        
        if (aStatus !== bStatus) {
          return aStatus - bStatus;
        }
        
        // 同じステータス内では新しいものが上
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const getMenuItemName = (menuItemId: string) => {
    const item = menuItems.find(item => item.id === menuItemId);
    return item ? item.name : `商品ID: ${menuItemId}`;
  };

  const getStatistics = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayOrders = orders.filter(order => new Date(order.createdAt) >= todayStart);
    
    const stats = {
      totalToday: todayOrders.length,
      totalRevenue: todayOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0),
      pending: orders.filter(order => order.status === 'pending').length,
      preparing: orders.filter(order => order.status === 'preparing').length,
      ready: orders.filter(order => order.status === 'ready').length,
      activeSessions: new Set(orders
        .filter(order => order.sessionId && ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status))
        .map(order => order.sessionId)
      ).size
    };
    
    return stats;
  };

  // セッションIDからセッション名と詳細情報を抽出
  const getSessionInfo = (sessionId?: string, createdAt?: string) => {
    if (!sessionId) {
      // セッションIDが無い場合は注文日時をベースに生成
      if (createdAt) {
        const date = new Date(createdAt);
        return {
          name: `注文-${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`,
          type: 'legacy',
          color: 'bg-gray-200 text-gray-700'
        };
      }
      return {
        name: '-',
        type: 'none',
        color: 'bg-gray-100 text-gray-500'
      };
    }
    
    try {
      // session-timestamp-uuid形式からタイムスタンプを抽出
      const parts = sessionId.split('-');
      if (parts.length === 3 && parts[0] === 'session') {
        const timestamp = parseInt(parts[1]);
        const date = new Date(timestamp);
        return {
          name: `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`,
          type: 'current',
          color: 'bg-blue-100 text-blue-800'
        };
      } else if (parts.length === 3 && parts[0] === 'legacy') {
        // legacy-timestamp-uuid形式
        const timestamp = parseInt(parts[1]);
        const date = new Date(timestamp);
        return {
          name: `移行-${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`,
          type: 'legacy',
          color: 'bg-purple-100 text-purple-800'
        };
      } else if (sessionId.includes('table-') && sessionId.includes('-')) {
        // table-xxx-timestamp-uuid形式
        const match = sessionId.match(/table-[^-]+-(\d+)-/);
        if (match) {
          const timestamp = parseInt(match[1]);
          const date = new Date(timestamp);
          return {
            name: `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`,
            type: 'table',
            color: 'bg-green-100 text-green-800'
          };
        }
      }
    } catch (error) {
      console.error('Error parsing session ID:', error);
    }
    
    return {
      name: sessionId.substring(0, 12) + '...',
      type: 'unknown',
      color: 'bg-yellow-100 text-yellow-800'
    };
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-900 border border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-900 border border-blue-300';
      case 'preparing': return 'bg-orange-100 text-orange-900 border border-orange-300';
      case 'ready': return 'bg-green-100 text-green-900 border border-green-300';
      case 'completed': return 'bg-gray-200 text-black border border-gray-400 font-semibold';
      case 'cancelled': return 'bg-red-200 text-black border border-red-400 font-semibold';
      default: return 'bg-gray-200 text-black border border-gray-400 font-semibold';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '注文受付';
      case 'confirmed': return '注文確認';
      case 'preparing': return '調理中';
      case 'ready': return '提供準備完了';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  // 古い注文データのセッションID自動補完
  const migrateOldOrders = async () => {
    try {
      const ordersWithoutSession = orders.filter(order => !order.sessionId);
      if (ordersWithoutSession.length === 0) return;

      const updatedOrders = ordersWithoutSession.map(order => {
        const date = new Date(order.createdAt);
        const timestamp = date.getTime();
        const randomId = Math.random().toString(36).substring(2, 10);
        return {
          ...order,
          sessionId: `legacy-${timestamp}-${randomId}`
        };
      });

      // 一括更新API呼び出し
      for (const order of updatedOrders) {
        await fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: order.sessionId }),
        });
      }

      fetchOrders(); // 更新後に再取得
    } catch (error) {
      console.error('Error migrating old orders:', error);
    }
  };

  if (loading) {
    return <div className="p-8">読み込み中...</div>;
  }

  const stats = getStatistics();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 新規注文通知 */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            <span className="font-semibold">{newOrderNotification}</span>
          </div>
        </div>
      )}
      
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">注文管理</h1>
          <p className="text-black mt-2 font-medium">すべての注文を管理できます</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>自動更新中 (30秒間隔)</span>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '更新中...' : '手動更新'}
          </button>
        </div>
      </div>

      {/* 統計情報カード */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">本日の注文</h3>
          <p className="text-2xl font-bold text-black">{stats.totalToday}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">本日の売上</h3>
          <p className="text-2xl font-bold text-green-600">¥{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">受付中</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">調理中</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.preparing}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">準備完了</h3>
          <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">活動中セッション</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.activeSessions}</p>
        </div>
      </div>

      {/* フィルタリング */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">すべて</option>
              <option value="pending">注文受付</option>
              <option value="confirmed">注文確認</option>
              <option value="preparing">調理中</option>
              <option value="ready">提供準備完了</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">すべて</option>
              <option value="today">今日</option>
              <option value="yesterday">昨日</option>
              <option value="week">1週間</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={migrateOldOrders}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
              disabled={orders.filter(order => !order.sessionId).length === 0}
            >
              古いデータを移行 ({orders.filter(order => !order.sessionId).length}件)
            </button>
          </div>
          <div className="flex-1 text-right">
            <span className="text-sm text-gray-600">
              表示中: {filteredOrders.length}件 / 全{orders.length}件
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  注文ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  テーブル
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  セッション
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  注文内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  注文時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`${
                    order.status === 'completed' || order.status === 'cancelled' 
                      ? 'opacity-60 bg-gray-50' 
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    テーブル {order.tableId.replace('table-', '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {(() => {
                      const sessionInfo = getSessionInfo(order.sessionId, order.createdAt);
                      return (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${sessionInfo.color}`}>
                          {sessionInfo.name}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    <div className="max-w-xs">
                      {order.items.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.quantity}x {getMenuItemName(item.menuItemId)}
                          {item.notes && <div className="text-xs text-black">備考: {item.notes}</div>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    ¥{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-md ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {new Date(order.createdAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="pending">注文受付</option>
                      <option value="confirmed">注文確認</option>
                      <option value="preparing">調理中</option>
                      <option value="ready">提供準備完了</option>
                      <option value="completed">完了</option>
                      <option value="cancelled">キャンセル</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black">
              {statusFilter !== 'all' || dateFilter !== 'all' 
                ? '条件に一致する注文がありません' 
                : '注文がありません'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
