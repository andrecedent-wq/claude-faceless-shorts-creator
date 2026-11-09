import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { ChartFrame, Curve, EndDot, GapArea, Legend, ShareBar, Ticker, contribSeries, lastPt, makeScale, money } from '../../lib/chart';
import { VO } from './vo.gen';

// short-13 · AI + money — "Your $20 AI subscription costs you $52,000"
// Same persistent-chart grammar as short-10: frame 0 is the payoff, the setup rewinds it,
// the reveal re-draws it, and the loop lands back on frame 0.
export const compositionConfig = {
  id: 'Short13AiSub',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e'; // the $20 invested instead
const RED = '#ef5f6b'; // the $20 paid to the subscription
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH (render-time, same formula as beats.json.money): $20/mo, 40 yrs, 7%/yr monthly
// compounding, deposit at month end -> $52,496 invested vs $9,600 paid; 81.7% is compounding.
const INVESTED = contribSeries(20, 0.07, 40);
const PAID = contribSeries(20, 0, 40);
const INV_FINAL = lastPt(INVESTED).y; // 52_496.27
const PAID_FINAL = lastPt(PAID).y; //  9_600
const COMP_SHARE = (INV_FINAL - PAID_FINAL) / INV_FINAL; // 0.817

const BOX = { x: 150, y: 540, w: 760, h: 520 };
const S = makeScale([0, 40], [0, 60_000], BOX);
const kfmt = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1).replace('.0', '')}K` : `$${Math.round(v)}`);

// CUES — from the REAL ElevenLabs word times (vo.gen.ts). Global frames.
const HOOK_OUT = F(4.4);
const REWIND_IN = F(4.8); // "Twenty bucks a month…"
const REWIND_OUT = F(7.0);
const LEGEND_IN = F(5.4);
const PAID_IN = F(9.5); // "nine thousand six hundred dollars you actually pay" 9.54–11.7
const PAID_OUT = F(11.6);
const PAUSE_FROM = F(13.6); // "Pause." @ 13.70
const PAUSE_DUR = F(3.75);
const GROW_IN = F(17.4); // "Forty years at seven percent, and the line takes off." — off @ 20.11
const GROW_OUT = F(20.5);
const RED_SAY = F(21.3); // "Nine thousand six hundred paid," 21.30–23.0
const RED_SAY_END = F(23.1);
const GOLD_SAY = F(23.6); // "fifty two thousand invested." 23.61–25.2
const GOLD_SAY_END = F(25.4);
const COUNT_IN = F(27.5); // "…fifty two thousand, five hundred dollars." 27.63–29.6
const COUNT_OUT = F(29.5);
const SHARE_IN = F(30.3); // "Eighty two percent…" @ 30.40
const SLICE_IN = F(30.6);
const SLICE_OUT = F(31.6);
const LOOP = F(38.9); // after "Make your AI pay you. Or it's…" — restores through "gone." (40.59)
const END = F(42.0);

const bump = (f: number, a: number, b: number) => Math.min(prog(f, a, a + 5), 1 - prog(f, b - 9, b));

const Short13AiSub: React.FC<{ hideProgress?: boolean }> = ({ hideProgress = false }) => {
  const f = useCurrentFrame();
  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const rewound = EASE_INOUT(prog(f, REWIND_IN, REWIND_OUT));
  const growth = Math.max(1 - rewound, EASE_INOUT(prog(f, GROW_IN, GROW_OUT)));
  const paid = Math.max(1 - rewound, EASE_INOUT(prog(f, PAID_IN, PAID_OUT)));
  const count = Math.max(1 - rewound, EASE_INOUT(prog(f, COUNT_IN, COUNT_OUT)));
  const headLabels = prog(growth, 0.45, 0.7);
  const goldPulse = bump(f, GOLD_SAY, GOLD_SAY_END);
  const redPulse = bump(f, RED_SAY, RED_SAY_END);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 15) + prog(f, LOOP + 8, LOOP + 30));
  const legendOp = prog(f, LEGEND_IN, LEGEND_IN + 14) * (1 - prog(f, LOOP + 4, LOOP + 22));
  const shareOp = prog(f, SHARE_IN, SHARE_IN + 12) * (1 - prog(f, LOOP, LOOP + 12));
  const tickerLive = Math.max(1 - rewound, prog(f, COUNT_IN - 10, COUNT_IN));
  const tickerOp = Math.min(1, tickerLive * (1 - prog(f, SHARE_IN, SHARE_IN + 10)) + prog(f, LOOP + 4, LOOP + 18));
  const sliceP = EASE_INOUT(prog(f, SLICE_IN, SLICE_OUT)) * (1 - prog(f, LOOP, LOOP + 10));

  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop base="#0f1216" glow="#2a1c22" />
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'YOUR $20 AI SUB', color: '#ffffff' },
              { text: 'COSTS $52K', color: RED },
            ]}
            subtitle="over 40 years"
            y={150}
            size={84}
            warm
          />
        </div>

        <Kicker text="$20/MO · 40 YEARS" color={GOLD} y={200} at={REWIND_IN} until={F(9.0)} />
        <Kicker text="WHAT YOU PAY" color={RED} y={200} at={F(9.2)} until={F(13.4)} />
        <Kicker text="INVESTED AT 7%" color={GOLD} y={200} at={GROW_IN} until={F(30.2)} />
        <Kicker text="82% = COMPOUNDING" color={RED} y={200} at={SHARE_IN} until={F(38.8)} />

        <ChartFrame scale={S} yTicks={[0, 20_000, 40_000, 60_000]} xTicks={[0, 10, 20, 30, 40]} />

        <GapArea scale={S} upper={INVESTED} lower={PAID} color={GOLD} p={Math.min(growth, paid)} opacity={0.22} />
        <Curve scale={S} pts={PAID} color={RED} p={paid} width={8} />
        <Curve scale={S} pts={INVESTED} color={GOLD} p={growth} width={8} />

        <EndDot scale={S} pts={INVESTED} p={growth} color={GOLD} label="invested" dy={-56} anchor="end" plate pulse={goldPulse} opacity={headLabels} format={kfmt} />
        <EndDot scale={S} pts={PAID} p={paid} color={RED} label="you paid" dy={-56} anchor="end" plate pulse={redPulse} opacity={prog(paid, 0.6, 0.85)} format={kfmt} />

        <Legend
          items={[
            { color: GOLD, text: '$20/mo invested · 7%' },
            { color: RED, text: '$20/mo paid to the app' },
          ]}
          x={196}
          y={572}
          opacity={legendOp}
        />

        <Ticker value={INV_FINAL} p={count} label="real cost of a $20/mo sub" color={RED} x={540} y={1215} size={96} format={money} opacity={tickerOp} />

        <ShareBar
          x={150}
          y={1160}
          w={760}
          share={COMP_SHARE}
          p={sliceP}
          keepColor={GOLD}
          lostColor={RED}
          lostLabel={`${Math.round(COMP_SHARE * 100)}% COMPOUNDING`}
          keepLabel="$9.6K YOU PAID"
          opacity={shareOp}
        />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="what would $20/mo become?" durSec={3.75} accent={GOLD} y={800} />
      </Sequence>

      <Captions lines={VO} y={1390} accent={GOLD} />
      {!hideProgress && <ProgressBar color={RED} />}
    </AbsoluteFill>
  );
};

export default Short13AiSub;
