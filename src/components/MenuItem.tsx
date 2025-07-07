'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Check } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

interface MenuItemProps {
  item: MenuItem;
}

export default function MenuItemComponent({ item }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // 少し遅延を追加してローディング状態を見せる
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addItem(item, quantity);
    
    // 成功状態を表示
    setIsAdding(false);
    setShowSuccess(true);
    
    // トーストメッセージを表示
    showToast(`${item.name} を ${quantity}個 カートに追加しました`, 'success');
    
    // 成功状態をリセット
    setTimeout(() => {
      setShowSuccess(false);
      setQuantity(1); // 数量をリセット
    }, 1000);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  if (!item.available) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">        
        <div className="relative h-32 sm:h-48 bg-gray-100">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover opacity-70"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-semibold">
              <span className="text-sm sm:text-base">画像なし</span>
            </div>
          )}
        </div>
        
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2 line-clamp-1">{item.name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 font-medium line-clamp-2">{item.description}</p>
          <p className="text-lg sm:text-xl font-bold text-gray-600 mb-3 sm:mb-4">¥{item.price.toLocaleString()}</p>
          
          <div className="flex items-center justify-center">
            <button
              disabled
              className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold bg-red-500 text-white cursor-not-allowed w-full text-xs sm:text-sm opacity-90"
            >
              売り切れ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="relative h-32 sm:h-48 bg-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-black font-semibold">
            <span className="text-sm sm:text-base">画像なし</span>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-lg font-semibold text-black mb-1 sm:mb-2 line-clamp-1">{item.name}</h3>
        <p className="text-black text-xs sm:text-sm mb-2 sm:mb-3 font-medium line-clamp-2">{item.description}</p>
        <p className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">¥{item.price.toLocaleString()}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={decreaseQuantity}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <Minus size={12} className="sm:w-4 sm:h-4" />
            </button>
            <span className="font-semibold text-sm sm:text-lg w-6 sm:w-8 text-center">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <Plus size={12} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding || showSuccess}
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform ${
              showSuccess
                ? 'bg-green-500 text-white scale-105'
                : isAdding
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
            }`}
          >
            {showSuccess ? (
              <span className="flex items-center">
                <Check size={12} className="mr-1 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">追加完了！</span>
                <span className="sm:hidden">完了</span>
              </span>
            ) : isAdding ? (
              <span className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                <span className="hidden sm:inline">追加中...</span>
                <span className="sm:hidden">追加中</span>
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">カートに追加</span>
                <span className="sm:hidden">追加</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}