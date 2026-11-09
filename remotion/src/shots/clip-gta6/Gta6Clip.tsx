import React from 'react';
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { BEATS } from './beats.gen';

// =============================================================================
// Clip-account template v3 (third-party footage: Rockstar's official GTA VI launch trailer,
// pre-cut + sharpened into media/projects/gta6/src*.mp4 — gitignored, never committed).
// Everything around the footage is crisp vector graphics (no blurred-video background):
// retro neon sun + scrolling perspective grid, full-width footage band with neon rails,
// beat-synced zoom punches / flashes / micro-shake from the trailer's own audio onsets
// (beats.gen.ts), word-by-word headline pops, date chips, gradient progress bar.
// =============================================================================

const PINK = '#ff2e88';
const ORANGE = '#ffa23a';
const PURPLE = '#8a2be2';
const CYAN = '#2ee6ff';
const GRAD = `linear-gradient(100deg, ${PINK}, ${ORANGE})`;
const EASE = Easing.bezier(0.33, 1, 0.68, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type Gta6ClipProps = {
  src: string;
  beatsKey: string;
  daysLeft: number;
  endLines: [string, string];
};

// ---- beat envelope: 1 right on an onset, decaying over a few frames -------------------
const beatEnv = (f: number, beats: number[], tau: number) => {
  let v = 0;
  for (const b of beats) {
    if (b > f) break;
    const d = f - b;
    if (d < tau * 6) v = Math.max(v, Math.exp(-d / tau));
  }
  return v;
};

const Word: React.FC<{ text: string; delay: number; grad?: boolean; size: number; warm?: boolean }> = ({
  text,
  delay,
  grad,
  size,
  warm,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = warm ? 1 : spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
  return (
    <span
      style={{
        display: 'inline-block',
        margin: '0 12px',
        fontSize: size,
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 40}px) scale(${0.6 + 0.4 * s})`,
        ...(grad
          ? {
              background: GRAD,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: `drop-shadow(0 0 22px ${PINK}aa)`,
            }
          : { color: '#fff', textShadow: `0 0 18px ${PURPLE}, 0 6px 0 rgba(0,0,0,0.35)` }),
      }}
    >
      {text}
    </span>
  );
};

// a headline phase = lines of words; each word pops in turn
const Headline: React.FC<{
  from: number;
  to: number;
  lines: { words: string[]; size: number; grad?: boolean }[];
  warm?: boolean;
  scale?: number;
}> = ({ from, to, lines, warm, scale = 1 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const out = interpolate(f, [to - 5, to], [1, 0], clamp);
  let k = 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: 130,
        left: 30,
        right: 30,
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        lineHeight: 1.0,
        letterSpacing: -2,
        opacity: out,
        transform: `scale(${scale})`,
      }}
    >
      {lines.map((ln, i) => (
        <div key={i}>
          {ln.words.map((w) => (
            <Word key={k} text={w} delay={from + 3 * k++} grad={ln.grad} size={ln.size} warm={warm} />
          ))}
        </div>
      ))}
    </div>
  );
};

// ---- crisp background: retro sun + perspective grid --------------------------------------
const NeonBackdrop: React.FC<{ beat: number }> = ({ beat }) => {
  const f = useCurrentFrame();
  const scroll = (f * 4) % 80;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0b0420 0%, #1a0838 45%, #2b0a3d 70%, #0b0420 100%)' }}>
      {/* sun behind the headline */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 300,
          top: 40,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `linear-gradient(180deg, ${ORANGE} 0%, ${PINK} 60%, ${PURPLE} 100%)`,
          opacity: 0.32 + 0.12 * beat,
          maskImage:
            'repeating-linear-gradient(180deg, #000 0px, #000 34px, transparent 34px, transparent 46px)',
          WebkitMaskImage:
            'repeating-linear-gradient(180deg, #000 0px, #000 34px, transparent 34px, transparent 46px)',
          filter: `drop-shadow(0 0 60px ${PINK})`,
        }}
      />
      {/* floor grid under the footage */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1330, bottom: 0, perspective: 600, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            left: -540,
            right: -540,
            top: -scroll,
            height: 1400,
            transform: 'rotateX(62deg)',
            transformOrigin: 'top',
            backgroundImage: `linear-gradient(${PINK}cc 2px, transparent 2px), linear-gradient(90deg, ${PINK}cc 2px, transparent 2px)`,
            backgroundSize: '80px 80px',
            opacity: 0.55,
          }}
        />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0b0420 0%, transparent 35%, transparent 70%, #0b0420 100%)' }} />
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ label: string; accent: string }> = ({ label, accent }) => (
  <div
    style={{
      padding: '14px 28px',
      borderRadius: 999,
      background: 'rgba(11,4,32,0.85)',
      border: `3px solid ${accent}`,
      color: '#fff',
      fontFamily: FONT_DISPLAY,
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: 1,
      boxShadow: `0 0 26px ${accent}88, inset 0 0 12px ${accent}44`,
    }}
  >
    {label}
  </div>
);

export const Gta6Clip: React.FC<Gta6ClipProps> = ({ src, beatsKey, daysLeft, endLines }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const beats = BEATS[beatsKey] ?? [];
  const P1_END = Math.round(3.6 * fps);
  const P3_FROM = durationInFrames - Math.round(3.4 * fps);

  const hit = beatEnv(f, beats, 3.5); // fast punch
  const flash = beatEnv(f, beats, 1.6);
  const punch = 1.0 + 0.075 * hit;
  const shakeX = Math.sin(f * 2.3) * 7 * hit;
  const shakeY = Math.cos(f * 1.9) * 5 * hit;

  const settle = 1.08 - 0.08 * EASE(interpolate(f, [0, 18], [0, 1], clamp));
  const pulse = 1 + 0.06 * hit;

  const BAND = { top: 560, h: 760 };

  return (
    <AbsoluteFill style={{ background: '#0b0420' }}>
      <NeonBackdrop beat={hit} />

      {/* top label */}
      <div style={{ position: 'absolute', top: 86, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: 6,
            color: CYAN,
            padding: '8px 22px',
            borderRadius: 999,
            border: `2px solid ${CYAN}`,
            background: 'rgba(11,4,32,0.7)',
            textShadow: `0 0 12px ${CYAN}`,
            boxShadow: `0 0 16px ${CYAN}66`,
          }}
        >
          GTA VI · OFFICIAL LAUNCH TRAILER
        </div>
      </div>

      {/* PHASE 1 — money hook (composed at frame 0 = thumbnail) */}
      <Headline
        from={0}
        to={P1_END}
        warm
        scale={settle}
        lines={[
          { words: ['GTA', '5', 'MADE'], size: 74 },
          { words: ['$1', 'BILLION'], size: 158, grad: true },
          { words: ['IN', '3', 'DAYS'], size: 74 },
        ]}
      />
      {/* PHASE 2 — countdown, pulses on the beat */}
      <Headline
        from={P1_END}
        to={P3_FROM}
        scale={pulse}
        lines={[
          { words: ['GTA', '6', 'DROPS', 'IN'], size: 76 },
          { words: [`${daysLeft}`, 'DAYS'], size: 200, grad: true },
        ]}
      />
      {/* PHASE 3 — date */}
      <Headline
        from={P3_FROM}
        to={durationInFrames + 1}
        lines={[
          { words: endLines[0].split(' '), size: 84 },
          { words: endLines[1].split(' '), size: 118, grad: true },
        ]}
      />

      {/* full-width footage band with neon rails; beat punches live inside the band */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: BAND.top, height: BAND.h, overflow: 'hidden', background: '#000' }}>
        <OffthreadVideo
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `translate(${shakeX}px, ${shakeY}px) scale(${punch})`,
          }}
        />
        <AbsoluteFill style={{ background: '#fff', opacity: 0.22 * flash }} />
        {/* subtle scanline/vignette for the Vice City CRT feel */}
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(11,4,32,0.55) 100%)',
          }}
        />
      </div>
      {[BAND.top - 6, BAND.top + BAND.h].map((y) => (
        <div
          key={y}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y,
            height: 6,
            background: `linear-gradient(90deg, ${CYAN}, ${PINK}, ${ORANGE})`,
            boxShadow: `0 0 ${18 + 22 * hit}px ${PINK}`,
          }}
        />
      ))}

      {/* date chips */}
      <div style={{ position: 'absolute', top: 1362, width: '100%', display: 'flex', justifyContent: 'center', gap: 22 }}>
        <Chip label="📅 NOV 19, 2026" accent={PINK} />
        <Chip label={`⏳ ${daysLeft} DAYS LEFT`} accent={ORANGE} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1466,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: 26,
          color: 'rgba(255,255,255,0.72)',
        }}
      >
        Footage: Rockstar Games · official launch trailer
      </div>

      {/* progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.12)' }}>
        <div style={{ width: `${(f / (durationInFrames - 1)) * 100}%`, height: '100%', background: GRAD, boxShadow: `0 0 12px ${PINK}` }} />
      </div>
    </AbsoluteFill>
  );
};
