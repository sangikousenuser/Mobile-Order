'use client';

import { useState, useEffect } from 'react';
import { QrCode, Download, Plus, Trash2, Eye } from 'lucide-react';
import { Table } from '@/types';
import { generateQRCode, generateTableQRCodeData } from '@/lib/qr';

export default function QRCodeManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [newTableCapacity, setNewTableCapacity] = useState(2);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables');
      if (response.ok) {
        const tablesData = await response.json();
        setTables(tablesData);
        
        // 各テーブルのQRコードを生成
        const qrCodePromises = tablesData.map(async (table: Table) => {
          const qrData = generateTableQRCodeData(table.id);
          const qrCodeImage = await generateQRCode(qrData);
          return { tableId: table.id, qrCodeImage };
        });
        
        const qrResults = await Promise.all(qrCodePromises);
        const qrCodesMap = qrResults.reduce((acc, { tableId, qrCodeImage }) => {
          acc[tableId] = qrCodeImage;
          return acc;
        }, {} as { [key: string]: string });
        
        setQrCodes(qrCodesMap);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTable = async () => {
    try {
      const newTableNumber = Math.max(...tables.map(t => t.number)) + 1;
      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: newTableNumber,
          capacity: newTableCapacity,
        }),
      });

      if (response.ok) {
        fetchTables();
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!confirm('このテーブルを削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTables();
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const downloadQRCode = (tableId: string, tableNumber: number) => {
    const qrCodeImage = qrCodes[tableId];
    if (!qrCodeImage) return;

    const link = document.createElement('a');
    link.download = `table-${tableNumber}-qr.png`;
    link.href = qrCodeImage;
    link.click();
  };

  const previewQRCode = (tableId: string) => {
    const qrCodeImage = qrCodes[tableId];
    if (!qrCodeImage) return;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>テーブル ${tables.find(t => t.id === tableId)?.number} QRコード</title></head>
          <body style="margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h2>テーブル ${tables.find(t => t.id === tableId)?.number}</h2>
            <img src="${qrCodeImage}" alt="QR Code" style="max-width: 400px; height: auto;" />
            <p>お客様にスキャンしていただくQRコードです</p>
          </body>
        </html>
      `);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">QRコードを生成中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QRコード管理</h1>
          <p className="text-gray-600">テーブルごとのQRコードを生成・管理できます</p>
        </div>

        {/* 新しいテーブル追加 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">新しいテーブルを追加</h2>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                座席数
              </label>
              <select
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={2}>2席</option>
                <option value={4}>4席</option>
                <option value={6}>6席</option>
                <option value={8}>8席</option>
              </select>
            </div>
            <button
              onClick={addTable}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus size={20} className="mr-2" />
              テーブル追加
            </button>
          </div>
        </div>

        {/* テーブル一覧とQRコード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div key={table.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">テーブル {table.number}</h3>
                  <p className="text-gray-600">{table.capacity}席</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    table.status === 'available' ? 'bg-green-100 text-green-800' :
                    table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {table.status === 'available' ? '空席' :
                     table.status === 'occupied' ? '使用中' : '予約済み'}
                  </span>
                </div>
                <button
                  onClick={() => deleteTable(table.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* QRコード表示 */}
              <div className="text-center mb-4">
                {qrCodes[table.id] ? (
                  <img
                    src={qrCodes[table.id]}
                    alt={`テーブル ${table.number} QRコード`}
                    className="mx-auto mb-2"
                    style={{ width: '150px', height: '150px' }}
                  />
                ) : (
                  <div className="w-150 h-150 bg-gray-200 flex items-center justify-center mb-2">
                    <QrCode size={40} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-2">
                <button
                  onClick={() => previewQRCode(table.id)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm"
                >
                  <Eye size={16} className="mr-1" />
                  プレビュー
                </button>
                <button
                  onClick={() => downloadQRCode(table.id, table.number)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm"
                  disabled={!qrCodes[table.id]}
                >
                  <Download size={16} className="mr-1" />
                  ダウンロード
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 使用方法 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">QRコードの使用方法</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• QRコードをダウンロードして印刷し、各テーブルに配置してください</li>
            <li>• お客様がQRコードをスキャンすると、自動的にそのテーブルの注文ページが開きます</li>
            <li>• QRコードには固有のテーブル情報が含まれており、注文がどのテーブルからかを自動識別します</li>
            <li>• プレビュー機能で印刷前の確認ができます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
