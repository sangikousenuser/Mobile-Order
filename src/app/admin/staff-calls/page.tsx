'use client';

import { useState, useEffect } from 'react';
import { StaffCall, Table } from '@/types';

export default function StaffCallsPage() {
  const [staffCalls, setStaffCalls] = useState<StaffCall[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffCalls();
    fetchTables();
    
    // 5秒間隔でポーリング
    const interval = setInterval(fetchStaffCalls, 5000); // 5秒 = 5,000ms
    return () => clearInterval(interval);
  }, []);

  const fetchStaffCalls = async () => {
    try {
      const response = await fetch('/api/admin/staff-calls');
      const data = await response.json();
      setStaffCalls(data.filter((call: StaffCall) => call.status !== 'resolved'));
    } catch (error) {
      console.error('Error fetching staff calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch('/api/admin/staff-calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'resolved' })
      });

      if (response.ok) {
        await fetchStaffCalls();
      }
    } catch (error) {
      console.error('Error resolving staff call:', error);
    }
  };

  const handleInProgress = async (id: string) => {
    try {
      const response = await fetch('/api/admin/staff-calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'in-progress' })
      });

      if (response.ok) {
        await fetchStaffCalls();
      }
    } catch (error) {
      console.error('Error updating staff call:', error);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-900 border border-red-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-900 border border-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-900 border border-green-300';
      default:
        return 'bg-gray-200 text-black border border-gray-400 font-semibold';
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      pending: '未対応',
      'in-progress': '対応中',
      resolved: '完了'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">スタッフ呼び出し管理</h1>
        <div className="text-sm text-black font-medium">
          自動更新: 10分間隔 | 最終更新: {new Date().toLocaleTimeString('ja-JP')}
        </div>
      </div>

      {staffCalls.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-black">
          現在、スタッフ呼び出しはありません。
        </div>
      ) : (
        <div className="grid gap-4">
          {staffCalls
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((call) => (
              <div
                key={call.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  call.status === 'pending' ? 'border-red-500' : 
                  call.status === 'in-progress' ? 'border-yellow-500' : 'border-green-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold">
                        テーブル {getTableNumber(call.tableId)}
                      </h3>
                      <span className={`px-3 py-1 rounded-md text-sm font-semibold ${getStatusColor(call.status)}`}>
                        {getStatusLabel(call.status)}
                      </span>
                      <span className="bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-md text-sm font-semibold">
                        {getTypeLabel(call.type)}
                      </span>
                    </div>
                    
                    {call.message && (
                      <p className="text-black mb-2 font-medium">{call.message}</p>
                    )}
                    
                    <p className="text-sm text-black">
                      呼び出し時刻: {new Date(call.createdAt).toLocaleString('ja-JP')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {call.status === 'pending' && (
                      <button
                        onClick={() => handleInProgress(call.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                      >
                        対応開始
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(call.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                    >
                      完了
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
