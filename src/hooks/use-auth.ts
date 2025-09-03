"use client";

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '@/contexts/auth-context';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
   if (!context.signup) {
    context.signup = async () => { throw new Error('signup function is not implemented'); };
  }
  if (!context.useGeneration) {
    context.useGeneration = async () => { throw new Error('useGeneration function is not implemented'); };
  }
  return context;
};
