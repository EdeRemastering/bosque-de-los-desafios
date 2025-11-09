'use client';

import { useEffect, useState, useRef } from 'react';
import { Player } from '@/lib/types';
import { getCharacterAnimation } from '@/lib/character-animations';
import { BOARD_SIZE } from '@/lib/game-config';
import { cn } from '@/lib/utils';

interface AnimatedPlayerTokenProps {
  player: Player;
  cellSize: number;
  boardRef: React.RefObject<HTMLDivElement | null>;
  columns: number;
  playersInCell: number;
  indexInCell: number;
}

export function AnimatedPlayerToken({ 
  player, 
  cellSize, 
  boardRef, 
  columns,
  playersInCell,
  indexInCell
}: AnimatedPlayerTokenProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  // IMPORTANTE: Inicializar prevPositionRef con null y luego establecerlo en el useEffect
  // para evitar problemas de sincronización
  const prevPositionRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const isAnimatingRef = useRef(false);

  // Calcular posición de una celda en el grid con offset para múltiples jugadores
  const getCellPosition = (cellIndex: number, offsetX: number = 0, offsetY: number = 0) => {
    const row = Math.floor(cellIndex / columns);
    const col = cellIndex % columns;
    
    // Obtener el elemento de la celda si existe
    if (boardRef.current) {
      const cellElement = boardRef.current.querySelector(
        `[data-cell-index="${cellIndex}"]`
      ) as HTMLElement;
      
      if (cellElement && boardRef.current.parentElement) {
        const cellRect = cellElement.getBoundingClientRect();
        const boardContainerRect = boardRef.current.parentElement.getBoundingClientRect();
        return {
          x: cellRect.left - boardContainerRect.left + cellRect.width / 2 + offsetX,
          y: cellRect.top - boardContainerRect.top + cellRect.height / 2 + offsetY,
        };
      }
    }
    
    // Fallback: calcular basándose en el grid
    const gap = 8; // gap del grid
    const cellWidth = cellSize + gap;
    const cellHeight = cellSize + gap;
    const padding = 20; // padding del contenedor
    
    return {
      x: padding + col * cellWidth + cellWidth / 2 + offsetX,
      y: padding + row * cellHeight + cellHeight / 2 + offsetY,
    };
  };

  // Calcular offset para posicionar jugadores lado a lado
  const getPlayerOffset = (playersInCell: number, indexInCell: number) => {
    if (playersInCell === 1) {
      return { offsetX: 0, offsetY: 0 };
    }
    
    // Si hay 2 jugadores, colocarlos lado a lado horizontalmente
    if (playersInCell === 2) {
      const spacing = cellSize * 0.3; // Espacio entre jugadores
      return {
        offsetX: indexInCell === 0 ? -spacing / 2 : spacing / 2,
        offsetY: 0
      };
    }
    
    // Si hay 3 jugadores, formar un triángulo
    if (playersInCell === 3) {
      const spacing = cellSize * 0.25;
      if (indexInCell === 0) {
        return { offsetX: 0, offsetY: -spacing / 2 };
      } else if (indexInCell === 1) {
        return { offsetX: -spacing / 2, offsetY: spacing / 2 };
      } else {
        return { offsetX: spacing / 2, offsetY: spacing / 2 };
      }
    }
    
    // Si hay 4 jugadores, formar un cuadrado
    if (playersInCell === 4) {
      const spacing = cellSize * 0.22;
      if (indexInCell === 0) {
        return { offsetX: -spacing / 2, offsetY: -spacing / 2 };
      } else if (indexInCell === 1) {
        return { offsetX: spacing / 2, offsetY: -spacing / 2 };
      } else if (indexInCell === 2) {
        return { offsetX: -spacing / 2, offsetY: spacing / 2 };
      } else {
        return { offsetX: spacing / 2, offsetY: spacing / 2 };
      }
    }
    
    // Para más de 4, usar un patrón circular
    const angle = (indexInCell / playersInCell) * 2 * Math.PI;
    const radius = cellSize * 0.2;
    return {
      offsetX: Math.cos(angle) * radius,
      offsetY: Math.sin(angle) * radius
    };
  };

  // Inicializar posición solo una vez al montar
  useEffect(() => {
    if (!initializedRef.current) {
      // Inicializar posición sin animación con offset
      const offset = getPlayerOffset(playersInCell, indexInCell);
      const initialPos = getCellPosition(player.position, offset.offsetX, offset.offsetY);
      setPosition(initialPos);
      // IMPORTANTE: Inicializar prevPositionRef con la posición actual del jugador
      prevPositionRef.current = player.position;
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    // Esperar a que se inicialice antes de animar
    if (!initializedRef.current) {
      return;
    }
    
    // Si ya hay una animación en progreso, no iniciar otra
    if (isAnimatingRef.current) {
      return;
    }
    
    // Si la posición cambió, animar el movimiento paso a paso
    const currentPlayerPosition = player.position;
    const storedPrevPosition = prevPositionRef.current;
    
    // Si es la primera vez, establecer la posición inicial sin animar
    if (storedPrevPosition === null) {
      prevPositionRef.current = currentPlayerPosition;
      const offset = getPlayerOffset(playersInCell, indexInCell);
      const initialPos = getCellPosition(currentPlayerPosition, offset.offsetX, offset.offsetY);
      setPosition(initialPos);
      return;
    }
    
    // Solo animar si realmente cambió la posición
    if (storedPrevPosition === currentPlayerPosition) {
      return;
    }
    
    // IMPORTANTE: Capturar las posiciones ANTES de cualquier otra cosa
    // NO actualizar prevPositionRef aquí, solo al final de la animación
    const oldPosition = storedPrevPosition ?? 0;
    const newPosition = currentPlayerPosition;
    
    // Calcular el número de pasos CORRECTAMENTE
    // Si oldPosition = 0 y newPosition = 1, steps = 1 (debe hacer 1 paso: 0->1)
    // Si oldPosition = 0 y newPosition = 2, steps = 2 (debe hacer 2 pasos: 0->1->2)
    const steps = newPosition > oldPosition 
      ? newPosition - oldPosition  // Avanzar hacia adelante
      : oldPosition - newPosition; // Retroceder (no debería pasar en este juego)
    
    // Validación: si steps es 0, no hay movimiento (pero puede haber cambio de offset si otros jugadores se movieron)
    if (steps === 0) {
      prevPositionRef.current = currentPlayerPosition;
      const offset = getPlayerOffset(playersInCell, indexInCell);
      const finalPos = getCellPosition(currentPlayerPosition, offset.offsetX, offset.offsetY);
      setPosition(finalPos);
      return;
    }
    
    const direction = newPosition > oldPosition ? 1 : -1;
    const animation = getCharacterAnimation(player.icon);
    
    setIsAnimating(true);
    isAnimatingRef.current = true;
    
    // Limpiar animación anterior si existe
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Duración por paso (celda) - ajustada para que se vea bien
    // Para saltos (conejo), hacer más rápido y visible
    // Cada celda debe animarse individualmente
    const baseDuration = animation.type === 'jump' || animation.type === 'hop' || animation.type === 'bounce' 
      ? 350  // 350ms por salto para que sea visible
      : animation.type === 'run'
      ? 250  // 250ms por paso al correr
      : 400; // 400ms por paso para otros movimientos
    const stepDuration = baseDuration; // Duración fija por paso
    const totalDuration = stepDuration * steps; // Duración total = duración por paso × número de pasos
    const startTime = Date.now();
    
    const animateStep = () => {
      const elapsed = Date.now() - startTime;
      const totalProgress = Math.min(elapsed / totalDuration, 1);
      
      if (totalProgress < 1) {
        // Calcular qué paso estamos ejecutando (0-indexed)
        // currentStepIndex indica en qué paso estamos: 0, 1, 2, ..., steps-1
        const elapsedSteps = elapsed / stepDuration;
        let currentStepIndex = Math.floor(elapsedSteps);
        
        // Limitar currentStepIndex para que no exceda steps-1
        // Si steps=2, currentStepIndex solo puede ser 0 o 1
        currentStepIndex = Math.min(currentStepIndex, steps - 1);
        
        // Calcular progreso dentro del paso actual (0 a 1)
        const stepProgress = Math.min((elapsedSteps - currentStepIndex), 1);
        
        // Calcular índices de celdas para este paso específico
        // Si oldPosition=0, newPosition=2, steps=2, direction=1:
        //   - Paso 0 (currentStepIndex=0): currentCellIndex=0, nextCellIndex=1
        //   - Paso 1 (currentStepIndex=1): currentCellIndex=1, nextCellIndex=2
        const currentCellIndex = oldPosition + (currentStepIndex * direction);
        const calculatedNextCellIndex = oldPosition + ((currentStepIndex + 1) * direction);
        
        // IMPORTANTE: Asegurar que nextCellIndex nunca exceda newPosition
        // Si estamos en el último paso, nextCellIndex DEBE ser newPosition
        let nextCellIndex: number;
        if (currentStepIndex === steps - 1) {
          // En el último paso, la siguiente celda debe ser exactamente newPosition
          nextCellIndex = newPosition;
        } else {
          // En pasos intermedios, usar el cálculo normal pero limitarlo
          if (direction > 0) {
            nextCellIndex = Math.min(calculatedNextCellIndex, newPosition);
          } else {
            nextCellIndex = Math.max(calculatedNextCellIndex, newPosition);
          }
        }
        
        // Asegurar que estamos dentro del rango válido del tablero
        if (currentCellIndex >= 0 && currentCellIndex < BOARD_SIZE &&
            nextCellIndex >= 0 && nextCellIndex < BOARD_SIZE) {
          // Durante la animación, no usar offset (centrado)
          // Solo aplicar offset al final cuando el jugador llegue a su posición final
          const startCellPos = getCellPosition(currentCellIndex, 0, 0);
          // Si es el último paso, aplicar offset, sino no
          const isLastStep = currentStepIndex === steps - 1;
          const finalOffset = isLastStep ? getPlayerOffset(playersInCell, indexInCell) : { offsetX: 0, offsetY: 0 };
          const endCellPos = getCellPosition(nextCellIndex, finalOffset.offsetX, finalOffset.offsetY);
          
          // Aplicar easing y efectos según el tipo de animación
          let easedProgress = stepProgress;
          let offsetY = 0;
          
          if (animation.type === 'jump' || animation.type === 'hop' || animation.type === 'bounce') {
            // Easing con salto pronunciado - el conejo salta de celda en celda
            // Cada salto debe ser visible y claro
            easedProgress = 1 - Math.pow(1 - stepProgress, 2.5);
            const jumpPhase = Math.sin(stepProgress * Math.PI);
            offsetY = -jumpPhase * 40; // Altura del salto más pronunciada para que sea visible
          } else if (animation.type === 'fly' || animation.type === 'glide') {
            // Movimiento suave con vuelo
            easedProgress = stepProgress < 0.5 
              ? 2 * stepProgress * stepProgress 
              : 1 - Math.pow(-2 * stepProgress + 2, 2) / 2;
            offsetY = -Math.sin(stepProgress * Math.PI * 2) * 18; // Movimiento ondulante
          } else if (animation.type === 'run') {
            // Movimiento rápido con pequeños rebotes
            easedProgress = stepProgress;
            offsetY = -Math.abs(Math.sin(stepProgress * Math.PI * 4)) * 6; // Rebotes rápidos
          } else if (animation.type === 'walk') {
            // Movimiento pausado
            easedProgress = stepProgress < 0.5 
              ? 2 * stepProgress * stepProgress 
              : 1 - Math.pow(-2 * stepProgress + 2, 2) / 2;
            offsetY = -Math.sin(stepProgress * Math.PI) * 3;
          } else {
            // Movimiento normal (crawl, etc.)
            easedProgress = stepProgress;
          }
          
          setPosition({
            x: startCellPos.x + (endCellPos.x - startCellPos.x) * easedProgress,
            y: startCellPos.y + (endCellPos.y - startCellPos.y) * easedProgress + offsetY,
          });
        }
        
        animationRef.current = requestAnimationFrame(animateStep);
      } else {
        // Animación completada - establecer posición final exacta con offset
        const offset = getPlayerOffset(playersInCell, indexInCell);
        const finalPos = getCellPosition(newPosition, offset.offsetX, offset.offsetY);
        setPosition(finalPos);
        setIsAnimating(false);
        isAnimatingRef.current = false;
        // IMPORTANTE: Actualizar la posición previa SOLO cuando termine la animación
        prevPositionRef.current = newPosition;
      }
    };
    
    // Iniciar animación inmediatamente
    animationRef.current = requestAnimationFrame(animateStep);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [player.position, player.icon, cellSize, columns, playersInCell, indexInCell]);
  
  // Actualizar posición cuando cambie el número de jugadores en la celda o el índice
  // (solo si no está animando)
  useEffect(() => {
    if (initializedRef.current && !isAnimatingRef.current && !isAnimating) {
      const offset = getPlayerOffset(playersInCell, indexInCell);
      const currentPos = getCellPosition(player.position, offset.offsetX, offset.offsetY);
      setPosition(currentPos);
    }
  }, [playersInCell, indexInCell, player.position, isAnimating]);

  return (
    <div
      className={cn(
        'absolute rounded-full border-[3px] border-white shadow-lg flex items-center justify-center text-2xl pointer-events-none',
        isAnimating && 'z-50'
      )}
      style={{
        backgroundColor: player.color,
        width: `${cellSize * 0.45}px`,
        height: `${cellSize * 0.45}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%)`,
        transition: isAnimating ? 'none' : 'left 0.2s ease, top 0.2s ease',
        willChange: isAnimating ? 'transform, left, top' : 'auto',
      }}
      title={player.name}
    >
      <span className="relative z-10">{player.icon}</span>
    </div>
  );
}

