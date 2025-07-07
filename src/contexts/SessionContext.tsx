'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionContextType, TableSession } from '@/types';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    // ページロード時にローカルストレージからセッションIDを復元
    const savedSessionId = localStorage.getItem('tableSession');
    const savedSessionName = localStorage.getItem('tableSessionName');
    const savedCreatedAt = localStorage.getItem('tableSessionCreatedAt');
    const savedExpiresAt = localStorage.getItem('tableSessionExpiresAt');
    if (savedSessionId) {
      // セッションの有効性を確認
      if (validateSession(savedSessionId)) {
        setSessionId(savedSessionId);
        setSessionName(savedSessionName);
        if (savedCreatedAt) setSessionCreatedAt(savedCreatedAt);
        if (savedExpiresAt) setSessionExpiresAt(savedExpiresAt);
      } else {
        localStorage.removeItem('tableSession');
        localStorage.removeItem('tableSessionName');
        localStorage.removeItem('tableSessionCreatedAt');
        localStorage.removeItem('tableSessionExpiresAt');
      }
    }
  }, []);

  const createSession = async (tableId: string): Promise<string> => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId })
      });

      if (response.ok) {
        const data = await response.json();
        const newSessionId = data.sessionId;
        const newSessionName = data.sessionName;
        const createdAt = data.createdAt || new Date().toISOString();
        const expiresAt = data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        setSessionId(newSessionId);
        setSessionName(newSessionName);
        setSessionCreatedAt(createdAt);
        setSessionExpiresAt(expiresAt);
        localStorage.setItem('tableSession', newSessionId);
        localStorage.setItem('tableSessionName', newSessionName);
        localStorage.setItem('tableSessionCreatedAt', createdAt);
        localStorage.setItem('tableSessionExpiresAt', expiresAt);
        
        return newSessionId;
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const validateSession = (sessionId: string): boolean => {
    try {
      // セッションIDの形式チェック（session-timestamp-uuid形式）
      if (!sessionId || sessionId.length < 10) {
        return false;
      }

      // セッションIDからタイムスタンプを抽出して有効期限をチェック
      const parts = sessionId.split('-');
      if (parts.length === 3 && parts[0] === 'session') {
        const timestamp = parseInt(parts[1]);
        const now = Date.now();
        const expirationTime = 24 * 60 * 60 * 1000; // 24時間

        return (now - timestamp) < expirationTime;
      }

      return false;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  };

  const clearSession = () => {
    setSessionId(null);
    setSessionName(null);
    setSessionCreatedAt(null);
    setSessionExpiresAt(null);
    localStorage.removeItem('tableSession');
    localStorage.removeItem('tableSessionName');
    localStorage.removeItem('tableSessionCreatedAt');
    localStorage.removeItem('tableSessionExpiresAt');
  };

  return (
    <SessionContext.Provider value={{
      sessionId,
      sessionName,
      sessionCreatedAt,
      sessionExpiresAt,
      createSession,
      validateSession,
      clearSession
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
