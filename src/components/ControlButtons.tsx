import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Loader2 } from 'lucide-react';
import { AppState } from '../utils/types';

interface ControlButtonsProps {
  appState: AppState;
  hasRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReplay: () => void;
}

export function ControlButtons({
  appState,
  hasRecording,
  onStartRecording,
  onStopRecording,
  onReplay,
}: ControlButtonsProps) {
  const isIdle = appState === 'idle';
  const isListening = appState === 'listening';
  const isProcessing = appState === 'processing';
  const isPlayback = appState === 'playback';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-4"
    >
      {/* Start / Stop */}
      {isListening ? (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onStopRecording}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full font-kanit font-700 text-sm tracking-widest uppercase"
          style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#fff',
            boxShadow: '0 0 24px rgba(239,68,68,0.5)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          >
            <MicOff size={18} />
          </motion.div>
          Stop Recording
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onStartRecording}
          disabled={isProcessing || isPlayback}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full font-kanit font-700 text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isIdle || isPlayback
              ? 'linear-gradient(135deg, #646973 0%, #BBCCD7 100%)'
              : 'linear-gradient(135deg, #646973 0%, #BBCCD7 100%)',
            color: '#0C0C0C',
          }}
        >
          {isProcessing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Mic size={18} />
          )}
          {isProcessing ? 'Processing...' : 'Start Recording'}
        </motion.button>
      )}

      {/* Replay */}
      <motion.button
        whileHover={{ scale: hasRecording && !isListening && !isProcessing ? 1.06 : 1 }}
        whileTap={{ scale: hasRecording && !isListening && !isProcessing ? 0.94 : 1 }}
        onClick={onReplay}
        disabled={!hasRecording || isListening || isProcessing || isPlayback}
        className="flex items-center gap-2 px-8 py-3.5 rounded-full font-kanit font-700 text-sm tracking-widest uppercase border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: isPlayback
            ? 'rgba(187,204,215,0.15)'
            : 'rgba(255,255,255,0.06)',
          color: '#D7E2EA',
          boxShadow: isPlayback ? '0 0 20px rgba(187,204,215,0.2)' : 'none',
        }}
      >
        <Play size={18} fill={isPlayback ? '#BBCCD7' : 'none'} />
        {isPlayback ? 'Playing...' : 'Replay Voice'}
      </motion.button>
    </motion.div>
  );
}
