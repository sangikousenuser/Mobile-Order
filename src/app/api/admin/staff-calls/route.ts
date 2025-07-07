import { NextRequest, NextResponse } from 'next/server';
import { getStaffCalls, createStaffCall, updateStaffCall, deleteStaffCall } from '@/lib/db';
import { StaffCall } from '@/types';

export async function GET() {
  try {
    const staffCalls = getStaffCalls();
    return NextResponse.json(staffCalls);
  } catch (error) {
    console.error('Error fetching staff calls:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, type, message } = body;

    if (!tableId || !type) {
      return NextResponse.json(
        { error: 'Table ID and type are required' },
        { status: 400 }
      );
    }

    const newStaffCall: StaffCall = {
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tableId,
      type,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      resolvedAt: undefined
    };

    createStaffCall(newStaffCall);

    return NextResponse.json(newStaffCall, { status: 201 });
  } catch (error) {
    console.error('Error creating staff call:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Staff call ID is required' },
        { status: 400 }
      );
    }

    const updates: Partial<StaffCall> = { status };
    if (status === 'resolved') {
      updates.resolvedAt = new Date().toISOString();
    }

    updateStaffCall(id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating staff call:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
