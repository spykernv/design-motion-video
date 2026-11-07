// « Une table très demandée ? » — how offers work on a night that takes them, from the guest to the
// club and back (app: VYR-129, offers on tables): the guest offers more than the subtotal, the club
// sees the highest offer and asks the others to raise theirs, another guest raises from the e-mail
// he receives, the club sees the list re-ranked and chooses. A label names each side. Demo data.
// The guest's screens are drawn after the app's as it is today (« Dark Sculpted »: table-panel.tsx,
// raise-bid-form.tsx, /<club>/<night>/offre); the e-mail is the app's, in the club's brass.
import {Video} from '@remotion/media';
import type {ReactNode} from 'react';
import {AbsoluteFill, Freeze, Sequence, staticFile, useCurrentFrame} from 'remotion';

import {ClubScene, LABEL_SPACE} from './Admin';
import {NIGHT, REQUESTS, TABLE} from './data';
import {DS, euro, INTER, LUMEN, M, T, tween, typed} from './theme';
import {Btn, CloseButton, DemoTag, Field, GlassRim, Group, List, pressAt, Screen, SideLabel, Steps, Tap, ZoneTile} from './ui';

export const OFFERS_DURATION = 450;

const SCENES = [
  {from: 0, length: 104, side: 'client', text: 'Il propose plus que le minimum'},
  {from: 100, length: 120, side: 'club', text: 'Vous proposez de surenchérir'},
  {from: 216, length: 134, side: 'client', text: 'Les autres relèvent leur offre'},
  {from: 346, length: 104, side: 'club', text: 'Vous choisissez'},
] as const;

const [camille, hugo] = REQUESTS;
const MAIL = {page: '#f4f4f5', card: '#ffffff', ink: '#18181b', muted: '#71717a', rule: '#e4e4e7'};

/** A scene of its own: its frames start at 0, and it fades in over the one before it. */
function Scene({from, length, children}: {from: number; length: number; children: ReactNode}) {
  return (
    <Sequence from={from} durationInFrames={length}>
      <FadeIn>{children}</FadeIn>
    </Sequence>
  );
}

function FadeIn({children}: {children: ReactNode}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{opacity: tween(frame, [0, 6], [0, 1])}}>{children}</AbsoluteFill>;
}

function Label() {
  const frame = useCurrentFrame();
  const scene = [...SCENES].reverse().find((s) => frame >= s.from) ?? SCENES[0];
  return <SideLabel club={scene.side === 'club'} text={`${SCENES.indexOf(scene) + 1} · ${scene.text}`} />;
}

/** 1 — the guest's request form on a night that takes offers: « Votre offre ». */
function OfferForm() {
  const frame = useCurrentFrame();
  const offer = typed('3 200', frame, 30, 8);
  const send = 88;
  const focus = frame >= 26 && frame < send;
  return (
    <AbsoluteFill>
      <Freeze frame={232}>
        <Video src={staticFile('vyra-site/guest-app.mp4')} muted />
      </Freeze>
      <AbsoluteFill style={{background: 'rgb(0 0 0 / 0.45)', backdropFilter: 'blur(6px)'}} />
      <div
        style={{
          ...M.glassThick,
          position: 'absolute',
          left: 0,
          right: 0,
          top: LABEL_SPACE + 14,
          bottom: 0,
          borderRadius: '32px 32px 0 0',
          overflow: 'hidden',
          color: DS.label,
        }}
      >
        <GlassRim />
        <div style={{height: 64, padding: '8px 12px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div>
            <div style={T.headline}>Demande de table</div>
            <Steps current={2} style={{marginTop: 4}} />
          </div>
          <CloseButton />
        </div>
        <div style={{padding: '0 16px'}}>
          <div style={{...M.sunken, borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 14}}>
            <ZoneTile size={48} />
            <div style={{flex: 1}}>
              <div style={T.headline}>Table {TABLE.label}</div>
              <div style={{...T.footnote, color: DS.label2}}>
                {TABLE.zone} · {TABLE.level}
              </div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{...T.caption, color: DS.label3}}>à partir de</div>
              <div style={{...T.headline, ...T.num}}>{euro(TABLE.minimum)}</div>
            </div>
          </div>
          <div style={{marginTop: 24}}>
            <List>
              <div style={{minHeight: 56, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
                <div>
                  <div style={T.ui}>Sous-total</div>
                  <div style={{...T.caption, color: DS.label3}}>Minimum pour {camille.people} personnes</div>
                </div>
                <div style={{...T.headline, ...T.num}}>{euro(TABLE.minimum)}</div>
              </div>
            </List>
          </div>
          <Group
            title="Votre offre"
            style={{marginTop: 24}}
            footer="Facultatif : proposez plus que le sous-total. Seul le club voit votre offre, et il choisit parmi les demandes."
          >
            <Field
              label="Offre"
              value={offer}
              placeholder={`plus de ${euro(TABLE.minimum).replace(/\s*€$/, '')}`}
              focus={focus}
              suffix={<span style={{color: DS.label2}}>€</span>}
            />
          </Group>
        </div>
        <div style={{position: 'absolute', left: 16, right: 16, bottom: 16}}>
          <Btn pressed={pressAt(frame, send)}>Envoyer la demande</Btn>
        </div>
      </div>
      <Tap at={send} x={195} y={802} />
    </AbsoluteFill>
  );
}

/** Lumen's wordmark (brand.json) in its foil, as the club's pages draw it. */
function LumenWordmark({height}: {height: number}) {
  const strokes = ['M1.5 2V18H11', 'M16 2V13a5 5 0 0 0 10 0V2', 'M31 18V2L38 13L45 2V18', 'M59 2H50V18H59M50 10H57.5', 'M64 18V2L76 18V2'];
  return (
    <svg viewBox="0 0 78 20" height={height} width={(height * 78) / 20} fill="none" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="lumen-foil" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={20}>
          <stop offset="0%" stopColor={LUMEN.foil[0]} />
          <stop offset="55%" stopColor={LUMEN.foil[1]} />
          <stop offset="100%" stopColor={LUMEN.foil[2]} />
        </linearGradient>
      </defs>
      {strokes.map((d) => (
        <path key={d} d={d} stroke="url(#lumen-foil)" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/** 3 — the e-mail another guest receives, then the page he raises his offer from. */
function RaiseByMail() {
  const frame = useCurrentFrame();
  const open = 52;
  const raise = 108;
  const page = tween(frame, [open + 4, open + 18], [0, 1]);
  const amount = typed('3 400', frame, open + 26, 8);
  // the field and its button fade out, then the answer comes in where they were
  const gone = tween(frame, [raise + 3, raise + 9], [0, 1]);
  const done = tween(frame, [raise + 9, raise + 17], [0, 1]);
  const typedEuros = Number(amount.replace(/\s/g, ''));
  // the button says the amount typed, so that a zero too many shows before it leaves
  const button = typedEuros > 0 ? `Relever mon offre à ${euro(typedEuros)}` : 'Relever mon offre';
  // the field and its button make way for the answer: 112 px, then the answer's 66
  const reflow = 46 * gone;
  return (
    <AbsoluteFill style={{background: MAIL.page, fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', color: MAIL.ink}}>
      <div style={{background: '#fff', padding: `${LABEL_SPACE + 14}px 16px 14px`, borderBottom: `1px solid ${MAIL.rule}`}}>
        <div style={{fontSize: 18, fontWeight: 600, lineHeight: '23px'}}>
          {NIGHT.club} · Une offre plus élevée pour la table {TABLE.label} · {hugo.reference}
        </div>
        <div style={{fontSize: 13, color: MAIL.muted, marginTop: 6}}>{NIGHT.club} via VYRA (démo)</div>
      </div>
      <div style={{padding: 14}}>
        <div style={{background: MAIL.card, borderRadius: 12, overflow: 'hidden'}}>
          <div style={{height: 4, background: LUMEN.accent}} />
          <div style={{padding: '18px 18px 22px', fontSize: 15, lineHeight: '22px'}}>
            <p style={{margin: 0}}>
              La table {TABLE.label} ({TABLE.zone}) de la soirée {NIGHT.name} a reçu une offre de <b>{euro(camille.offer ?? 0)}</b>. Votre demande est à <b>{euro(hugo.offer ?? 0)}</b>.
            </p>
            <p style={{margin: '12px 0 0', color: MAIL.muted}}>
              Vous pouvez relever votre offre : le club choisit parmi les demandes de la table.
            </p>
            <div style={{display: 'inline-block', marginTop: 16, padding: '11px 16px', borderRadius: 8, background: LUMEN.accent, color: LUMEN.on, fontSize: 14, fontWeight: 600, transform: `scale(${1 - 0.04 * pressAt(frame, open)})`}}>
              Relever mon offre
            </div>
          </div>
        </div>
      </div>
      {page < 0.5 ? <Tap at={open} x={104} y={338} light={false} /> : null}
      {/* the guest's page to raise it (app: /<club>/<night>/offre), on the studio's ground */}
      <AbsoluteFill
        style={{
          ...M.studio,
          transform: `translateX(${(1 - page) * 100}%)`,
          fontFamily: 'inherit',
          color: DS.label,
        }}
      >
        <AbsoluteFill style={{fontFamily: INTER, padding: `${LABEL_SPACE + 24}px 20px 0`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 28}}>
            <LumenWordmark height={28} />
            <DemoTag />
          </div>
          <div style={{...T.display, marginTop: 40}}>Relever mon offre</div>
          <div style={{...T.callout, color: DS.label2, marginTop: 8}}>
            Table {TABLE.label} · {TABLE.zone} · {NIGHT.name}, {NIGHT.date}
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 32}}>
            {[
              ['Offre la plus haute', camille.offer ?? 0],
              ['Votre offre', hugo.offer ?? 0],
            ].map(([label, value]) => (
              <div key={String(label)} style={{...M.sunken, borderRadius: 18, padding: 14}}>
                <div style={{...T.caption, color: DS.label3}}>{label}</div>
                <div style={{...T.headline, ...T.num, marginTop: 4}}>{euro(Number(value))}</div>
              </div>
            ))}
          </div>
          <div style={{position: 'relative', marginTop: 24, height: 112 - reflow}}>
            <div style={{position: 'absolute', inset: 0, opacity: 1 - gone}}>
              <div
                style={{
                  ...M.sunken,
                  borderRadius: 16,
                  minHeight: 48,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0 16px',
                  boxShadow: frame >= open + 22 ? `${M.sunken.boxShadow}, 0 0 0 2px rgb(246 242 235 / 0.6)` : M.sunken.boxShadow,
                }}
              >
                <span style={{...T.ui, color: DS.label2}}>Nouvelle offre</span>
                <span style={{...T.ui, ...T.num, flex: 1, textAlign: 'right', color: amount ? DS.label : DS.label3}}>
                  {amount || `plus de ${euro(hugo.offer ?? 0).replace(/\s*€$/, '')}`}
                </span>
                <span style={{...T.ui, color: DS.label2}}>€</span>
              </div>
              <Btn pressed={pressAt(frame, raise)} style={{marginTop: 12}}>
                {button}
              </Btn>
            </div>
            <p style={{...T.callout, position: 'absolute', top: 0, left: 0, right: 0, margin: 0, opacity: done}}>
              Votre offre est maintenant de {euro(3400)}. Le club la voit, et il choisit parmi les demandes de la table.
            </p>
          </div>
          <p style={{...T.footnote, color: DS.label3, margin: '24px 0 0'}}>
            {/* the app ends on « une offre n’est ni un paiement ni une réservation » : not a word of it in the films */}
            Seul le club voit les offres, jamais le nom de qui les fait. Il choisit parmi les demandes de la table.
          </p>
          <p style={{...T.caption, color: DS.label3, margin: '40px 0 0'}}>Référence de votre demande : {hugo.reference}</p>
        </AbsoluteFill>
      </AbsoluteFill>
      {page > 0.99 && done < 0.5 ? <Tap at={raise} x={195} y={436} /> : null}
    </AbsoluteFill>
  );
}

export const Offers = () => {
  const frame = useCurrentFrame();
  const fadeOut = tween(frame, [OFFERS_DURATION - 12, OFFERS_DURATION - 1], [0, 1]);
  return (
    <Screen>
      <Scene from={SCENES[0].from} length={SCENES[0].length}>
        <OfferForm />
      </Scene>
      <Scene from={SCENES[1].from} length={SCENES[1].length}>
        <ClubScene ask={30} send={78} />
      </Scene>
      <Scene from={SCENES[2].from} length={SCENES[2].length}>
        <RaiseByMail />
      </Scene>
      <Scene from={SCENES[3].from} length={SCENES[3].length}>
        <ClubScene raise={12} />
      </Scene>
      <Label />
      <AbsoluteFill style={{background: DS.ink, opacity: fadeOut}} />
    </Screen>
  );
};
