'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const publicRoutes = ['/', '/signup', '/forgot-password'];
const protectedRoutes = ['/dashboard', '/dashboard/credenciais', '/dashboard/webhooks', '/dashboard/transferencias', '/dashboard/cobrancas', '/dashboard/extrato', '/dashboard/infracoes', '/dashboard/qrcodes', '/dashboard/pagamentos'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isPublicRoute = publicRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (token) {
      if (isPublicRoute) {
        router.push('/dashboard');
      }
    } else {
      if (isProtectedRoute) {
        router.push('/');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
} 