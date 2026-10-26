// « Une table très demandée ? » — how offers work on a night that takes them, from the guest to the
// club and back (app: VYR-129, offers on tables): the guest offers more than the subtotal, the club
// sees the highest offer and asks the others to raise theirs, another guest raises from the e-mail
// he receives, the club sees the list re-ranked and chooses. A label names each side. Demo data.
import {Video} from '@remotion/media';
import type {ReactNode} from 'react';
import {AbsoluteFill, Freeze, Sequence, staticFile, useCurrentFrame} from 'remotion';

import {ClubScene, LABEL_SPACE} from './Admin';
import {NIGHT, REQUESTS, TABLE} from './data';
import {euro, GLASS, LUMEN, tween, typed} from './theme';
import {Eyebrow, GoldButton, Screen, Tap, TierTile} from './ui';

export const OFFERS_DURATION = 450;

const SCENES = [
  {from: 0, length: 104, side: 'client', text: 'Il propose plus que le minimum'},
  {from: 100, length: 120, side: 'club', text: 'Vous proposez de surenchérir'},
  {from: 216, length: 134, side: 'client', text: 'Les autres relèvent leur offre'},
  {from: 346, length: 104, side: 'club', text: 'Vous choisissez'},
] as const;

const [camille, hugo] = REQUESTS;
const MAIL = {page: '#f4f4f5', card: '#ffffff', ink: '#18181b', muted: '#71717a', rule: '#e4e4e7'};

const group = {
  borderRadius: 16,
  background: GLASS.fill2,
  border: `1px solid ${GLASS.hairline}`,
  overflow: 'hidden',
} as const;

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

/** Which side the scene shows, and what happens there. */
function Label() {
  const frame = useCurrentFrame();
  const scene = [...SCENES].reverse().find((s) => frame >= s.from) ?? SCENES[0];
  const club = scene.side === 'club';
  return (
    <div style={{position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 26,
          borderRadius: 13,
          overflow: 'hidden',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.06em',
          boxShadow: '0 6px 20px rgb(0 0 0 / 0.35)',
        }}
      >
        <span style={{padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center', background: club ? '#e8c27a' : '#f5f4f7', color: '#14100a'}}>
          {club ? 'CÔTÉ CLUB' : 'CÔTÉ CLIENT'}
        </span>
        <span style={{padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', background: 'rgb(22 19 27 / 0.92)', color: '#f5f4f7', fontWeight: 500, letterSpacing: 0}}>
          {SCENES.indexOf(scene) + 1} · {scene.text}
        </span>
      </div>
    </div>
  );
}

/** 1 — the guest's request form on a night that takes offers: « Votre offre ». */
function OfferForm() {
  const frame = useCurrentFrame();
  const offer = typed('3 200', frame, 30, 8);
  const send = 88;
  return (
    <AbsoluteFill>
      <Freeze frame={232}>
        <Video src={staticFile('vyra-site/guest-app.mp4')} muted />
      </Freeze>
      <AbsoluteFill style={{background: 'rgb(0 0 0 / 0.45)'}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: LABEL_SPACE + 14,
          bottom: 0,
          borderRadius: '30px 30px 0 0',
          background: GLASS.thick,
          backdropFilter: 'blur(40px) saturate(190%)',
          borderTop: `1px solid ${GLASS.hairlineStrong}`,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{fontSize: 20, fontWeight: 500}}>Demande de table</div>
        <div style={{...group, display: 'flex', alignItems: 'center', gap: 12, padding: 12}}>
          <TierTile size={44} />
          <div style={{flex: 1}}>
            <div style={{fontSize: 17, fontWeight: 500}}>Table {TABLE.label}</div>
            <div style={{fontSize: 13, color: GLASS.label2}}>
              {TABLE.zone} · {TABLE.level}
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 12, color: GLASS.label2}}>à partir de</div>
            <div style={{fontSize: 19, fontWeight: 600, color: LUMEN.price}}>{euro(TABLE.minimum)}</div>
          </div>
        </div>
        <div style={{...group, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div style={{fontSize: 15}}>Sous-total</div>
            <div style={{fontSize: 12, color: GLASS.label2}}>Minimum pour {camille.people} personnes</div>
          </div>
          <div style={{fontSize: 20, fontWeight: 600, color: LUMEN.price}}>{euro(TABLE.minimum)}</div>
        </div>
        <div style={{marginTop: 10, paddingLeft: 2}}>
          <Eyebrow>Votre offre</Eyebrow>
        </div>
        <div style={{...group, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 15, borderColor: frame > 26 ? 'rgb(201 164 106 / 0.6)' : GLASS.hairline}}>
          <span>Offre</span>
          <span style={{color: offer ? GLASS.label : GLASS.label3, fontSize: offer ? 18 : 15, fontWeight: offer ? 600 : 400}}>
            {offer ? `${offer} €` : 'plus de 2 500'}
          </span>
        </div>
        <p style={{fontSize: 13, lineHeight: '18px', color: GLASS.label2, margin: '0 2px'}}>
          Facultatif : proposez plus que le sous-total. Seul le club voit votre offre, et il choisit parmi les demandes.
        </p>
        <div style={{flex: 1}} />
        <GoldButton pressed={tween(frame, [send - 4, send], [0, 1]) * (1 - tween(frame, [send + 2, send + 8], [0, 1]))}>
          Envoyer la demande
        </GoldButton>
      </div>
      <Tap at={send} x={195} y={781} light={false} />
    </AbsoluteFill>
  );
}

/** 3 — the e-mail another guest receives, then the page he raises his offer from. */
function RaiseByMail() {
  const frame = useCurrentFrame();
  const open = 52;
  const raise = 108;
  const page = tween(frame, [open + 4, open + 18], [0, 1]);
  const amount = typed('3 400', frame, open + 26, 8);
  const done = tween(frame, [raise + 4, raise + 14], [0, 1]);
  const press = (at: number) => tween(frame, [at - 5, at], [0, 1]) * (1 - tween(frame, [at + 2, at + 8], [0, 1]));
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
            <div style={{display: 'inline-block', marginTop: 16, padding: '11px 16px', borderRadius: 8, background: LUMEN.accent, color: LUMEN.on, fontSize: 14, fontWeight: 600, transform: `scale(${1 - 0.04 * press(open)})`}}>
              Relever mon offre
            </div>
          </div>
        </div>
      </div>
      {page < 0.5 ? <Tap at={open} x={104} y={338} light={false} /> : null}
      {/* the guest's page to raise it (app: /<club>/<night>/offre) */}
      <AbsoluteFill
        style={{
          transform: `translateX(${(1 - page) * 100}%)`,
          background: GLASS.ink,
          fontFamily: 'inherit',
          color: GLASS.label,
          padding: `${LABEL_SPACE + 24}px 16px 20px`,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{fontSize: 24, fontWeight: 500, fontFamily: 'Jost, sans-serif'}}>Relever mon offre</div>
        <div style={{display: 'flex', gap: 10}}>
          {[
            ['Offre la plus haute', camille.offer ?? 0],
            ['Votre offre', hugo.offer ?? 0],
          ].map(([label, value]) => (
            <div key={String(label)} style={{...group, flex: 1, padding: '12px 14px'}}>
              <div style={{fontSize: 12, color: GLASS.label2}}>{label}</div>
              <div style={{fontSize: 22, fontWeight: 600, color: LUMEN.price}}>{euro(Number(value))}</div>
            </div>
          ))}
        </div>
        <div style={{...group, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 15, borderColor: 'rgb(201 164 106 / 0.6)'}}>
          <span>Nouvelle offre</span>
          <span style={{fontSize: 18, fontWeight: 600}}>{amount ? `${amount} €` : ''}</span>
        </div>
        <div style={{flex: 1}} />
        <p
          style={{
            fontSize: 14,
            lineHeight: '20px',
            color: GLASS.label2,
            textAlign: 'center',
            margin: 0,
            opacity: done,
          }}
        >
          Votre offre est maintenant de 3 400 €. Le club la voit, et il choisit parmi les demandes de la table.
        </p>
        <GoldButton pressed={press(raise)}>Relever mon offre à 3 400 €</GoldButton>
      </AbsoluteFill>
      {page > 0.99 && done < 0.5 ? <Tap at={raise} x={195} y={795} light={false} /> : null}
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
      <AbsoluteFill style={{background: `rgb(6 4 8 / ${fadeOut})`}} />
    </Screen>
  );
};
