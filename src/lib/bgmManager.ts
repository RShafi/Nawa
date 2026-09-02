"use client";

/**
 * Single shared BGM instance — avoids duplicate 60MB+ decodes when arena modes switch.
 * Audio is created lazily on first user gesture (autoplay policy + memory).
 */

const FADE_MS = 600;
const TARGET_VOLUME = 0.35;

let audio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let fadeTimer: number | null = null;
let started = false;
let mutedState = false;
let listenersAttached = false;

function clearFade() {
  if (fadeTimer != null) {
    window.clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function fadeTo(target: number, ms = FADE_MS) {
  if (!audio) return;
  clearFade();
  const start = audio.volume;
  const steps = Math.max(1, Math.floor(ms / 40));
  let i = 0;
  fadeTimer = window.setInterval(() => {
    if (!audio) {
      clearFade();
      return;
    }
    i += 1;
    const t = Math.min(1, i / steps);
    audio.volume = Math.max(0, Math.min(1, start + (target - start) * t));
    if (t >= 1) {
      clearFade();
      if (target <= 0.001) audio.pause();
    }
  }, 40);
}

function ensureAudio(url: string): HTMLAudioElement {
  if (audio && currentUrl === url) return audio;
  stopBgm();
  audio = new Audio(url);
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0;
  currentUrl = url;
  return audio;
}

function tryPlay() {
  if (!audio) return;
  void audio.play().catch(() => {
    /* blocked until gesture */
  });
}

function onUnlock() {
  if (!audio || started) return;
  started = true;
  tryPlay();
  fadeTo(mutedState ? 0 : TARGET_VOLUME, mutedState ? 280 : FADE_MS);
  window.removeEventListener("pointerdown", onUnlock);
  window.removeEventListener("keydown", onUnlock);
  listenersAttached = false;
}

function attachUnlock() {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;
  window.addEventListener("pointerdown", onUnlock);
  window.addEventListener("keydown", onUnlock);
}

export function startBgm(url: string, muted: boolean) {
  mutedState = muted;
  ensureAudio(url);
  attachUnlock();
  if (started) {
    tryPlay();
    fadeTo(muted ? 0 : TARGET_VOLUME, muted ? 280 : FADE_MS);
  }
}

export function setBgmMuted(muted: boolean) {
  mutedState = muted;
  if (!audio || !started) return;
  if (muted) fadeTo(0, 280);
  else {
    tryPlay();
    fadeTo(TARGET_VOLUME, FADE_MS);
  }
}

export function fadeOutBgm() {
  fadeTo(0, FADE_MS);
}

export function stopBgm() {
  clearFade();
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    try {
      audio.load();
    } catch {
      /* ignore */
    }
    audio = null;
  }
  currentUrl = null;
  started = false;
  if (listenersAttached) {
    window.removeEventListener("pointerdown", onUnlock);
    window.removeEventListener("keydown", onUnlock);
    listenersAttached = false;
  }
}
