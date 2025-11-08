'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CharacterConfirmModalProps {
  open: boolean;
  characterEmoji: string;
  characterName: string;
  playerNumber: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CharacterConfirmModal({
  open,
  characterEmoji,
  characterName,
  playerNumber,
  onConfirm,
  onCancel,
}: CharacterConfirmModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-green-800">
            ¿Confirmar selección?
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="text-6xl">{characterEmoji}</div>
          <div className="text-lg font-semibold text-green-800">
            {characterName}
          </div>
          <p className="text-base text-green-700 text-center">
            Este será el personaje para <strong>Jugador {playerNumber}</strong>
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-green-400 text-green-700 hover:bg-green-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
          >
            ✓ Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

