'use client';

import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, Package, Utensils } from 'lucide-react';
import { Order } from '@/types';
import { useSession } from '@/contexts/SessionContext';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
}

export default function OrderHistoryModal({ isOpen, onClose, tableId }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { sessionId } = useSession();

  useEffect(() => {
    if (isOpen) {
      fetchOrderHistory();
    }
  }, [isOpen, tableId, sessionId]);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      // 注文履歴とメニュー情報を並行取得
      const [ordersResponse, menuResponse] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu')
      ]);
      
      if (ordersResponse.ok && menuResponse.ok) {
        const allOrders = await ordersResponse.json();
        const allMenuItems = await menuResponse.json();
        
        setMenuItems(allMenuItems);
        
        // このテーブルのセッションの注文のみフィルタリング
        let tableOrders = allOrders.filter((order: Order) => order.tableId === tableId);
        
        // セッションIDがある場合は、そのセッションの注文のみ表示
        if (sessionId) {
          tableOrders = tableOrders.filter((order: Order) => order.sessionId === sessionId);
        }
        
        // 新しい順にソート
        tableOrders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(tableOrders);
      }
    } catch (error) {
      console.error('注文履歴の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemName = (menuItemId: string) => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    return menuItem ? menuItem.name : '不明な商品';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '注文受付中';
      case 'confirmed': return '注文確認済み';
      case 'preparing': return '調理中';
      case 'ready': return '配膳準備完了';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'confirmed': return <CheckCircle className="text-blue-500" size={16} />;
      case 'preparing': return <Utensils className="text-orange-500" size={16} />;
      case 'ready': return <Package className="text-green-500" size={16} />;
      case 'completed': return <CheckCircle className="text-green-600" size={16} />;
      case 'cancelled': return <X className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-green-200 text-green-900 border-green-400';
      case 'cancelled': return 'bg-red-200 text-red-900 border-red-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">注文履歴</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-black font-medium">読み込み中...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-black text-lg font-semibold">注文履歴がありません</p>
              <p className="text-gray-600 mt-2">まだ注文が行われていません。</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 font-medium">
                        注文ID: {order.id.substring(0, 8)}...
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <p className="text-black font-medium">{getMenuItemName(item.menuItemId)}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-600">備考: {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-black font-medium">
                            {item.quantity}個 × ¥{item.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            ¥{(item.quantity * item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-black">合計金額</span>
                    <span className="text-xl font-bold text-black">
                      ¥{order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Customer Info */}
                  {order.customerName && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        お客様名: <span className="text-black font-medium">{order.customerName}</span>
                      </p>
                    </div>
                  )}

                  {/* Payment Info */}
                  {order.paymentCompletedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        会計完了: {new Date(order.paymentCompletedAt).toLocaleString('ja-JP')}
                      </p>
                      {order.paymentMethod && (
                        <p className="text-sm text-gray-600">
                          支払方法: {order.paymentMethod}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
