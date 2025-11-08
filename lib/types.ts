export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'individual' | 'teams';

export interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  icon: string;
  team: number | null;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  players: Player[];
  position: number;
}

export type ChallengeType = 'classification' | 'sequence' | 'puzzle';

export interface Challenge {
  type: ChallengeType;
  title: string;
  content: string;
  solution: any;
  gridSize?: number;
  current?: string[];
}

export interface ClassificationChallenge {
  type: 'classification';
  title: string;
  content: string;
  solution: Record<string, string[]>;
  selectedCategories?: Array<{
    name: string;
    items: string[];
    label: string;
  }>;
}

export interface SequenceChallenge {
  type: 'sequence';
  title: string;
  content: string;
  solution: string;
  pattern?: string[];
  options?: string[];
}

export interface PuzzleChallenge {
  type: 'puzzle';
  title: string;
  content: string;
  solution: string[];
  gridSize: number;
  current: string[];
}
