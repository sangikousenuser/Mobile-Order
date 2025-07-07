'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  onCallStaff: () => void;
}

export default function PaymentModal({ isOpen, onClose, tableId, onCallStaff }: PaymentModalProps) {
  const [step, setStep] = useState<'confirm' | 'barcode' | 'completed'>('confirm');
  const [barcode, setBarcode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const ordersResponse = await fetch('/api/orders');
      const orders = await ordersResponse.json();
      const tableOrders = orders.filter((order: any) => {
        const isMatchingTable = order.tableId === tableId || 
                               order.tableId === `table-${tableId}` ||
                               order.tableId.includes(tableId);
        const isReadyForPayment = order.status === 'ready';
        const notPaid = !order.paymentCompletedAt;
        return isMatchingTable && isReadyForPayment && notPaid;
      });
      if (tableOrders.length === 0) {
        alert('会計可能な注文がありません。注文が「提供準備完了」状態になるまでお待ちください。');
        setLoading(false);
        return;
      }
      const latestOrder = tableOrders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: latestOrder.id }),
      });
      if (response.ok) {
        const result = await response.json();
        setBarcode(result.barcode);
        
        const qrUrl = await QRCode.toDataURL(result.barcode);
        setQrCodeUrl(qrUrl);
        
        setStep('barcode');
      } else {
        alert('バーコードの生成に失敗しました');
      }
    } catch (error) {
      console.error('エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCallStaff = () => {
    onCallStaff();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {step === 'confirm' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">お会計</h2>
            <p className="text-black mb-6 text-lg">
              ご注文の商品全て届いていますか？
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '処理中...' : 'はい'}
              </button>
              <button
                onClick={handleCallStaff}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold"
              >
                いいえ
              </button>
            </div>
            <button
              onClick={onClose}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              キャンセル
            </button>
          </div>
        )}

        {step === 'barcode' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">お会計バーコード</h2>
            <p className="text-black mb-4">
              以下のバーコードをレジでスキャンしてください
            </p>
            
            {qrCodeUrl && (
              <div className="mb-4 flex justify-center">
                <img src={qrCodeUrl} alt="会計用QRコード" className="border border-gray-300 rounded" />
              </div>
            )}
            
            <div className="bg-gray-100 p-3 rounded mb-4">
              <p className="text-sm text-gray-600 mb-1">バーコード:</p>
              <p className="font-mono text-sm text-black break-all">{barcode}</p>
            </div>
            
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
