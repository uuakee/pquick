import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    // Verificar se o usuário é admin
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!admin || admin.role !== "ADMIN") {
      return new NextResponse("Acesso negado", { status: 403 });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return new NextResponse("ID de usuário inválido", { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["ACTIVE", "INACTIVE", "BLOCKED"].includes(status)) {
      return new NextResponse("Status inválido", { status: 400 });
    }

    // Não permitir que o admin bloqueie a si mesmo
    if (userId === decoded.userId) {
      return new NextResponse("Não é possível alterar seu próprio status", { status: 400 });
    }

    // Atualizar status do usuário
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        status: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[ADMIN_USER_STATUS_UPDATE]", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2025") {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }
    return new NextResponse("Erro interno", { status: 500 });
  }
} 