import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppState } from '../utils/types';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  appState: AppState;
}

const BAR_COUNT = 32;

export function AudioVisualizer({ analyser, appState }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  const isActive = appState === 'listening' || appState === 'playback';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const barWidth = (W / BAR_COUNT) - 2;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      let freqData: Uint8Array<ArrayBuffer> | null = null;
      if (analyser) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        freqData = new Uint8Array(analyser.frequencyBinCount) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        analyser.getByteFrequencyData(freqData as any);
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        const dataIndex = Math.floor((i / BAR_COUNT) * (analyser?.frequencyBinCount ?? 1));
        const raw = freqData ? freqData[dataIndex] / 255 : 0;
        barsRef.current[i] = barsRef.current[i] * 0.75 + raw * 0.25;

        const barH = Math.max(3, barsRef.current[i] * H * 0.92);
        const x = i * (barWidth + 2);
        const y = H - barH;

        // Color gradient per bar
        const gradient = ctx.createLinearGradient(x, y, x, H);
        if (appState === 'listening') {
          gradient.addColorStop(0, 'rgba(245,158,11,0.9)');
          gradient.addColorStop(1, 'rgba(245,158,11,0.2)');
        } else if (appState === 'playback') {
          gradient.addColorStop(0, 'rgba(187,204,215,0.9)');
          gradient.addColorStop(1, 'rgba(100,105,115,0.2)');
        } else {
          gradient.addColorStop(0, 'rgba(100,105,115,0.4)');
          gradient.addColorStop(1, 'rgba(100,105,115,0.05)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 3);
        ctx.fill();
      }

      // Idle fallback gentle wave
      if (!analyser) {
        for (let i = 0; i < BAR_COUNT; i++) {
          const wave = Math.sin(Date.now() * 0.002 + i * 0.4) * 0.06 + 0.04;
          barsRef.current[i] = barsRef.current[i] * 0.9 + wave * 0.1;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, appState]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="flex flex-col items-center gap-2"
    >
      <span className="font-kanit text-xs tracking-widest uppercase opacity-40 text-[#D7E2EA]">
        {appState === 'listening'
          ? '🎙 Listening...'
          : appState === 'playback'
          ? '🔊 Playing...'
          : appState === 'processing'
          ? '⚙ Processing...'
          : 'Audio Visualizer'}
      </span>

      <div
        className="rounded-2xl overflow-hidden border border-white/5"
        style={{
          background: 'rgba(255,255,255,0.025)',
          boxShadow: isActive ? '0 0 20px rgba(245,158,11,0.08)' : 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={72}
          className="block"
        />
      </div>
    </motion.div>
  );
}
