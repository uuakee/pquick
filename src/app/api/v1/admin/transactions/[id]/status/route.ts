import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
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

    const { id } = params;
    const transactionId = parseInt(id);
    if (isNaN(transactionId)) {
      return new NextResponse("ID inválido", { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["PENDING", "COMPLETED", "FAILED", "FLAGGED"].includes(status)) {
      return new NextResponse("Status inválido", { status: 400 });
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[ADMIN_TRANSACTION_STATUS]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 