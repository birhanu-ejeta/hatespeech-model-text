import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (adminOnly && user.role !== 'admin') {
        router.push('/user/dashboard');
      }
    }
  }, [user, loading, router, adminOnly]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!user) return null;
  if (adminOnly && user.role !== 'admin') return null;
  return children;
}