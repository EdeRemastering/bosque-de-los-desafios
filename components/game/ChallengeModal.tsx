'use client';
//
import { useEffect, useState, useRef } from 'react';
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
  const [draggedOption, setDraggedOption] = useState<string | null>(null);
  const [dropZoneHovered, setDropZoneHovered] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{item: string; source: 'available' | string} | null>(null);
  const [hoveredDropZone, setHoveredDropZone] = useState<string | null>(null);
  const [puzzleDraggedIndex, setPuzzleDraggedIndex] = useState<number | null>(null);
  const [puzzleHoveredIndex, setPuzzleHoveredIndex] = useState<number | null>(null);
  
  // Estados para soporte táctil móvil
  const [touchState, setTouchState] = useState<{
    active: boolean;
    item: string | null;
    source: 'available' | string | null;
    startX: number;
    startY: number;
  } | null>(null);
  const [touchSequenceState, setTouchSequenceState] = useState<{
    active: boolean;
    option: string | null;
    source: 'options' | 'answer' | null;
  } | null>(null);
  const [touchPuzzleState, setTouchPuzzleState] = useState<{
    active: boolean;
    index: number | null;
    startX: number;
    startY: number;
  } | null>(null);
  
  // Refs para funciones de drop (para acceso desde listeners globales)
  const dropHandlersRef = useRef<{
    handleItemDrop?: (categoryName: string, item: string) => void;
    handleReturnToAvailable?: (item: string, sourceCategory: string) => void;
  }>({});

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
    setDraggedOption(null);
    setDropZoneHovered(false);
    setDraggedItem(null);
    setHoveredDropZone(null);
    setPuzzleDraggedIndex(null);
    setPuzzleHoveredIndex(null);
    setTouchState(null);
    setTouchSequenceState(null);
    setTouchPuzzleState(null);
  }, [challenge]);

  // Listener global para eventos táctiles cuando hay un toque activo
  useEffect(() => {
    if (!touchState?.active && !touchSequenceState?.active && !touchPuzzleState?.active) return;

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (touchState?.active) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element) {
          const dropZone = element.closest('[data-drop-zone]') as HTMLElement;
          if (dropZone) {
            const zoneId = dropZone.getAttribute('data-drop-zone');
            if (zoneId) {
              setHoveredDropZone(zoneId);
            }
          } else {
            setHoveredDropZone(null);
          }
        }
      } else if (touchSequenceState?.active) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element) {
          const dropZone = element.closest('[data-sequence-drop-zone]') as HTMLElement;
          const optionsZone = element.closest('[data-options-zone]') as HTMLElement;
          if (dropZone) {
            setDropZoneHovered(true);
          } else if (optionsZone) {
            setDropZoneHovered(false);
          } else {
            setDropZoneHovered(false);
          }
        } else {
          setDropZoneHovered(false);
        }
      } else if (touchPuzzleState?.active) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element) {
          const puzzleItem = element.closest('[data-puzzle-item]') as HTMLElement;
          if (puzzleItem) {
            const index = puzzleItem.getAttribute('data-puzzle-index');
            if (index !== null && touchPuzzleState.index !== null && parseInt(index) !== touchPuzzleState.index) {
              setPuzzleHoveredIndex(parseInt(index));
            } else {
              setPuzzleHoveredIndex(null);
            }
          } else {
            setPuzzleHoveredIndex(null);
          }
        } else {
          setPuzzleHoveredIndex(null);
        }
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (touchState?.active) {
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && touchState.item && touchState.source) {
          const dropZone = element.closest('[data-drop-zone]') as HTMLElement;
          if (dropZone) {
            const zoneId = dropZone.getAttribute('data-drop-zone');
            if (zoneId && touchState.item && touchState.source) {
              const { handleItemDrop, handleReturnToAvailable } = dropHandlersRef.current;
              
              if (handleItemDrop && handleReturnToAvailable) {
                // Si se arrastra desde disponible a una categoría
                if (touchState.source === 'available' && zoneId !== 'available') {
                  handleItemDrop(zoneId, touchState.item);
                }
                // Si se arrastra desde una categoría de vuelta a disponible
                else if (touchState.source !== 'available' && zoneId === 'available') {
                  handleReturnToAvailable(touchState.item, touchState.source);
                }
                // Si se arrastra de una categoría a otra categoría
                else if (touchState.source !== 'available' && zoneId !== 'available' && touchState.source !== zoneId) {
                  handleReturnToAvailable(touchState.item, touchState.source);
                  handleItemDrop(zoneId, touchState.item);
                }
              }
            }
          }
        }
        
        setTouchState(null);
        setDraggedItem(null);
        setHoveredDropZone(null);
      } else if (touchSequenceState?.active) {
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && touchSequenceState.option) {
          const dropZone = element.closest('[data-sequence-drop-zone]') as HTMLElement;
          const optionsZone = element.closest('[data-options-zone]') as HTMLElement;
          
          if (dropZone && touchSequenceState.source === 'options') {
            setSelectedAnswer(touchSequenceState.option);
          } else if (optionsZone && touchSequenceState.source === 'answer') {
            setSelectedAnswer(null);
          }
        }
        
        setTouchSequenceState(null);
        setDraggedOption(null);
        setDropZoneHovered(false);
      } else if (touchPuzzleState?.active) {
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && touchPuzzleState.index !== null) {
          const puzzleItem = element.closest('[data-puzzle-item]') as HTMLElement;
          if (puzzleItem) {
            const dropIndex = puzzleItem.getAttribute('data-puzzle-index');
            if (dropIndex !== null) {
              const dragIndex = touchPuzzleState.index;
              const dropIdx = parseInt(dropIndex);
              
              if (dragIndex !== dropIdx) {
                const newState = [...puzzleState];
                const draggedItem = newState[dragIndex];
                newState[dragIndex] = newState[dropIdx];
                newState[dropIdx] = draggedItem;
                setPuzzleState(newState);
              }
            }
          }
        }
        
        setTouchPuzzleState(null);
        setPuzzleDraggedIndex(null);
        setPuzzleHoveredIndex(null);
      }
    };

    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleGlobalTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [touchState, touchSequenceState, touchPuzzleState, puzzleState]);

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

    const handleReturnToAvailable = (item: string, sourceCategory: string) => {
      // Remover el item de la categoría
      setClassificationState(prev => {
        const categoryItems = prev[sourceCategory] || [];
        const newItems = categoryItems.filter(i => i !== item);
        const newState = { ...prev };
        if (newItems.length > 0) {
          newState[sourceCategory] = newItems;
        } else {
          delete newState[sourceCategory];
        }
        return newState;
      });
      
      // Agregar el item de vuelta a la lista de disponibles
      setAvailableItems(prev => [...prev, item]);
    };
    
    // Guardar referencias a las funciones de drop para uso en listeners globales
    dropHandlersRef.current = { handleItemDrop, handleReturnToAvailable };

    const handleDragStart = (e: React.DragEvent, item: string, source: 'available' | string) => {
      e.dataTransfer.setData('item', item);
      e.dataTransfer.setData('source', source);
      e.dataTransfer.effectAllowed = 'move';
      setDraggedItem({ item, source });
      // Mejorar el feedback visual durante el arrastre
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
      }
    };

    const handleDragEnd = (e: React.DragEvent) => {
      setDraggedItem(null);
      setHoveredDropZone(null);
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '1';
      }
    };

    const handleDragOver = (e: React.DragEvent, zoneId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setHoveredDropZone(zoneId);
    };

    const handleDragLeave = () => {
      setHoveredDropZone(null);
    };

    const handleDrop = (e: React.DragEvent, targetZone: 'available' | string) => {
      e.preventDefault();
      const item = e.dataTransfer.getData('item');
      const source = e.dataTransfer.getData('source');
      performDrop(item, source, targetZone);
    };

    const performDrop = (item: string, source: string, targetZone: 'available' | string) => {
      // Si se arrastra desde disponible a una categoría
      if (source === 'available' && targetZone !== 'available') {
        handleItemDrop(targetZone, item);
      }
      // Si se arrastra desde una categoría de vuelta a disponible
      else if (source !== 'available' && targetZone === 'available') {
        handleReturnToAvailable(item, source);
      }
      // Si se arrastra de una categoría a otra categoría
      else if (source !== 'available' && targetZone !== 'available' && source !== targetZone) {
        handleReturnToAvailable(item, source);
        handleItemDrop(targetZone, item);
      }
      
      setDraggedItem(null);
      setHoveredDropZone(null);
    };

    // Manejador de inicio de toque para móvil
    const handleTouchStart = (e: React.TouchEvent, item: string, source: 'available' | string) => {
      const touch = e.touches[0];
      setTouchState({
        active: true,
        item,
        source,
        startX: touch.clientX,
        startY: touch.clientY,
      });
      setDraggedItem({ item, source });
      e.preventDefault();
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
          <div 
            data-drop-zone="available"
            className={cn(
              "flex flex-wrap gap-2 sm:gap-3 justify-center p-3 sm:p-4 md:p-5 rounded-lg border-2 min-h-[80px] sm:min-h-[100px] items-center transition-all",
              hoveredDropZone === 'available' 
                ? "bg-green-200 border-green-600 border-solid shadow-lg scale-105" 
                : "bg-green-100 border-green-300"
            )}
            onDragOver={(e) => handleDragOver(e, 'available')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'available')}
          >
            {availableItems.length > 0 ? (
              availableItems.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  draggable
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-white border-2 border-green-400 flex items-center justify-center text-2xl sm:text-3xl cursor-grab hover:scale-110 hover:border-green-600 hover:shadow-lg transition-all active:cursor-grabbing select-none"
                  onDragStart={(e) => handleDragStart(e, item, 'available')}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, item, 'available')}
                  style={{ touchAction: 'none' }}
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-green-600 text-xs sm:text-sm italic">
                {hoveredDropZone === 'available' ? '💡 Suelta aquí para devolver' : '✅ Todos los objetos han sido clasificados'}
              </p>
            )}
          </div>
          {availableItems.length > 0 && (
            <p className="text-xs text-green-600 text-center italic px-2">
              💡 Arrastra los objetos a las categorías de abajo
            </p>
          )}
        </div>
        <div className="space-y-2 sm:space-y-3">
          <p className="text-center text-xs sm:text-sm text-green-700 font-semibold">
            📁 Categorías:
          </p>
          <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap">
            {categories.map((category) => (
              <div
                key={category.name}
                data-drop-zone={category.name}
                className={cn(
                  "min-w-[120px] min-h-[120px] sm:min-w-[140px] sm:min-h-[140px] md:min-w-[150px] md:min-h-[150px] border-2 rounded-lg p-2 sm:p-3 md:p-4 transition-all",
                  hoveredDropZone === category.name
                    ? "border-green-600 border-solid bg-green-200 shadow-lg scale-105"
                    : "border-dashed border-green-400 bg-green-50"
                )}
                onDragOver={(e) => handleDragOver(e, category.name)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category.name)}
              >
                <div className="font-bold text-center mb-1 sm:mb-2 text-green-800 text-xs sm:text-sm md:text-base">
                  {category.label}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[60px]">
                  {(classificationState[category.name] || []).map((item, idx) => (
                    <div
                      key={`${category.name}-${idx}`}
                      draggable
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border-2 border-green-400 flex items-center justify-center text-lg sm:text-xl md:text-2xl shadow-sm cursor-grab hover:scale-110 hover:border-green-600 hover:shadow-lg transition-all active:cursor-grabbing select-none"
                      onDragStart={(e) => handleDragStart(e, item, category.name)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, item, category.name)}
                      style={{ touchAction: 'none' }}
                      title="Arrastra para mover a otra categoría o devolver"
                    >
                      {item}
                    </div>
                  ))}
                  {hoveredDropZone === category.name && (classificationState[category.name] || []).length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-green-600 text-xs italic">
                      💡 Suelta aquí
                    </div>
                  )}
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

    // Encontrar el índice de la casilla con "?"
    const questionMarkIndex = pattern.findIndex(item => item === '?');
    const displayedPattern = [...pattern];

    // Manejar el inicio del arrastre desde las opciones
    const handleDragStartFromOptions = (e: React.DragEvent, option: string) => {
      // Establecer el estado primero
      setDraggedOption(option);
      // Luego establecer los datos del dataTransfer
      try {
        e.dataTransfer.setData('text/plain', option);
        e.dataTransfer.setData('source', 'options');
        e.dataTransfer.effectAllowed = 'move';
      } catch (error) {
        // Algunos navegadores pueden tener problemas con setData
        console.warn('Error setting drag data:', error);
      }
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
      }
    };

    // Manejar el inicio del arrastre desde la respuesta seleccionada
    const handleDragStartFromAnswer = (e: React.DragEvent, answer: string) => {
      // Establecer el estado primero
      setDraggedOption(answer);
      // Luego establecer los datos del dataTransfer
      try {
        e.dataTransfer.setData('text/plain', answer);
        e.dataTransfer.setData('source', 'answer');
        e.dataTransfer.effectAllowed = 'move';
      } catch (error) {
        // Algunos navegadores pueden tener problemas con setData
        console.warn('Error setting drag data:', error);
      }
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
      }
    };

    // Manejar cuando se arrastra sobre la zona de drop
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      setDropZoneHovered(true);
    };

    // Manejar cuando se sale de la zona de drop
    const handleDragLeave = (e: React.DragEvent) => {
      // Verificar que realmente salimos del elemento (no solo movimos sobre un hijo)
      const currentTarget = e.currentTarget as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!currentTarget.contains(relatedTarget)) {
        setDropZoneHovered(false);
      }
    };

    // Manejar cuando se suelta en la zona de drop
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        // Intentar obtener los datos del dataTransfer
        let option = e.dataTransfer.getData('text/plain');
        let source = e.dataTransfer.getData('source');
        
        // Si no hay datos en dataTransfer (algunos navegadores), usar el estado
        if (!option && draggedOption) {
          option = draggedOption;
          source = 'options'; // Asumir que viene de opciones si no hay source
        }
        
        // Verificar que tenemos datos válidos
        if (option && (source === 'options' || source === 'answer' || !source)) {
          setSelectedAnswer(option);
        }
      } catch (error) {
        // Si hay error, intentar usar el estado directamente
        if (draggedOption) {
          setSelectedAnswer(draggedOption);
        }
      }
      
      setDraggedOption(null);
      setDropZoneHovered(false);
    };

    // Manejar cuando se suelta en la zona de opciones (para devolver la respuesta)
    const handleDropOnOptions = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const source = e.dataTransfer.getData('source');
        
        if (source === 'answer') {
          setSelectedAnswer(null);
        }
      } catch (error) {
        console.error('Error en handleDropOnOptions:', error);
      }
      
      setDraggedOption(null);
      setDropZoneHovered(false);
    };

    // Manejar el fin del arrastre
    const handleDragEnd = (e: React.DragEvent) => {
      setDraggedOption(null);
      setDropZoneHovered(false);
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '1';
      }
    };

    // Manejadores táctiles para móvil
    const handleTouchStartSequence = (e: React.TouchEvent, option: string, source: 'options' | 'answer') => {
      setTouchSequenceState({
        active: true,
        option,
        source,
      });
      setDraggedOption(option);
      e.preventDefault();
    };

    // Reemplazar "?" con la respuesta seleccionada si existe
    if (selectedAnswer && questionMarkIndex !== -1) {
      displayedPattern[questionMarkIndex] = selectedAnswer;
    }

    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <p className="text-center text-sm sm:text-base md:text-lg font-semibold text-green-800 px-2">
          Arrastra el número correcto para completar la secuencia
        </p>
        <div className="space-y-2">
          <p className="text-center text-xs sm:text-sm text-green-700 font-semibold">
            🔢 Secuencia:
          </p>
          <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg border-2 border-green-300">
            {displayedPattern.map((item, idx) => {
              const isDropZone = idx === questionMarkIndex;
              const isSelectedCell = selectedAnswer && idx === questionMarkIndex;
              return (
                <div
                  key={idx}
                  draggable={!!isSelectedCell}
                  onDragStart={isSelectedCell ? (e) => handleDragStartFromAnswer(e, selectedAnswer) : undefined}
                  onDragEnd={isSelectedCell ? handleDragEnd : undefined}
                  data-sequence-drop-zone={isDropZone ? 'true' : undefined}
                  onDragOver={isDropZone ? handleDragOver : (e) => e.preventDefault()}
                  onDragLeave={isDropZone ? handleDragLeave : undefined}
                  onDrop={isDropZone ? handleDrop : (e) => e.preventDefault()}
                  onTouchStart={isSelectedCell ? (e) => handleTouchStartSequence(e, selectedAnswer, 'answer') : undefined}
                  style={(isSelectedCell || isDropZone) ? { touchAction: 'none' } : undefined}
                  className={cn(
                    'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 rounded-lg flex items-center justify-center text-2xl sm:text-3xl md:text-4xl bg-white shadow-sm transition-all select-none',
                    isDropZone && !selectedAnswer
                      ? cn(
                          'border-green-600 border-dashed',
                          dropZoneHovered 
                            ? 'bg-green-200 scale-110 border-green-700 border-solid shadow-lg' 
                            : 'animate-pulse bg-green-100'
                        )
                      : isSelectedCell
                      ? 'border-green-600 bg-green-100 cursor-grab hover:scale-110 hover:shadow-lg active:cursor-grabbing'
                      : 'border-green-500'
                  )}
                  title={isSelectedCell ? 'Arrastra para cambiar la respuesta' : isDropZone ? 'Arrastra un número aquí' : undefined}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-center text-xs sm:text-sm text-green-700 font-semibold">
            {selectedAnswer ? '✅ Respuesta seleccionada - Arrastra para cambiarla' : '📦 Arrastra una opción a la secuencia 👆'}
          </p>
          <div 
            data-options-zone="true"
            className={cn(
              "flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap p-3 sm:p-4 md:p-5 rounded-lg border-2 transition-all",
              dropZoneHovered && draggedOption && !options.includes(draggedOption)
                ? "bg-green-200 border-green-600 border-solid shadow-lg"
                : "bg-green-100 border-green-300"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (selectedAnswer) {
                e.dataTransfer.dropEffect = 'move';
              }
            }}
            onDragLeave={(e) => {
              // No hacer nada especial aquí
            }}
            onDrop={handleDropOnOptions}
          >
            {options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isDragging = draggedOption === option;
              return (
                <div
                  key={idx}
                  draggable={!isSelected}
                  onDragStart={(e) => !isSelected && handleDragStartFromOptions(e, option)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => !isSelected && handleTouchStartSequence(e, option, 'options')}
                  style={!isSelected ? { touchAction: 'none' } : undefined}
                  className={cn(
                    'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 border-green-600 rounded-lg flex items-center justify-center text-2xl sm:text-3xl md:text-4xl bg-white transition-all flex-shrink-0 select-none',
                    isSelected
                      ? 'border-green-700 bg-green-200 ring-2 ring-green-400 cursor-not-allowed'
                      : cn(
                          'cursor-grab active:cursor-grabbing hover:scale-110 hover:shadow-lg hover:border-green-700',
                          isDragging && 'opacity-50 scale-90'
                        )
                  )}
                  title={isSelected ? 'Ya seleccionado' : 'Arrastra este número'}
                >
                  {option}
                </div>
              );
            })}
          </div>
          {!selectedAnswer && (
            <p className="text-xs text-green-600 text-center italic px-2">
              💡 Arrastra un número desde abajo hasta la casilla con "?" en la secuencia
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderPuzzleChallenge = (challenge: PuzzleChallenge) => {
    const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = 'move';
      setPuzzleDraggedIndex(index);
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
      }
    };

    const handleDragEnd = (e: React.DragEvent) => {
      setPuzzleDraggedIndex(null);
      setPuzzleHoveredIndex(null);
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '1';
      }
    };

    const handleDragOver = (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setPuzzleHoveredIndex(index);
    };

    const handleDragLeave = () => {
      setPuzzleHoveredIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
      
      if (dragIndex !== dropIndex && !isNaN(dragIndex)) {
        const newState = [...puzzleState];
        const draggedItem = newState[dragIndex];
        newState[dragIndex] = newState[dropIndex];
        newState[dropIndex] = draggedItem;
        setPuzzleState(newState);
      }
      
      setPuzzleDraggedIndex(null);
      setPuzzleHoveredIndex(null);
    };

    // Manejador táctil para móvil
    const handleTouchStartPuzzle = (e: React.TouchEvent, index: number) => {
      const touch = e.touches[0];
      setTouchPuzzleState({
        active: true,
        index,
        startX: touch.clientX,
        startY: touch.clientY,
      });
      setPuzzleDraggedIndex(index);
      e.preventDefault();
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
              
              const isDragging = puzzleDraggedIndex === idx;
              const isHovered = puzzleHoveredIndex === idx && puzzleDraggedIndex !== null && puzzleDraggedIndex !== idx;
              
              return (
                <div
                  key={idx}
                  data-puzzle-item="true"
                  data-puzzle-index={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver(idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onTouchStart={(e) => handleTouchStartPuzzle(e, idx)}
                  style={{ 
                    touchAction: 'none',
                    wordBreak: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    ...textStyle
                  }}
                  className={cn(
                    `${boxSize} border-2 sm:border-[3px] rounded-md sm:rounded-lg flex items-center justify-center ${textSize} cursor-grab bg-white shadow-md transition-all active:cursor-grabbing active:scale-95 flex-shrink-0 select-none`,
                    isDragging 
                      ? 'opacity-50 scale-90 border-green-400'
                      : isHovered
                      ? 'scale-110 shadow-xl border-green-700 bg-green-100 ring-2 ring-green-400'
                      : 'hover:scale-110 hover:shadow-lg hover:border-green-700 border-green-600'
                  )}
                  title="Arrastra para reordenar"
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
