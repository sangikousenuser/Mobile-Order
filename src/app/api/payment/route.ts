import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

// バーコード生成用の関数
function generateBarcode(orderId: string): string {
  // 注文IDをベースにしたバーコード（実際のプロジェクトでは適切な形式を使用）
  return `ORDER_${orderId}_${Date.now()}`;
}

// GET: 注文情報をバーコードで取得（外部レジシステム用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    
    if (!barcode) {
      return NextResponse.json({ error: 'バーコードが必要です' }, { status: 400 });
    }
    
    const db = await readDB();
    
    // バーコードから注文IDを抽出
    const orderIdMatch = barcode.match(/ORDER_([^_]+)_/);
    if (!orderIdMatch) {
      return NextResponse.json({ error: '無効なバーコードです' }, { status: 400 });
    }
    
    const orderId = orderIdMatch[1];
    const order = db.orders.find((o: any) => o.id === orderId);
    
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });
    }
    
    // メニュー項目の詳細情報を取得
    const orderDetails = {
      orderId: order.id,
      tableNumber: order.tableId.replace('table-', ''),
      items: order.items.map((item: any) => {
        const menuItem = db.menuItems.find((m: any) => m.id === item.menuItemId);
        return {
          name: menuItem?.name || '不明な商品',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          notes: item.notes
        };
      }),
      totalAmount: order.totalAmount,
      status: order.status,
      customerName: order.customerName,
      createdAt: order.createdAt
    };
    
    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error('注文情報取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

// POST: バーコード生成（注文確定時）
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: '注文IDが必要です' }, { status: 400 });
    }
    
    const db = await readDB();
    const order = db.orders.find((o: any) => o.id === orderId);
    
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });
    }
    
    // バーコードを生成
    const barcode = generateBarcode(orderId);
    
    // 注文にバーコード情報を追加
    order.barcode = barcode;
    order.barcodeGeneratedAt = new Date().toISOString();
    
    await writeDB(db);
    
    return NextResponse.json({
      barcode,
      orderId,
      message: 'バーコードが生成されました'
    });
  } catch (error) {
    console.error('バーコード生成エラー:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

// PATCH: 会計完了通知（外部レジシステムから）
export async function PATCH(request: NextRequest) {
  try {
    const { barcode, paymentStatus, paymentMethod, paidAmount } = await request.json();
    
    if (!barcode || !paymentStatus) {
      return NextResponse.json({ error: 'バーコードと支払いステータスが必要です' }, { status: 400 });
    }
    
    const db = await readDB();
    
    // バーコードから注文IDを抽出
    const orderIdMatch = barcode.match(/ORDER_([^_]+)_/);
    if (!orderIdMatch) {
      return NextResponse.json({ error: '無効なバーコードです' }, { status: 400 });
    }
    
    const orderId = orderIdMatch[1];
    const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });
    }
    
    // 注文ステータスを更新
    if (paymentStatus === 'completed') {
      db.orders[orderIndex].status = 'completed';
      db.orders[orderIndex].paymentCompletedAt = new Date().toISOString();
      db.orders[orderIndex].paymentMethod = paymentMethod;
      db.orders[orderIndex].paidAmount = paidAmount;
    }
    
    await writeDB(db);
    
    return NextResponse.json({
      message: '会計処理が完了しました',
      orderId,
      status: db.orders[orderIndex].status
    });
  } catch (error) {
    console.error('会計完了処理エラー:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
