import { useRef, useState, useCallback } from 'react';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioBuffer: AudioBuffer | null;
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback((stream: MediaStream) => {
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : '';

    const options = mimeType ? { mimeType } : undefined;
    const recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve();
        return;
      }

      recorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorderRef.current?.mimeType || 'audio/webm',
        });

        try {
          const arrayBuffer = await blob.arrayBuffer();
          const ctx = new AudioContext();
          const decoded = await ctx.decodeAudioData(arrayBuffer);
          setAudioBuffer(decoded);
          await ctx.close();
        } catch (err) {
          console.error('[AudioRecorder] Decode error:', err);
        }

        setIsRecording(false);
        resolve();
      };

      recorderRef.current.stop();
    });
  }, []);

  const clearRecording = useCallback(() => {
    setAudioBuffer(null);
    chunksRef.current = [];
  }, []);

  return { isRecording, audioBuffer, startRecording, stopRecording, clearRecording };
}
