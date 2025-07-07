'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, ArrowLeft, History } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useSession } from '@/contexts/SessionContext';
import MenuItemComponent from '@/components/MenuItem';
import CartModal from '@/components/CartModal';
import StaffCallButton from '@/components/StaffCallButton';
import OrderHistoryModal from '@/components/OrderHistoryModal';

export default function TablePage() {
  const params = useParams();
  const tableId = params.id as string;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const { getTotalItems } = useCart();
  const { sessionId, sessionName, sessionCreatedAt, sessionExpiresAt, createSession } = useSession();

  useEffect(() => {
    // セッションの初期化
    const initializeSession = async () => {
      if (!sessionId) {
        try {
          await createSession(tableId);
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      }
    };

    initializeSession();
    fetchMenuItems();
  }, [sessionId, createSession, tableId]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (response.ok) {
        const items = await response.json();
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // カートにアイテムが追加された時のアニメーション
  const prevTotalItems = useRef(getTotalItems());
  useEffect(() => {
    const currentTotal = getTotalItems();
    if (currentTotal > prevTotalItems.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
    prevTotalItems.current = currentTotal;
  }, [getTotalItems]);

  // セッション有効期限のチェック
  const getSessionTimeRemaining = () => {
    if (!sessionExpiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(sessionExpiresAt);
    const timeRemaining = expiry.getTime() - now.getTime();
    
    if (timeRemaining <= 0) {
      return { expired: true, minutes: 0 };
    }
    
    const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
    return { expired: false, minutes: minutesRemaining };
  };

  const sessionTimeInfo = getSessionTimeRemaining();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black font-semibold">メニューを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-black">
                  テーブル {tableId.replace('table-', '')}
                </h1>
                {sessionName && (
                  <p className="text-xs text-gray-600 mb-1">
                    セッション: {sessionName}
                  </p>
                )}
                <p className="text-sm text-black font-medium">メニューから商品を選んでください</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOrderHistoryOpen(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
                title="注文履歴"
              >
                <History size={20} />
              </button>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 ${
                  cartBounce ? 'animate-bounce scale-110' : ''
                }`}
              >
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center transition-all duration-300 ${
                    cartBounce ? 'animate-pulse scale-125' : ''
                  }`}>
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* セッション有効期限警告 */}
        {sessionTimeInfo && sessionTimeInfo.minutes <= 30 && (
          <div className={`rounded-lg p-4 mb-6 ${
            sessionTimeInfo.expired 
              ? 'bg-red-100 border border-red-400'
              : sessionTimeInfo.minutes <= 10 
                ? 'bg-red-50 border border-red-300'
                : 'bg-yellow-50 border border-yellow-300'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                sessionTimeInfo.expired 
                  ? 'bg-red-500'
                  : sessionTimeInfo.minutes <= 10 
                    ? 'bg-red-400 animate-pulse'
                    : 'bg-yellow-400'
              }`}></div>
              <div>
                <p className={`font-semibold ${
                  sessionTimeInfo.expired 
                    ? 'text-red-800'
                    : sessionTimeInfo.minutes <= 10 
                      ? 'text-red-700'
                      : 'text-yellow-800'
                }`}>
                  {sessionTimeInfo.expired 
                    ? 'セッションが期限切れです'
                    : `セッション期限まで残り${sessionTimeInfo.minutes}分`
                  }
                </p>
                <p className={`text-sm ${
                  sessionTimeInfo.expired 
                    ? 'text-red-600'
                    : sessionTimeInfo.minutes <= 10 
                      ? 'text-red-600'
                      : 'text-yellow-700'
                }`}>
                  {sessionTimeInfo.expired 
                    ? 'QRコードを再度読み取って新しいセッションを開始してください。'
                    : '期限が近づいています。注文をお急ぎください。'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session Info Card */}
        {sessionId && sessionName && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-black mb-1">
                  現在のセッション情報
                </h2>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-gray-600">アクティブ</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">テーブル</span>
                <div className="text-lg font-bold text-blue-900 mt-1">
                  {tableId.replace('table-', '')}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <span className="text-xs font-medium text-green-700 uppercase tracking-wide">セッション</span>
                <div className="text-lg font-bold text-green-900 mt-1">
                  {sessionName}
                </div>
              </div>
              
              {sessionCreatedAt && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">開始時刻</span>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(sessionCreatedAt).toLocaleString('ja-JP', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
              
              {sessionExpiresAt && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">有効期限</span>
                  <div className="text-sm font-semibold text-orange-900 mt-1">
                    {new Date(sessionExpiresAt).toLocaleString('ja-JP', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors border ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-black hover:bg-gray-100 border-gray-300'
                }`}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black text-lg font-semibold">
              {selectedCategory === 'all' 
                ? 'メニューアイテムがありません' 
                : `${selectedCategory}カテゴリにアイテムがありません`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuItemComponent key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        tableId={tableId}
      />

      {/* Order History Modal */}
      <OrderHistoryModal 
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        tableId={tableId}
      />

      {/* Floating Buttons for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden flex flex-col gap-3">
        {/* Order History Button */}
        <button
          onClick={() => setIsOrderHistoryOpen(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <History size={20} />
        </button>
        
        {/* Cart Button */}
        {getTotalItems() > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className={`bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ${
              cartBounce ? 'animate-bounce scale-110' : ''
            }`}
          >
            <ShoppingCart size={24} />
            <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center transition-all duration-300 ${
              cartBounce ? 'animate-pulse scale-125' : ''
            }`}>
              {getTotalItems()}
            </span>
          </button>
        )}
      </div>

      {/* Staff Call Button - 左下に配置 */}
      <StaffCallButton tableId={tableId} position="left" />
    </div>
  );
}
