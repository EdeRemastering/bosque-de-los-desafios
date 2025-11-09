'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Player, Team } from '@/lib/types';

interface WinModalProps {
  open: boolean;
  winner: Player | Team | null;
  gameMode: 'individual' | 'teams';
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function WinModal({ open, winner, gameMode, onRestart, onBackToMenu }: WinModalProps) {
  const getWinnerMessage = () => {
    if (!winner) return '';

    if (gameMode === 'teams' && 'players' in winner) {
      const team = winner as Team;
      const members = team.players.map(p => `${p.icon} ${p.name}`).join(', ');
      return `¡${team.name} ha ganado el juego! 🎊\n\nMiembros del equipo: ${members}`;
    } else if ('name' in winner) {
      const player = winner as Player;
      return `¡${player.name} ${player.icon} ha ganado el juego! 🎊`;
    }

    return '';
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center text-green-800">
            🎉 ¡Felicitaciones! 🎉
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center text-lg whitespace-pre-line text-green-800 font-semibold">
            {getWinnerMessage()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onRestart} 
            className="flex-1 text-base sm:text-lg py-4 sm:py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
          >
            🔄 Jugar de Nuevo
          </Button>
          <Button 
            onClick={onBackToMenu} 
            className="flex-1 text-base sm:text-lg py-4 sm:py-6 bg-gray-600 hover:bg-gray-700 text-white font-bold"
          >
            🏠 Volver al Menú
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
