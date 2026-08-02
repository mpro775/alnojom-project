import { useEffect, useState } from 'react';
import { readStoredSession, writeStoredSession } from './session-storage';
import type { AdminSession } from './types';

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession());

  useEffect(() => {
    writeStoredSession(session);
  }, [session]);

  return [session, setSession] as const;
}
