'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Challenge, ClassificationChallenge, SequenceChallenge, PuzzleChallenge } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChallengeModalProps {
  challenge: Challenge | null;
  timeRemaining: number;
  timeLimitEnabled: boolean;
  onComplete: (success: boolean) => void;
  onSkip: () => void;
}

export function ChallengeModal({
  challenge,
  timeRemaining,
  timeLimitEnabled,
  onComplete,
  onSkip,
}: ChallengeModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [puzzleState, setPuzzleState] = useState<string[]>([]);
  const [classificationState, setClassificationState] = useState<Record<string, string[]>>({});
  const [availableItems, setAvailableItems] = useState<string[]>([]);

  useEffect(() => {
    if (challenge?.type === 'puzzle') {
      setPuzzleState([...(challenge as PuzzleChallenge).current || []]);
    }
    if (challenge?.type === 'classification') {
      setClassificationState({});
      const categories = (challenge as ClassificationChallenge).selectedCategories || [];
      const allItems = categories.flatMap(cat => cat.items);
      const shuffledItems = [...allItems].sort(() => 0.5 - Math.random());
      setAvailableItems(shuffledItems);
    }
    setSelectedAnswer(null);
  }, [challenge]);

  if (!challenge) return null;

  const handleSubmit = () => {
    let isCorrect = false;

    if (challenge.type === 'classification') {
      const classificationChallenge = challenge as ClassificationChallenge;
      const solution = classificationChallenge.solution;
      isCorrect = Object.keys(solution).every(category => {
        const solutionItems = solution[category];
        const stateItems = classificationState[category] || [];
        return solutionItems.length === stateItems.length &&
          solutionItems.every(item => stateItems.includes(item));
      });
    } else if (challenge.type === 'sequence') {
      isCorrect = selectedAnswer === (challenge as SequenceChallenge).solution;
    } else if (challenge.type === 'puzzle') {
      const puzzleChallenge = challenge as PuzzleChallenge;
      isCorrect = JSON.stringify(puzzleState) === JSON.stringify(puzzleChallenge.solution);
    }

    onComplete(isCorrect);
  };

  const renderChallenge = () => {
    if (challenge.type === 'classification') {
      return renderClassificationChallenge(challenge as ClassificationChallenge);
    } else if (challenge.type === 'sequence') {
      return renderSequenceChallenge(challenge as SequenceChallenge);
    } else if (challenge.type === 'puzzle') {
      return renderPuzzleChallenge(challenge as PuzzleChallenge);
    }
    return null;
  };

  const renderClassificationChallenge = (challenge: ClassificationChallenge) => {
    const categories = challenge.selectedCategories || [];

    const handleItemDrop = (categoryName: string, item: string) => {
      // Agregar el item a la categoría
      setClassificationState(prev => ({
        ...prev,
        [categoryName]: [...(prev[categoryName] || []), item],
      }));
      
      // Eliminar el item de la lista de disponibles
      setAvailableItems(prev => prev.filter(i => i !== item));
    };

    const handleRemoveFromCategory = (categoryName: string, item: string, index: number) => {
      // Remover el item de la categoría
      setClassificationState(prev => {
        const categoryItems = prev[categoryName] || [];
        const newItems = categoryItems.filter((_, idx) => idx !== index);
        return {
          ...prev,
          [categoryName]: newItems,
        };
      });
      
      // Agregar el item de vuelta a la lista de disponibles
      setAvailableItems(prev => [...prev, item]);
    };

    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <p className="text-center text-sm sm:text-base md:text-lg font-semibold text-green-800 px-2">
          Arrastra cada objeto a su categoría correcta
        </p>
        <div className="space-y-2 sm:space-y-3">
          <p className="text-center text-xs sm:text-sm text-green-700 font-semibold">
            📦 Objetos para clasificar:
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center p-3 sm:p-4 md:p-5 bg-green-100 rounded-lg border-2 border-green-300 min-h-[80px] sm:min-h-[100px] items-center">
            {availableItems.length > 0 ? (
              availableItems.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  draggable
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-white border-2 border-green-400 flex items-center justify-center text-2xl sm:text-3xl cursor-grab hover:scale-110 hover:border-green-600 hover:shadow-lg transition-all active:cursor-grabbing"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('item', item);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-green-600 text-xs sm:text-sm italic">✅ Todos los objetos han sido clasificados</p>
            )}
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <p className="text-center text-xs sm:text-sm text-green-700 font-semibold">
            📁 Categorías:
          </p>
          <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap">
            {categories.map((category) => (
              <div
                key={category.name}
                className="min-w-[120px] min-h-[120px] sm:min-w-[140px] sm:min-h-[140px] md:min-w-[150px] md:min-h-[150px] border-2 border-dashed border-green-400 rounded-lg p-2 sm:p-3 md:p-4 bg-green-50"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  e.currentTarget.classList.add('border-green-600', 'bg-green-100', 'shadow-lg');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-green-600', 'bg-green-100', 'shadow-lg');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const item = e.dataTransfer.getData('item');
                  handleItemDrop(category.name, item);
                  e.currentTarget.classList.remove('border-green-600', 'bg-green-100', 'shadow-lg');
                }}
              >
                <div className="font-bold text-center mb-1 sm:mb-2 text-green-800 text-xs sm:text-sm md:text-base">
                  {category.label}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(classificationState[category.name] || []).map((item, idx) => (
                    <div
                      key={`${category.name}-${idx}`}
                      onClick={() => handleRemoveFromCategory(category.name, item, idx)}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border-2 border-green-300 flex items-center justify-center text-lg sm:text-xl md:text-2xl shadow-sm cursor-pointer hover:scale-110 hover:border-red-400 hover:bg-red-50 transition-all"
                      title="Clic para devolver a la lista"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSequenceChallenge = (challenge: SequenceChallenge) => {
    const pattern = challenge.pattern || [];
    const options = challenge.options || [];

    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <p className="text-center text-sm sm:text-base md:text-lg font-semibold px-2">Completa la secuencia</p>
        <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg border-2 border-green-300">
          {pattern.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 rounded-lg flex items-center justify-center text-2xl sm:text-3xl md:text-4xl bg-white shadow-sm',
                item === '?' 
                  ? 'border-green-600 border-dashed animate-pulse' 
                  : 'border-green-500'
              )}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap p-3 sm:p-4 md:p-5 bg-green-100 rounded-lg border-2 border-green-300">
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedAnswer(option)}
              className={cn(
                'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 border-green-600 rounded-lg flex items-center justify-center text-2xl sm:text-3xl md:text-4xl cursor-pointer bg-white transition-all hover:scale-110 hover:shadow-lg',
                selectedAnswer === option && 'border-green-700 bg-green-100 ring-2 ring-green-400'
              )}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPuzzleChallenge = (challenge: PuzzleChallenge) => {
    const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
      
      if (dragIndex !== dropIndex) {
        const newState = [...puzzleState];
        const draggedItem = newState[dragIndex];
        newState[dragIndex] = newState[dropIndex];
        newState[dropIndex] = draggedItem;
        setPuzzleState(newState);
      }
    };

    // Detectar si todos los elementos son letras
    const allLetters = puzzleState.every(item => item.length === 1 && /[A-Z]/.test(item));
    const isVowels = allLetters && puzzleState.every(item => /[AEIOU]/.test(item));
    
    let instructionText = challenge.content || 'Arrastra los elementos para ordenarlos correctamente';
    if (allLetters && !isVowels) {
      instructionText = 'Arrastra las letras para ordenarlas en orden alfabético (A, B, C...)';
    } else if (isVowels) {
      instructionText = 'Arrastra las vocales para ordenarlas (A, E, I, O, U)';
    }

    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <p className="text-center text-sm sm:text-base md:text-lg font-semibold text-green-800 px-2">
          {instructionText}
        </p>
        <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
          <div className="text-center text-xs sm:text-sm text-green-700 font-semibold mb-1 sm:mb-2">
            📋 Área de ordenamiento:
          </div>
          <div className="w-full flex gap-1.5 sm:gap-2 justify-center flex-wrap p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg border-2 border-green-400 min-h-[80px] sm:min-h-[100px] items-center max-w-full overflow-hidden">
            {puzzleState.map((item, idx) => {
              // Detectar si es una letra del abecedario (solo un carácter y es una letra)
              const isLetter = item.length === 1 && /[A-Z]/.test(item);
              
              // Determinar el tamaño del texto basado en el tipo de elemento y el tamaño de pantalla
              let textSize: string;
              let boxSize: string;
              let textStyle: React.CSSProperties = {};
              
              if (isLetter) {
                // Letras grandes y coloridas para el abecedario - responsivas
                textSize = 'text-3xl sm:text-4xl md:text-5xl';
                boxSize = 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24';
                textStyle = {
                  fontWeight: 'bold',
                  color: '#1e40af', // Azul oscuro
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                };
              } else if (item.length > 3) {
                textSize = 'text-lg sm:text-xl md:text-2xl';
                boxSize = 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16';
              } else if (item.length > 2) {
                textSize = 'text-xl sm:text-2xl md:text-3xl';
                boxSize = 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20';
              } else {
                textSize = 'text-2xl sm:text-3xl md:text-4xl';
                boxSize = 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20';
              }
              
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`${boxSize} border-2 sm:border-[3px] border-green-600 rounded-md sm:rounded-lg flex items-center justify-center ${textSize} cursor-move bg-white shadow-md hover:scale-110 hover:shadow-lg hover:border-green-700 transition-all active:scale-95 flex-shrink-0`}
                  style={{ 
                    wordBreak: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    ...textStyle
                  }}
                >
                  <span className="truncate" style={textStyle}>{item}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-green-600 text-center italic mt-1 sm:mt-2 px-2">
            💡 Tip: Arrastra un elemento sobre otro para intercambiarlos
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={!!challenge}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl text-green-800">{challenge.title}</DialogTitle>
        </DialogHeader>
        
        {timeLimitEnabled && (
          <div className="text-center py-2 sm:py-4">
            <div className={cn(
              'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 sm:border-6 md:border-8 mx-auto flex items-center justify-center mb-2 transition-colors',
              timeRemaining <= 10 ? 'border-red-500 animate-pulse bg-red-50' :
              timeRemaining <= 20 ? 'border-orange-500 bg-orange-50' :
              'border-green-500 bg-green-50'
            )}>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800">{timeRemaining}</span>
            </div>
            <p className="text-sm sm:text-base text-green-700 font-semibold">Tiempo restante</p>
          </div>
        )}

        <div className="py-2 sm:py-4">{renderChallenge()}</div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2 sm:pt-4">
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base py-2 sm:py-3"
          >
            Enviar Respuesta
          </Button>
          <Button 
            onClick={onSkip} 
            variant="outline" 
            className="flex-1 border-green-400 text-green-700 hover:bg-green-50 text-sm sm:text-base py-2 sm:py-3"
          >
            Omitir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
