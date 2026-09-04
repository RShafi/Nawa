"use client";

import { useCallback, useRef } from "react";

/** One Web Audio context for all procedural SFX — avoids per-component duplication. */
let sharedCtx: AudioContext | null = null;

export function suspendSharedAudioContext(): void {
  if (!sharedCtx || sharedCtx.state !== "running") return;
  void sharedCtx.suspend();
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (typeof document !== "undefined" && document.hidden) return null;

  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AC();
  }
  return sharedCtx;
}

function resumeContextIfNeeded(ac: AudioContext): boolean {
  if (typeof document !== "undefined" && document.hidden) return false;
  if (ac.state === "suspended") {
    void ac.resume();
  }
  return true;
}

/**
 * Zero-latency procedural SFX via Web Audio API (Desert Twilight feel).
 */
export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback(() => {
    const ac = getAudioContext();
    ctxRef.current = ac;
    return ac;
  }, []);

  const playTap = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 1.2;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(920, t0);
    osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.045);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.08);
  }, [ctx]);

  const playSnap = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t0);
    osc.frequency.exponentialRampToValueAtTime(1320, t0 + 0.04);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.25);
  }, [ctx]);

  const playSuccess = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    const freqs = [523.25, 659.25, 783.99]; // C–E–G celestial triad
    freqs.forEach((f, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const start = t0 + i * 0.05;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  }, [ctx]);

  const playError = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t0);
    osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.18);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.3);
  }, [ctx]);

  const playCast = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    // Whoosh noise + pitch ramp
    const bufferSize = Math.floor(ac.sampleRate * 0.35);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(400, t0);
    filter.frequency.exponentialRampToValueAtTime(2400, t0 + 0.28);
    filter.Q.value = 0.8;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    noise.start(t0);
    noise.stop(t0 + 0.36);

    const osc = ac.createOscillator();
    const og = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.exponentialRampToValueAtTime(720, t0 + 0.3);
    og.gain.setValueAtTime(0.0001, t0);
    og.gain.exponentialRampToValueAtTime(0.06, t0 + 0.05);
    og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
    osc.connect(og);
    og.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.34);
  }, [ctx]);

  const playImpact = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    osc.type = "square";
    osc.frequency.setValueAtTime(90, t0);
    osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.15);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.25);
  }, [ctx]);

  const playCelestialEtch = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    const freqs = [392, 523.25, 659.25, 783.99, 987.77];
    freqs.forEach((f, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const start = t0 + i * 0.07;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(i === freqs.length - 1 ? 0.16 : 0.09, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  }, [ctx]);

  /** Soft quill scratch — calligraphy stroke SFX. */
  const playQuillStroke = useCallback(() => {
    const ac = ctx();
    if (!ac || !resumeContextIfNeeded(ac)) return;
    const t0 = ac.currentTime;
    const bufferSize = Math.floor(ac.sampleRate * 0.18);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.35;
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.9;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    noise.start(t0);
    noise.stop(t0 + 0.22);
  }, [ctx]);

  return {
    playTap,
    playSnap,
    playSuccess,
    playError,
    playCast,
    playImpact,
    playCelestialEtch,
    playQuillStroke,
  };
}
