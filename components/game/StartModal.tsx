'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Difficulty, GameMode } from '@/lib/types';
import { CharacterSelector } from './CharacterSelector';
import { FOREST_CHARACTERS } from '@/lib/game-config';

interface StartModalProps {
  open: boolean;
  onStart: (
    playerCount: number, 
    difficulty: Difficulty, 
    mode: GameMode, 
    timeLimit: boolean,
    playerCharacters: string[]
  ) => void;
}

interface CharacterSelection {
  emoji: string;
  playerNumber: number;
}

export function StartModal({ open, onStart }: StartModalProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<GameMode>('individual');
  const [timeLimit, setTimeLimit] = useState(false);
  const [currentPlayerSelecting, setCurrentPlayerSelecting] = useState(1);
  const [playerSelections, setPlayerSelections] = useState<CharacterSelection[]>([]);

  const handleCharacterSelect = (emoji: string, playerNumber: number) => {
    setPlayerSelections(prev => {
      // Remover selección anterior de este jugador si existe
      const filtered = prev.filter(s => s.playerNumber !== playerNumber);
      
      // Verificar si el personaje ya está seleccionado por otro jugador
      const existingSelection = prev.find(s => s.emoji === emoji);
      
      let newSelections: CharacterSelection[];
      
      if (existingSelection && existingSelection.playerNumber !== playerNumber) {
        // Si otro jugador ya lo tiene, intercambiar
        const otherPlayerSelection = prev.find(s => s.playerNumber === playerNumber);
        if (otherPlayerSelection) {
          // Intercambiar personajes
          newSelections = [
            ...filtered.filter(s => s.playerNumber !== existingSelection.playerNumber),
            { emoji, playerNumber },
            { emoji: otherPlayerSelection.emoji, playerNumber: existingSelection.playerNumber }
          ];
        } else {
          // Solo reemplazar la selección del otro jugador
          newSelections = [
            ...filtered.filter(s => s.playerNumber !== existingSelection.playerNumber),
            { emoji, playerNumber }
          ];
        }
      } else {
        // Agregar nueva selección
        newSelections = [...filtered, { emoji, playerNumber }];
      }
      
      // Verificar si este jugador ya tiene un personaje seleccionado
      const thisPlayerHasSelection = newSelections.some(s => s.playerNumber === playerNumber);
      
      // Solo avanzar al siguiente jugador si:
      // 1. Este jugador tiene un personaje seleccionado
      // 2. Aún hay más jugadores por seleccionar
      // 3. El jugador actual es el que está seleccionando
      if (thisPlayerHasSelection && currentPlayerSelecting === playerNumber) {
        // Avanzar al siguiente jugador después de un breve delay solo si no es el último
        if (currentPlayerSelecting < playerCount) {
          setTimeout(() => {
            setCurrentPlayerSelecting(prev => {
              // Verificar que realmente hay más jugadores y que este jugador tiene selección
              const hasSelection = newSelections.some(s => s.playerNumber === prev);
              if (prev < playerCount && hasSelection) {
                return prev + 1;
              }
              return prev;
            });
          }, 500);
        }
      }
      
      return newSelections;
    });
  };

  const handleStart = () => {
    if (playerCount >= 2 && playerCount <= 4) {
      // Verificar que todos los jugadores (1 a playerCount) tengan un personaje seleccionado
      const playersWithSelection = new Set(playerSelections.map(s => s.playerNumber));
      const missingPlayers: number[] = [];
      
      for (let i = 1; i <= playerCount; i++) {
        if (!playersWithSelection.has(i)) {
          missingPlayers.push(i);
        }
      }
      
      if (missingPlayers.length > 0) {
        alert(`Por favor, todos los jugadores deben seleccionar un personaje. Faltan: Jugador ${missingPlayers.join(', Jugador ')}.`);
        return;
      }
      
      // Verificar que todos los personajes sean únicos
      const uniqueCharacters = new Set(playerSelections.map(s => s.emoji));
      if (uniqueCharacters.size < playerCount) {
        alert('Por favor, selecciona personajes diferentes para cada jugador');
        return;
      }

      // Verificar que el número de selecciones coincide con el número de jugadores
      if (playerSelections.length !== playerCount) {
        alert(`Error: Se esperaban ${playerCount} selecciones, pero se encontraron ${playerSelections.length}. Por favor, reinicia las selecciones.`);
        return;
      }

      // Ordenar por número de jugador y extraer los emojis
      const sortedSelections = [...playerSelections]
        .sort((a, b) => a.playerNumber - b.playerNumber)
        .map(s => s.emoji);
      
      onStart(playerCount, difficulty, mode, timeLimit, sortedSelections);
    }
  };

  const handleResetSelection = () => {
    setPlayerSelections([]);
    setCurrentPlayerSelecting(1);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 to-emerald-50">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center text-green-800">
            🌲 Aventura en el Bosque de los Desafíos 🌲
          </DialogTitle>
          <DialogDescription className="text-center text-lg pt-2 text-green-700">
            ¡Únete a esta aventura y completa desafíos para llegar primero a la meta!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="player-count" className="text-base text-green-800 font-semibold">
              Número de Jugadores (2-4):
            </Label>
            <Input
              id="player-count"
              type="number"
              min={2}
              max={4}
              value={playerCount}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 2;
                // Limitar el valor entre 2 y 4
                if (value < 2) {
                  setPlayerCount(2);
                } else if (value > 4) {
                  setPlayerCount(4);
                } else {
                  setPlayerCount(value);
                }
              }}
              onBlur={(e) => {
                // Asegurar que el valor esté en el rango válido cuando se pierde el foco
                const value = parseInt(e.target.value) || 2;
                if (value < 2) {
                  setPlayerCount(2);
                } else if (value > 4) {
                  setPlayerCount(4);
                }
              }}
              className="w-full border-green-300 focus:border-green-500"
            />
          </div>

          {/* Selector único de personajes */}
          <div className="space-y-4 p-4 bg-white/60 rounded-lg border-2 border-green-300 shadow-md">
            {/* Verificar si todos los jugadores han seleccionado */}
            {(() => {
              // Verificar que todos los jugadores (1 a playerCount) tengan un personaje
              const allPlayersHaveSelection = Array.from({ length: playerCount }, (_, i) => i + 1)
                .every(playerNum => playerSelections.some(s => s.playerNumber === playerNum));
              
              if (allPlayersHaveSelection && playerSelections.length === playerCount) {
                return (
                  <div className="text-center py-4">
                    <p className="text-green-800 font-semibold text-lg mb-2">
                      ✅ Todos los jugadores han seleccionado su personaje
                    </p>
                    <p className="text-green-700 text-sm">
                      Puedes hacer clic en "Comenzar Aventura" para iniciar el juego
                    </p>
                  </div>
                );
              }
              
              return (
                <>
                  <CharacterSelector
                    playerSelections={playerSelections}
                    currentPlayerNumber={currentPlayerSelecting}
                    onSelect={handleCharacterSelect}
                    playerCount={playerCount}
                  />
                  {playerSelections.length > 0 && (
                    <Button
                      onClick={handleResetSelection}
                      variant="outline"
                      className="w-full border-green-400 text-green-700 hover:bg-green-50"
                    >
                      🔄 Reiniciar Selecciones
                    </Button>
                  )}
                  {/* Mostrar progreso de selección */}
                  <div className="text-center">
                    <p className="text-sm text-green-700">
                      Progreso: {playerSelections.length} de {playerCount} jugadores han seleccionado
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-base text-green-800 font-semibold">
              Nivel de Dificultad:
            </Label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
              <SelectTrigger id="difficulty" className="border-green-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil (4-5 años)</SelectItem>
                <SelectItem value="medium">Medio (5-6 años)</SelectItem>
                <SelectItem value="hard">Difícil (6+ años)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="text-base text-green-800 font-semibold">
              Modo de Juego:
            </Label>
            <Select value={mode} onValueChange={(value) => setMode(value as GameMode)}>
              <SelectTrigger id="mode" className="border-green-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="teams">Equipos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="time-limit"
              checked={timeLimit}
              onCheckedChange={(checked) => setTimeLimit(checked === true)}
              className="border-green-400"
            />
            <Label htmlFor="time-limit" className="text-base cursor-pointer text-green-800">
              Activar tiempo límite para desafíos
            </Label>
          </div>

          <Button 
            onClick={handleStart} 
            className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg"
          >
            🎮 Comenzar Aventura en el Bosque
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
