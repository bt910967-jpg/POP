import { useRef, useState, useCallback, useEffect } from 'react';

export interface UseMicrophoneReturn {
  volume: number;
  analyser: AnalyserNode | null;
  isActive: boolean;
  error: string | null;
  startListening: () => Promise<MediaStream | null>;
  stopListening: () => void;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [volume, setVolume] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / data.length;
    setVolume(avg / 255);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startListening = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const anal = ctx.createAnalyser();
      anal.fftSize = 256;
      anal.smoothingTimeConstant = 0.8;
      src.connect(anal);

      audioCtxRef.current = ctx;
      analyserRef.current = anal;
      streamRef.current = stream;

      setAnalyser(anal);
      setIsActive(true);
      setError(null);

      rafRef.current = requestAnimationFrame(tick);
      return stream;
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      return null;
    }
  }, [tick]);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => { /* noop */ });
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAnalyser(null);
    setIsActive(false);
    setVolume(0);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => { /* noop */ });
    };
  }, []);

  return { volume, analyser, isActive, error, startListening, stopListening };
}
