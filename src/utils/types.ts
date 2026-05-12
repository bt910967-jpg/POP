export type AppState = 'idle' | 'listening' | 'processing' | 'playback';

export type CharacterType = 'chick' | 'poop' | 'penguin';

export type VoiceMode = 'normal' | 'chipmunk' | 'monster' | 'robot' | 'echo' | 'slow';

export interface VoiceModeConfig {
  id: VoiceMode;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  glowColor: string;
}

export const VOICE_MODES: VoiceModeConfig[] = [
  {
    id: 'chipmunk',
    name: 'Chipmunk',
    description: 'Super high pitch, tiny squeaky voice',
    emoji: '🐿️',
    gradient: 'from-yellow-400 to-orange-500',
    glowColor: 'rgba(251,191,36,0.4)',
  },
  {
    id: 'monster',
    name: 'Monster',
    description: 'Deep rumbling demon growl',
    emoji: '👹',
    gradient: 'from-red-500 to-purple-700',
    glowColor: 'rgba(239,68,68,0.4)',
  },
  {
    id: 'robot',
    name: 'Robot',
    description: 'Mechanical digital tremolo',
    emoji: '🤖',
    gradient: 'from-cyan-400 to-blue-600',
    glowColor: 'rgba(34,211,238,0.4)',
  },
  {
    id: 'echo',
    name: 'Echo Cave',
    description: 'Reverberating canyon echo',
    emoji: '🏔️',
    gradient: 'from-emerald-400 to-teal-600',
    glowColor: 'rgba(52,211,153,0.4)',
  },
  {
    id: 'slow',
    name: 'Slow Mo',
    description: 'Slowed down and dramatic',
    emoji: '🐌',
    gradient: 'from-purple-400 to-pink-600',
    glowColor: 'rgba(192,132,252,0.4)',
  },
];
