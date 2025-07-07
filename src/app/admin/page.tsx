'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminStats, Order, StaffCall } from '@/types';
import { BarChart3, Users, ShoppingBag, Table, Settings, Bell, QrCode, Tag } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    availableTables: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingCalls, setPendingCalls] = useState<StaffCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 注文データの取得
      const ordersResponse = await fetch('/api/orders');
      const orders: Order[] = await ordersResponse.json();
      
      // テーブルデータの取得
      const tablesResponse = await fetch('/api/admin/tables');
      const tables = await tablesResponse.json();

      // スタッフ呼び出しデータの取得
      const staffCallsResponse = await fetch('/api/admin/staff-calls');
      const staffCalls: StaffCall[] = await staffCallsResponse.json();

      // 統計の計算
      const activeOrders = orders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
      ).length;
      
      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      const availableTables = tables.filter((table: any) => table.status === 'available').length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        activeOrders,
        availableTables
      });

      setRecentOrders(orders.slice(0, 5));
      setPendingCalls(staffCalls.filter(call => call.status === 'pending'));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'メニュー管理',
      description: '商品の追加・編集・削除、売り切れ管理',
      href: '/admin/menu',
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      title: 'カテゴリ管理',
      description: 'メニューカテゴリの管理',
      href: '/admin/categories',
      icon: Tag,
      color: 'bg-purple-500'
    },
    {
      title: 'テーブル管理',
      description: 'テーブルの追加・削除・状態管理',
      href: '/admin/tables',
      icon: Table,
      color: 'bg-green-500'
    },
    {
      title: 'QRコード管理',
      description: 'テーブル用QRコードの生成・管理',
      href: '/admin/qr-codes',
      icon: QrCode,
      color: 'bg-yellow-500'
    },
    {
      title: '注文管理',
      description: '注文の確認・ステータス管理',
      href: '/admin/orders',
      icon: BarChart3,
      color: 'bg-red-500'
    },
    {
      title: 'スタッフ呼び出し',
      description: '顧客からの呼び出し対応',
      href: '/admin/staff-calls',
      icon: Bell,
      color: 'bg-orange-500'
    },
    {
      title: 'ユーザー管理',
      description: 'ユーザーアカウントの管理',
      href: '/admin/users',
      icon: Users,
      color: 'bg-indigo-500'
    }
  ];

  if (loading) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">管理画面ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">総注文数</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">総売上</h3>
          <p className="text-2xl font-bold text-gray-900">¥{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">進行中の注文</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">利用可能テーブル</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.availableTables}</p>
        </div>
      </div>

      {/* スタッフ呼び出し通知 */}
      {pendingCalls.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            🔔 未対応のスタッフ呼び出し ({pendingCalls.length}件)
          </h3>
          <Link href="/admin/staff-calls" className="text-red-600 hover:text-red-800 underline">
            すぐに対応する →
          </Link>
        </div>
      )}

      {/* メニュー項目 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${item.color} text-white mr-4`}>
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            </div>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
