'use client';

import { Inter } from 'next/font/google';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationBanner from '@/components/NotificationBanner';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'ダッシュボード' },
    { href: '/admin/orders', label: '注文管理' },
    { href: '/admin/menu', label: 'メニュー管理' },
    { href: '/admin/categories', label: 'カテゴリ管理' },
    { href: '/admin/tables', label: 'テーブル管理' },
    { href: '/admin/qr-codes', label: 'QRコード管理' },
    { href: '/admin/staff-calls', label: 'スタッフ呼び出し' },
    { href: '/admin/users', label: 'ユーザー管理' },
  ];

  return (
    <NotificationProvider>
      <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
        {/* ナビゲーションバー */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/admin" className="text-xl font-bold text-black">
                  管理画面
                </Link>
                <div className="hidden md:flex space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-black hover:text-black hover:bg-gray-100 font-semibold'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href="/table/table-1"
                  className="text-sm text-black hover:text-black font-semibold"
                >
                  顧客画面へ
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <main>{children}</main>

        {/* 通知バナー */}
        <NotificationBanner />
      </div>
    </NotificationProvider>
  );
}
