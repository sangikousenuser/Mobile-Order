import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'サポートされていないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。' 
      }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。' 
      }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'menu');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    const publicPath = `/uploads/menu/${fileName}`;
    return NextResponse.json({
      success: true,
      path: publicPath,
      originalName: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('アップロードエラー:', error);
    return NextResponse.json({ 
      error: 'ファイルのアップロードに失敗しました' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    if (!filePath || !filePath.startsWith('/uploads/menu/')) {
      return NextResponse.json({ error: '無効なファイルパスです' }, { status: 400 });
    }
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
      await access(fullPath);
      await unlink(fullPath);
      return NextResponse.json({ success: true, message: 'ファイルが削除されました' });
    } catch (error) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 });
    }
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    return NextResponse.json({ 
      error: 'ファイルの削除に失敗しました' 
    }, { status: 500 });
  }
}
