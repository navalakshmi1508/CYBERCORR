import { useEffect, useState } from 'react';

export type CyberNexusUser = {
  name: string;
  role: 'admin' | 'analyst' | 'user';
  token: string;
};

export const getAuthUser = (): CyberNexusUser | null => {
  try {
    const data = localStorage.getItem('cybernexus_user');
    if (!data) return null;
    return JSON.parse(data) as CyberNexusUser;
  } catch (e) {
    return null;
  }
};

export const setAuthUser = (user: CyberNexusUser | null) => {
  if (user) {
    localStorage.setItem('cybernexus_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('cybernexus_user');
  }
  // Dispatch custom event to notify other parts of the app
  window.dispatchEvent(new Event('auth_changed'));
};

export const useAuth = () => {
  const [user, setUser] = useState<CyberNexusUser | null>(getAuthUser());

  useEffect(() => {
    const handleAuthChanged = () => setUser(getAuthUser());
    window.addEventListener('auth_changed', handleAuthChanged);
    return () => window.removeEventListener('auth_changed', handleAuthChanged);
  }, []);

  return {
    user,
    isAnalyst: user?.role === 'analyst' || user?.role === 'admin',
    isAuthenticated: !!user,
  };
};
