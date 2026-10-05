/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
/** Optional shared event sound. Original synthesized tones; no borrowed assets. */
export interface SoundSettings {
  enabled: boolean;
  muted: boolean;
  volume: number;
  blocked: boolean;
}
export interface SoundEvent {
  id: string;
  kind: 'sent' | 'complete' | 'error' | 'stopped';
}
export type TonePlayer = (
  kind: SoundEvent['kind'],
  volume: number,
) => Promise<void>;
export function createSoundController(player: TonePlayer = playTone) {
  let settings: SoundSettings = {
    enabled: false,
    muted: false,
    volume: 0.15,
    blocked: false,
  };
  const seen = new Set<string>();
  let last = -Infinity;
  return {
    configure(next: Partial<Omit<SoundSettings, 'blocked'>>) {
      settings = {
        ...settings,
        ...next,
        volume: Math.max(0, Math.min(1, next.volume ?? settings.volume)),
        blocked: false,
      };
    },
    snapshot() {
      return {...settings};
    },
    async play(event: SoundEvent, time = Date.now()) {
      if (seen.has(event.id)) {
        return false;
      }
      seen.add(event.id);
      if (
        !settings.enabled ||
        settings.muted ||
        settings.volume === 0 ||
        time - last < 800
      ) {
        return false;
      }
      last = time;
      try {
        await player(event.kind, settings.volume);
        return true;
      } catch {
        settings = {...settings, blocked: true};
        return false;
      }
    },
  };
}
let context: AudioContext | undefined;
async function playTone(kind: SoundEvent['kind'], volume: number) {
  if (typeof window === 'undefined' || !window.AudioContext) {
    throw new Error('Audio unavailable');
  }
  context ??= new AudioContext();
  if (context.state !== 'running') {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        context.resume(),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error('Audio blocked')), 500);
        }),
      ]);
    } finally {
      clearTimeout(timeout);
    }
  }
  if (context.state !== 'running') {
    throw new Error('Audio blocked');
  }
  const frequencies = {sent: 440, complete: 660, error: 220, stopped: 330};
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequencies[kind];
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(volume * 0.15, context.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.14);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}
