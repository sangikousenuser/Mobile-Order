import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createOrder, getOrders, updateOrder } from '@/lib/db';
import { Order } from '@/types';

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, items, customerName, notes, totalAmount, sessionId } = body;

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // セッションIDの検証（オプション）
    if (sessionId) {
      const parts = sessionId.split('-');
      if (parts.length === 3 && parts[0] === 'session') {
        const timestamp = parseInt(parts[1]);
        const now = Date.now();
        const expirationTime = 24 * 60 * 60 * 1000; // 24時間

        if ((now - timestamp) >= expirationTime) {
          return NextResponse.json(
            { error: 'Session expired' },
            { status: 401 }
          );
        }
      }
    }

    const orderId = uuidv4();
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      tableId,
      items: items.map(item => ({
        id: uuidv4(),
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || ''
      })),
      totalAmount: totalAmount || 0,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      customerName: customerName || '匿名',
      notes: notes || '',
      sessionId: sessionId || undefined
    };

    createOrder(order);

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    updateOrder(orderId, { 
      status, 
      updatedAt: new Date().toISOString() 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}