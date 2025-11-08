import { Difficulty, Challenge, ClassificationChallenge, SequenceChallenge, PuzzleChallenge } from './types';

// Tipo para definir un reto predefinido
export interface PredefinedChallenge {
  id: string;
  name: string;
  type: 'classification' | 'sequence' | 'puzzle';
  generate: (difficulty: Difficulty) => Challenge;
}

// Función auxiliar para generar números aleatorios dentro de un rango
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función auxiliar para decidir si invertir una secuencia
function shouldReverse(): boolean {
  return Math.random() > 0.5;
}

// Función auxiliar para obtener emoji de número
function getNumberEmoji(num: number): string {
  // Limitar a números del 1 al 10 para mantenerlo simple para niños
  const clampedNum = Math.max(1, Math.min(10, num));
  const emojis: Record<number, string> = {
    1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
    6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣', 10: '🔟'
  };
  return emojis[clampedNum] || `${clampedNum}`;
}

// RETO 1: Secuencia numérica ascendente
const challenge1: PredefinedChallenge = {
  id: 'seq-num-asc',
  name: 'Secuencia Numérica Ascendente',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    let start: number, length: number;
    if (difficulty === 'easy') {
      // 4-5 años: secuencias muy simples (1,2,?) o (2,3,?)
      start = randomInt(1, 3);
      length = 2; // Solo 2 números para que sea muy fácil
    } else if (difficulty === 'medium') {
      // 5-6 años: secuencias un poco más largas (1,2,3,?)
      start = randomInt(1, 4);
      length = 3;
    } else {
      // 6+ años: secuencias más largas (1,2,3,4,?)
      start = randomInt(1, 5);
      length = 4;
    }
    
    const pattern = Array.from({ length }, (_, i) => getNumberEmoji(start + i));
    const next = start + length;
    const answer = getNumberEmoji(next);
    const options = [answer, getNumberEmoji(next + 1), getNumberEmoji(next - 1)].sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia Numérica',
      content: '¿Qué número sigue?',
      solution: answer,
      pattern: [...pattern, '?'],
      options: options,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 2: Secuencia numérica descendente
const challenge2: PredefinedChallenge = {
  id: 'seq-num-desc',
  name: 'Secuencia Numérica Descendente',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    let start: number, length: number;
    if (difficulty === 'easy') {
      // 4-5 años: secuencias descendentes muy simples (4,3,?) o (5,4,?)
      start = randomInt(4, 5);
      length = 2;
    } else if (difficulty === 'medium') {
      // 5-6 años: secuencias un poco más largas (6,5,4,?)
      start = randomInt(5, 6);
      length = 3;
    } else {
      // 6+ años: secuencias más largas (8,7,6,5,?)
      start = randomInt(7, 9);
      length = 4;
    }
    
    const pattern = Array.from({ length }, (_, i) => getNumberEmoji(start - i));
    const next = start - length;
    const answer = getNumberEmoji(next);
    const options = [answer, getNumberEmoji(next - 1), getNumberEmoji(next + 1)].sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia Numérica',
      content: '¿Qué número sigue?',
      solution: answer,
      pattern: [...pattern, '?'],
      options: options,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 3: Secuencia de números pares
const challenge3: PredefinedChallenge = {
  id: 'seq-num-even',
  name: 'Secuencia de Números Pares',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    // Para 4-5 años, este reto es demasiado complejo, usar secuencia simple ascendente
    if (difficulty === 'easy') {
      return challenge1.generate(difficulty);
    }
    
    let start: number, length: number;
    if (difficulty === 'medium') {
      // 5-6 años: secuencia de pares simple (2,4,?)
      start = 2;
      length = 2;
    } else {
      // 6+ años: secuencia de pares más larga (2,4,6,?)
      start = randomInt(2, 4);
      length = 3;
    }
    
    // Asegurar que el siguiente número no exceda 10
    const next = start + length * 2;
    if (next > 10) {
      length = Math.floor((10 - start) / 2);
    }
    
    const pattern = Array.from({ length }, (_, i) => getNumberEmoji(start + i * 2));
    const finalNext = start + length * 2;
    const answer = getNumberEmoji(finalNext);
    const options = [answer, getNumberEmoji(finalNext + 1), getNumberEmoji(finalNext - 2)].sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia de Pares',
      content: '¿Qué número sigue?',
      solution: answer,
      pattern: [...pattern, '?'],
      options: options,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 4: Secuencia de vocales
const challenge4: PredefinedChallenge = {
  id: 'seq-vowels',
  name: 'Secuencia de Vocales',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    let length: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 2 vocales (A,E,?)
      length = 2;
    } else if (difficulty === 'medium') {
      // 5-6 años: 3 vocales (A,E,I,?)
      length = 3;
    } else {
      // 6+ años: 4 vocales (A,E,I,O,?)
      length = 4;
    }
    
    const startIdx = 0; // Siempre empezar desde A para que sea más fácil
    const pattern = vowels.slice(startIdx, startIdx + length);
    const next = vowels[startIdx + length];
    const wrongOptions = vowels.filter(v => v !== next);
    const options = [next, ...wrongOptions.slice(0, 2)].sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia de Vocales',
      content: '¿Qué vocal sigue?',
      solution: next,
      pattern: [...pattern, '?'],
      options: options,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 5: Secuencia alfabética
const challenge5: PredefinedChallenge = {
  id: 'seq-alphabet',
  name: 'Secuencia Alfabética',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    let length: number, startCharCode: number;
    if (difficulty === 'easy') {
      // 4-5 años: secuencia muy simple (A,B,?)
      length = 2;
      startCharCode = 65; // Siempre empezar desde A
    } else if (difficulty === 'medium') {
      // 5-6 años: secuencia un poco más larga (A,B,C,?)
      length = 3;
      startCharCode = randomInt(65, 70); // A-F
    } else {
      // 6+ años: secuencia más larga (A,B,C,D,?)
      length = 4;
      startCharCode = randomInt(65, 75); // A-K
    }
    
    const pattern = Array.from({ length }, (_, i) => String.fromCharCode(startCharCode + i));
    const next = String.fromCharCode(startCharCode + length);
    const wrongOptions = [
      String.fromCharCode(startCharCode + length + 1),
      String.fromCharCode(Math.max(65, startCharCode + length - 1))
    ];
    const options = [next, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia Alfabética',
      content: '¿Qué letra sigue?',
      solution: next,
      pattern: [...pattern, '?'],
      options: options,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 6: Ordenamiento de números (ascendente)
const challenge6: PredefinedChallenge = {
  id: 'puzzle-num-asc',
  name: 'Ordenar Números Ascendente',
  type: 'puzzle',
  generate: (difficulty: Difficulty) => {
    let count: number, start: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 2-3 números fáciles (1,2,3)
      count = 3;
      start = 1; // Siempre empezar desde 1 para que sea muy fácil
    } else if (difficulty === 'medium') {
      // 5-6 años: 3-4 números (1,2,3,4)
      count = 4;
      start = randomInt(1, 3);
    } else {
      // 6+ años: 4-5 números (puede empezar desde diferentes números)
      count = 5;
      start = randomInt(1, 5);
    }
    
    const items = Array.from({ length: count }, (_, i) => getNumberEmoji(start + i));
    const solution = [...items];
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    
    return {
      type: 'puzzle',
      title: '🎯 Ordenar Números',
      content: 'Arrastra los números para ordenarlos de menor a mayor',
      solution: solution,
      gridSize: count,
      current: shuffled,
    };
  }
};

// RETO 7: Ordenamiento de números (descendente)
const challenge7: PredefinedChallenge = {
  id: 'puzzle-num-desc',
  name: 'Ordenar Números Descendente',
  type: 'puzzle',
  generate: (difficulty: Difficulty) => {
    let count: number, start: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 3 números fáciles (5,4,3)
      count = 3;
      start = 5; // Siempre empezar desde 5 para que sea muy fácil
    } else if (difficulty === 'medium') {
      // 5-6 años: 4 números (6,5,4,3)
      count = 4;
      start = randomInt(5, 6);
    } else {
      // 6+ años: 5 números (8,7,6,5,4)
      count = 5;
      start = randomInt(7, 9);
    }
    
    const items = Array.from({ length: count }, (_, i) => getNumberEmoji(start - i));
    const solution = [...items];
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    
    return {
      type: 'puzzle',
      title: '🎯 Ordenar Números',
      content: 'Arrastra los números para ordenarlos de mayor a menor',
      solution: solution,
      gridSize: count,
      current: shuffled,
    };
  }
};

// RETO 8: Ordenamiento de vocales
const challenge8: PredefinedChallenge = {
  id: 'puzzle-vowels',
  name: 'Ordenar Vocales',
  type: 'puzzle',
  generate: (difficulty: Difficulty) => {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    let count: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 3 vocales (A,E,I)
      count = 3;
    } else if (difficulty === 'medium') {
      // 5-6 años: 4 vocales (A,E,I,O)
      count = 4;
    } else {
      // 6+ años: todas las 5 vocales (A,E,I,O,U)
      count = 5;
    }
    
    const items = vowels.slice(0, count);
    const solution = [...items];
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    
    return {
      type: 'puzzle',
      title: '🎯 Ordenar Vocales',
      content: 'Arrastra las vocales para ordenarlas (A, E, I, O, U)',
      solution: solution,
      gridSize: count,
      current: shuffled,
    };
  }
};

// RETO 9: Ordenamiento alfabético
const challenge9: PredefinedChallenge = {
  id: 'puzzle-alphabet',
  name: 'Ordenar Letras Alfabéticamente',
  type: 'puzzle',
  generate: (difficulty: Difficulty) => {
    let count: number, startCharCode: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 3 letras desde A (A,B,C)
      count = 3;
      startCharCode = 65; // Siempre empezar desde A
    } else if (difficulty === 'medium') {
      // 5-6 años: 4 letras (A,B,C,D o E,F,G,H)
      count = 4;
      startCharCode = randomInt(65, 70); // A-F
    } else {
      // 6+ años: 5 letras (puede empezar desde diferentes letras)
      count = 5;
      startCharCode = randomInt(65, 80); // A-P
    }
    
    const items = Array.from({ length: count }, (_, i) => String.fromCharCode(startCharCode + i));
    const solution = [...items];
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    
    return {
      type: 'puzzle',
      title: '🎯 Ordenar Letras',
      content: 'Arrastra las letras para ordenarlas alfabéticamente',
      solution: solution,
      gridSize: count,
      current: shuffled,
    };
  }
};

// RETO 10: Ordenamiento de frutas
const challenge10: PredefinedChallenge = {
  id: 'puzzle-fruits',
  name: 'Ordenar Frutas',
  type: 'puzzle',
  generate: (difficulty: Difficulty) => {
    const fruits = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍑', '🥝', '🍉'];
    let count: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 3 frutas
      count = 3;
    } else if (difficulty === 'medium') {
      // 5-6 años: 4 frutas
      count = 4;
    } else {
      // 6+ años: 5 frutas
      count = 5;
    }
    
    const selectedFruits = fruits.slice(0, count);
    const solution = [...selectedFruits];
    const shuffled = [...selectedFruits].sort(() => Math.random() - 0.5);
    
    return {
      type: 'puzzle',
      title: '🎯 Ordenar Frutas',
      content: 'Arrastra las frutas para ordenarlas',
      solution: solution,
      gridSize: count,
      current: shuffled,
    };
  }
};

// RETO 11: Ordenamiento de animales
const challenge11: PredefinedChallenge = {
  id: 'puzzle-animals',
  name: 'Ordenar Animales',
  type: 'puzzle',
  generate: (difficulty: Difficulty) => {
    const animals = ['🐶', '🐱', '🐷', '🐮', '🐰', '🐻', '🐼', '🐨'];
    let count: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 3 animales
      count = 3;
    } else if (difficulty === 'medium') {
      // 5-6 años: 4 animales
      count = 4;
    } else {
      // 6+ años: 5 animales
      count = 5;
    }
    
    const selectedAnimals = animals.slice(0, count);
    const solution = [...selectedAnimals];
    const shuffled = [...selectedAnimals].sort(() => Math.random() - 0.5);
    
    return {
      type: 'puzzle',
      title: '🎯 Ordenar Animales',
      content: 'Arrastra los animales para ordenarlos',
      solution: solution,
      gridSize: count,
      current: shuffled,
    };
  }
};

// RETO 12: Clasificación de frutas y animales
const challenge12: PredefinedChallenge = {
  id: 'class-fruits-animals',
  name: 'Clasificar Frutas y Animales',
  type: 'classification',
  generate: (difficulty: Difficulty) => {
    const fruits = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍑'];
    const animals = ['🐶', '🐱', '🐷', '🐮', '🐰', '🐻'];
    
    let itemsPerCategory: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 2 elementos por categoría (muy fácil)
      itemsPerCategory = 2;
    } else if (difficulty === 'medium') {
      // 5-6 años: 3 elementos por categoría
      itemsPerCategory = 3;
    } else {
      // 6+ años: 4 elementos por categoría
      itemsPerCategory = 4;
    }
    
    const selectedFruits = fruits.slice(0, itemsPerCategory);
    const selectedAnimals = animals.slice(0, itemsPerCategory);
    
    return {
      type: 'classification',
      title: '🎯 Clasificación',
      content: 'Agrupa los elementos por categoría',
      solution: {
        'Frutas': selectedFruits,
        'Animales': selectedAnimals,
      },
      selectedCategories: [
        { name: 'Frutas', items: selectedFruits, label: 'Frutas' },
        { name: 'Animales', items: selectedAnimals, label: 'Animales' },
      ],
    } as ClassificationChallenge & { selectedCategories: Array<{ name: string; items: string[]; label: string }> };
  }
};

// RETO 13: Clasificación de transporte y formas
const challenge13: PredefinedChallenge = {
  id: 'class-transport-shapes',
  name: 'Clasificar Transporte y Formas',
  type: 'classification',
  generate: (difficulty: Difficulty) => {
    const transport = ['🚗', '🚲', '✈️', '🚢', '🚂', '🚁'];
    const shapes = ['🔴', '🟦', '🟩', '🟨', '🟧', '🟪'];
    
    let itemsPerCategory: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 2 elementos por categoría
      itemsPerCategory = 2;
    } else if (difficulty === 'medium') {
      // 5-6 años: 3 elementos por categoría
      itemsPerCategory = 3;
    } else {
      // 6+ años: 4 elementos por categoría
      itemsPerCategory = 4;
    }
    
    const selectedTransport = transport.slice(0, itemsPerCategory);
    const selectedShapes = shapes.slice(0, itemsPerCategory);
    
    return {
      type: 'classification',
      title: '🎯 Clasificación',
      content: 'Agrupa los elementos por categoría',
      solution: {
        'Transporte': selectedTransport,
        'Formas': selectedShapes,
      },
      selectedCategories: [
        { name: 'Transporte', items: selectedTransport, label: 'Transporte' },
        { name: 'Formas', items: selectedShapes, label: 'Formas' },
      ],
    } as ClassificationChallenge & { selectedCategories: Array<{ name: string; items: string[]; label: string }> };
  }
};

// RETO 14: Clasificación de animales y transporte
const challenge14: PredefinedChallenge = {
  id: 'class-animals-transport',
  name: 'Clasificar Animales y Transporte',
  type: 'classification',
  generate: (difficulty: Difficulty) => {
    const animals = ['🐶', '🐱', '🐷', '🐮', '🐰', '🐻'];
    const transport = ['🚗', '🚲', '✈️', '🚢', '🚂', '🚁'];
    
    let itemsPerCategory: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 2 elementos por categoría
      itemsPerCategory = 2;
    } else if (difficulty === 'medium') {
      // 5-6 años: 3 elementos por categoría
      itemsPerCategory = 3;
    } else {
      // 6+ años: 4 elementos por categoría
      itemsPerCategory = 4;
    }
    
    const selectedAnimals = animals.slice(0, itemsPerCategory);
    const selectedTransport = transport.slice(0, itemsPerCategory);
    
    return {
      type: 'classification',
      title: '🎯 Clasificación',
      content: 'Agrupa los elementos por categoría',
      solution: {
        'Animales': selectedAnimals,
        'Transporte': selectedTransport,
      },
      selectedCategories: [
        { name: 'Animales', items: selectedAnimals, label: 'Animales' },
        { name: 'Transporte', items: selectedTransport, label: 'Transporte' },
      ],
    } as ClassificationChallenge & { selectedCategories: Array<{ name: string; items: string[]; label: string }> };
  }
};

// RETO 15: Secuencia alternada (patrón ABAB)
const challenge15: PredefinedChallenge = {
  id: 'seq-alternating',
  name: 'Secuencia Alternada',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    // Para 4-5 años, este patrón es demasiado complejo, usar secuencia simple
    if (difficulty === 'easy') {
      return challenge1.generate(difficulty);
    }
    
    const options = [
      { items: ['🔴', '🔵'], name: 'Rojo y Azul' },
      { items: ['🟡', '🟢'], name: 'Amarillo y Verde' },
      { items: ['🍎', '🍌'], name: 'Manzana y Plátano' },
      { items: ['🐶', '🐱'], name: 'Perro y Gato' },
      { items: ['1️⃣', '2️⃣'], name: 'Uno y Dos' },
    ];
    
    const selected = options[randomInt(0, options.length - 1)];
    let length: number;
    if (difficulty === 'medium') {
      // 5-6 años: secuencia alternada de 3 elementos (A,B,A,?)
      length = 3;
    } else {
      // 6+ años: secuencia alternada más larga (A,B,A,B,?)
      length = 4;
    }
    
    const pattern = Array.from({ length }, (_, i) => selected.items[i % 2]);
    const next = selected.items[length % 2];
    const wrongOptions = selected.items.filter(item => item !== next);
    const allOptions = [next, ...wrongOptions, '🟠'].slice(0, 3).sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia Alternada',
      content: '¿Qué sigue en la secuencia?',
      solution: next,
      pattern: [...pattern, '?'],
      options: allOptions,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 16: Secuencia de crecimiento (tamaño)
const challenge16: PredefinedChallenge = {
  id: 'seq-growth',
  name: 'Secuencia de Crecimiento',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    const growthPatterns = [
      ['🌱', '🌿', '🌳'],
      ['🐣', '🐥', '🐔'],
      ['⭐', '⭐⭐', '⭐⭐⭐'],
    ];
    
    let pattern: string[];
    if (difficulty === 'easy') {
      // 4-5 años: solo 2 elementos (🌱,🌿,?)
      pattern = growthPatterns[randomInt(0, growthPatterns.length - 1)].slice(0, 2);
    } else if (difficulty === 'medium') {
      // 5-6 años: 3 elementos (🌱,🌿,🌳,?)
      pattern = growthPatterns[randomInt(0, growthPatterns.length - 1)].slice(0, 3);
    } else {
      // 6+ años: 3 elementos completos
      const selected = growthPatterns[randomInt(0, growthPatterns.length - 1)];
      pattern = selected.slice(0, 3);
    }
    
    // Para crecimiento, el siguiente sería el último elemento repetido más uno
    const lastItem = pattern[pattern.length - 1];
    let answer: string;
    if (lastItem === '🌱') answer = '🌿';
    else if (lastItem === '🌿') answer = '🌳';
    else if (lastItem === '🐣') answer = '🐥';
    else if (lastItem === '🐥') answer = '🐔';
    else if (lastItem === '⭐') answer = '⭐⭐';
    else if (lastItem === '⭐⭐') answer = '⭐⭐⭐';
    else answer = '⭐';
    
    const allOptions = [answer, pattern[0], pattern[1] || pattern[0]].sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia de Crecimiento',
      content: '¿Qué sigue en la secuencia?',
      solution: answer,
      pattern: [...pattern, '?'],
      options: allOptions,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 17: Ordenamiento de plantas (crecimiento)
const challenge17: PredefinedChallenge = {
  id: 'puzzle-plants',
  name: 'Ordenar Plantas por Crecimiento',
  type: 'puzzle',
  generate: (difficulty: Difficulty) => {
    const plants = ['🌱', '🌿', '🌳', '🌲', '🍃'];
    let count: number;
    if (difficulty === 'easy') {
      // 4-5 años: solo 3 plantas
      count = 3;
    } else if (difficulty === 'medium') {
      // 5-6 años: 4 plantas
      count = 4;
    } else {
      // 6+ años: 5 plantas
      count = 5;
    }
    
    const items = plants.slice(0, count);
    const solution = [...items];
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    
    return {
      type: 'puzzle',
      title: '🎯 Ordenar Plantas',
      content: 'Arrastra las plantas para ordenarlas desde la más pequeña hasta la más grande',
      solution: solution,
      gridSize: count,
      current: shuffled,
    };
  }
};

// RETO 18: Secuencia de números impares
const challenge18: PredefinedChallenge = {
  id: 'seq-num-odd',
  name: 'Secuencia de Números Impares',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    // Para 4-5 años, este patrón es demasiado complejo, usar secuencia simple
    if (difficulty === 'easy') {
      return challenge1.generate(difficulty);
    }
    
    let start: number, length: number;
    if (difficulty === 'medium') {
      // 5-6 años: secuencia de impares simple (1,3,?)
      start = 1;
      length = 2;
    } else {
      // 6+ años: secuencia de impares más larga (1,3,5,?)
      start = randomInt(1, 3);
      length = 3;
    }
    
    // Asegurar que el siguiente número no exceda 10
    const next = start + length * 2;
    if (next > 10) {
      length = Math.floor((10 - start) / 2);
    }
    
    const pattern = Array.from({ length }, (_, i) => getNumberEmoji(start + i * 2));
    const finalNext = start + length * 2;
    const answer = getNumberEmoji(finalNext);
    const options = [answer, getNumberEmoji(finalNext + 1), getNumberEmoji(finalNext - 2)].sort(() => Math.random() - 0.5);
    
    return {
      type: 'sequence',
      title: '🎯 Secuencia de Impares',
      content: '¿Qué número sigue?',
      solution: answer,
      pattern: [...pattern, '?'],
      options: options,
    } as SequenceChallenge & { pattern: string[]; options: string[] };
  }
};

// RETO 19: Clasificación triple (frutas, animales, transporte)
const challenge19: PredefinedChallenge = {
  id: 'class-triple',
  name: 'Clasificación Triple',
  type: 'classification',
  generate: (difficulty: Difficulty) => {
    if (difficulty === 'easy') {
      // 4-5 años: solo 2 categorías (más fácil)
      return challenge12.generate(difficulty);
    }
    
    const fruits = ['🍎', '🍌', '🍇', '🍓'];
    const animals = ['🐶', '🐱', '🐷', '🐮'];
    const transport = ['🚗', '🚲', '✈️', '🚢'];
    
    let itemsPerCategory: number;
    if (difficulty === 'medium') {
      // 5-6 años: 3 categorías con 2 elementos cada una (más fácil que 3)
      itemsPerCategory = 2;
    } else {
      // 6+ años: 3 categorías con 3 elementos cada una
      itemsPerCategory = 3;
    }
    
    const selectedFruits = fruits.slice(0, itemsPerCategory);
    const selectedAnimals = animals.slice(0, itemsPerCategory);
    const selectedTransport = transport.slice(0, itemsPerCategory);
    
    return {
      type: 'classification',
      title: '🎯 Clasificación',
      content: 'Agrupa los elementos por categoría',
      solution: {
        'Frutas': selectedFruits,
        'Animales': selectedAnimals,
        'Transporte': selectedTransport,
      },
      selectedCategories: [
        { name: 'Frutas', items: selectedFruits, label: 'Frutas' },
        { name: 'Animales', items: selectedAnimals, label: 'Animales' },
        { name: 'Transporte', items: selectedTransport, label: 'Transporte' },
      ],
    } as ClassificationChallenge & { selectedCategories: Array<{ name: string; items: string[]; label: string }> };
  }
};

// RETO 20: Secuencia de suma (+1, +2, +3)
const challenge20: PredefinedChallenge = {
  id: 'seq-sum',
  name: 'Secuencia con Suma Creciente',
  type: 'sequence',
  generate: (difficulty: Difficulty) => {
    if (difficulty === 'easy') {
      // 4-5 años: usar secuencia simple +1 (más fácil)
      return challenge1.generate(difficulty);
    }
    
    let start: number;
    if (difficulty === 'medium') {
      // 5-6 años: secuencia simple +1 (1,2,3,?) - igual que fácil pero un poco más larga
      start = randomInt(1, 4);
      const pattern = [getNumberEmoji(start), getNumberEmoji(start + 1), getNumberEmoji(start + 2)];
      const next = start + 3;
      const answer = getNumberEmoji(next > 10 ? 10 : next);
      const options = [answer, getNumberEmoji(Math.min(10, next + 1)), getNumberEmoji(Math.max(1, next - 1))].sort(() => Math.random() - 0.5);
      
      return {
        type: 'sequence',
        title: '🎯 Secuencia Numérica',
        content: '¿Qué número sigue?',
        solution: answer,
        pattern: [...pattern, '?'],
        options: options,
      } as SequenceChallenge & { pattern: string[]; options: string[] };
    } else {
      // 6+ años: secuencia con incremento creciente (1,2,4,7,?) - más complejo
      start = randomInt(1, 3);
      const pattern = [getNumberEmoji(start), getNumberEmoji(start + 1), getNumberEmoji(start + 3)];
      const next = start + 6;
      const answer = getNumberEmoji(next > 10 ? 10 : next);
      const options = [answer, getNumberEmoji(Math.min(10, next + 1)), getNumberEmoji(Math.max(1, next - 1))].sort(() => Math.random() - 0.5);
      
      return {
        type: 'sequence',
        title: '🎯 Secuencia Numérica',
        content: '¿Qué número sigue?',
        solution: answer,
        pattern: [...pattern, '?'],
        options: options,
      } as SequenceChallenge & { pattern: string[]; options: string[] };
    }
  }
};

// Lista de los 20 retos predefinidos
export const PREDEFINED_CHALLENGES: PredefinedChallenge[] = [
  challenge1, challenge2, challenge3, challenge4, challenge5,
  challenge6, challenge7, challenge8, challenge9, challenge10,
  challenge11, challenge12, challenge13, challenge14, challenge15,
  challenge16, challenge17, challenge18, challenge19, challenge20,
];

/**
 * Selecciona 5 retos aleatorios de los 20 predefinidos
 */
export function selectRandomChallenges(count: number = 5): PredefinedChallenge[] {
  const shuffled = [...PREDEFINED_CHALLENGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Genera un desafío específico basado en un reto predefinido
 */
export function generateSpecificChallenge(challenge: PredefinedChallenge, difficulty: Difficulty): Challenge {
  return challenge.generate(difficulty);
}

/**
 * Función legacy para compatibilidad - genera un desafío aleatorio
 * @deprecated Usar generateSpecificChallenge en su lugar
 */
export function generateChallenge(difficulty: Difficulty): Challenge {
  const challengeTypes: ('classification' | 'sequence' | 'puzzle')[] = ['classification', 'sequence', 'puzzle'];
  const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
  
  switch (type) {
    case 'classification':
      return generateClassificationChallenge(difficulty);
    case 'sequence':
      return generateSequenceChallenge(difficulty);
    case 'puzzle':
      return generatePuzzleChallenge(difficulty);
    default:
      return generateClassificationChallenge(difficulty);
  }
}

// Funciones legacy mantenidas para compatibilidad
export function generateClassificationChallenge(difficulty: Difficulty): ClassificationChallenge {
  const allCategories = [
    { name: 'Frutas', items: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍑'], label: 'Frutas' },
    { name: 'Animales', items: ['🐶', '🐱', '🐷', '🐮', '🐰', '🐻'], label: 'Animales' },
    { name: 'Transporte', items: ['🚗', '🚲', '✈️', '🚢', '🚂', '🚁'], label: 'Transporte' },
    { name: 'Colores', items: ['🔴', '🟡', '🔵', '🟢', '🟠', '🟣'], label: 'Colores' },
    { name: 'Formas', items: ['🔴', '🟦', '🟩', '🟨', '🟧', '🟪'], label: 'Formas' }
  ];
  
  let numCategories: number, itemsPerCategory: number;
  if (difficulty === 'easy') {
    numCategories = 2;
    itemsPerCategory = 2;
  } else if (difficulty === 'medium') {
    numCategories = 2;
    itemsPerCategory = 3;
  } else {
    numCategories = 3;
    itemsPerCategory = 4;
  }
  
  const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
  const selectedCategories = shuffled.slice(0, numCategories).map(cat => ({
    ...cat,
    items: cat.items.slice(0, itemsPerCategory)
  }));
  
  return {
    type: 'classification',
    title: '🎯 Desafío de Clasificación',
    content: '',
    solution: selectedCategories.reduce((acc, cat) => {
      acc[cat.name] = cat.items;
      return acc;
    }, {} as Record<string, string[]>),
    selectedCategories,
  } as ClassificationChallenge & { selectedCategories: typeof selectedCategories };
}

export function generateSequenceChallenge(difficulty: Difficulty): SequenceChallenge {
  const easySequences = [
    { pattern: ['1️⃣', '2️⃣', '?'], answer: '3️⃣', options: ['3️⃣', '4️⃣', '5️⃣'] },
    { pattern: ['🟥', '🟦', '?'], answer: '🟥', options: ['🟥', '🟩', '🟨'] },
    { pattern: ['⭐', '⭐⭐', '?'], answer: '⭐⭐⭐', options: ['⭐⭐⭐', '⭐', '⭐⭐'] }
  ];
  
  const mediumSequences = [
    { pattern: ['1️⃣', '2️⃣', '3️⃣', '?'], answer: '4️⃣', options: ['4️⃣', '5️⃣', '6️⃣'] },
    { pattern: ['🟥', '🟦', '🟥', '?'], answer: '🟦', options: ['🟦', '🟩', '🟨'] },
    { pattern: ['⭐', '⭐⭐', '⭐⭐⭐', '?'], answer: '⭐⭐⭐⭐', options: ['⭐⭐⭐⭐', '⭐', '⭐⭐'] },
    { pattern: ['🔴', '🔵', '🟢', '?'], answer: '🟡', options: ['🟡', '🟠', '🟣'] }
  ];
  
  const hardSequences = [
    { pattern: ['1️⃣', '3️⃣', '5️⃣', '?'], answer: '7️⃣', options: ['7️⃣', '6️⃣', '8️⃣'] },
    { pattern: ['🟥', '🟦', '🟥', '🟦', '?'], answer: '🟥', options: ['🟥', '🟦', '🟩'] },
    { pattern: ['⭐', '⭐⭐', '⭐', '⭐⭐', '?'], answer: '⭐', options: ['⭐', '⭐⭐', '⭐⭐⭐'] },
    { pattern: ['🔴', '🟡', '🔵', '🟡', '?'], answer: '🔴', options: ['🔴', '🟡', '🔵'] },
    { pattern: ['1️⃣', '2️⃣', '4️⃣', '5️⃣', '?'], answer: '7️⃣', options: ['7️⃣', '6️⃣', '8️⃣'] }
  ];
  
  let sequences;
  if (difficulty === 'easy') {
    sequences = easySequences;
  } else if (difficulty === 'medium') {
    sequences = mediumSequences;
  } else {
    sequences = hardSequences;
  }
  
  const selected = sequences[Math.floor(Math.random() * sequences.length)];
  
  return {
    type: 'sequence',
    title: '🎯 Desafío de Secuencia',
    content: '',
    solution: selected.answer,
    pattern: selected.pattern,
    options: selected.options,
  } as SequenceChallenge & { pattern: string[]; options: string[] };
}

export function generatePuzzleChallenge(difficulty: Difficulty): PuzzleChallenge {
  const easyPuzzles = [
    { items: ['1️⃣', '2️⃣', '3️⃣'], solution: ['1️⃣', '2️⃣', '3️⃣'], gridSize: 3 },
    { items: ['A', 'E', 'I'], solution: ['A', 'E', 'I'], gridSize: 3 },
    { items: ['A', 'B', 'C'], solution: ['A', 'B', 'C'], gridSize: 3 },
    { items: ['🍎', '🍌', '🍇'], solution: ['🍎', '🍌', '🍇'], gridSize: 3 },
    { items: ['🐶', '🐱', '🐷'], solution: ['🐶', '🐱', '🐷'], gridSize: 3 },
    { items: ['🌱', '🌿', '🌳'], solution: ['🌱', '🌿', '🌳'], gridSize: 3 },
  ];
  
  const mediumPuzzles = [
    { items: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], solution: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], gridSize: 4 },
    { items: ['A', 'E', 'I', 'O'], solution: ['A', 'E', 'I', 'O'], gridSize: 4 },
    { items: ['A', 'B', 'C', 'D'], solution: ['A', 'B', 'C', 'D'], gridSize: 4 },
    { items: ['E', 'F', 'G', 'H'], solution: ['E', 'F', 'G', 'H'], gridSize: 4 },
    { items: ['🍎', '🍌', '🍇', '🍓'], solution: ['🍎', '🍌', '🍇', '🍓'], gridSize: 4 },
    { items: ['🐶', '🐱', '🐷', '🐮'], solution: ['🐶', '🐱', '🐷', '🐮'], gridSize: 4 },
    { items: ['🌱', '🌿', '🌳', '🌲'], solution: ['🌱', '🌿', '🌳', '🌲'], gridSize: 4 },
  ];
  
  const hardPuzzles = [
    { items: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'], solution: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'], gridSize: 5 },
    { items: ['A', 'E', 'I', 'O', 'U'], solution: ['A', 'E', 'I', 'O', 'U'], gridSize: 5 },
    { items: ['A', 'B', 'C', 'D', 'E'], solution: ['A', 'B', 'C', 'D', 'E'], gridSize: 5 },
    { items: ['F', 'G', 'H', 'I', 'J'], solution: ['F', 'G', 'H', 'I', 'J'], gridSize: 5 },
    { items: ['K', 'L', 'M', 'N', 'O'], solution: ['K', 'L', 'M', 'N', 'O'], gridSize: 5 },
    { items: ['🍎', '🍌', '🍇', '🍓', '🍊'], solution: ['🍎', '🍌', '🍇', '🍓', '🍊'], gridSize: 5 },
    { items: ['🐶', '🐱', '🐷', '🐮', '🐰'], solution: ['🐶', '🐱', '🐷', '🐮', '🐰'], gridSize: 5 },
    { items: ['🌱', '🌿', '🌳', '🌲', '🍃'], solution: ['🌱', '🌿', '🌳', '🌲', '🍃'], gridSize: 5 },
  ];
  
  let puzzles;
  if (difficulty === 'easy') {
    puzzles = easyPuzzles;
  } else if (difficulty === 'medium') {
    puzzles = mediumPuzzles;
  } else {
    puzzles = hardPuzzles;
  }
  
  const selected = puzzles[Math.floor(Math.random() * puzzles.length)];
  const shuffled = [...selected.items].sort(() => Math.random() - 0.5);
  
  return {
    type: 'puzzle',
    title: '🎯 Desafío de Ordenamiento',
    content: 'Arrastra los elementos para ordenarlos correctamente',
    solution: selected.solution,
    gridSize: selected.gridSize,
    current: shuffled,
  };
}
