'use client';

import { useState, useEffect } from 'react';
import PaymentModal from './PaymentModal';

interface StaffCallButtonProps {
  tableId: string;
  position?: 'left' | 'right';
}

export default function StaffCallButton({ tableId, position = 'right' }: StaffCallButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const [message, setMessage] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [hasReadyOrders, setHasReadyOrders] = useState(false);

  // 注文状態をチェックして会計ボタンの有効性を判定
  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        const readyOrders = orders.filter((order: any) => {
          const isMatchingTable = order.tableId === tableId || 
                                 order.tableId === `table-${tableId}` ||
                                 order.tableId.includes(tableId);
          const isReady = order.status === 'ready';
          const notPaid = !order.paymentCompletedAt;
          
          return isMatchingTable && isReady && notPaid;
        });
        
        setHasReadyOrders(readyOrders.length > 0);
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    };

    checkOrderStatus();
    // 30秒間隔で注文状態をチェック
    const interval = setInterval(checkOrderStatus, 30000);
    
    return () => clearInterval(interval);
  }, [tableId]);

  const callTypes = [
    { id: 'assistance', label: 'お手伝いが必要', icon: '🙋‍♂️' },
    { id: 'payment', label: 'お会計をお願いします', icon: '💳' },
    { id: 'cleaning', label: 'テーブルの清掃', icon: '🧹' },
    { id: 'other', label: 'その他', icon: '💬' }
  ];

  const handleCall = async (type: string) => {
    if (type === 'payment') {
      setIsOpen(false);
      setIsPaymentModalOpen(true);
      return;
    }

    setCalling(true);
    try {
      const response = await fetch('/api/admin/staff-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          type,
          message: type === 'other' ? message : ''
        })
      });

      if (response.ok) {
        setIsOpen(false);
        setMessage('');
        alert('スタッフを呼び出しました。しばらくお待ちください。');
      }
    } catch (error) {
      console.error('Error calling staff:', error);
      alert('呼び出しに失敗しました。もう一度お試しください。');
    } finally {
      setCalling(false);
    }
  };

  const handleCallStaffForPayment = async () => {
    setCalling(true);
    try {
      const response = await fetch('/api/admin/staff-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          type: 'payment_assistance',
          message: '商品が届いていないため、お会計の前にサポートが必要です。'
        })
      });

      if (response.ok) {
        alert('スタッフを呼び出しました。しばらくお待ちください。');
      }
    } catch (error) {
      console.error('Error calling staff:', error);
      alert('呼び出しに失敗しました。もう一度お試しください。');
    } finally {
      setCalling(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 ${position === 'left' ? 'left-4' : 'right-4'} bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-50`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black">スタッフ呼び出し</h2>
            
            <div className="space-y-3">
              {callTypes.map((type) => {
                // 会計ボタンは準備完了の注文がある場合のみ表示
                if (type.id === 'payment' && !hasReadyOrders) {
                  return (
                    <div key={type.id} className="opacity-50">
                      <button
                        disabled={true}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded bg-gray-100 cursor-not-allowed"
                      >
                        <span className="text-xl">{type.icon}</span>
                        <span className="flex-1 text-left text-gray-500 font-medium">
                          {type.label} (注文の準備が完了していません)
                        </span>
                      </button>
                    </div>
                  );
                }
                
                return (
                  <div key={type.id}>
                    <button
                      onClick={() => type.id !== 'other' ? handleCall(type.id) : null}
                      disabled={calling}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="flex-1 text-left text-black font-medium">{type.label}</span>
                    </button>
                    
                    {type.id === 'other' && (
                    <div className="mt-2 ml-8">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="メッセージを入力してください"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        rows={3}
                      />
                      <button
                        onClick={() => handleCall('other')}
                        disabled={calling || !message.trim()}
                        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                      >
                        {calling ? '呼び出し中...' : '呼び出す'}
                      </button>
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        tableId={tableId}
        onCallStaff={handleCallStaffForPayment}
      />
    </>
  );
}
