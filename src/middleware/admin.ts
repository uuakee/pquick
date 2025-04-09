import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function adminMiddleware(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }

  if (payload.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Acesso negado' },
      { status: 403 }
    );
  }

  return NextResponse.next();
} 