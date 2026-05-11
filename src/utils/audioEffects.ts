import { VoiceMode } from './types';

export interface PlaybackHandle {
  analyser: AnalyserNode;
  stop: () => void;
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 512;
  const curve = new Float32Array(n) as unknown as Float32Array<ArrayBuffer>;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    (curve as unknown as Float32Array)[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export function playWithEffect(
  ctx: AudioContext,
  buffer: AudioBuffer,
  mode: VoiceMode,
  onEnded: () => void
): PlaybackHandle {
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 1.0;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.85;

  switch (mode) {
    case 'chipmunk': {
      source.playbackRate.value = 1.75;
      const hi = ctx.createBiquadFilter();
      hi.type = 'highshelf';
      hi.frequency.value = 3000;
      hi.gain.value = 10;
      source.connect(hi);
      hi.connect(masterGain);
      break;
    }

    case 'monster': {
      source.playbackRate.value = 0.45;
      const lo = ctx.createBiquadFilter();
      lo.type = 'lowpass';
      lo.frequency.value = 500;
      lo.Q.value = 3;

      const dist = ctx.createWaveShaper();
      dist.curve = makeDistortionCurve(300);
      dist.oversample = '4x';

      const boost = ctx.createGain();
      boost.gain.value = 1.8;

      source.connect(lo);
      lo.connect(dist);
      dist.connect(boost);
      boost.connect(masterGain);
      break;
    }

    case 'robot': {
      // Tremolo ring modulation
      const tremoloGain = ctx.createGain();
      tremoloGain.gain.value = 0.5;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 70;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.5;

      // DC offset so gain swings 0→1 instead of -0.5→0.5
      const dc = ctx.createConstantSource();
      dc.offset.value = 0.5;

      osc.connect(oscGain);
      dc.connect(tremoloGain.gain);
      oscGain.connect(tremoloGain.gain);

      osc.start();
      dc.start();

      source.connect(tremoloGain);
      tremoloGain.connect(masterGain);

      source.onended = () => {
        try { osc.stop(); } catch { /* noop */ }
        try { dc.stop(); } catch { /* noop */ }
        onEnded();
      };

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);
      source.start(0);

      return {
        analyser,
        stop: () => {
          try { source.stop(); } catch { /* noop */ }
        },
      };
    }

    case 'echo': {
      const echoDelay1 = ctx.createDelay(2.0);
      echoDelay1.delayTime.value = 0.28;
      const echoDelay2 = ctx.createDelay(2.0);
      echoDelay2.delayTime.value = 0.56;
      const echoDelay3 = ctx.createDelay(2.0);
      echoDelay3.delayTime.value = 0.84;

      const echoGain1 = ctx.createGain();
      echoGain1.gain.value = 0.55;
      const echoGain2 = ctx.createGain();
      echoGain2.gain.value = 0.3;
      const echoGain3 = ctx.createGain();
      echoGain3.gain.value = 0.12;

      source.connect(masterGain);
      source.connect(echoDelay1);
      echoDelay1.connect(echoGain1);
      echoGain1.connect(masterGain);
      echoGain1.connect(echoDelay2);
      echoDelay2.connect(echoGain2);
      echoGain2.connect(masterGain);
      echoGain2.connect(echoDelay3);
      echoDelay3.connect(echoGain3);
      echoGain3.connect(masterGain);
      break;
    }

    case 'slow': {
      source.playbackRate.value = 0.55;
      const lo = ctx.createBiquadFilter();
      lo.type = 'lowpass';
      lo.frequency.value = 3500;
      source.connect(lo);
      lo.connect(masterGain);
      break;
    }

    default: {
      source.connect(masterGain);
      break;
    }
  }

  masterGain.connect(analyser);
  analyser.connect(ctx.destination);

  source.onended = onEnded;
  source.start(0);

  return {
    analyser,
    stop: () => {
      try { source.stop(); } catch { /* noop */ }
    },
  };
}
