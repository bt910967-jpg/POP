import { useRef, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VoiceModeSelector } from './components/VoiceModeSelector';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { useMicrophone } from './hooks/useMicrophone';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useLipSync } from './hooks/useLipSync';
import { playWithEffect } from './utils/audioEffects';
import { AppState, VoiceMode, CharacterType } from './utils/types';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('chipmunk');
  const [character, setCharacter] = useState<CharacterType>('chick');
  const [playbackAnalyser, setPlaybackAnalyser] = useState<AnalyserNode | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopPlaybackRef = useRef<(() => void) | null>(null);

  const {
    volume,
    analyser: micAnalyser,
    isActive: micActive,
    error,
    startListening,
    stopListening,
  } = useMicrophone();

  const { isRecording, audioBuffer, startRecording, stopRecording } = useAudioRecorder();

  // Active analyser: mic during recording, playback analyser during playback
  const activeAnalyser = appState === 'playback' ? playbackAnalyser : micAnalyser;

  // Lip sync from whichever analyser is currently active
  const mouthOpen = useLipSync(activeAnalyser);

  // Volume source: mic volume during recording, we use the playback analyser during playback
  const [playbackVolume, setPlaybackVolume] = useState(0);
  const playbackRafRef = useRef<number>(0);

  const trackPlaybackVolume = useCallback((anal: AnalyserNode) => {
    const data = new Uint8Array(anal.frequencyBinCount);
    const tick = () => {
      anal.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      setPlaybackVolume(sum / data.length / 255);
      playbackRafRef.current = requestAnimationFrame(tick);
    };
    playbackRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopTrackingPlaybackVolume = useCallback(() => {
    cancelAnimationFrame(playbackRafRef.current);
    setPlaybackVolume(0);
  }, []);

  const displayVolume = appState === 'playback' ? playbackVolume : volume;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleStartRecording = useCallback(async () => {
    if (appState !== 'idle') return;

    // Stop any playback
    stopPlaybackRef.current?.();
    setPlaybackAnalyser(null);
    stopTrackingPlaybackVolume();

    const stream = await startListening();
    if (!stream) return;

    startRecording(stream);
    setAppState('listening');
  }, [appState, startListening, startRecording, stopTrackingPlaybackVolume]);

  const handleStopRecording = useCallback(async () => {
    if (appState !== 'listening') return;

    setAppState('processing');
    stopListening();
    await stopRecording();
    setAppState('idle');
  }, [appState, stopListening, stopRecording]);

  const handleReplay = useCallback(() => {
    if (!audioBuffer || appState === 'listening' || appState === 'processing') return;

    // Stop any current playback
    stopPlaybackRef.current?.();
    stopTrackingPlaybackVolume();

    // Create or reuse audio context
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const { analyser, stop } = playWithEffect(ctx, audioBuffer, voiceMode, () => {
      setAppState('idle');
      setPlaybackAnalyser(null);
      stopTrackingPlaybackVolume();
    });

    stopPlaybackRef.current = stop;
    setPlaybackAnalyser(analyser);
    setAppState('playback');
    trackPlaybackVolume(analyser);
  }, [audioBuffer, appState, voiceMode, trackPlaybackVolume, stopTrackingPlaybackVolume]);

  const handleVoiceModeChange = useCallback((mode: VoiceMode) => {
    setVoiceMode(mode);
    // If we're playing back, restart with new mode
    if (appState === 'playback' && audioBuffer) {
      stopPlaybackRef.current?.();
      stopTrackingPlaybackVolume();

      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') ctx.resume();

      const { analyser, stop } = playWithEffect(ctx, audioBuffer, mode, () => {
        setAppState('idle');
        setPlaybackAnalyser(null);
        stopTrackingPlaybackVolume();
      });

      stopPlaybackRef.current = stop;
      setPlaybackAnalyser(analyser);
      trackPlaybackVolume(analyser);
    }
  }, [appState, audioBuffer, trackPlaybackVolume, stopTrackingPlaybackVolume]);

  const isDisabledForModeChange = appState === 'listening' || appState === 'processing';

  return (
    <div className="min-h-screen font-kanit" style={{ background: '#0C0C0C' }}>
      <Navbar />

      <Hero
        appState={appState}
        voiceMode={voiceMode}
        character={character}
        volume={displayVolume}
        mouthOpen={mouthOpen}
        hasRecording={!!audioBuffer}
        activeAnalyser={activeAnalyser}
        error={error}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onReplay={handleReplay}
        onCharacterChange={setCharacter}
      />

      <VoiceModeSelector
        selected={voiceMode}
        onChange={handleVoiceModeChange}
        disabled={isDisabledForModeChange}
      />

      <FeaturesSection />
      <Footer />
    </div>
  );
}
