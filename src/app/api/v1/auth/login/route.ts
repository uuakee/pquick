import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, loginSchema, verifyPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar dados
    const validatedData = loginSchema.parse(body);

    // Buscar usuário por email ou username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.identifier },
          { username: validatedData.identifier }
        ]
      },
      include: {
        wallet: {
          select: {
            balance: true,
            blocked_balance: true,
            available_balance: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar status do usuário
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Conta inativa ou bloqueada' },
        { status: 403 }
      );
    }
    

    // Verificar senha
    const isValid = await verifyPassword(validatedData.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gerar token
    const token = generateToken(user.id, user.email, user.username);

    // Retornar resposta
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        wallet: user.wallet,
      },
      token,
    });
  } catch (error: any) {
    console.error('Erro no login:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 