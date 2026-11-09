import React from 'react';
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

// =============================================================================
// Clip-account overlay for third-party footage (here: Rockstar's official GTA VI launch
// trailer, pre-cut to media/projects/gta6/src*.mp4 — gitignored, never committed).
// Vice City look: sunset gradient + blurred footage behind a framed, zoomed video panel,
// a 3-phase animated headline ($1B counter -> countdown -> CTA date), date chips, progress bar.
// Shared by Gta6ClipA (40s, YT/IG) and Gta6ClipB (63s, TikTok/FB).
// =============================================================================

const PINK = '#ff3d8b';
const ORANGE = '#ffa63d';
const PURPLE = '#7b2ff7';
const GRAD = `linear-gradient(100deg, ${PINK}, ${ORANGE})`;
const EASE = Easing.bezier(0.33, 1, 0.68, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type Gta6ClipProps = {
  src: string; // staticFile path
  daysLeft: number;
  endLines: [string, string];
};

const GradText: React.FC<{ children: React.ReactNode; size: number }> = ({ children, size }) => (
  <span
    style={{
      fontSize: size,
      background: GRAD,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      filter: 'drop-shadow(0 6px 18px rgba(255,61,139,0.45))',
    }}
  >
    {children}
  </span>
);

// one headline phase: pops in with a spring, fades out at `to`
const Phase: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from - 1 || f > to + 1) return null;
  const s = spring({ frame: f - from, fps, config: { damping: 14, stiffness: 180, mass: 0.7 } });
  const out = interpolate(f, [to - 6, to], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: 150,
        left: 50,
        right: 50,
        height: 330,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        color: '#fff',
        lineHeight: 1.02,
        letterSpacing: -1.5,
        textShadow: '0 6px 24px rgba(0,0,0,0.55)',
        opacity: Math.min(1, s * 1.4) * out,
        transform: `scale(${0.82 + 0.18 * s}) translateY(${(1 - s) * 30}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Chip: React.FC<{ label: string; at: number; accent: string }> = ({ label, at, accent }) => {
  const f = useCurrentFrame();
  const p = EASE(interpolate(f, [at, at + 12], [0, 1], clamp));
  return (
    <div
      style={{
        padding: '14px 26px',
        borderRadius: 999,
        background: 'rgba(12,6,24,0.72)',
        border: `3px solid ${accent}`,
        color: '#fff',
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: 1,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        boxShadow: `0 0 24px ${accent}66`,
      }}
    >
      {label}
    </div>
  );
};

export const Gta6Clip: React.FC<Gta6ClipProps> = ({ src, daysLeft, endLines }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const P1_END = Math.round(3.6 * fps);
  const P3_FROM = durationInFrames - Math.round(3.4 * fps);

  // frame 0 is the thumbnail: phase 1 is fully composed at f0 and only "settles" (1.08 -> 1)
  const settle = 1.08 - 0.08 * EASE(interpolate(f, [0, 18], [0, 1], clamp));

  // countdown number pulses on the beat in phase 2
  const pulse = 1 + 0.05 * Math.max(0, Math.sin(((f - P1_END) / fps) * Math.PI * 2));

  // slow push-in on the panel footage for energy
  const zoom = 1.32 + 0.06 * (f / durationInFrames);
  const panelIn = 1; // composed at frame 0 (thumbnail rule)

  const PANEL = { x: 40, y: 520, w: 1000, h: 700 };

  return (
    <AbsoluteFill style={{ background: '#12061f' }}>
      {/* moving blurred footage behind everything */}
      <AbsoluteFill style={{ filter: 'blur(38px) saturate(1.4)', transform: 'scale(1.25)', opacity: 0.55 }}>
        <OffthreadVideo src={staticFile(src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      {/* Vice City sunset wash */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(18,6,31,0.92) 0%, rgba(123,47,247,0.35) 30%, rgba(255,61,139,0.28) 62%, rgba(255,166,61,0.25) 78%, rgba(18,6,31,0.95) 100%)`,
        }}
      />

      {/* top label */}
      <div style={{ position: 'absolute', top: 92, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: 6,
            color: '#fff',
            padding: '8px 22px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          GTA VI · OFFICIAL LAUNCH TRAILER
        </div>
      </div>

      {/* PHASE 1 — the money hook */}
      <Phase from={-30} to={P1_END}>
        <div style={{ transform: `scale(${settle})` }}>
          <div style={{ fontSize: 68 }}>GTA 5 MADE</div>
          <GradText size={150}>$1 BILLION</GradText>
          <div style={{ fontSize: 68 }}>IN 3 DAYS</div>
        </div>
      </Phase>

      {/* PHASE 2 — countdown */}
      <Phase from={P1_END} to={P3_FROM}>
        <div style={{ fontSize: 70 }}>GTA 6 DROPS IN</div>
        <div style={{ transform: `scale(${pulse})` }}>
          <GradText size={190}>{daysLeft} DAYS</GradText>
        </div>
      </Phase>

      {/* PHASE 3 — the date */}
      <Phase from={P3_FROM} to={durationInFrames + 10}>
        <div style={{ fontSize: 80 }}>{endLines[0]}</div>
        <GradText size={110}>{endLines[1]}</GradText>
      </Phase>

      {/* the framed, zoomed footage panel (carries the audio) */}
      <div
        style={{
          position: 'absolute',
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.w,
          height: PANEL.h,
          padding: 6,
          borderRadius: 40,
          background: `linear-gradient(135deg, ${PINK}, ${ORANGE}, ${PURPLE})`,
          boxShadow: `0 20px 80px rgba(255,61,139,0.45)`,
          opacity: panelIn,
          transform: `scale(${0.96 + 0.04 * panelIn})`,
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden', background: '#000' }}>
          <OffthreadVideo
            src={staticFile(src)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }}
          />
        </div>
      </div>

      {/* date chips under the panel */}
      <div style={{ position: 'absolute', top: 1268, width: '100%', display: 'flex', justifyContent: 'center', gap: 22 }}>
        <Chip label="📅 NOV 19, 2026" at={-20} accent={PINK} />
        <Chip label={`⏳ ${daysLeft} DAYS LEFT`} at={-20} accent={ORANGE} />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1372,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: 26,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        Footage: Rockstar Games · official launch trailer
      </div>

      {/* progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.12)' }}>
        <div style={{ width: `${(f / (durationInFrames - 1)) * 100}%`, height: '100%', background: GRAD }} />
      </div>
    </AbsoluteFill>
  );
};
