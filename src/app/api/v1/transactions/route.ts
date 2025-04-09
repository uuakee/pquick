import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { checkAndUpdateUserLevel } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, receiverId, type, description } = body;

    if (!amount || !receiverId || !type) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        description,
        status: 'COMPLETED',
        senderId: auth.userId,
        receiverId,
      },
    });

    // Verificar e atualizar nível do usuário receptor
    const levelUpdate = await checkAndUpdateUserLevel(receiverId);

    // Se houve upgrade de nível, incluir na resposta
    return NextResponse.json({
      transaction,
      levelUpdate: levelUpdate ? {
        message: `Parabéns! Você alcançou o nível ${levelUpdate.newLevel}!`,
        ...levelUpdate
      } : null
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 