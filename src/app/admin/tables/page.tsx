'use client';

import { useState, useEffect } from 'react';
import { Table } from '@/types';

export default function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: '',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables');
      const data = await response.json();
      setTables(data.sort((a: Table, b: Table) => a.number - b.number));
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: parseInt(newTable.number),
          capacity: parseInt(newTable.capacity),
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewTable({ number: '', capacity: '' });
        fetchTables();
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (confirm('このテーブルを削除しますか？')) {
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
    }
  };

  const updateTableStatus = async (tableId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/tables', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tableId, status }),
      });

      if (response.ok) {
        fetchTables();
      }
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-200 text-black border border-green-400 font-semibold';
      case 'occupied': return 'bg-red-200 text-black border border-red-400 font-semibold';
      case 'reserved': return 'bg-yellow-200 text-black border border-yellow-400 font-semibold';
      default: return 'bg-gray-200 text-black border border-gray-400 font-semibold';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return '利用可能';
      case 'occupied': return '使用中';
      case 'reserved': return '予約済み';
      default: return status;
    }
  };

  if (loading) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">テーブル管理</h1>
          <p className="text-gray-600 mt-2">テーブルの追加・削除・状態管理</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          テーブル追加
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  テーブル番号
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  収容人数
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  QRコード
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tables.map((table) => (
                <tr key={table.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                    テーブル {table.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                    {table.capacity}名
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={table.status}
                      onChange={(e) => updateTableStatus(table.id, e.target.value)}
                      className={`px-3 py-2 text-sm font-semibold rounded-md ${getStatusColor(table.status)}`}
                    >
                      <option value="available">利用可能</option>
                      <option value="occupied">使用中</option>
                      <option value="reserved">予約済み</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {table.qrCode}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {tables.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black font-semibold">テーブルがありません</p>
          </div>
        )}
      </div>

      {/* テーブル追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black">新しいテーブルを追加</h2>
            
            <form onSubmit={handleAddTable}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  テーブル番号
                </label>
                <input
                  type="number"
                  value={newTable.number}
                  onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  収容人数
                </label>
                <input
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
