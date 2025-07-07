import { NextRequest, NextResponse } from 'next/server';
import { getTables, updateTable, createTable } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '@/types';

export async function GET() {
  try {
    const tables = getTables();
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, status } = body;

    if (!tableId || !status) {
      return NextResponse.json(
        { error: 'Missing tableId or status' },
        { status: 400 }
      );
    }

    const validStatuses = ['available', 'occupied', 'reserved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    updateTable(tableId, { status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, capacity } = body;

    if (!number || !capacity) {
      return NextResponse.json(
        { error: 'Table number and capacity are required' },
        { status: 400 }
      );
    }

    const newTable: Table = {
      id: `table-${uuidv4()}`,
      number,
      capacity,
      status: 'available',
      qrCode: `QR_TABLE_${number}`
    };

    createTable(newTable);

    return NextResponse.json({ success: true, table: newTable });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}