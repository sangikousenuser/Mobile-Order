'use client';

import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useSession } from '@/contexts/SessionContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string;
}

export default function CartModal({ isOpen, onClose, tableId }: CartModalProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const { sessionId } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');

  if (!isOpen) return null;

  const handleSubmitOrder = async () => {
    if (!tableId) {
      showToast('テーブル情報が必要です', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('カートが空です', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        tableId,
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.menuItem.price,
          notes: item.notes || ''
        })),
        customerName: customerName || '匿名',
        totalAmount: getTotalPrice(),
        notes: '',
        sessionId: sessionId
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        clearCart();
        setCustomerName('');
        onClose();
        showToast('注文が正常に送信されました！厨房で調理を開始します。', 'success', 4000);
      } else {
        throw new Error('注文の送信に失敗しました');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      showToast('注文の送信に失敗しました。もう一度お試しください。', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingCart className="mr-2" size={24} />
            カート
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {items.length === 0 ? (
            <div className="p-8 text-center text-black font-semibold">
              カートが空です
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-black">{item.menuItem.name}</h3>
                    <p className="text-sm text-black font-semibold">¥{item.menuItem.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>合計:</span>
              <span>¥{getTotalPrice().toLocaleString()}</span>
            </div>
            
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-black mb-1">
                お名前（任意）
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="お名前を入力してください"
              />
            </div>
            
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? '注文中...' : '注文する'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}