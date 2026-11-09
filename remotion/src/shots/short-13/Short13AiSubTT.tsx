import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import Short13AiSub from './Short13AiSub';
import { VO_EXT } from './vo-ext.gen';

// TikTok / Facebook cut of short-13 (63s, Creator Rewards needs >1 min): the 42s short up to the
// end of the twist (VO line 8 ends 36.85s), a 21s "the AI subscription test" segment, then the
// original payoff line + loop (36.9 → 42).
export const compositionConfig = {
  id: 'Short13AiSubTT',
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

const ToolRow: React.FC<{ name: string; cost: string; value: string; verdict: 'KEEP' | 'CANCEL'; at: number; judgeAt: number }> = ({
  name,
  cost,
  value,
  verdict,
  at,
  judgeAt,
}) => {
  const f = useCurrentFrame();
  const p = EASE(prog(f, at, at + 10));
  const v = EASE(prog(f, judgeAt, judgeAt + 8));
  const c = verdict === 'KEEP' ? GOLD : RED;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '22px 30px',
        marginTop: 18,
        borderRadius: 18,
        background: 'rgba(255,255,255,0.06)',
        border: `3px solid ${v > 0.5 ? c : 'rgba(255,255,255,0.18)'}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ color: INK, fontSize: 46, fontWeight: 800 }}>{name}</div>
        <div style={{ color: '#8b96a5', fontSize: 32, fontWeight: 600 }}>
          costs {cost} · earned/saved {value}
        </div>
      </div>
      <div
        style={{
          color: '#0f1216',
          background: c,
          fontSize: 38,
          fontWeight: 900,
          padding: '10px 18px',
          borderRadius: 12,
          opacity: v,
          transform: `scale(${1.4 - 0.4 * v})`,
        }}
      >
        {verdict}
      </div>
    </div>
  );
};

const Ext: React.FC = () => {
  const f = useCurrentFrame();
  const titleOp = 1 - prog(f, F(1.7), F(2.0));
  const listOp = prog(f, F(1.9), F(2.2)) * (1 - prog(f, F(18.2), F(18.5)));
  const close = EASE(prog(f, F(18.4), F(18.8)));
  return (
    <AbsoluteFill>
      <ShortsBackdrop base="#0f1216" glow="#1f2a1c" />
      <Kicker text="THE AI SUBSCRIPTION TEST" color={GOLD} y={200} at={0} until={F(18.3)} />

      <div style={{ opacity: titleOp }}>
        <BigTitle lines={[{ text: "HERE'S", color: '#ffffff' }, { text: 'THE TEST', color: GOLD }]} y={600} size={120} />
      </div>

      <div style={{ position: 'absolute', left: 90, right: 90, top: 430, opacity: listOp }}>
        <div style={{ color: '#8b96a5', fontSize: 38, fontWeight: 800, letterSpacing: 4, fontFamily: 'Inter, sans-serif' }}>
          YOUR AI TOOLS · THIS MONTH
        </div>
        <ToolRow name="AI tool #1" cost="$20" value="$300" verdict="KEEP" at={F(2.8)} judgeAt={F(11.4)} />
        <ToolRow name="AI tool #2" cost="$20" value="$0" verdict="CANCEL" at={F(3.2)} judgeAt={F(15.4)} />
        <ToolRow name="AI tool #3" cost="$10" value="$45" verdict="KEEP" at={F(3.6)} judgeAt={F(12.2)} />
      </div>

      <Stamp text="INVEST THE $20" at={F(16.4)} until={F(18.3)} color={GOLD} x={540} y={1150} size={92} rotate={-6} />

      <div style={{ position: 'absolute', top: 660, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter, sans-serif', opacity: close }}>
        <div style={{ color: '#ffffff', fontSize: 104, fontWeight: 900 }}>MAKE THE $20</div>
        <div style={{ color: GOLD, fontSize: 104, fontWeight: 900 }}>WORK FOR YOU</div>
      </div>

      <div style={{ position: 'absolute', top: 1660, left: 0, right: 0, textAlign: 'center', color: '#8b96a5', fontSize: 30, fontFamily: 'Inter, sans-serif' }}>
        Example numbers · educational, not financial advice
      </div>

      <Captions lines={VO_EXT} y={1390} accent={GOLD} />
    </AbsoluteFill>
  );
};

const Short13AiSubTT: React.FC = () => (
  <AbsoluteFill style={{ background: '#0f1216' }}>
    <Sequence from={0} durationInFrames={SPLIT}>
      <Short13AiSub hideProgress />
    </Sequence>
    <Sequence from={SPLIT} durationInFrames={EXT}>
      <Ext />
    </Sequence>
    <Sequence from={SPLIT + EXT}>
      <Sequence from={-SPLIT}>
        <Short13AiSub hideProgress />
      </Sequence>
    </Sequence>
    <ProgressBar color={RED} />
  </AbsoluteFill>
);

export default Short13AiSubTT;
