import type {ReactNode} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {NEWSREADER, JETBRAINS, C} from '../RadarIntro/theme';

// ── Easings ──────────────────────────────────────────────────────────────────
const WIPE   = Easing.bezier(0.76, 0, 0.24, 1);
const SMOOTH = Easing.bezier(0.22, 0.61, 0.36, 1);

// ── Helpers ───────────────────────────────────────────────────────────────────
function ip(
  f: number, from: number, to: number, a: number, b: number,
  ease: (t: number) => number = SMOOTH,
) {
  return interpolate(f, [from, to], [a, b], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
  });
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}
function spr(frame: number, fps: number, damping = 18) {
  return Math.min(1, spring({frame, fps, config: {mass: 1, damping}}));
}

// ── Shared shell ──────────────────────────────────────────────────────────────
function BlockShell({num, label, children}: {num: string; label: string; children: ReactNode}) {
  const f = useCurrentFrame();
  const eyeOp   = ip(f, 0, 15, 0, 1);
  const ruleScale = ip(f, 0, 20, 0, 1, WIPE);
  const exitOp  = ip(f, 130, 150, 1, 0);

  return (
    <AbsoluteFill style={{background: C.ink, opacity: exitOp}}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: 44, left: 80, right: 80,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: JETBRAINS, fontSize: 11, color: C.muted,
        letterSpacing: '0.14em', textTransform: 'uppercase' as const,
        opacity: eyeOp,
      }}>
        <span>[{num}]&nbsp;&nbsp;{label}</span>
        <span>Paris · FR →</span>
      </div>

      {children}

      {/* Bottom rule */}
      <div style={{
        position: 'absolute', bottom: 44, left: 80, right: 80,
        height: 1, background: 'rgba(255,255,255,.15)',
        transform: `scaleX(${ruleScale})`, transformOrigin: 'left',
      }} />
    </AbsoluteFill>
  );
}

// ── Title caption — sits directly under each illustration, conveys the
//    client-facing benefit (plain French, no jargon).
function BlockTitle({text, mt = 48}: {text: string; mt?: number}) {
  const f = useCurrentFrame();
  const op = ip(f, 20, 44, 0, 1);
  const y  = ip(f, 20, 44, 16, 0, WIPE);
  return (
    <div style={{
      marginTop: mt,
      fontFamily: NEWSREADER, fontSize: 44, fontWeight: 300,
      color: C.paper, letterSpacing: '-0.01em', textAlign: 'center',
      opacity: op, transform: `translateY(${y}px)`,
    }}>
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 01 — Direction artistique
// ─────────────────────────────────────────────────────────────────────────────
function Block01() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const colFade = ip(f, 110, 145, 1, 0);
  const y1 = lerp(-80, 0, spr(f - 25, fps));
  const o1 = ip(f, 25, 60, 0, 1);
  const y2 = lerp(80, 0, spr(f - 50, fps));
  const o2 = ip(f, 50, 85, 0, 1);

  return (
    <BlockShell num="01" label="Direction artistique">
      {/* 12 vertical columns */}
      {Array.from({length: 12}).map((_, i) => {
        const colScaleY = ip(f, i * 2, i * 2 + 30, 0, 1, WIPE);
        const x = 80 + i * (1760 / 11);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x, top: '50%', marginTop: -240,
            width: 1, height: 480,
            background: `rgba(255,255,255,${0.15 * colFade})`,
            transform: `scaleY(${colScaleY})`,
            transformOrigin: 'top',
          }} />
        );
      })}

      {/* Title */}
      <div style={{
        position: 'absolute', left: 160, top: '50%',
        transform: 'translateY(-50%)',
        fontFamily: NEWSREADER, fontSize: 140, fontWeight: 300,
        color: C.paper, lineHeight: 1.05,
      }}>
        <div style={{transform: `translateY(${y1}px)`, opacity: o1}}>
          Direction
        </div>
        <div style={{transform: `translateY(${y2}px)`, opacity: o2, fontStyle: 'italic'}}>
          artistique.
        </div>
      </div>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 02 — Design system
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_COLORS = [C.ink, C.paper, C.wash, C.muted] as const;
const PILL_W = 320, PILL_H = 72, PILL_R = 36;
// Perimeter of a stadium (pill): 2*(W-H) + π*H
const PILL_PERIM = 2 * (PILL_W - PILL_H) + Math.PI * PILL_H;

function Block02() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pillDash = ip(f, 55, 100, PILL_PERIM, 0, WIPE);
  const labelOp  = ip(f, 95, 130, 0, 1);
  const labelLS  = ip(f, 95, 130, 0.4, 0.14);

  return (
    <BlockShell num="02" label="Design system">
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 60}}>
        {/* Colour swatches */}
        <div style={{display: 'flex', gap: 24}}>
          {SWATCH_COLORS.map((color, i) => {
            const sc = spr(f - (5 + i * 10), fps);
            const op = ip(f, 5 + i * 10, 20 + i * 10, 0, 1);
            return (
              <div key={i} style={{
                width: 48, height: 48,
                borderRadius: 24,
                background: color,
                border: color === C.ink ? '1px solid rgba(255,255,255,.2)' : 'none',
                transform: `scale(${sc})`,
                opacity: op,
              }} />
            );
          })}
        </div>

        {/* Pill with SVG border */}
        <div style={{position: 'relative', width: PILL_W, height: PILL_H}}>
          <svg
            width={PILL_W} height={PILL_H}
            viewBox={`0 0 ${PILL_W} ${PILL_H}`}
            style={{position: 'absolute', inset: 0}}
          >
            <rect
              x={0.5} y={0.5}
              width={PILL_W - 1} height={PILL_H - 1}
              rx={PILL_R} ry={PILL_R}
              fill="none"
              stroke="white"
              strokeWidth={1}
              strokeDasharray={PILL_PERIM}
              strokeDashoffset={pillDash}
            />
          </svg>
          {/* Internal label */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: JETBRAINS, fontSize: 14, color: C.paper,
            letterSpacing: `${labelLS}em`,
            opacity: labelOp,
          }}>
            COMPOSANT
          </div>
        </div>

        <BlockTitle text="Une identité visuelle cohérente" mt={0} />
      </AbsoluteFill>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 03 — Développement React
// ─────────────────────────────────────────────────────────────────────────────
const CODE_LINES = [
  {text: '<App>',             indent: 0,  delay: 10},
  {text: '  <Page>',          indent: 32, delay: 30},
  {text: '    <Component />', indent: 64, delay: 50},
  {text: '  </Page>',         indent: 32, delay: 65},
  {text: '</App>',            indent: 0,  delay: 80},
] as const;

function CodeToken({text, highlight}: {text: string; highlight?: boolean}) {
  const parts = text.split(/(<|>|\/|  )/g);
  return (
    <span style={{fontFamily: JETBRAINS, fontSize: 28, lineHeight: 1.8}}>
      {parts.map((p, i) => {
        const col = p === '<' || p === '>' ? C.muted
                  : p === '/' ? C.faint
                  : highlight && (p === 'Component' || p.includes('Component')) ? '#a8d5c2'
                  : C.paper;
        return <span key={i} style={{color: col}}>{p}</span>;
      })}
    </span>
  );
}

function Block03() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const highlightT = ip(f, 100, 130, 0, 1);

  return (
    <BlockShell num="03" label="Développement React">
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div>
          {CODE_LINES.map((line, i) => {
            const sc = spr(f - line.delay, fps);
            const x  = lerp(-60, 0, sc);
            const op = ip(f, line.delay, line.delay + 8, 0, 1);
            const isComp = i === 2;
            return (
              <div key={i} style={{
                paddingLeft: line.indent,
                transform: `translateX(${x}px)`,
                opacity: op,
              }}>
                <CodeToken
                  text={line.text}
                  highlight={isComp && highlightT > 0.5}
                />
              </div>
            );
          })}
        </div>

        <BlockTitle text="Un site développé sur mesure" />
      </AbsoluteFill>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 04 — Headless CMS
// ─────────────────────────────────────────────────────────────────────────────
const CMS_BLOCKS = [
  {label: 'ARTICLE', cx: 660,  cy: 440},
  {label: 'IMAGE',   cx: 960,  cy: 440},
  {label: 'DATA',    cx: 1260, cy: 440},
] as const;
const CONN_X = 960, CONN_Y = 560;
const BROWSER = {x: 820, y: 600, w: 280, h: 180, rx: 12};

// Pre-compute line lengths
const LINE_LENGTHS = CMS_BLOCKS.map(b => {
  const dx = b.cx - CONN_X, dy = (b.cy + 32) - CONN_Y;
  return Math.sqrt(dx * dx + dy * dy);
});

function Block04() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const browserS = spr(f - 90, fps, 14);
  const browserOp = ip(f, 90, 115, 0, 1);

  return (
    <BlockShell num="04" label="Headless CMS">
      <AbsoluteFill>
        {/* Content blocks */}
        {CMS_BLOCKS.map((b, i) => {
          const sc = spr(f - (5 + i * 12), fps);
          const op = ip(f, 5 + i * 12, 20 + i * 12, 0, 1);
          return (
            <div key={i} style={{
              position: 'absolute',
              left: b.cx - 80, top: b.cy - 32,
              width: 160, height: 64,
              background: 'rgba(255,255,255,.08)',
              border: `1px solid ${C.line}`,
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${sc})`,
              opacity: op,
            }}>
              <span style={{fontFamily: JETBRAINS, fontSize: 11, color: C.muted, letterSpacing: '0.14em'}}>
                {b.label}
              </span>
            </div>
          );
        })}

        {/* SVG connection lines + dots */}
        <svg style={{position: 'absolute', inset: 0}} width={1920} height={1080}>
          {CMS_BLOCKS.map((b, i) => {
            const len = LINE_LENGTHS[i];
            const dash = ip(f, 50 + i * 10, 100 + i * 10, len, 0, WIPE);
            return (
              <line
                key={i}
                x1={b.cx} y1={b.cy + 32}
                x2={CONN_X} y2={CONN_Y}
                stroke="rgba(255,255,255,.25)"
                strokeWidth={1}
                strokeDasharray={len}
                strokeDashoffset={dash}
              />
            );
          })}
          {/* Connection dot */}
          <circle cx={CONN_X} cy={CONN_Y} r={5} fill={C.paper}
            opacity={ip(f, 80, 95, 0, 1)} />
        </svg>

        {/* Browser frame */}
        <div style={{
          position: 'absolute',
          left: BROWSER.x, top: BROWSER.y,
          width: BROWSER.w, height: BROWSER.h,
          border: `1px solid ${C.paper}`,
          borderRadius: BROWSER.rx,
          background: 'rgba(255,255,255,.04)',
          transform: `scale(${browserS})`,
          opacity: browserOp,
          transformOrigin: 'center top',
        }}>
          {/* Browser dots */}
          <div style={{display: 'flex', gap: 6, padding: '14px 16px'}}>
            {[0, 1, 2].map(d => (
              <div key={d} style={{width: 8, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.25)'}} />
            ))}
          </div>
          {/* Content placeholder lines */}
          <div style={{padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8}}>
            {[80, 60, 70].map((w, d) => (
              <div key={d} style={{height: 6, width: `${w}%`, background: 'rgba(255,255,255,.15)', borderRadius: 3}} />
            ))}
          </div>
        </div>

        {/* Title below the browser frame */}
        <div style={{position: 'absolute', top: 820, left: 0, right: 0}}>
          <BlockTitle text="Un contenu facile à gérer" mt={0} />
        </div>
      </AbsoluteFill>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 05 — Motion & WebGL
// ─────────────────────────────────────────────────────────────────────────────
const WAVE_TOTAL_LEN = 1100;
const WAVE_SVG_W = 960, WAVE_SVG_H = 200, WAVE_A = 70;

function getWavePath() {
  const N = 200;
  return Array.from({length: N}, (_, i) => {
    const x = (i / (N - 1)) * WAVE_SVG_W;
    const y = WAVE_SVG_H / 2 + WAVE_A * Math.sin(2 * Math.PI * 2 * (i / (N - 1)));
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}
const WAVE_PATH = getWavePath();

// 16 point positions (in screen coords relative to center)
const PT16_WAVE = Array.from({length: 16}, (_, i) => {
  const t = i / 15;
  return {x: t * WAVE_SVG_W - WAVE_SVG_W / 2, y: WAVE_A * Math.sin(2 * Math.PI * 2 * t)};
});
const PT16_SCATTER = Array.from({length: 16}, (_, i) => ({
  x: Math.sin(i * 2.4) * 200,
  y: Math.cos(i * 1.7) * 120,
}));
const PT16_LINE = Array.from({length: 16}, (_, i) => ({x: (i - 7.5) * 60, y: 0}));

function Block05() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const waveDash = ip(f, 5, 70, WAVE_TOTAL_LEN, 0, WIPE);
  const waveOp   = ip(f, 65, 100, 1, 0);
  const dotOp    = ip(f, 60, 78, 0, 1);

  return (
    <BlockShell num="05" label="Motion & WebGL">
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: WAVE_SVG_W, height: WAVE_SVG_H}}>
          {/* Sine wave */}
          <svg
            width={WAVE_SVG_W} height={WAVE_SVG_H}
            viewBox={`0 0 ${WAVE_SVG_W} ${WAVE_SVG_H}`}
            style={{position: 'absolute', inset: 0, opacity: waveOp}}
          >
            <path
              d={WAVE_PATH}
              fill="none"
              stroke={C.paper}
              strokeWidth={2}
              strokeDasharray={WAVE_TOTAL_LEN}
              strokeDashoffset={waveDash}
            />
          </svg>

          {/* 16 animated points */}
          {PT16_WAVE.map((wp, i) => {
            const p1 = spr(f - 65 - i * 2, fps, 14);
            const p2 = spr(f - 100 - i * 2, fps, 14);
            const sc = PT16_SCATTER[i];
            const ln = PT16_LINE[i];
            const px = lerp(lerp(wp.x, sc.x, p1), ln.x, p2);
            const py = lerp(lerp(wp.y, sc.y, p1), ln.y, p2);
            return (
              <div key={i} style={{
                position: 'absolute',
                left: WAVE_SVG_W / 2 + px - 3,
                top:  WAVE_SVG_H / 2 + py - 3,
                width: 6, height: 6, borderRadius: 3,
                background: C.paper,
                opacity: dotOp,
              }} />
            );
          })}
        </div>

        <BlockTitle text="Des animations qui captivent" mt={56} />
      </AbsoluteFill>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 06 — SEO / GEO
// ─────────────────────────────────────────────────────────────────────────────
function Block06() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pinY    = ip(f, 15, 100, 160, 0, SMOOTH);
  const rank    = Math.round(ip(f, 15, 100, 8, 1));
  const rankOp  = ip(f, 15, 30, 0, 1);
  const ringS   = spr(f - 80, fps, 10);
  const ringOp  = ip(f, 80, 110, 1, 0);
  const labelOp = ip(f, 100, 130, 0, 1);
  const labelX  = ip(f, 100, 130, -10, 0);

  return (
    <BlockShell num="06" label="SEO / GEO">
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0}}>
        {/* 9×5 dot grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)',
          gap: 20, marginBottom: 40,
        }}>
          {Array.from({length: 45}).map((_, i) => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,.15)',
              opacity: ip(f, i * 0.4, i * 0.4 + 15, 0, 1),
            }} />
          ))}
        </div>

        {/* Pin + rank */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 16,
          transform: `translateY(${pinY}px)`,
        }}>
          {/* Pin circle + ring */}
          <div style={{position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {/* Ring pulse */}
            <div style={{
              position: 'absolute',
              width: 40, height: 40, borderRadius: 20,
              border: '1.5px solid rgba(255,255,255,.6)',
              transform: `scale(${1 + ringS})`,
              opacity: ringOp,
            }} />
            {/* Pin dot */}
            <div style={{width: 14, height: 14, borderRadius: 7, background: C.paper}} />
          </div>

          {/* Rank number */}
          <div style={{
            fontFamily: NEWSREADER, fontSize: 120, fontWeight: 300,
            color: C.paper, lineHeight: 1, opacity: rankOp,
          }}>
            #{rank}
          </div>
        </div>

        {/* Location label */}
        <div style={{
          fontFamily: JETBRAINS, fontSize: 12, color: C.muted,
          letterSpacing: '0.16em', marginTop: 16,
          opacity: labelOp, transform: `translateX(${labelX}px)`,
        }}>
          Paris · FR
        </div>

        <BlockTitle text="Trouvé en premier sur Google" mt={40} />
      </AbsoluteFill>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 07 — Performance
// ─────────────────────────────────────────────────────────────────────────────
const CWV = [
  {label: 'LCP', value: '1.2s',  delay: 100},
  {label: 'FID', value: '12ms',  delay: 110},
  {label: 'CLS', value: '0.01',  delay: 120},
] as const;

function Block07() {
  const f = useCurrentFrame();

  const barContainerOp = ip(f, 10, 20, 0, 1);
  const barScale = ip(f, 20, 110, 0, 1, WIPE);
  const score    = Math.round(ip(f, 20, 110, 0, 100, SMOOTH));
  const scoreOp  = ip(f, 18, 35, 0, 1);

  return (
    <BlockShell num="07" label="Performance">
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32}}>
        {/* Score counter */}
        <div style={{
          fontFamily: NEWSREADER, fontSize: 180, fontWeight: 300,
          color: C.paper, lineHeight: 1,
          opacity: scoreOp,
        }}>
          {score}
        </div>

        {/* Bar */}
        <div style={{
          width: 600, opacity: barContainerOp,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{
            width: '100%', height: 1,
            background: 'rgba(255,255,255,.15)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: '100%',
              background: C.paper,
              transform: `scaleX(${barScale})`,
              transformOrigin: 'left',
            }} />
          </div>
        </div>

        {/* Core Web Vitals */}
        <div style={{display: 'flex', gap: 60}}>
          {CWV.map(({label, value, delay}) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              opacity: ip(f, delay, delay + 25, 0, 1),
              transform: `translateY(${ip(f, delay, delay + 25, 8, 0)}px)`,
            }}>
              <span style={{fontFamily: JETBRAINS, fontSize: 11, color: C.muted, letterSpacing: '0.14em'}}>
                {label}
              </span>
              <span style={{fontFamily: NEWSREADER, fontSize: 28, fontWeight: 300, color: C.paper}}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <BlockTitle text="Un site qui se charge en un instant" mt={16} />
      </AbsoluteFill>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 08 — Accessibilité
// ─────────────────────────────────────────────────────────────────────────────
const PILL8_W = 240, PILL8_H = 56, PILL8_R = 28;
// Focus ring: pill + 6px offset on each side → 252×68, r=34
const FOCUS_W = 252, FOCUS_H = 68, FOCUS_R = 34;
const FOCUS_PERIM = 2 * (FOCUS_W - FOCUS_H) + Math.PI * FOCUS_H; // = 2*184 + π*68 = 368 + 213.6 = 581.6

function Block08() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pillS   = spr(f - 5, fps);
  const pillOp  = ip(f, 5, 25, 0, 1);

  const focusDash  = ip(f, 30, 75, FOCUS_PERIM, 0, WIPE);
  const focusRingS = lerp(1.3, 1, spr(f - 30, fps, 10));

  const ratioOp = ip(f, 75, 115, 0, 1);
  const ratioY  = ip(f, 75, 115, 14, 0);

  const badgeS  = spr(f - 105, fps);
  const badgeOp = ip(f, 105, 130, 0, 1);

  return (
    <BlockShell num="08" label="Accessibilité">
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 48}}>
        {/* Pill button + focus ring */}
        <div style={{position: 'relative', width: FOCUS_W, height: FOCUS_H, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {/* Focus ring SVG */}
          <svg
            width={FOCUS_W} height={FOCUS_H}
            viewBox={`0 0 ${FOCUS_W} ${FOCUS_H}`}
            style={{
              position: 'absolute', inset: 0,
              transform: `scale(${focusRingS})`,
            }}
          >
            <rect
              x={0.5} y={0.5}
              width={FOCUS_W - 1} height={FOCUS_H - 1}
              rx={FOCUS_R} ry={FOCUS_R}
              fill="none"
              stroke="rgba(255,255,255,.7)"
              strokeWidth={1.5}
              strokeDasharray={5}
              strokeDashoffset={focusDash}
            />
          </svg>

          {/* The pill button itself */}
          <div style={{
            width: PILL8_W, height: PILL8_H,
            border: `1px solid ${C.paper}`,
            borderRadius: PILL8_R,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${lerp(0.85, 1, pillS)})`,
            opacity: pillOp,
          }}>
            <span style={{
              fontFamily: JETBRAINS, fontSize: 12,
              color: C.paper, letterSpacing: '0.14em',
            }}>
              PRENDRE CONTACT
            </span>
          </div>
        </div>

        {/* Contrast ratio */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          opacity: ratioOp,
          transform: `translateY(${ratioY}px)`,
        }}>
          <span style={{
            fontFamily: NEWSREADER, fontSize: 64, fontWeight: 300,
            color: C.paper, lineHeight: 1,
          }}>
            4.5 : 1
          </span>

          {/* AA badge */}
          <div style={{
            background: C.paper,
            borderRadius: 20,
            padding: '8px 20px',
            transform: `scale(${lerp(0, 1, badgeS)})`,
            opacity: badgeOp,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              fontFamily: JETBRAINS, fontSize: 14, fontWeight: 700,
              color: C.ink, letterSpacing: '0.06em',
            }}>
              AA ✓
            </span>
          </div>
        </div>

        <BlockTitle text="Accessible à tous, sans exception" mt={0} />
      </AbsoluteFill>
    </BlockShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPOSITION
// ─────────────────────────────────────────────────────────────────────────────
export function MarqueeMotion() {
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Sequence from={0}    durationInFrames={150}><Block01 /></Sequence>
      <Sequence from={150}  durationInFrames={150}><Block02 /></Sequence>
      <Sequence from={300}  durationInFrames={150}><Block03 /></Sequence>
      <Sequence from={450}  durationInFrames={150}><Block04 /></Sequence>
      <Sequence from={600}  durationInFrames={150}><Block05 /></Sequence>
      <Sequence from={750}  durationInFrames={150}><Block06 /></Sequence>
      <Sequence from={900}  durationInFrames={150}><Block07 /></Sequence>
      <Sequence from={1050} durationInFrames={150}><Block08 /></Sequence>
    </AbsoluteFill>
  );
}
