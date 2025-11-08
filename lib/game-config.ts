export const BOARD_SIZE = 30;
export const CHALLENGE_CELLS = [5, 10, 15, 20, 25]; // Deprecated: usar generateRandomChallengeCells

/**
 * Genera posiciones aleatorias para los desafíos
 * @param count Número de desafíos a generar (por defecto 5)
 * @param boardSize Tamaño del tablero (por defecto BOARD_SIZE)
 * @returns Array de posiciones de desafíos ordenadas
 */
export function generateRandomChallengeCells(count: number = 5, boardSize: number = BOARD_SIZE): number[] {
  // No colocar desafíos en la primera casilla (inicio) ni en la última (meta)
  const availableCells: number[] = [];
  for (let i = 1; i < boardSize - 1; i++) {
    availableCells.push(i);
  }

  // Mezclar las casillas disponibles
  const shuffled = [...availableCells].sort(() => Math.random() - 0.5);
  
  // Seleccionar las primeras 'count' casillas y ordenarlas
  const selectedCells = shuffled.slice(0, count).sort((a, b) => a - b);
  
  return selectedCells;
}

// Personajes del bosque con colores verdosos
export const FOREST_CHARACTERS = [
  { emoji: '🐰', name: 'Conejo', color: '#8B9A5B' }, // Verde oliva
  { emoji: '🐻', name: 'Oso', color: '#6B8E23' }, // Verde oliva oscuro
  { emoji: '🦊', name: 'Zorro', color: '#9ACD32' }, // Amarillo verdoso
  { emoji: '🐸', name: 'Rana', color: '#32CD32' }, // Verde lima
  { emoji: '🐿️', name: 'Ardilla', color: '#7CB342' }, // Verde claro
  { emoji: '🦉', name: 'Búho', color: '#556B2F' }, // Verde oscuro
  { emoji: '🐺', name: 'Lobo', color: '#6B8E23' }, // Verde oliva
  { emoji: '🦌', name: 'Ciervo', color: '#8FBC8F' }, // Verde mar claro
  { emoji: '🐝', name: 'Abeja', color: '#ADFF2F' }, // Verde amarillento
  { emoji: '🦋', name: 'Mariposa', color: '#98FB98' }, // Verde pálido
  { emoji: '🐞', name: 'Mariquita', color: '#90EE90' }, // Verde claro
  { emoji: '🦎', name: 'Lagarto', color: '#7CFC00' }, // Verde césped
] as const;

// Colores del bosque
export const FOREST_COLORS = [
  '#2E7D32', // Verde bosque oscuro
  '#388E3C', // Verde bosque
  '#43A047', // Verde bosque claro
  '#66BB6A', // Verde claro
  '#81C784', // Verde muy claro
  '#A5D6A7', // Verde pastel
] as const;

export const TIME_LIMITS = {
  easy: 90,
  medium: 60,
  hard: 45,
} as const;
