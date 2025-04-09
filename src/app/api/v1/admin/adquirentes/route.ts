import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AdquirenteStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Token não fornecido" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const adquirente = await prisma.adquirentes.findFirst();

  if (!adquirente) {
    // Criar configuração padrão se não existir
    const defaultAdquirente = await prisma.adquirentes.create({
      data: {
        primepag_name: "PrimePag",
        primepag_status: "INACTIVE",
        primepag_uri: "",
        primepag_ci: "",
        primepag_cs: "",
        zendry_name: "Zendry",
        zendry_status: "INACTIVE",
        zendry_uri: "",
        zendry_ci: "",
        zendry_cs: "",
      },
    });
    return NextResponse.json(defaultAdquirente);
  }

  return NextResponse.json(adquirente);
}

export async function PUT(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Token não fornecido" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const data = await request.json();

  // Buscar o registro existente ou criar um novo
  let existingAdquirente = await prisma.adquirentes.findFirst();
  const adquirenteId = existingAdquirente?.id || 1;

  // Validar que apenas um adquirente pode estar ativo por vez
  if (data.primepag_status === "ACTIVE" && data.zendry_status === "ACTIVE") {
    return NextResponse.json(
      { error: "Apenas um adquirente pode estar ativo por vez" },
      { status: 400 }
    );
  }

  // Converter os status para o enum
  const primepag_status = data.primepag_status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
  const zendry_status = data.zendry_status === "ACTIVE" ? "ACTIVE" : "INACTIVE";

  const adquirente = await prisma.adquirentes.upsert({
    where: { id: adquirenteId },
    update: {
      primepag_status,
      primepag_uri: data.primepag_uri || "",
      primepag_ci: data.primepag_ci || "",
      primepag_cs: data.primepag_cs || "",
      primepag_name: data.primepag_name || "PrimePag",
      zendry_status,
      zendry_uri: data.zendry_uri || "",
      zendry_ci: data.zendry_ci || "",
      zendry_cs: data.zendry_cs || "",
      zendry_name: data.zendry_name || "Zendry",
    },
    create: {
      primepag_status,
      primepag_uri: data.primepag_uri || "",
      primepag_ci: data.primepag_ci || "",
      primepag_cs: data.primepag_cs || "",
      primepag_name: data.primepag_name || "PrimePag",
      zendry_status,
      zendry_uri: data.zendry_uri || "",
      zendry_ci: data.zendry_ci || "",
      zendry_cs: data.zendry_cs || "",
      zendry_name: data.zendry_name || "Zendry",
    },
  });

  return NextResponse.json(adquirente);
} 