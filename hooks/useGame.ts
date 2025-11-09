'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Player, Team, Difficulty, GameMode, Challenge } from '@/lib/types';
import { BOARD_SIZE, FOREST_CHARACTERS, FOREST_COLORS, generateRandomChallengeCells } from '@/lib/game-config';
import { playAnimalSound, playTeamVictorySound } from '@/lib/animal-sounds';
import { generateChallenge, selectRandomChallenges, generateSpecificChallenge, PredefinedChallenge } from '@/lib/challenge-generator';

export function useGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentTeamPlayerIndex, setCurrentTeamPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [diceRolled, setDiceRolled] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('individual');
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<number | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [challengeCells, setChallengeCells] = useState<number[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const challengeCellsRef = useRef<number[]>([]);
  // Mapeo de casilla de desafío -> reto predefinido
  const challengeMapRef = useRef<Map<number, PredefinedChallenge>>(new Map());
  const playersRef = useRef<Player[]>([]);
  const teamsRef = useRef<Team[]>([]);
  const currentPlayerIndexRef = useRef(0);
  const currentTeamIndexRef = useRef(0);
  const currentTeamPlayerIndexRef = useRef(0);
  const gameModeRef = useRef<GameMode>('individual');
  const isMovingPlayerRef = useRef(false);
  const movePlayerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar refs con state
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  useEffect(() => {
    currentPlayerIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex]);

  useEffect(() => {
    currentTeamIndexRef.current = currentTeamIndex;
  }, [currentTeamIndex]);

  useEffect(() => {
    currentTeamPlayerIndexRef.current = currentTeamPlayerIndex;
  }, [currentTeamPlayerIndex]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  // IMPORTANTE: Sincronizar challengeCellsRef con challengeCells state
  useEffect(() => {
    challengeCellsRef.current = challengeCells;
  }, [challengeCells]);

  const nextTurn = useCallback(() => {
    setDiceRolled(false);
    setDiceValue(null);
    // Resetear el flag de movimiento cuando cambia el turno
    isMovingPlayerRef.current = false;
    // Limpiar cualquier timeout pendiente
    if (movePlayerTimeoutRef.current) {
      clearTimeout(movePlayerTimeoutRef.current);
      movePlayerTimeoutRef.current = null;
    }

    if (gameModeRef.current === 'teams') {
      // Modo equipos: usar refs para obtener valores actuales
      const currentTeams = teamsRef.current;
      const currentTeamIdx = currentTeamIndexRef.current;
      const currentPlayerIdx = currentTeamPlayerIndexRef.current;
      
      const currentTeam = currentTeams[currentTeamIdx];
      if (!currentTeam) return;

      const newPlayerIndex = currentPlayerIdx + 1;
      
      if (newPlayerIndex < currentTeam.players.length) {
        // Hay más jugadores en el equipo actual, avanzar al siguiente
        setCurrentTeamPlayerIndex(newPlayerIndex);
      } else {
        // No hay más jugadores, cambiar al siguiente equipo
        const nextTeamIndex = (currentTeamIdx + 1) % currentTeams.length;
        setCurrentTeamIndex(nextTeamIndex);
        setCurrentTeamPlayerIndex(0);
      }
    } else {
      // Modo individual: avanzar al siguiente jugador circularmente
      const currentPlayers = playersRef.current;
      const currentIdx = currentPlayerIndexRef.current;
      const nextIndex = (currentIdx + 1) % currentPlayers.length;
      setCurrentPlayerIndex(nextIndex);
    }
  }, []);

  const movePlayer = useCallback((steps: number) => {
    // IMPORTANTE: steps debe ser el valor exacto del dado (1-6)
    // No debe duplicarse ni modificarse
    // Validar que steps esté en el rango válido
    if (steps < 1 || steps > 6) {
      console.warn(`Valor de dado inválido: ${steps}`);
      return;
    }
    
    // Prevenir múltiples ejecuciones simultáneas
    if (isMovingPlayerRef.current) {
      console.warn('movePlayer ya está en ejecución, ignorando llamada duplicada');
      return;
    }
    
    isMovingPlayerRef.current = true;
    
    // Limpiar cualquier timeout pendiente de movePlayer
    if (movePlayerTimeoutRef.current) {
      clearTimeout(movePlayerTimeoutRef.current);
      movePlayerTimeoutRef.current = null;
    }
    
    setPlayers(prevPlayers => {
      // Crear una copia profunda del array de jugadores
      const updatedPlayers = prevPlayers.map(p => ({ ...p }));
      let newPosition = 0;

      // Usar refs para obtener valores actuales
      const mode = gameModeRef.current;
      const currentTeams = teamsRef.current;
      const currentTeamIdx = currentTeamIndexRef.current;
      const currentPlayerIdx = currentTeamPlayerIndexRef.current;
      const currentPlayerIdxIndividual = currentPlayerIndexRef.current;

      if (mode === 'teams') {
        // Obtener el jugador actual del equipo
        const currentTeam = currentTeams[currentTeamIdx];
        if (!currentTeam) return prevPlayers;
        
        const currentPlayer = currentTeam.players[currentPlayerIdx];
        if (!currentPlayer) return prevPlayers;

        const playerIndex = updatedPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex === -1) return prevPlayers;

        // Obtener la posición ACTUAL del jugador desde el estado previo
        const oldPosition = prevPlayers[playerIndex]?.position ?? updatedPlayers[playerIndex].position;
        // Calcular nueva posición: posición actual + pasos del dado
        // Si está en 0 y steps=2, newPosition = 0 + 2 = 2 (no 4)
        newPosition = Math.min(oldPosition + steps, BOARD_SIZE - 1);
        updatedPlayers[playerIndex].position = newPosition;

        // Actualizar posición del equipo
        setTeams(prevTeams => {
          const updatedTeams = [...prevTeams];
          const team = updatedTeams[currentTeamIdx];
          if (team && team.players.length > 0) {
            const totalPosition = team.players.reduce((sum, p) => {
              const player = updatedPlayers.find(pl => pl.id === p.id);
              return sum + (player?.position || 0);
            }, 0);
            team.position = Math.floor(totalPosition / team.players.length);
          }
          return updatedTeams;
        });
      } else {
        // Modo individual
        // Validar que el índice del jugador sea válido
        if (currentPlayerIdxIndividual < 0 || currentPlayerIdxIndividual >= updatedPlayers.length) {
          return prevPlayers;
        }
        
        const currentPlayer = updatedPlayers[currentPlayerIdxIndividual];
        if (!currentPlayer) return prevPlayers;

        // IMPORTANTE: Obtener la posición ACTUAL del jugador desde el estado previo (prevPlayers)
        // No usar updatedPlayers porque podría tener una posición ya modificada
        const oldPosition = prevPlayers[currentPlayerIdxIndividual]?.position ?? 0;
        
        // Calcular la nueva posición: posición actual + pasos del dado
        // Ejemplo: si está en 0 y saca 2, debe ir a 0 + 2 = 2 (exactamente 2 pasos)
        newPosition = Math.min(oldPosition + steps, BOARD_SIZE - 1);
        
        // Actualizar la posición del jugador
        updatedPlayers[currentPlayerIdxIndividual].position = newPosition;
      }

      // Verificar si ganó (si está en la última casilla, no mostrar desafío)
      if (newPosition >= BOARD_SIZE - 1) {
        // El jugador ganó, cambiar de turno para verificar la victoria
        setTimeout(() => {
          isMovingPlayerRef.current = false;
          nextTurn();
        }, 1000);
        return updatedPlayers;
      }

      // IMPORTANTE: Solo activar desafío si el jugador TERMINA en una casilla de desafío
      // Verificar DESPUÉS de actualizar la posición
      const challengeCells = challengeCellsRef.current;
      const isOnChallengeCell = challengeCells.includes(newPosition);

      if (isOnChallengeCell) {
        // El jugador terminó en una casilla de desafío - activar desafío
        setTimeout(() => {
          isMovingPlayerRef.current = false;
          // Obtener el reto predefinido asignado a esta casilla
          const predefinedChallenge = challengeMapRef.current.get(newPosition);
          if (predefinedChallenge) {
            // Generar el desafío específico con variabilidad interna
            const challenge = generateSpecificChallenge(predefinedChallenge, difficulty);
            setCurrentChallenge(challenge);
          } else {
            // Fallback: usar generación aleatoria si no hay reto asignado
            const challenge = generateChallenge(difficulty);
            setCurrentChallenge(challenge);
          }
        }, 800);
      } else {
        // El jugador NO terminó en una casilla de desafío - cambiar de turno
        setTimeout(() => {
          isMovingPlayerRef.current = false;
          nextTurn();
        }, 1000);
      }

      return updatedPlayers;
    });
  }, [difficulty, nextTurn]);

  const rollDice = useCallback(() => {
    if (diceRolled || !gameStarted || isMovingPlayerRef.current) return;
    
    // Primero establecer el dado como "rodando" sin valor
    setDiceValue(null);
    setDiceRolled(true);
    
    // Generar el valor pero no mostrarlo aún
    const value = Math.floor(Math.random() * 6) + 1;
    
    // Después de la animación del dado (2 segundos), establecer el valor
    setTimeout(() => {
      setDiceValue(value);
      // Mover al jugador después de un breve delay para mostrar el valor
      // Asegurar que solo se llame una vez usando un timeout único
      if (movePlayerTimeoutRef.current) {
        clearTimeout(movePlayerTimeoutRef.current);
      }
      movePlayerTimeoutRef.current = setTimeout(() => {
        movePlayer(value);
        movePlayerTimeoutRef.current = null;
      }, 500);
    }, 2000);
  }, [diceRolled, gameStarted, movePlayer]);

  const startGame = useCallback((
    playerCount: number,
    difficultyLevel: Difficulty,
    mode: GameMode,
    timeLimit: number | null,
    playerCharacters: string[] = []
  ) => {
    // Generar posiciones aleatorias para los desafíos
    const randomChallengeCells = generateRandomChallengeCells(5, BOARD_SIZE);
    setChallengeCells(randomChallengeCells);
    challengeCellsRef.current = randomChallengeCells;
    
    // Seleccionar 5 retos aleatorios de los 20 predefinidos
    const selectedChallenges = selectRandomChallenges(5);
    
    // Crear mapeo de casilla -> reto predefinido
    const challengeMap = new Map<number, PredefinedChallenge>();
    randomChallengeCells.forEach((cell, index) => {
      challengeMap.set(cell, selectedChallenges[index]);
    });
    challengeMapRef.current = challengeMap;

    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      const characterEmoji = playerCharacters[i] || FOREST_CHARACTERS[i % FOREST_CHARACTERS.length].emoji;
      const character = FOREST_CHARACTERS.find(c => c.emoji === characterEmoji) || FOREST_CHARACTERS[i % FOREST_CHARACTERS.length];
      
      newPlayers.push({
        id: i + 1,
        name: `${character.name}`,
        position: 0,
        color: character.color,
        icon: character.emoji,
        team: null,
      });
    }

    setPlayers(newPlayers);
    setDifficulty(difficultyLevel);
    setGameMode(mode);
    setSelectedTimeLimit(timeLimit);

    if (mode === 'teams') {
      const teamColors = [FOREST_COLORS[1], FOREST_COLORS[3]];
      const newTeams: Team[] = [];

      for (let i = 0; i < 2; i++) {
        const teamPlayers: Player[] = [];
        for (let j = i; j < playerCount; j += 2) {
          newPlayers[j].team = i;
          teamPlayers.push(newPlayers[j]);
        }

        // Nombrar el equipo según el animal principal (primer jugador del equipo)
        const mainAnimal = teamPlayers[0];
        const animalName = FOREST_CHARACTERS.find(c => c.emoji === mainAnimal?.icon)?.name || 'Animal';
        // Usar plural correcto
        let pluralName = animalName;
        if (!animalName.endsWith('s')) {
          // Casos especiales
          if (animalName === 'Ciervo') {
            pluralName = 'Ciervos';
          } else if (animalName === 'Búho') {
            pluralName = 'Búhos';
          } else {
            pluralName = `${animalName}s`;
          }
        }
        const teamName = `Equipo de ${pluralName}`;

        newTeams.push({
          id: i,
          name: teamName,
          color: teamColors[i],
          players: teamPlayers,
          position: 0,
        });
      }

      setTeams(newTeams);
      setCurrentTeamIndex(0);
      setCurrentTeamPlayerIndex(0);
    } else {
      setTeams([]);
      setCurrentPlayerIndex(0);
    }

    setGameStarted(true);
    setDiceRolled(false);
    
    // Guardar la configuración para poder reiniciar el juego
    gameConfigRef.current = {
      playerCount,
      difficulty: difficultyLevel,
      mode,
      timeLimit,
      playerCharacters,
    };
  }, []);
  
  // Función para reiniciar el juego con la misma configuración
  const resetGame = useCallback(() => {
    if (!gameConfigRef.current) return;
    
    const config = gameConfigRef.current;
    
    // Cerrar cualquier desafío activo
    setCurrentChallenge(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reiniciar el juego con la misma configuración
    startGame(
      config.playerCount,
      config.difficulty,
      config.mode,
      config.timeLimit,
      config.playerCharacters
    );
  }, [startGame]);
  
  // Función para volver al menú (resetear todo)
  const resetToMenu = useCallback(() => {
    // Cerrar cualquier desafío activo
    setCurrentChallenge(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Limpiar timeouts
    if (movePlayerTimeoutRef.current) {
      clearTimeout(movePlayerTimeoutRef.current);
      movePlayerTimeoutRef.current = null;
    }
    
    // Resetear todo el estado
    setPlayers([]);
    setTeams([]);
    setCurrentPlayerIndex(0);
    setCurrentTeamIndex(0);
    setCurrentTeamPlayerIndex(0);
    setGameStarted(false);
    setDiceRolled(false);
    setDiceValue(null);
    setCurrentChallenge(null);
    setChallengeCells([]);
    setTimeRemaining(60);
    setSelectedTimeLimit(null);
    
    // Resetear refs
    challengeCellsRef.current = [];
    challengeMapRef.current.clear();
    playersRef.current = [];
    teamsRef.current = [];
    currentPlayerIndexRef.current = 0;
    currentTeamIndexRef.current = 0;
    currentTeamPlayerIndexRef.current = 0;
    isMovingPlayerRef.current = false;
    timeExpiredHandledRef.current = false;
    gameConfigRef.current = null;
  }, []);

  const startChallengeTimer = useCallback(() => {
    if (selectedTimeLimit === null) return;

    // Limpiar cualquier timer anterior
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Iniciar el timer que cuenta hacia atrás
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [selectedTimeLimit]);
  
  // Ref para evitar que se ejecute múltiples veces cuando el tiempo llega a 0
  const timeExpiredHandledRef = useRef(false);
  
  // Guardar la configuración inicial del juego para poder reiniciarlo
  const gameConfigRef = useRef<{
    playerCount: number;
    difficulty: Difficulty;
    mode: GameMode;
    timeLimit: number | null;
    playerCharacters: string[];
  } | null>(null);

  useEffect(() => {
    if (currentChallenge && selectedTimeLimit !== null) {
      // Reiniciar el tiempo cada vez que se abre un nuevo desafío
      // Esto asegura que cada desafío comience con el tiempo completo seleccionado
      setTimeRemaining(selectedTimeLimit);
      // Resetear el flag de tiempo expirado cuando se abre un nuevo desafío
      timeExpiredHandledRef.current = false;
      startChallengeTimer();
    } else if (!currentChallenge) {
      // Si no hay desafío, detener el timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Resetear el tiempo cuando se cierra el desafío para el próximo
      if (selectedTimeLimit !== null) {
        setTimeRemaining(selectedTimeLimit);
      }
      // Resetear el flag cuando se cierra el desafío
      timeExpiredHandledRef.current = false;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentChallenge, selectedTimeLimit, startChallengeTimer]);

  const getCurrentPlayer = useCallback((): Player | null => {
    if (!gameStarted) return null;
    
    if (gameMode === 'teams') {
      const currentTeam = teams[currentTeamIndex];
      if (!currentTeam) return null;
      return currentTeam.players[currentTeamPlayerIndex] || null;
    } else {
      return players[currentPlayerIndex] || null;
    }
  }, [gameStarted, gameMode, teams, currentTeamIndex, currentTeamPlayerIndex, players, currentPlayerIndex]);

  const closeChallenge = useCallback(() => {
    setCurrentChallenge(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const completeChallenge = useCallback((success: boolean) => {
    // Detener el timer antes de cerrar el desafío
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Cerrar el desafío actual primero
    closeChallenge();
    
    if (success) {
      // Obtener el jugador actual antes de actualizar
      const currentPlayer = getCurrentPlayer();
      if (!currentPlayer) {
        setTimeout(() => {
          nextTurn();
        }, 300);
        return;
      }
      
      // Reproducir sonido del animal cuando completa el desafío correctamente
      try {
        playAnimalSound(currentPlayer.icon);
      } catch (error) {
        // Si falla la reproducción de audio, continuar sin sonido
        console.log('No se pudo reproducir el sonido:', error);
      }

      setPlayers(prevPlayers => {
        // Crear una copia profunda del array de jugadores
        const updatedPlayers = prevPlayers.map(p => ({ ...p }));
        const playerIndex = updatedPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex === -1) {
          setTimeout(() => {
            nextTurn();
          }, 300);
          return prevPlayers;
        }

        // IMPORTANTE: Obtener la posición ACTUAL del jugador desde el estado previo (prevPlayers)
        // No usar updatedPlayers porque podría tener una posición ya modificada
        const oldPosition = prevPlayers[playerIndex]?.position ?? 0;
        const newPosition = Math.min(
          oldPosition + 1,
          BOARD_SIZE - 1
        );
        
        // Actualizar la posición del jugador
        updatedPlayers[playerIndex].position = newPosition;

        // Verificar si ganó
        if (newPosition >= BOARD_SIZE - 1) {
          // El jugador ganó, no mostrar más desafíos
          setTimeout(() => {
            nextTurn();
          }, 500);
          return updatedPlayers;
        }

        // IMPORTANTE: Solo activar un nuevo desafío si el jugador TERMINA en una casilla de desafío
        // después de recibir el bonus de 1 espacio
        // Usar una copia del array para evitar problemas de referencia
        const challengeCells = [...challengeCellsRef.current];
        const isOnChallengeCell = challengeCells.includes(newPosition) && newPosition > 0 && newPosition < BOARD_SIZE - 1;

        if (isOnChallengeCell) {
          // La nueva posición después del bonus ES una casilla de desafío - activar nuevo desafío
          setTimeout(() => {
            // Verificar nuevamente antes de activar el desafío (doble verificación)
            if (challengeCellsRef.current.includes(newPosition)) {
              // Obtener el reto predefinido asignado a esta casilla
              const predefinedChallenge = challengeMapRef.current.get(newPosition);
              if (predefinedChallenge) {
                // Generar el desafío específico con variabilidad interna
                const challenge = generateSpecificChallenge(predefinedChallenge, difficulty);
                setCurrentChallenge(challenge);
              } else {
                // Fallback: usar generación aleatoria si no hay reto asignado
                const challenge = generateChallenge(difficulty);
                setCurrentChallenge(challenge);
              }
            } else {
              // Si por alguna razón ya no está en una casilla de desafío, cambiar de turno
              nextTurn();
            }
          }, 600);
        } else {
          // La nueva posición después del bonus NO es una casilla de desafío - cambiar de turno
          setTimeout(() => {
            nextTurn();
          }, 500);
        }
        
        return updatedPlayers;
      });
    } else {
      // Si el desafío falló, cambiar de turno inmediatamente
      setTimeout(() => {
        nextTurn();
      }, 300);
    }
  }, [getCurrentPlayer, closeChallenge, nextTurn, difficulty]);

  // Efecto para manejar cuando el tiempo llega a 0
  // Debe estar después de la definición de completeChallenge
  useEffect(() => {
    // Solo ejecutar si el tiempo llegó a 0, hay un desafío activo, hay tiempo límite configurado
    // y aún no se ha manejado este evento de tiempo expirado
    if (timeRemaining === 0 && currentChallenge && selectedTimeLimit !== null && !timeExpiredHandledRef.current) {
      // Marcar que ya se manejó este evento para evitar múltiples ejecuciones
      timeExpiredHandledRef.current = true;
      
      // Detener el timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Mostrar toast de tiempo agotado
      toast.error('⏰ Tiempo agotado', {
        description: 'No has completado el desafío a tiempo. No puedes avanzar.',
        duration: 4000,
      });
      
      // Cerrar el desafío y continuar con el siguiente turno (sin avanzar)
      // Usar un pequeño delay para que el usuario vea el toast
      setTimeout(() => {
        completeChallenge(false);
      }, 500);
    }
  }, [timeRemaining, currentChallenge, selectedTimeLimit, completeChallenge]);

  return {
    players,
    teams,
    currentPlayer: getCurrentPlayer(),
    currentPlayerIndex,
    currentTeamIndex,
    gameStarted,
    diceRolled,
    diceValue,
    difficulty,
    gameMode,
    timeLimitEnabled: selectedTimeLimit !== null,
    timeLimit: selectedTimeLimit,
    playerCharacters: players.map(p => p.icon),
    currentChallenge,
    timeRemaining,
    challengeCells,
    startGame,
    rollDice,
    nextTurn,
    closeChallenge,
    completeChallenge,
    resetGame,
    resetToMenu,
  };
}
