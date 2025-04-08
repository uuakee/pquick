import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: any
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const parsedId = parseInt(params.id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se a credencial existe e pertence ao usuário
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: parsedId,
        userId: auth.userId,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Credencial não encontrada' },
        { status: 404 }
      );
    }

    if (apiKey.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Credencial já está revogada ou expirada' },
        { status: 400 }
      );
    }

    // Revogar a credencial
    const updatedApiKey = await prisma.apiKey.update({
      where: { id: parsedId },
      data: { status: 'REVOKED' },
    });

    return NextResponse.json({ apiKey: updatedApiKey });
  } catch (error) {
    console.error('Erro ao revogar credencial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 