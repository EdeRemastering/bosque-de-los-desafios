'use client';

import { useRef, useState, useEffect } from 'react';
import { BOARD_SIZE } from '@/lib/game-config';
import { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PlayerToken } from './PlayerToken';
import { AnimatedPlayerToken } from './AnimatedPlayerToken';

interface GameBoardProps {
  players: Player[];
  challengeCells: number[];
  cellSize?: number;
}

const DESKTOP_COLUMNS = 10;

export function GameBoard({ players, challengeCells, cellSize }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Calcular el número de columnas responsivo
  const getResponsiveColumns = (): number => {
    if (typeof window === 'undefined') return DESKTOP_COLUMNS;
    const width = windowWidth;
    if (width < 640) {
      // Móvil: usar 6 columnas para tener 5 filas de alto (30 casillas / 6 columnas = 5 filas)
      return 6;
    } else if (width < 1024) {
      // Tablet: usar 7 columnas
      return 7;
    }
    // Desktop: usar 10 columnas (layout horizontal)
    return DESKTOP_COLUMNS;
  };
  
  // Calcular el tamaño de celda responsivo basado en el ancho de la pantalla y número de columnas
  const getResponsiveCellSize = (columns: number): number => {
    if (typeof window === 'undefined') return cellSize || 60;
    const width = windowWidth;
    if (width < 640) {
      // Móvil: calcular tamaño basado en columnas y ancho disponible
      // Considerar padding del contenedor principal, padding del tablero, y gaps
      const mainPadding = 16; // padding del contenedor principal (p-2 = 8px cada lado)
      const boardPadding = 16; // padding del tablero (p-2 = 8px cada lado)
      const border = 4; // borde del tablero (border-2 = 2px cada lado)
      const availableWidth = width - (mainPadding * 2) - (boardPadding * 2) - (border * 2);
      const gap = 4; // gap entre celdas (gap-1 = 4px)
      const totalGapWidth = gap * (columns - 1);
      const calculatedSize = Math.floor((availableWidth - totalGapWidth) / columns);
      return Math.max(45, calculatedSize); // mínimo 45px para que sea cómodamente táctil
    } else if (width < 1024) {
      // Tablet
      return cellSize || 50;
    }
    // Desktop
    return cellSize || 60;
  };
  
  // Actualizar el ancho de la ventana cuando cambie
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const responsiveColumns = getResponsiveColumns();
  const responsiveCellSize = getResponsiveCellSize(responsiveColumns);
  
  const getCellContent = (index: number): { icon: string; showNumber: boolean } => {
    if (index === 0) return { icon: '🌱', showNumber: false };
    if (index === BOARD_SIZE - 1) return { icon: '🏆', showNumber: false };
    if (challengeCells.includes(index)) return { icon: '🎯', showNumber: false };
    // Mostrar iconos del bosque en algunas casillas
    const forestIcons = ['🍃', '🌿', '🍀', '🌾'];
    if (index % 3 === 0 && index > 0 && index < BOARD_SIZE - 1) {
      return { icon: forestIcons[index % forestIcons.length], showNumber: true };
    }
    return { icon: '', showNumber: true };
  };

  const getCellClassName = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-green-600 to-emerald-600 text-white font-bold border-green-700 shadow-lg';
    if (index === BOARD_SIZE - 1) return 'bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold animate-pulse border-amber-700 shadow-xl';
    if (challengeCells.includes(index)) return 'bg-gradient-to-br from-yellow-400 to-amber-400 border-yellow-600 shadow-lg hover:shadow-xl';
    return 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 hover:from-green-200 hover:to-emerald-200 hover:shadow-md';
  };

  const getPlayersInCell = (index: number) => {
    return players.filter(p => p.position === index);
  };

  return (
    <div className="p-2 sm:p-3 md:p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-green-600 shadow-inner relative overflow-visible">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='60' font-size='60' text-anchor='middle'%3E🌳%3C/text%3E%3C/svg%3E")`,
        backgroundSize: '150px 150px'
      }}></div>
      <div 
        ref={boardRef}
        className="grid gap-1 sm:gap-2 relative z-10"
        style={{
          gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
        }}
      >
        {Array.from({ length: BOARD_SIZE }).map((_, index) => {
          return (
            <div
              key={index}
              data-cell-index={index}
              className={cn(
                'aspect-square rounded-md sm:rounded-lg border-2 flex flex-col items-center justify-center font-semibold relative transition-all hover:scale-105 hover:shadow-md',
                getCellClassName(index)
              )}
              style={{ 
                minWidth: `${responsiveCellSize}px`,
                minHeight: `${responsiveCellSize}px`,
              }}
            >
              {(() => {
                const content = getCellContent(index);
                return (
                  <>
                    {content.icon && (
                      <span className="z-10 text-lg sm:text-xl md:text-2xl lg:text-3xl">{content.icon}</span>
                    )}
                    {content.showNumber && (
                      <span className="z-10 text-xs sm:text-sm text-green-700 font-semibold mt-0.5 sm:mt-1">{index}</span>
                    )}
                  </>
                );
              })()}
            </div>
          );
        })}
      </div>
      
      {/* Renderizar tokens animados por encima del tablero */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
        {players.map((player) => {
          // Contar cuántos jugadores están en la misma casilla
          const playersInSameCell = players.filter(p => p.position === player.position);
          // Obtener el índice de este jugador entre los que están en la misma casilla
          const indexInCell = playersInSameCell
            .sort((a, b) => a.id - b.id)
            .findIndex(p => p.id === player.id);
          
          return (
            <AnimatedPlayerToken
              key={player.id}
              player={player}
              cellSize={responsiveCellSize}
              boardRef={boardRef}
              columns={responsiveColumns}
              playersInCell={playersInSameCell.length}
              indexInCell={indexInCell}
            />
          );
        })}
      </div>
    </div>
  );
}
