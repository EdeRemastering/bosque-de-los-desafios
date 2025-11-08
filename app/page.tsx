'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { GameBoard } from '@/components/game/GameBoard';
import { StartModal } from '@/components/game/StartModal';
import { ChallengeModal } from '@/components/game/ChallengeModal';
import { PlayerList } from '@/components/game/PlayerList';
import { WinModal } from '@/components/game/WinModal';
import { Button } from '@/components/ui/button';
import { BOARD_SIZE } from '@/lib/game-config';
import { Player, Team } from '@/lib/types';
import { toast } from 'sonner';
import { Dice3D } from '@/components/game/Dice3D';

export default function Home() {
  const game = useGame();
  const [showWinModal, setShowWinModal] = useState(false);
  const [winner, setWinner] = useState<Player | Team | null>(null);
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  useEffect(() => {
    // Verificar si alguien ganó
    if (game.gameStarted) {
      if (game.gameMode === 'teams') {
        const winningTeam = game.teams.find(team =>
          team.players.some(p => {
            const player = game.players.find(pl => pl.id === p.id);
            return (player?.position || 0) >= BOARD_SIZE - 1;
          })
        );
        if (winningTeam) {
          setWinner(winningTeam);
          setShowWinModal(true);
        }
      } else {
        const winningPlayer = game.players.find(p => p.position >= BOARD_SIZE - 1);
        if (winningPlayer) {
          setWinner(winningPlayer);
          setShowWinModal(true);
        }
      }
    }
  }, [game.players, game.teams, game.gameStarted, game.gameMode]);

  const handleStart = (playerCount: number, difficulty: any, mode: any, timeLimit: boolean, playerCharacters: string[]) => {
    game.startGame(playerCount, difficulty, mode, timeLimit, playerCharacters);
  };

  const handleRollDice = () => {
    if (game.diceRolled || !game.gameStarted) return;
    setIsDiceRolling(true);
    game.rollDice();
    // El dado completará su animación y llamará a handleDiceRollComplete
    setTimeout(() => {
      setIsDiceRolling(false);
    }, 2500); // 2 segundos de animación + 0.5 segundos de margen
  };

  const handleDiceRollComplete = () => {
    setIsDiceRolling(false);
  };

  const handleCompleteChallenge = (success: boolean) => {
    if (success) {
      toast.success('¡Correcto! 🎉', {
        description: 'Puedes avanzar un espacio adicional.',
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: '2px solid #047857',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });
      setTimeout(() => {
        game.completeChallenge(true);
      }, 500);
    } else {
      toast.error('Inténtalo de nuevo 💪', {
        description: '¡Tú puedes hacerlo! Sigue intentando.',
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          border: '2px solid #b91c1c',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });
    }
  };

  const handleSkipChallenge = () => {
    game.closeChallenge();
    game.nextTurn();
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-700 to-teal-800 p-5 relative overflow-hidden" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='60' y='80' font-size='80' text-anchor='middle' opacity='0.1'%3E🌳%3C/text%3E%3Ctext x='30' y='40' font-size='40' text-anchor='middle' opacity='0.08'%3E🍃%3C/text%3E%3Ctext x='90' y='100' font-size='30' text-anchor='middle' opacity='0.08'%3E🌿%3C/text%3E%3C/svg%3E")`,
      backgroundSize: '150px 150px'
    }}>
      {/* Elementos decorativos del bosque */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-wiggle">🌲</div>
      <div className="absolute top-20 right-20 text-5xl opacity-15">🌳</div>
      <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-wiggle">🍃</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-15">🌿</div>
      
      <div className="max-w-7xl mx-auto bg-white/98 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-green-500 relative z-10">
        <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='40' y='55' font-size='50' text-anchor='middle'%3E🌲%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg flex items-center justify-center gap-3 flex-wrap">
              <span className="text-5xl">🌲</span>
              <span>Aventura en el Bosque de los Desafíos</span>
              <span className="text-5xl">🌲</span>
            </h1>
            <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
              <div className="flex items-center gap-3 bg-white/25 rounded-lg px-4 py-2 backdrop-blur-md border-2 border-white/30 shadow-lg">
                <span className="text-3xl">{game.currentPlayer?.icon || '🐰'}</span>
                <span className="text-xl font-bold">
                  {game.currentPlayer
                    ? game.gameMode === 'teams'
                      ? `${game.teams[game.currentTeamIndex]?.name} - ${game.currentPlayer.name}`
                      : game.currentPlayer.name
                    : 'Conejo'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div 
                  onClick={handleRollDice}
                  className={`cursor-pointer ${(!game.gameStarted || game.diceRolled) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
                >
                  <Dice3D 
                    value={game.diceValue} 
                    isRolling={isDiceRolling}
                    onRollComplete={handleDiceRollComplete}
                  />
                </div>
                    <Button
                      onClick={handleRollDice}
                      disabled={!game.gameStarted || game.diceRolled}
                      className="text-sm px-4 py-2 bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg border-2 border-green-300 hover:scale-105 transition-transform"
                    >
                      {game.diceRolled ? (game.diceValue ? `Valor: ${game.diceValue}` : 'Lanzando...') : 'Lanzar Dado'}
                    </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <GameBoard players={game.players} challengeCells={game.challengeCells} />
            </div>
            <div className="lg:w-80">
              <PlayerList
                players={game.players}
                teams={game.teams}
                gameMode={game.gameMode}
                currentPlayerIndex={game.currentPlayerIndex}
                currentTeamIndex={game.currentTeamIndex}
              />
            </div>
          </div>
        </div>
      </div>

      <StartModal
        open={!game.gameStarted}
        onStart={handleStart}
      />

      {game.currentChallenge && (
        <ChallengeModal
          challenge={game.currentChallenge}
          timeRemaining={game.timeRemaining}
          timeLimitEnabled={game.timeLimitEnabled}
          onComplete={handleCompleteChallenge}
          onSkip={handleSkipChallenge}
        />
      )}

      <WinModal
        open={showWinModal}
        winner={winner}
        gameMode={game.gameMode}
        onRestart={handleRestart}
      />
    </main>
  );
}
