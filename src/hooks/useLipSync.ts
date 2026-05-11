import { useRef, useEffect, useState } from 'react';

export function useLipSync(analyser: AnalyserNode | null): number {
  const [mouthOpen, setMouthOpen] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser) {
      setMouthOpen(0);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);

    const update = () => {
      analyser.getByteFrequencyData(data);

      // Focus on speech-range bins (~300–3000 Hz out of 0–22050 Hz)
      const sampleRate = analyser.context.sampleRate;
      const binHz = sampleRate / (bufferLength * 2);
      const startBin = Math.floor(300 / binHz);
      const endBin = Math.min(Math.floor(3000 / binHz), bufferLength - 1);

      let sum = 0;
      for (let i = startBin; i <= endBin; i++) sum += data[i];
      const avg = sum / (endBin - startBin + 1);

      setMouthOpen(Math.min(avg / 110, 1));
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  return mouthOpen;
}
