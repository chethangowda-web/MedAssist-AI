import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { authApi } from '@services/api';
import { signInWithGoogle, signOutUser } from '@services/firebase';
import type { User } from '@types/index';

export function useAuth() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, setAuth, setLoading, logout: storeLogout } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      const { access_token, user_id, email: userEmail, name, role } = response.data;
      const userData: User = { id: user_id, email: userEmail, name, role, phone: '', isActive: true, createdAt: '' };
      setAuth(userData, access_token);
      toast.success(`Welcome back, ${name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Login failed';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth, setLoading]);

  const register = useCallback(async (data: { email: string; password: string; name: string; role: string }) => {
    try {
      setLoading(true);
      const response = await authApi.register(data);
      const { access_token, user_id, email, name, role } = response.data;
      const userData: User = { id: user_id, email, name, role, phone: '', isActive: true, createdAt: '' };
      setAuth(userData, access_token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Registration failed';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth, setLoading]);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const firebaseUser = await signInWithGoogle();
      const idToken = await firebaseUser.getIdToken();
      const response = await authApi.firebaseAuth(idToken);
      const { access_token, user_id, email, name, role } = response.data;
      const userData: User = { id: user_id, email, name, role, phone: '', isActive: true, createdAt: '' };
      setAuth(userData, access_token);
      toast.success(`Welcome, ${name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Google sign-in failed';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth, setLoading]);

  const logout = useCallback(async () => {
    try {
      await signOutUser();
    } catch {
      // ignore firebase signout errors
    }
    storeLogout();
    navigate('/');
    toast.success('Logged out successfully');
  }, [navigate, storeLogout]);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          await authApi.getProfile();
          setLoading(false);
        } catch {
          storeLogout();
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { user, token, isAuthenticated, isLoading, login, register, loginWithGoogle, logout };
}
