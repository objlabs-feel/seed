import { AuthProvider } from './_contexts/AuthContext';
import { ReactNode } from 'react';

export default function TestLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 