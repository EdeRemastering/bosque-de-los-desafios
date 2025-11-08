/**
 * Mapeo de emojis de animales a tipos de animación de movimiento
 */
export const CHARACTER_ANIMATIONS: Record<string, {
  type: 'jump' | 'run' | 'fly' | 'hop' | 'crawl' | 'glide' | 'bounce' | 'walk';
  duration: number;
  easing: string;
}> = {
  '🐸': { type: 'jump', duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }, // Rana - salta
  '🐰': { type: 'hop', duration: 500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }, // Conejo - salta rápido
  '🦊': { type: 'run', duration: 700, easing: 'ease-out' }, // Zorro - corre
  '🐻': { type: 'walk', duration: 800, easing: 'ease-in-out' }, // Oso - camina pesado
  '🐿️': { type: 'hop', duration: 450, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }, // Ardilla - salta rápido
  '🦉': { type: 'glide', duration: 750, easing: 'ease-in-out' }, // Búho - planea
  '🐺': { type: 'run', duration: 650, easing: 'ease-out' }, // Lobo - corre
  '🦌': { type: 'run', duration: 600, easing: 'ease-out' }, // Ciervo - corre
  '🐝': { type: 'fly', duration: 500, easing: 'ease-in-out' }, // Abeja - vuela
  '🦋': { type: 'fly', duration: 600, easing: 'ease-in-out' }, // Mariposa - vuela suave
  '🐞': { type: 'crawl', duration: 700, easing: 'linear' }, // Mariquita - se arrastra
  '🦎': { type: 'crawl', duration: 650, easing: 'linear' }, // Lagarto - se arrastra
};

/**
 * Obtiene la animación para un emoji de personaje
 */
export function getCharacterAnimation(emoji: string): {
  type: 'jump' | 'run' | 'fly' | 'hop' | 'crawl' | 'glide' | 'bounce' | 'walk';
  duration: number;
  easing: string;
} {
  return CHARACTER_ANIMATIONS[emoji] || { type: 'walk', duration: 600, easing: 'ease-in-out' };
}

