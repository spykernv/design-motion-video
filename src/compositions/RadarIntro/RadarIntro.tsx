import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import {NEWSREADER, JETBRAINS, C} from './theme';

// ── Timing at 30 fps ─────────────────────────────────────────────────────────
//   S1  0:00.0 →  0:00.8   Silence noir
//   S2  0:00.8 →  0:03.0   Loader RADAR        (starts at 24)
//   S3  0:03.0 →  0:04.4   Wipe reveal          (starts at 90)
//   S4  0:04.0 →  0:05.2   Nav appear           (starts at 120, overlaps S3)
//   S5  0:05.0 →  0:08.5   Hero + titre         (starts at 150, extended +16)
//   S6  0:08.5 →  0:12.5   Living grid          (curtain at 255, content at 271)
//   S7  0:12.5 →  0:16.5   Manifeste            (starts at 375, extended +16)
//   S8  0:16.5 →  0:20.0   Contact + end card   (curtain at 495, content at 511)
// ─────────────────────────────────────────────────────────────────────────────
const S2 = 24;
const S3 = 90;
const S4 = 120;
const S5 = 150;
const S6 = 255;
const S6C = 271;   // grid content start (after curtain in)
const S7 = 375;
const S8 = 495;
const S8C = 511;   // contact content start (after curtain in)
const TOTAL = 600;

// ── Easing curves ────────────────────────────────────────────────────────────
const WIPE = Easing.bezier(0.76, 0, 0.24, 1); // "claquée" — signature du site
const MED  = Easing.bezier(0.22, 0.61, 0.36, 1);

// ── Interpolation helper (always clamped) ────────────────────────────────────
function ip(
  f: number,
  from: number, to: number,
  a: number, b: number,
  ease: (t: number) => number = MED,
) {
  return interpolate(f, [from, to], [a, b], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — LOADER RADAR
// ─────────────────────────────────────────────────────────────────────────────

function Letter({char, delay}: {char: string; delay: number}) {
  const f = useCurrentFrame();
  const y = ip(f, delay, delay + 24, 130, 0, WIPE);
  return (
    <div style={{overflow: 'hidden', lineHeight: '0.95', display: 'inline-block'}}>
      <span style={{display: 'block', transform: `translateY(${y}px)`}}>{char}</span>
    </div>
  );
}

function LoaderScene() {
  const f = useCurrentFrame();
  const barScale = ip(f, 12, 44, 0, 1, WIPE);
  const metaOp   = ip(f, 27, 42, 0, 1);
  const metaY    = ip(f, 27, 42, 4, 0);

  return (
    <AbsoluteFill style={{
      background: C.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20,
    }}>
      {/* R A D A R */}
      <div style={{
        fontFamily: NEWSREADER,
        fontSize: 108,
        fontWeight: 300,
        color: C.paper,
        letterSpacing: '0.06em',
        display: 'flex',
        gap: 4,
      }}>
        {['R', 'A', 'D', 'A', 'R'].map((ch, i) => (
          <Letter key={i} char={ch} delay={i * 2} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        width: 240,
        height: 1,
        background: 'rgba(255,255,255,0.2)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.8)',
          transform: `scaleX(${barScale})`,
          transformOrigin: 'left',
        }} />
      </div>

      {/* Meta mono */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: 240,
        fontFamily: JETBRAINS,
        fontSize: 10.5,
        color: 'rgba(255,255,255,0.5)',
        opacity: metaOp,
        transform: `translateY(${metaY}px)`,
        letterSpacing: '0.06em',
      }}>
        <span>Studio de création web</span>
        <span>Paris · FR</span>
      </div>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — WIPE REVEAL
// (dark panel clips away upward, white background appears underneath)
// ─────────────────────────────────────────────────────────────────────────────

function WipeReveal() {
  const f = useCurrentFrame();
  // inset(top right bottom left) — bottom value 0→100 clips the panel upward
  const bottom = ip(f, 0, 35, 0, 100, WIPE);
  return (
    <AbsoluteFill style={{
      background: C.ink,
      clipPath: `inset(0 0 ${bottom}% 0)`,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4 — NAV BAR
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = ['01 INDEX', '02 SAVOIR-FAIRE', '03 STUDIO', '04 CONTACT'];

function NavBar() {
  const f = useCurrentFrame();
  const navY = ip(f, 3, 30, -100, 0, WIPE);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      mixBlendMode: 'difference',
      transform: `translateY(${navY}%)`,
      padding: '28px 60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: NEWSREADER,
        fontSize: 21,
        fontWeight: 400,
        color: C.paper,
        display: 'flex', alignItems: 'center', gap: 3,
        letterSpacing: '-0.01em',
      }}>
        Radar
        <span style={{
          fontSize: 9,
          display: 'inline-block',
          transform: `scale(${ip(f, 6, 16, 0, 1)})`,
          transformOrigin: 'center',
        }}>●</span>
      </div>

      {/* Links */}
      <div style={{display: 'flex', gap: 36, alignItems: 'center'}}>
        {NAV_LINKS.map((link, i) => (
          <span key={i} style={{
            fontFamily: JETBRAINS,
            fontSize: 11,
            color: C.paper,
            letterSpacing: '0.16em',
            textTransform: 'uppercase' as const,
            opacity: ip(f, 6 + i * 1.5, 18 + i * 1.5, 0, 1),
          }}>
            {link}
          </span>
        ))}
      </div>

      {/* CTA pill */}
      <div style={{
        fontFamily: JETBRAINS,
        fontSize: 10,
        color: C.paper,
        border: '1px solid rgba(255,255,255,0.5)',
        padding: '8px 18px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        opacity: ip(f, 12, 24, 0, 1),
      }}>
        Prendre contact
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5 — HERO GRID + TITRE
// ─────────────────────────────────────────────────────────────────────────────

function WordReveal({text, delay, italic}: {text: string; delay: number; italic?: boolean}) {
  const f = useCurrentFrame();
  const y  = ip(f, delay, delay + 18, 70, 0, WIPE);
  const op = ip(f, delay, delay + 6, 0, 1);
  return (
    <div style={{overflow: 'hidden', lineHeight: '0.95', display: 'block'}}>
      <span style={{
        display: 'block',
        transform: `translateY(${y}px)`,
        opacity: op,
        fontStyle: italic ? 'italic' : 'normal',
      }}>
        {text}
      </span>
    </div>
  );
}

function HeroScene() {
  const f = useCurrentFrame();
  const gridOp     = ip(f, 0, 54, 0, 0.7);
  const eyebrowOp  = ip(f, 6, 16, 0, 1);
  const eyebrowX   = ip(f, 6, 16, -8, 0);
  const ruleScale  = ip(f, 6, 22, 0, 1, WIPE);
  const ledeOp     = ip(f, 18, 36, 0, 1);
  const ledeY      = ip(f, 18, 36, 26, 0);
  const metaScale  = ip(f, 22, 38, 0, 1);

  return (
    <AbsoluteFill style={{background: C.paper}}>
      {/* Subtle grid background */}
      <AbsoluteFill style={{
        opacity: gridOp,
        backgroundImage: [
          'linear-gradient(rgba(11,11,11,.055) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(11,11,11,.055) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '100px 100px',
        maskImage: 'radial-gradient(ellipse 75% 65% at 82% 0%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 82% 0%, black 20%, transparent 100%)',
      }} />

      {/* Main content */}
      <div style={{
        position: 'absolute',
        top: 130, left: 60, right: 60,
      }}>
        {/* Eyebrow */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 44,
          opacity: eyebrowOp,
          transform: `translateX(${eyebrowX}px)`,
        }}>
          <div style={{
            width: 80, height: 1,
            background: C.line2,
            transform: `scaleX(${ruleScale})`,
            transformOrigin: 'left',
          }} />
          <span style={{
            fontFamily: JETBRAINS,
            fontSize: 10,
            color: C.muted,
            letterSpacing: '0.22em',
            textTransform: 'uppercase' as const,
          }}>
            01 · Radar
          </span>
        </div>

        {/* Display title — word by word reveal */}
        <div style={{
          fontFamily: NEWSREADER,
          fontSize: 148,
          fontWeight: 300,
          color: C.ink,
          letterSpacing: '-0.02em',
          lineHeight: '0.92',
          marginBottom: 52,
        }}>
          <WordReveal text="Studio" delay={0} />
          <WordReveal text="de création" delay={4} italic />
          <WordReveal text="web." delay={8} />
        </div>

        {/* Lede + meta */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
          <p style={{
            fontFamily: NEWSREADER,
            fontSize: 22,
            fontWeight: 400,
            color: C.ink2,
            opacity: ledeOp,
            transform: `translateY(${ledeY}px)`,
            maxWidth: 520,
            lineHeight: 1.5,
            margin: 0,
          }}>
            Nous façonnons des expériences web qui durent.
          </p>
          <span style={{
            fontFamily: JETBRAINS,
            fontSize: 10,
            color: C.muted,
            letterSpacing: '0.18em',
            display: 'inline-block',
            transform: `scale(${metaScale})`,
            transformOrigin: 'right bottom',
          }}>
            Paris · FR ↘
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 6 — LIVING GRID
// ─────────────────────────────────────────────────────────────────────────────

type CardDef = {cols: number; height: number; label: string; tags: string[]};
const CARDS: CardDef[] = [
  {cols: 7, height: 310, label: 'Halle des Forges', tags: ['WEB DESIGN', 'BRANDING']},
  {cols: 5, height: 310, label: 'Atelier Lemaire',  tags: ['E-COMMERCE']},
  {cols: 5, height: 240, label: 'Studio Marin',     tags: ['IDENTITÉ']},
  {cols: 4, height: 240, label: 'Cabinet Droit',    tags: ['WEB']},
  {cols: 3, height: 240, label: 'Lumière & Co',     tags: ['MOTION']},
];

function ProjectCard({card, index}: {card: CardDef; index: number}) {
  const f = useCurrentFrame();
  // Cards reveal after curtain lifts (local frame 16 = curtain done)
  const delay = 16 + Math.round(index * 2.4);
  const op = ip(f, delay, delay + 19, 0, 1);
  const y  = ip(f, delay, delay + 19, 16, 0);

  const isFirst = index === 0;
  const hoverStart = 76; // ~2s after curtain lifts (local frame 16 + 60)
  const hoverOp  = isFirst ? ip(f, hoverStart, hoverStart + 19, 0, 1) : 0;
  const hoverY   = isFirst ? ip(f, hoverStart, hoverStart + 19, 8, 0) : 0;

  return (
    <div style={{
      gridColumn: `span ${card.cols}`,
      height: card.height,
      background: C.wash,
      position: 'relative',
      overflow: 'hidden',
      opacity: op,
      transform: `translateY(${y}px)`,
    }}>
      {/* Placeholder gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(145deg, ${C.faint} 0%, ${C.line} 100%)`,
        opacity: 0.55,
      }} />
      {/* Simulated image texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(11,11,11,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(11,11,11,.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Hover info overlay (card 0 only) */}
      {isFirst && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(246,245,242,0.85)',
          opacity: hoverOp,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 32,
        }}>
          <div style={{
            transform: `translateY(${hoverY}px)`,
            opacity: hoverOp,
          }}>
            <p style={{
              fontFamily: NEWSREADER,
              fontSize: 30,
              fontWeight: 400,
              color: C.ink,
              margin: '0 0 10px',
            }}>
              {card.label}
            </p>
            <div style={{display: 'flex', gap: 8, flexWrap: 'wrap' as const}}>
              {card.tags.map((t, ti) => (
                <span key={ti} style={{
                  fontFamily: JETBRAINS,
                  fontSize: 9,
                  color: C.muted,
                  letterSpacing: '0.16em',
                  border: `1px solid ${C.line2}`,
                  padding: '4px 10px',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GridScene() {
  const f = useCurrentFrame();
  const eyebrowOp    = ip(f, 16, 28, 0, 1);
  const ruleScale    = ip(f, 16, 40, 0, 1, MED);

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{
        position: 'absolute',
        top: 130, left: 60, right: 60,
      }}>
        {/* Eyebrow row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          opacity: eyebrowOp,
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{
              fontFamily: JETBRAINS,
              fontSize: 10, color: C.muted,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
            }}>
              02 Savoir-faire
            </span>
            <div style={{
              width: 200, height: 1,
              background: C.line2,
              transform: `scaleX(${ruleScale})`,
              transformOrigin: 'left',
            }} />
          </div>
          <span style={{
            fontFamily: JETBRAINS,
            fontSize: 10, color: C.muted,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
          }}>
            Projets
          </span>
        </div>

        {/* Project grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 12,
        }}>
          {CARDS.map((card, i) => (
            <ProjectCard key={i} card={card} index={i} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 7 — SAVOIR-FAIRE · MANIFESTE
// ─────────────────────────────────────────────────────────────────────────────

type TitleLine = {text: string; italic?: boolean; delay: number};
const MANIFESTE_LINES: TitleLine[] = [
  {text: 'Une démo,',       delay: 0},
  {text: 'pas un',          delay: 6,  italic: true},
  {text: 'argumentaire.',   delay: 12, italic: true},
];

const CAPABILITIES = [
  {num: '01', title: 'Grille vivante'},
  {num: '02', title: 'Triple lecture'},
];

function ManifesteLine({line}: {line: TitleLine}) {
  const f = useCurrentFrame();
  const y  = ip(f, line.delay, line.delay + 24, 120, 0, WIPE);
  const op = ip(f, line.delay, line.delay + 8, 0, 1);
  return (
    <div style={{overflow: 'hidden', lineHeight: '0.95', display: 'block'}}>
      <span style={{
        display: 'block',
        transform: `translateY(${y}px)`,
        opacity: op,
        fontStyle: line.italic ? 'italic' : 'normal',
      }}>
        {line.text}
      </span>
    </div>
  );
}

function ManifesteScene() {
  const f = useCurrentFrame();
  const noteOp = ip(f, 30, 45, 0, 0.55);

  return (
    <AbsoluteFill style={{
      background: C.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{width: 1100, padding: '0 60px'}}>
        {/* Main display title */}
        <div style={{
          fontFamily: NEWSREADER,
          fontSize: 118,
          fontWeight: 300,
          color: C.ink,
          letterSpacing: '-0.01em',
          lineHeight: '0.95',
          marginBottom: 48,
        }}>
          {MANIFESTE_LINES.map((line, i) => (
            <ManifesteLine key={i} line={line} />
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          fontFamily: JETBRAINS,
          fontSize: 10,
          color: C.muted,
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
          opacity: noteOp,
          marginBottom: 40,
        }}>
          Contenu fictif · Client illustratif «DL-C»
        </div>

        {/* Capabilities list */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
          {CAPABILITIES.map((cap, i) => {
            const delay = 24 + i * 4;
            const op = ip(f, delay, delay + 12, 0, 1);
            const ruleScale = ip(f, delay + 4, delay + 24, 0, 1, MED);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 0',
                borderTop: `1px solid ${C.line}`,
                opacity: op,
              }}>
                <span style={{
                  fontFamily: JETBRAINS, fontSize: 10,
                  color: C.muted, letterSpacing: '0.1em',
                  minWidth: 24,
                }}>
                  {cap.num}
                </span>
                <span style={{
                  fontFamily: NEWSREADER,
                  fontSize: 26, fontWeight: 400,
                  color: C.ink,
                }}>
                  {cap.title}
                </span>
                <div style={{
                  flex: 1, height: 1,
                  background: C.line2,
                  transform: `scaleX(${ruleScale})`,
                  transformOrigin: 'left',
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 8 — CONTACT + END CARD
// ─────────────────────────────────────────────────────────────────────────────

function FinalLetter({char, delay}: {char: string; delay: number}) {
  const f = useCurrentFrame();
  const y = ip(f, delay, delay + 33, 100, 0, WIPE);
  return (
    <div style={{overflow: 'hidden', lineHeight: '0.95', display: 'inline-block'}}>
      <span style={{display: 'block', transform: `translateY(${y}px)`}}>{char}</span>
    </div>
  );
}

function ContactScene() {
  const f = useCurrentFrame();
  const cs = 16; // content start (after curtain-in; curtain-out also uses this area)

  // Contact text (fades out at frame 62)
  const textFade = ip(f, 62, 88, 1, 0);

  const h1Op = ip(f, cs, cs + 14, 0, 1) * textFade;
  const h1Y  = ip(f, cs, cs + 20, 22, 0);
  const h2Op = ip(f, cs + 5, cs + 19, 0, 1) * textFade;
  const h2Y  = ip(f, cs + 5, cs + 25, 22, 0);

  const emailX  = ip(f, cs + 10, cs + 40, -22, 0, MED);
  const emailOp = ip(f, cs + 10, cs + 40, 0, 1) * textFade;
  const arrowS  = ip(f, cs + 22, cs + 34, 0, 1);

  // Logo final (starts at frame 68, overlaps with fade)
  const logoStart = 68;
  const barScale  = ip(f, logoStart + 14, logoStart + 38, 0, 1, WIPE);
  const logoOp    = ip(f, logoStart, logoStart + 6, 0, 1);

  // Dot pulse on logo
  const dotT     = f - logoStart;
  const dotScale = dotT < 0 ? 1
    : dotT < 18 ? ip(f, logoStart, logoStart + 18, 1, 1.4)
    : ip(f, logoStart + 18, logoStart + 36, 1.4, 1);

  return (
    <AbsoluteFill style={{background: C.ink}}>
      {/* Contact headline + email */}
      <AbsoluteFill style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{width: 960}}>
          <h2 style={{
            fontFamily: NEWSREADER,
            fontSize: 60, fontWeight: 300,
            color: C.paper, margin: '0 0 4px',
            opacity: h1Op,
            transform: `translateY(${h1Y}px)`,
          }}>
            Un projet de site ?
          </h2>
          <h2 style={{
            fontFamily: NEWSREADER,
            fontSize: 60, fontWeight: 300,
            color: C.paper, margin: '0 0 44px',
            opacity: h2Op,
            transform: `translateY(${h2Y}px)`,
          }}>
            On regardera ça ensemble.
          </h2>

          {/* Email géant */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18,
            fontFamily: NEWSREADER,
            fontSize: 68, fontWeight: 300,
            color: C.paper,
            opacity: emailOp,
            transform: `translateX(${emailX}px)`,
          }}>
            <span>bonjour@radar.studio</span>
            <span style={{
              display: 'inline-block',
              transform: `scale(${arrowS})`,
              transformOrigin: 'left center',
              fontSize: 56,
            }}>
              →
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Logo final */}
      <AbsoluteFill style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        opacity: logoOp,
      }}>
        <div style={{
          fontFamily: NEWSREADER,
          fontSize: 80, fontWeight: 300,
          color: C.paper,
          letterSpacing: '0.06em',
          display: 'flex', gap: 4, alignItems: 'center',
        }}>
          {['R', 'A', 'D', 'A', 'R'].map((ch, i) => (
            <FinalLetter key={i} char={ch} delay={logoStart + i * 2} />
          ))}
          <div style={{
            fontSize: 12,
            display: 'inline-block',
            transform: `scale(${dotScale})`,
            transformOrigin: 'center',
            marginLeft: 6,
            opacity: logoOp,
          }}>
            ●
          </div>
        </div>

        {/* Final rule */}
        <div style={{
          width: 220, height: 1,
          background: 'rgba(255,255,255,0.25)',
          transform: `scaleX(${barScale})`,
          transformOrigin: 'left',
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CURTAIN (ink panel sweeps in from bottom, then lifts from top)
// ─────────────────────────────────────────────────────────────────────────────

function Curtain() {
  const f = useCurrentFrame();
  const isIn = f < 16;
  const scale  = isIn ? ip(f, 0, 16, 0, 1, WIPE) : ip(f, 16, 32, 1, 0, WIPE);
  const origin = isIn ? 'bottom' : 'top';
  return (
    <AbsoluteFill style={{
      background: C.ink,
      transform: `scaleY(${scale})`,
      transformOrigin: origin,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPOSITION
// ─────────────────────────────────────────────────────────────────────────────

export function RadarIntro() {
  return (
    <AbsoluteFill style={{background: C.ink}}>

      {/* ── White background layer (permanent from S3 onwards) ── */}
      <Sequence from={S3}>
        <AbsoluteFill style={{background: C.paper}} />
      </Sequence>

      {/* ── S2: Loader (dark ink overlay) ── */}
      <Sequence from={S2} durationInFrames={S3 - S2}>
        <LoaderScene />
      </Sequence>

      {/* ── S3: Dark panel wipes away to reveal white ── */}
      <Sequence from={S3} durationInFrames={36}>
        <WipeReveal />
      </Sequence>

      {/* ── S5: Hero — extends 16 frames past S6 for curtain coverage ── */}
      <Sequence from={S5} durationInFrames={S6 + 16 - S5}>
        <HeroScene />
      </Sequence>

      {/* ── S6: Curtain for S5→S6 transition ── */}
      <Sequence from={S6} durationInFrames={33}>
        <Curtain />
      </Sequence>

      {/* ── S6: Grid content (starts after curtain-in, 16 frames after S6) ── */}
      <Sequence from={S6C} durationInFrames={S7 - S6C}>
        <GridScene />
      </Sequence>

      {/* ── S7: Manifeste — extends 16 frames past S8 for curtain coverage ── */}
      <Sequence from={S7} durationInFrames={S8 + 16 - S7}>
        <ManifesteScene />
      </Sequence>

      {/* ── S8: Curtain for S7→S8 transition ── */}
      <Sequence from={S8} durationInFrames={33}>
        <Curtain />
      </Sequence>

      {/* ── S8: Contact content (starts after curtain-in) ── */}
      <Sequence from={S8C} durationInFrames={TOTAL - S8C}>
        <ContactScene />
      </Sequence>

      {/* ── Nav bar: visible from S4 through S7 ── */}
      <Sequence from={S4} durationInFrames={S8 - S4}>
        <NavBar />
      </Sequence>

    </AbsoluteFill>
  );
}
