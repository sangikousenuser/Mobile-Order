import { NextResponse } from 'next/server';
import { getMenuItems } from '@/lib/db';

export async function GET() {
  try {
    const menuItems = getMenuItems();
    const availableItems = menuItems.filter(item => item.available);
    return NextResponse.json(availableItems);
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}