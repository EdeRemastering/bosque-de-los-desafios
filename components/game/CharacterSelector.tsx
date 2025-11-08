'use client';

import { useState } from 'react';
import { FOREST_CHARACTERS } from '@/lib/game-config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CharacterConfirmModal } from './CharacterConfirmModal';

interface CharacterSelection {
  emoji: string;
  playerNumber: number;
}

interface CharacterSelectorProps {
  playerSelections: CharacterSelection[];
  currentPlayerNumber: number;
  onSelect: (emoji: string, playerNumber: number) => void;
  disabled?: boolean;
  playerCount: number;
}

export function CharacterSelector({ 
  playerSelections,
  currentPlayerNumber,
  onSelect,
  disabled = false,
  playerCount
}: CharacterSelectorProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<{ emoji: string; name: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getSelectionForCharacter = (emoji: string) => {
    return playerSelections.find(s => s.emoji === emoji);
  };

  const isSelectedByCurrentPlayer = (emoji: string) => {
    const selection = getSelectionForCharacter(emoji);
    return selection?.playerNumber === currentPlayerNumber;
  };

  const handleChooseClick = (character: { emoji: string; name: string }) => {
    const selection = getSelectionForCharacter(character.emoji);
    // Si ya está seleccionado por otro jugador, no permitir seleccionarlo
    if (selection && selection.playerNumber !== currentPlayerNumber) {
      return;
    }
    setSelectedCharacter(character);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      onSelect(selectedCharacter.emoji, currentPlayerNumber);
      setShowConfirmModal(false);
      setSelectedCharacter(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setSelectedCharacter(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="text-center">
          <label className="text-base font-bold text-green-800">
            Selecciona tu personaje del bosque:
          </label>
          <p className="text-sm text-green-700 mt-1">
            Jugador {currentPlayerNumber} de {playerCount}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3 p-4 bg-white/90 rounded-lg border-2 border-green-400 shadow-lg">
          {FOREST_CHARACTERS.slice(0, 12).map((character) => {
            const selection = getSelectionForCharacter(character.emoji);
            const isSelected = !!selection;
            const isCurrentPlayer = isSelectedByCurrentPlayer(character.emoji);
            const isSelectedByOther = isSelected && !isCurrentPlayer;
            
            return (
              <div
                key={character.emoji}
                className={cn(
                  'relative flex flex-col items-center gap-2',
                  isSelectedByOther && 'opacity-60'
                )}
              >
                <div
                  className={cn(
                    'w-16 h-16 rounded-lg border-2 transition-all text-3xl flex items-center justify-center',
                    isCurrentPlayer
                      ? 'border-green-600 bg-green-200 shadow-lg ring-2 ring-green-400 border-[3px]'
                      : isSelectedByOther
                      ? 'border-green-400 bg-green-100'
                      : 'border-green-300 bg-white'
                  )}
                  title={character.name}
                >
                  <span>{character.emoji}</span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-md">
                      {selection.playerNumber}
                    </span>
                  )}
                </div>
                {!isSelectedByOther && (
                  <Button
                    type="button"
                    onClick={() => handleChooseClick(character)}
                    disabled={disabled}
                    size="sm"
                    className={cn(
                      'text-xs px-2 py-1 h-auto',
                      isCurrentPlayer
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    )}
                  >
                    Elegir
                  </Button>
                )}
                {isSelectedByOther && (
                  <span className="text-xs text-green-600 font-semibold">
                    Ocupado
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="bg-green-100 rounded-lg p-3 border-2 border-green-300">
          <p className="text-sm font-semibold text-green-800 mb-2 text-center">
            Personajes seleccionados:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {playerSelections.map((selection) => {
              const character = FOREST_CHARACTERS.find(c => c.emoji === selection.emoji);
              return (
                <div
                  key={selection.playerNumber}
                  className="flex items-center gap-1 bg-white px-2 py-1 rounded border-2 border-green-400"
                >
                  <span className="text-lg">{selection.emoji}</span>
                  <span className="text-xs font-semibold text-green-800">
                    Jugador {selection.playerNumber}
                  </span>
                </div>
              );
            })}
          </div>
          {playerSelections.length === 0 && (
            <p className="text-xs text-green-600 text-center italic">
              Ningún personaje seleccionado aún
            </p>
          )}
        </div>
      </div>

      {selectedCharacter && (
        <CharacterConfirmModal
          open={showConfirmModal}
          characterEmoji={selectedCharacter.emoji}
          characterName={selectedCharacter.name}
          playerNumber={currentPlayerNumber}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
