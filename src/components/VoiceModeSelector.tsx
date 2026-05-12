import { motion } from 'framer-motion';
import { VoiceMode, VOICE_MODES } from '../utils/types';

interface VoiceModeSelectorProps {
  selected: VoiceMode;
  onChange: (mode: VoiceMode) => void;
  disabled: boolean;
}

export function VoiceModeSelector({ selected, onChange, disabled }: VoiceModeSelectorProps) {
  return (
    <section id="voice-modes" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-kanit font-800 text-4xl md:text-5xl hero-heading mb-4">
            Voice Modes
          </h2>
          <p className="font-kanit font-300 text-[#D7E2EA]/50 text-lg">
            Pick a filter. The chick will sound absolutely ridiculous.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {VOICE_MODES.map((mode, i) => {
            const isSelected = selected === mode.id;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ scale: disabled ? 1 : 1.06, y: disabled ? 0 : -4 }}
                whileTap={{ scale: disabled ? 1 : 0.96 }}
                onClick={() => !disabled && onChange(mode.id)}
                disabled={disabled}
                className="relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 cursor-pointer disabled:cursor-not-allowed group"
                style={{
                  background: isSelected
                    ? 'rgba(187,204,215,0.1)'
                    : 'rgba(255,255,255,0.04)',
                  border: isSelected
                    ? `1px solid rgba(187,204,215,0.35)`
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isSelected ? `0 0 24px ${mode.glowColor}` : 'none',
                }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="mode-indicator"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${mode.glowColor} 0%, transparent 65%)`,
                    }}
                  />
                )}

                <span className="text-3xl relative z-10">{mode.emoji}</span>

                <div className="relative z-10 text-center">
                  <div
                    className={`font-kanit font-700 text-sm tracking-wide ${
                      isSelected ? 'text-white' : 'text-[#D7E2EA]/70'
                    }`}
                  >
                    {mode.name}
                  </div>
                  <div className="font-kanit font-300 text-[10px] text-[#D7E2EA]/40 mt-0.5 leading-tight">
                    {mode.description}
                  </div>
                </div>

                {/* Gradient accent dot */}
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mode.gradient} relative z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-30'}`}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
