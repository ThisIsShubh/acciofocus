import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserData() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clerkLoaded || !clerkUser) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/me');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [clerkLoaded, clerkUser]);

  const updateUserData = async (updates) => {
    try {
      setError(null);

      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const result = await response.json();
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        ...result.user
      }));

      return result;
    } catch (err) {
      console.error('Error updating user data:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    userData,
    loading,
    error,
    updateUserData,
    refetch: () => {
      if (clerkUser) {
        setLoading(true);
        fetch('/api/user/me')
          .then(res => res.json())
          .then(data => setUserData(data))
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));
      }
    }
  };
} 