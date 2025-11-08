'use client';

import { useEffect, useState, useRef } from 'react';
import { Player } from '@/lib/types';
import { getCharacterAnimation } from '@/lib/character-animations';
import { cn } from '@/lib/utils';

interface PlayerTokenProps {
  player: Player;
  cellSize: number;
  index: number;
  isMoving?: boolean;
}

export function PlayerToken({ player, cellSize, index, isMoving = false }: PlayerTokenProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPositionRef = useRef(player.position);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Si la posición cambió, activar animación
    if (prevPositionRef.current !== player.position) {
      setIsAnimating(true);
      const animation = getCharacterAnimation(player.icon);
      
      // Limpiar animación anterior si existe
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      
      // Desactivar animación después de la duración
      animationRef.current = window.setTimeout(() => {
        setIsAnimating(false);
      }, animation.duration);
      
      prevPositionRef.current = player.position;
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [player.position, player.icon]);

  const animation = getCharacterAnimation(player.icon);
  
  // Mapeo de tipos de animación a clases de Tailwind
  const getAnimationClass = (type: string) => {
    const animationMap: Record<string, string> = {
      'jump': 'animate-jump',
      'hop': 'animate-hop',
      'run': 'animate-run',
      'fly': 'animate-fly',
      'crawl': 'animate-crawl',
      'glide': 'animate-glide',
      'bounce': 'animate-bounce',
      'walk': 'animate-walk',
    };
    return animationMap[type] || 'animate-walk';
  };

  const animationClass = isAnimating || isMoving 
    ? getAnimationClass(animation.type)
    : '';

  return (
    <div
      className={cn(
        'rounded-full border-[3px] border-white shadow-lg flex items-center justify-center text-2xl transition-all relative hover:scale-125',
        animationClass,
        isAnimating && 'z-30'
      )}
      style={{
        backgroundColor: player.color,
        width: `${cellSize * 0.45}px`,
        height: `${cellSize * 0.45}px`,
        left: `${(index % 2) * 50}%`,
        top: `${Math.floor(index / 2) * 50}%`,
        transform: `translate(${(index % 2) * 25 - 12}px, ${Math.floor(index / 2) * 25 - 12}px)`,
        ...(isAnimating && {
          animationDuration: `${animation.duration}ms`,
          animationTimingFunction: animation.easing,
          animationIterationCount: 1,
        }),
      }}
      title={player.name}
    >
      <span className="relative z-10">{player.icon}</span>
    </div>
  );
}

