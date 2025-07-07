'use client';

import { useState, useEffect } from 'react';
import { MenuItem, Category } from '@/types';
import ImageUpload from '@/components/ImageUpload';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true
  });

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/admin/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingItem ? '/api/admin/menu' : '/api/admin/menu';
      const method = editingItem ? 'PATCH' : 'POST';
      
      // バリデーション
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        alert('必須項目を入力してください');
        return;
      }

      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        alert('有効な価格を入力してください');
        return;
      }
      
      const payload = editingItem 
        ? { id: editingItem.id, ...formData, price: priceValue }
        : { ...formData, price: priceValue };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchMenuItems();
        resetForm();
        alert('保存されました');
      } else {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        alert(`保存に失敗しました: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('保存中にエラーが発生しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/menu?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchMenuItems();
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      available: item.available
    });
    setIsAddingNew(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      available: true
    });
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          available: !item.available
        })
      });

      if (response.ok) {
        await fetchMenuItems();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  if (loading) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">メニュー管理</h1>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          新規追加
        </button>
      </div>

      {(isAddingNew || editingItem) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">
            {editingItem ? '商品編集' : '新規商品追加'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">商品名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-black">価格</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-black">カテゴリ</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">カテゴリを選択</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black">商品画像</label>
            <ImageUpload
              currentImage={formData.image}
              onImageChange={(imagePath) => setFormData({ ...formData, image: imagePath })}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-black">説明</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 h-24"
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center text-black font-medium">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="mr-2"
              />
              販売中
            </label>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              保存
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-black font-semibold">画像</th>
                <th className="px-4 py-3 text-left text-black font-semibold">商品名</th>
                <th className="px-4 py-3 text-left text-black font-semibold">価格</th>
                <th className="px-4 py-3 text-left text-black font-semibold">カテゴリ</th>
                <th className="px-4 py-3 text-left text-black font-semibold">販売状況</th>
                <th className="px-4 py-3 text-left text-black font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">
                    <img
                      src={item.image || '/img/default-food.svg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-black">{item.name}</td>
                  <td className="px-4 py-3 text-black font-medium">¥{item.price}</td>
                  <td className="px-4 py-3 text-black">{item.category}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`px-3 py-2 rounded-md text-sm font-semibold border ${
                        item.available
                          ? 'bg-green-100 text-green-900 border-green-300'
                          : 'bg-red-100 text-red-900 border-red-300'
                      }`}
                    >
                      {item.available ? '販売中' : '売り切れ'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
