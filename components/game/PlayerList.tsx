'use client';

import { Player, Team } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlayerListProps {
  players: Player[];
  teams: Team[];
  gameMode: 'individual' | 'teams';
  currentPlayerIndex: number;
  currentTeamIndex: number;
}

export function PlayerList({
  players,
  teams,
  gameMode,
  currentPlayerIndex,
  currentTeamIndex,
}: PlayerListProps) {
  if (gameMode === 'teams') {
    return (
      <div className="w-full max-w-sm bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl shadow-lg border-2 border-green-300">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center text-green-800">🌳 Equipos</h2>
        <div className="space-y-2 sm:space-y-3">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className={cn(
                'bg-white p-3 sm:p-4 rounded-lg border-2 transition-all shadow-md',
                index === currentTeamIndex
                  ? 'border-green-600 shadow-lg scale-105 ring-2 ring-green-400'
                  : 'border-green-200'
              )}
            >
              <div className="font-bold text-base sm:text-lg mb-2" style={{ color: team.color }}>
                {team.name}
              </div>
              <div className="text-xs sm:text-sm text-gray-700 mb-1 flex flex-wrap gap-1">
                {team.players.map(p => (
                  <span key={p.id} className="flex items-center gap-1">
                    <span className="text-base sm:text-lg">{p.icon}</span>
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>
              <div className="text-xs sm:text-sm text-green-700 font-semibold">Posición: {team.position}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl shadow-lg border-2 border-green-300">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center text-green-800">🐾 Jugadores</h2>
      <div className="space-y-2 sm:space-y-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              'bg-white p-3 sm:p-4 rounded-lg border-2 transition-all flex items-center gap-2 sm:gap-3 shadow-md',
              index === currentPlayerIndex
                ? 'border-green-600 shadow-lg scale-105 ring-2 ring-green-400'
                : 'border-green-200'
            )}
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
              style={{ backgroundColor: player.color }}
            >
              {player.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-800 text-sm sm:text-base md:text-lg truncate">{player.name}</div>
              <div className="text-xs sm:text-sm text-green-700 font-semibold">Posición: {player.position}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
