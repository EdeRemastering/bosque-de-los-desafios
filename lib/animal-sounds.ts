import { Howl } from 'howler';

// Mapeo de emojis de animales a sus archivos de sonido
// Los sonidos deben estar en la carpeta public/sounds/
export const ANIMAL_SOUNDS: Record<string, string> = {
  '🐰': '/sounds/rabbit.mp3', // Conejo - sonido suave
  '🐻': '/sounds/bear.mp3', // Oso - gruñido
  '🦊': '/sounds/fox.mp3', // Zorro - ladrido/lloriqueo
  '🐸': '/sounds/frog.mp3', // Rana - croar
  '🐿️': '/sounds/squirrel.mp3', // Ardilla - chirrido
  '🦉': '/sounds/owl.mp3', // Búho - ulular
  '🐺': '/sounds/wolf.mp3', // Lobo - aullido
  '🦌': '/sounds/deer.mp3', // Ciervo - bramido
  '🐝': '/sounds/bee.mp3', // Abeja - zumbido
  '🦋': '/sounds/butterfly.mp3', // Mariposa - sonido suave (alas)
  '🐞': '/sounds/ladybug.mp3', // Mariquita - sonido suave
  '🦎': '/sounds/lizard.mp3', // Lagarto - siseo suave
};

// Cache de sonidos Howler para mejor rendimiento
const soundCache: Map<string, Howl> = new Map();

// Función para obtener o crear un sonido Howler
function getSound(emoji: string): Howl | null {
  const soundPath = ANIMAL_SOUNDS[emoji];
  if (!soundPath) {
    console.warn(`No hay sonido configurado para el emoji: ${emoji}`);
    return null;
  }

  // Si ya existe en el cache, retornarlo
  if (soundCache.has(emoji)) {
    return soundCache.get(emoji)!;
  }

  // Crear nuevo sonido Howler
  try {
    const sound = new Howl({
      src: [soundPath],
      volume: 0.7, // Volumen moderado para niños
      preload: true,
      html5: true, // Usar HTML5 Audio para mejor compatibilidad
      onloaderror: (id, error) => {
        console.warn(`Error al cargar el sonido ${soundPath}:`, error);
      },
    });

    soundCache.set(emoji, sound);
    return sound;
  } catch (error) {
    console.error(`Error al crear el sonido para ${emoji}:`, error);
    return null;
  }
}

// Función para reproducir un sonido de animal
export function playAnimalSound(emoji: string): void {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') {
    return;
  }

  const sound = getSound(emoji);
  if (sound) {
    try {
      // Detener cualquier reproducción anterior del mismo sonido
      sound.stop();
      // Reproducir el sonido
      sound.play();
    } catch (error) {
      console.warn(`Error al reproducir el sonido para ${emoji}:`, error);
    }
  }
}

// Función para reproducir sonido de victoria de un equipo (reproduce 3 veces)
export function playTeamVictorySound(animalEmoji: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const sound = getSound(animalEmoji);
  if (sound) {
    try {
      // Reproducir el sonido 3 veces con pequeños delays para celebrar
      sound.play();
      
      setTimeout(() => {
        sound.play();
      }, 500);
      
      setTimeout(() => {
        sound.play();
      }, 1000);
    } catch (error) {
      console.warn(`Error al reproducir el sonido de victoria para ${animalEmoji}:`, error);
    }
  }
}

// Función para precargar todos los sonidos (útil para mejorar la experiencia)
export function preloadAllSounds(): void {
  if (typeof window === 'undefined') {
    return;
  }

  Object.keys(ANIMAL_SOUNDS).forEach(emoji => {
    getSound(emoji);
  });
}

// Función para limpiar el cache de sonidos (útil para liberar memoria)
export function clearSoundCache(): void {
  soundCache.forEach(sound => {
    sound.unload();
  });
  soundCache.clear();
}
