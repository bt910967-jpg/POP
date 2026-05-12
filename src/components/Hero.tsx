import { motion } from 'framer-motion';
import { PoopCharacter3D } from './PoopCharacter3D';
import { ControlButtons } from './ControlButtons';
import { AudioVisualizer } from './AudioVisualizer';
import { AppState, VoiceMode, VOICE_MODES } from '../utils/types';

interface HeroProps {
  appState: AppState;
  voiceMode: VoiceMode;
  volume: number;
  mouthOpen: number;
  hasRecording: boolean;
  activeAnalyser: AnalyserNode | null;
  error: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReplay: () => void;
}

const stateLabel: Record<AppState, { text: string; color: string }> = {
  idle: { text: 'Idle — Press Start to Talk', color: '#646973' },
  listening: { text: '🔴 Listening... Speak Now!', color: '#EF4444' },
  processing: { text: '⚙ Processing your voice...', color: '#F59E0B' },
  playback: { text: '🔊 Playing your voice back!', color: '#BBCCD7' },
};

export function Hero({
  appState,
  voiceMode,
  volume,
  mouthOpen,
  hasRecording,
  activeAnalyser,
  error,
  onStartRecording,
  onStopRecording,
  onReplay,
}: HeroProps) {
  const label = stateLabel[appState];
  const currentMode = VOICE_MODES.find((m) => m.id === voiceMode);

  return (
    <section
      id="demo"
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden"
    >
      {/* Background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(100,105,115,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Animated grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(187,204,215,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(187,204,215,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-2 relative z-10"
      >
        <h1 className="font-kanit font-900 text-6xl sm:text-7xl md:text-8xl hero-heading leading-none tracking-tight">
          Talking Chick
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-kanit font-300 text-[#D7E2EA]/50 text-lg md:text-xl mt-3 max-w-md mx-auto"
        >
          Talk to me and I repeat everything in ridiculous funny voices.
        </motion.p>
      </motion.div>

      {/* 3D Character */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        className="relative w-full max-w-sm sm:max-w-md h-72 sm:h-80 md:h-96 flex-shrink-0"
      >
        <PoopCharacter3D
          appState={appState}
          volume={volume}
          mouthOpen={mouthOpen}
        />
      </motion.div>

      {/* State indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center gap-2 mb-5 relative z-10"
      >
        <motion.div
          animate={{
            opacity: appState === 'listening' ? [1, 0.3, 1] : 1,
            scale: appState === 'listening' ? [1, 1.3, 1] : 1,
          }}
          transition={{ repeat: appState === 'listening' ? Infinity : 0, duration: 0.9 }}
          className="w-2 h-2 rounded-full"
          style={{ background: label.color }}
        />
        <span
          className="font-kanit font-400 text-sm tracking-wider"
          style={{ color: label.color }}
        >
          {label.text}
        </span>
        {currentMode && appState !== 'idle' && appState !== 'listening' && (
          <span className="text-sm ml-1 opacity-60">
            {currentMode.emoji} {currentMode.name}
          </span>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-5 py-3 rounded-xl font-kanit font-400 text-sm text-red-300 border border-red-500/20 bg-red-500/08"
          style={{ background: 'rgba(239,68,68,0.08)' }}
        >
          {error}
        </motion.div>
      )}

      {/* Buttons */}
      <div className="relative z-10 mb-8">
        <ControlButtons
          appState={appState}
          hasRecording={hasRecording}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onReplay={onReplay}
        />
      </div>

      {/* Visualizer */}
      <div className="relative z-10">
        <AudioVisualizer analyser={activeAnalyser} appState={appState} />
      </div>

      {/* Volume bar */}
      {(appState === 'listening' || appState === 'playback') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-3 relative z-10"
        >
          <span className="font-kanit text-xs text-[#D7E2EA]/40 uppercase tracking-widest">Vol</span>
          <div className="w-32 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${volume * 100}%`,
                background: appState === 'listening'
                  ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                  : 'linear-gradient(90deg, #646973, #BBCCD7)',
              }}
              animate={{ width: `${volume * 100}%` }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
