import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { tableId } = await request.json();

    if (!tableId) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      );
    }

    // セッションIDを生成（独立したUUID + タイムスタンプ）
    const timestamp = Date.now();
    const sessionUuid = uuidv4();
    const sessionId = `session-${timestamp}-${sessionUuid.split('-')[0]}`;

    // セッション名を生成（日時ベース）
    const now = new Date();
    const sessionName = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    return NextResponse.json({
      success: true,
      sessionId,
      sessionName,
      tableId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(timestamp + 24 * 60 * 60 * 1000).toISOString() // 24時間後
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // セッションIDの形式チェック（session-timestamp-uuid形式）
    const parts = sessionId.split('-');
    if (parts.length !== 3 || parts[0] !== 'session') {
      return NextResponse.json(
        { valid: false, error: 'Invalid session format' },
        { status: 400 }
      );
    }

    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    const expirationTime = 24 * 60 * 60 * 1000; // 24時間

    const isValid = (now - timestamp) < expirationTime;

    return NextResponse.json({
      valid: isValid,
      sessionId,
      createdAt: new Date(timestamp).toISOString(),
      expiresAt: new Date(timestamp + expirationTime).toISOString()
    });
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}
