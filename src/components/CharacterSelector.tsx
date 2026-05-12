import { motion } from 'framer-motion';
import { CharacterType } from '../utils/types';

interface CharacterSelectorProps {
  selected: CharacterType;
  onChange: (c: CharacterType) => void;
}

const CHARACTERS: { id: CharacterType; emoji: string; name: string; accent: string }[] = [
  { id: 'chick',   emoji: '🐥', name: 'Chick',   accent: '#FFD93D' },
  { id: 'poop',    emoji: '💩', name: 'Poop',    accent: '#8B4A20' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', accent: '#7EB8FF' },
];

export function CharacterSelector({ selected, onChange }: CharacterSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex items-center gap-3 relative z-10 mb-2"
    >
      {CHARACTERS.map((c) => {
        const isSelected = selected === c.id;
        return (
          <motion.button
            key={c.id}
            onClick={() => onChange(c.id)}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.94 }}
            className="relative flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all duration-300 select-none"
            style={{
              background: isSelected
                ? `rgba(${hexToRgb(c.accent)}, 0.14)`
                : 'rgba(255,255,255,0.04)',
              border: isSelected
                ? `1px solid rgba(${hexToRgb(c.accent)}, 0.45)`
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isSelected
                ? `0 0 18px rgba(${hexToRgb(c.accent)}, 0.25)`
                : 'none',
              minWidth: '76px',
            }}
          >
            {isSelected && (
              <motion.div
                layoutId="char-indicator"
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, rgba(${hexToRgb(c.accent)}, 0.18) 0%, transparent 70%)`,
                }}
              />
            )}
            <span className="text-2xl relative z-10">{c.emoji}</span>
            <span
              className="font-kanit font-600 text-xs tracking-wider uppercase relative z-10"
              style={{ color: isSelected ? c.accent : 'rgba(215,226,234,0.55)' }}
            >
              {c.name}
            </span>
            {isSelected && (
              <motion.div
                layoutId="char-dot"
                className="w-1 h-1 rounded-full relative z-10"
                style={{ background: c.accent }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
