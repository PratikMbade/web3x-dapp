// hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  wallet_address: string;
  isRegistered: boolean;
  directTeam: number;
  totalTema: number;
  regId?: number | null;
  metaunityId?: string | null;
  sponsor_address?: string | null;
}

interface SessionData {
  authenticated: boolean;
  user?: User;
  session?: {
    expires: string;
  };
}

export function useAuth() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setSession(data);
    } catch (error) {
      console.error('Failed to check session:', error);
      setSession({ authenticated: false });
    } finally {
      setIsPending(false);
    }
  }

  function refetch() {
    setIsPending(true);
    checkSession();
  }

  return {
    data: session,
    isPending,
    isAuthenticated: session?.authenticated ?? false,
    user: session?.user,
    refetch,
  };
}