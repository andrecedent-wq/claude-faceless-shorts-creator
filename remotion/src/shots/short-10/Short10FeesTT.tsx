import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import Short10Fees from './Short10Fees';
import { VO_EXT } from './vo-ext.gen';

// =============================================================================
// TikTok cut of short-10 (63s). TikTok Creator Rewards only pays on videos over 1 minute, so
// this splices a 21s "how to check your fee" segment in after the TWIST ("…twenty four percent
// of everything he saved.", ends 36.71s), then resumes the original at its payoff line + loop.
//   0 ─ 36.9s  Short10Fees as-is
//   36.9 ─ 57.9s  EXT (this file, VO from shorts/short-10-fees/tiktok-ext/beats.json)
//   57.9 ─ 63s  Short10Fees frames 36.9 → 42 (payoff line, loop back to the hook)
// =============================================================================
export const compositionConfig = {
  id: 'Short10FeesTT',
  durationInSeconds: 63,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const INK = '#e9edf2';
const EASE = Easing.bezier(0.33, 1, 0.68, 1);
const F = (s: number) => Math.round(s * 30);
const SPLIT = F(36.9);
const EXT = F(21);

const Row: React.FC<{ label: string; value: string; at: number; color: string }> = ({ label, value, at, color }) => {
  const f = useCurrentFrame();
  const p = EASE(prog(f, at, at + 10));
  const glow = Math.max(0, 1 - prog(f, at + 10, at + 40));
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '26px 36px',
        marginTop: 18,
        borderRadius: 18,
        background: `rgba(255,255,255,${0.05 + 0.08 * glow})`,
        border: `3px solid ${color}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span style={{ color: INK, fontSize: 52, fontWeight: 700 }}>{label}</span>
      <span style={{ color, fontSize: 64, fontWeight: 900 }}>{value}</span>
    </div>
  );
};

const FeeBar: React.FC<{ label: string; pct: number; color: string; y: number; at: number; dur: number }> = ({
  label,
  pct,
  color,
  y,
  at,
  dur,
}) => {
  const f = useCurrentFrame();
  const show = EASE(prog(f, at - 8, at));
  const grow = EASE(prog(f, at, at + dur));
  const W = 760;
  const w = Math.max(14, W * (pct / 1.0) * grow);
  return (
    <div style={{ position: 'absolute', left: 150, top: y, width: W, opacity: show, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ color: INK, fontSize: 44, fontWeight: 700, marginBottom: 14 }}>{label}</div>
      <div style={{ height: 70, width: W, borderRadius: 14, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ height: 70, width: w, borderRadius: 14, background: color, boxShadow: `0 0 30px ${color}88` }} />
      </div>
      <div style={{ color, fontSize: 88, fontWeight: 900, marginTop: 8 }}>{(pct * grow).toFixed(2)}%</div>
    </div>
  );
};

const Ext: React.FC = () => {
  const f = useCurrentFrame();
  const titleOp = 1 - prog(f, F(2.2), F(2.5));
  const cardOp = prog(f, F(2.3), F(2.6)) * (1 - prog(f, F(7.1), F(7.4)));
  const barsOp = 1 - prog(f, F(16.7), F(17.0));
  const closeA = EASE(prog(f, F(17.0), F(17.3)));
  const closeB = EASE(prog(f, F(18.4), F(18.7)));
  return (
    <AbsoluteFill>
      <ShortsBackdrop base="#0f1216" glow="#1f2a1c" />
      <Kicker text="CHECK YOUR FEE" color={GOLD} y={200} at={0} until={F(16.8)} />

      <div style={{ opacity: titleOp }}>
        <BigTitle lines={[{ text: 'HOW TO CHECK', color: '#ffffff' }, { text: 'YOURS', color: GOLD }]} y={560} size={110} />
      </div>

      <div style={{ position: 'absolute', left: 110, right: 110, top: 520, opacity: cardOp }}>
        <div style={{ color: '#8b96a5', fontSize: 40, fontWeight: 800, letterSpacing: 4, fontFamily: 'Inter, sans-serif' }}>
          YOUR FUND · FACT SHEET
        </div>
        <Row label="Expense ratio" value="?.??%" at={F(3.2)} color={GOLD} />
        <Row label="+ Advisor fee" value="?.??%" at={F(5.0)} color={RED} />
      </div>

      <div style={{ opacity: barsOp }}>
        <FeeBar label="Typical fund + advisor" pct={1.0} color={RED} y={470} at={F(7.4)} dur={F(1.2)} />
        <FeeBar label="S&P 500 index fund" pct={0.03} color={GOLD} y={800} at={F(10.3)} dur={F(1.3)} />
        <Stamp text="33× CHEAPER" at={F(13.6)} until={F(16.9)} color={GOLD} x={540} y={1210} size={100} rotate={-6} />
      </div>

      <div style={{ position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ color: '#ffffff', fontSize: 120, fontWeight: 900, opacity: closeA, transform: `scale(${0.9 + 0.1 * closeA})` }}>
          SAME MARKET.
        </div>
        <div style={{ color: GOLD, fontSize: 120, fontWeight: 900, opacity: closeB, transform: `scale(${0.9 + 0.1 * closeB})` }}>
          KEEP MORE.
        </div>
      </div>

      <div style={{ position: 'absolute', top: 1660, left: 0, right: 0, textAlign: 'center', color: '#8b96a5', fontSize: 30, fontFamily: 'Inter, sans-serif' }}>
        Educational, not financial advice · hypothetical returns
      </div>

      <Captions lines={VO_EXT} y={1390} accent={GOLD} />
    </AbsoluteFill>
  );
};

const Short10FeesTT: React.FC = () => (
  <AbsoluteFill style={{ background: '#0f1216' }}>
    <Sequence from={0} durationInFrames={SPLIT}>
      <Short10Fees hideProgress />
    </Sequence>
    <Sequence from={SPLIT} durationInFrames={EXT}>
      <Ext />
    </Sequence>
    <Sequence from={SPLIT + EXT}>
      <Sequence from={-SPLIT}>
        <Short10Fees hideProgress />
      </Sequence>
    </Sequence>
    <ProgressBar color={RED} />
  </AbsoluteFill>
);

export default Short10FeesTT;
