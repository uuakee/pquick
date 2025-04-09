"use client";

import { UserLevel } from "@prisma/client";
import { LEVEL_BADGES, LEVEL_COLORS, LEVEL_BENEFITS, LEVEL_THRESHOLDS } from "@/lib/gamification";
import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface UserLevelBadgeProps {
  level: UserLevel;
  monthlyRevenue: number;
  showProgress?: boolean;
  className?: string;
}

export function UserLevelBadge({ level, monthlyRevenue, showProgress = true, className = "" }: UserLevelBadgeProps) {
  // Calcular progresso para o próximo nível
  const currentThreshold = LEVEL_THRESHOLDS[level];
  const levels = Object.entries(LEVEL_THRESHOLDS);
  const nextLevelIndex = levels.findIndex(([l]) => l === level) + 1;
  const nextLevel = levels[nextLevelIndex];
  const progress = nextLevel
    ? ((monthlyRevenue - currentThreshold) / (nextLevel[1] - currentThreshold)) * 100
    : 100;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={`flex items-center gap-2 cursor-pointer ${className}`}>
          <Image
            src={LEVEL_BADGES[level]}
            alt={`Nível ${level}`}
            width={32}
            height={32}
            className=""
          />
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${LEVEL_COLORS[level]}`}>
              Nível {level.charAt(0) + level.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Image
            src={LEVEL_BADGES[level]}
            alt={`Nível ${level}`}
            width={48}
            height={48}
          />
          <div className="space-y-1">
            <h4 className={`text-sm font-semibold ${LEVEL_COLORS[level]}`}>
              Nível {level.charAt(0) + level.slice(1).toLowerCase()}
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Benefícios do seu nível:</p>
              <ul className="list-none space-y-1">
                {LEVEL_BENEFITS[level].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Trophy className="h-3 w-3" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            {nextLevel && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p>
                  Próximo nível: {nextLevel[0].charAt(0) + nextLevel[0].slice(1).toLowerCase()}
                </p>
                {/* <p>
                  Faltam R$ {((nextLevel[1] - monthlyRevenue) / 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p> */}
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 