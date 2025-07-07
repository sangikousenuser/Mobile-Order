'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Camera } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imagePath: string) => void;
  className?: string;
}

export default function ImageUpload({ currentImage, onImageChange, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('サポートされていないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
      return;
    }
    setUploading(true);
    try {
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        URL.revokeObjectURL(tempUrl);
        setPreviewUrl(result.path);
        onImageChange(result.path);
      } else {
        URL.revokeObjectURL(tempUrl);
        setPreviewUrl(currentImage || '');
        alert(result.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        {previewUrl ? (
          <div className="relative">
            <div className="relative w-full h-48 mb-3">
              <Image
                src={previewUrl}
                alt="プレビュー"
                fill
                className="object-cover rounded"
                onError={() => {
                  setPreviewUrl('');
                  onImageChange('');
                }}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">アップロード中...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                disabled={uploading}
              >
                <Camera size={14} className="mr-1" />
                変更
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                disabled={uploading}
              >
                <X size={14} className="mr-1" />
                削除
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              画像をドラッグ&ドロップまたはクリックして選択
            </p>
            <p className="text-sm text-gray-500">
              JPEG, PNG, GIF, WebP (最大5MB)
            </p>
          </div>
        )}
      </div>

      {/* Manual path input */}
      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          または画像パスを直接入力
        </label>
        <input
          type="text"
          value={previewUrl}
          onChange={(e) => {
            setPreviewUrl(e.target.value);
            onImageChange(e.target.value);
          }}
          placeholder="/img/example.jpg または /uploads/menu/image.jpg"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          アップロードされた画像は /uploads/menu/ フォルダに保存されます
        </p>
      </div>
    </div>
  );
}
