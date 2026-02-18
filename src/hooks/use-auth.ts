import { useState, useEffect } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';

export function useAuth() {
  const { isAuthenticated, isLoading, user, signOut } = useBlinkAuth();
  
  // Custom hook logic can be expanded here
  
  return {
    isAuthenticated,
    isLoading,
    user,
    signOut,
  };
}
