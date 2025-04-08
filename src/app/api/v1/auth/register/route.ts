import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, hashPassword, registerSchema } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar dados
    const validatedData = registerSchema.parse(body);

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone },
          { cnpj: validatedData.cnpj },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com esse email, telefone, CNPJ ou username' },
        { status: 400 }
      );
    }

    // Criar usuário
    const hashedPassword = await hashPassword(validatedData.password);
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        status: 'INACTIVE',
        wallet: {
          create: {
            balance: 0,
            blocked_balance: 0,
            available_balance: 0,
          },
        },
      },
    });

    // Gerar token
    const token = generateToken(user.id);

    // Retornar resposta
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      token,
    });
  } catch (error: any) {
    console.error('Erro no registro:', error);

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