'use client';

import { useState } from 'react';
import { QrCode, Smartphone, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  const [tableNumber, setTableNumber] = useState('');

  const handleTableAccess = () => {
    if (tableNumber) {
      window.location.href = `/table/table-${tableNumber}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">モバイルオーダー</h1>
            <div className="flex space-x-4">
              <a
                href="/admin/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                管理者ログイン
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">
            簡単で便利な<br />モバイル注文システム
          </h2>
          <p className="text-xl text-black font-semibold mb-8">
            QRコードをスキャンするか、テーブル番号を入力して注文を開始しましょう
          </p>

          {/* Table Number Input */}
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-12">
            <h3 className="text-lg font-semibold mb-4">テーブル番号で注文開始</h3>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="テーブル番号"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTableAccess}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                開始
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <QrCode className="text-blue-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-black">QRコードスキャン</h3>
            <p className="text-black font-medium">テーブルのQRコードをスキャンして簡単アクセス</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-black">モバイル対応</h3>
            <p className="text-black font-medium">スマートフォンで簡単に注文できます</p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-black">迅速な注文</h3>
            <p className="text-black font-medium">待ち時間なく素早く注文できます</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-purple-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-black">注文確認</h3>
            <p className="text-black font-medium">リアルタイムで注文状況を確認</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-center mb-8">ご利用方法</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold mb-2 text-black">テーブルアクセス</h4>
              <p className="text-black font-medium">QRコードスキャンまたはテーブル番号入力でアクセス</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold mb-2 text-black">メニュー選択</h4>
              <p className="text-black font-medium">豊富なメニューから好きなものを選んでカートに追加</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold mb-2 text-black">注文確定</h4>
              <p className="text-black font-medium">注文内容を確認して送信。厨房で調理開始！</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 モバイルオーダーシステム. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
