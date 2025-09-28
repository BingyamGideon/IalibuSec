import { useState, useEffect } from 'react';
import { authStore, type User, type LoginCredentials, type RegisterData } from '@/lib/authStore';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const updateAuthState = () => {
      setCurrentUser(authStore.getCurrentUser());
      setIsAuthenticated(authStore.isAuthenticated());
      setLoading(false);
    };

    // Subscribe to auth changes
    const unsubscribe = authStore.subscribe(() => {
      updateAuthState();
    });

    // Initial state
    updateAuthState();

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const result = await authStore.login(credentials);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const result = await authStore.register(userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (username: string, token: string, password: string) => {
    setLoading(true);
    try {
      const res = await authStore.completeRegistration(username, token, password);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authStore.logout();
  };

  const updateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      return authStore.updateProfile(currentUser.id, updates);
    }
    return false;
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (currentUser) {
      return authStore.changePassword(currentUser.id, oldPassword, newPassword);
    }
    return false;
  };

  const hasPermission = (permission: string) => {
    return authStore.hasPermission(permission);
  };

  return {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    completeRegistration,
    logout,
    updateProfile,
    changePassword,
    hasPermission
  };
}
