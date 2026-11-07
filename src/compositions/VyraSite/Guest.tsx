// « Vos clients choisissent » — the guest's side of a night, on a phone: the app filmed on the demo
// venue (public/vyra-site/guest-app.mp4: the room, a tap on Le Phare, a tap on P1, its sheet; filmed
// again on 2026-11-07 in the app's « Dark Sculpted » design), then the request form and the screen
// after sending, drawn after the app's (table-panel.tsx: RequestForm, RequestSuccess). Loops.
import {Video} from '@remotion/media';
import type {ReactNode} from 'react';
import {AbsoluteFill, Freeze, Sequence, staticFile, useCurrentFrame} from 'remotion';

import {NIGHT, REQUESTS, TABLE} from './data';
import {DS, euro, M, T, tween, typed} from './theme';
import {
  Btn,
  Caret,
  CloseButton,
  DIVIDER,
  Field,
  GlassRim,
  Group,
  Icon,
  List,
  pressAt,
  Screen,
  Stepper,
  Steps,
  SwitchTrack,
  Tap,
  ZoneTile,
} from './ui';

/** The film of the app: 233 frames at 30 fps; its taps, read from guest-taps.json. */
const FILM = 233;
const TAPS = [
  {at: 53, x: 168, y: 405},
  {at: 133, x: 195, y: 341},
];
const ASK = {at: 214, x: 195, y: 770};

const SHEET_IN = [220, 238] as const;
const SCROLL_1 = [262, 280] as const;
const SCROLL_2 = [330, 346] as const;
const CONSENT = 382;
const SEND = {at: 396, x: 195, y: 802};
const DONE = 402;
export const GUEST_DURATION = 495;

const buyer = REQUESTS[0];
/** The form's sheet on a phone: 94 % of the screen's height, its top rounded (32 px). */
const SHEET_TOP = 844 * 0.06;
/** After sending, the sheet holds the acknowledgement only: 478 px high (the app's, its text one line shorter). */
const SENT_TOP = 844 - 478;
const HEADER = 64;
const FOOTER = 80;
/** The form's body: what it holds is 973 px high, 649 px of it shown. */
const SCROLLED = [170, 324] as const;

/** Each field typed in turn, the focus with it: [start, cps, end of the focus]. */
const TYPING = {
  first: [282, 26, 290],
  last: [290, 20, 296],
  phone: [296, 30, 312],
  email: [312, 34, 347],
  message: [348, 40, CONSENT],
} as const;

function Row({label, children}: {label: string; children: ReactNode}) {
  return (
    <div style={{minHeight: 48, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px'}}>
      <span style={{...T.ui, color: DS.label2, width: 104, flexShrink: 0}}>{label}</span>
      <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>{children}</div>
    </div>
  );
}

/** The form's content, as it scrolls under its header (table-panel.tsx, the request form). */
function FormContent({frame}: {frame: number}) {
  const text = (key: keyof typeof TYPING, value: string) => typed(value, frame, TYPING[key][0], TYPING[key][1]);
  const focus = (key: keyof typeof TYPING) => frame >= TYPING[key][0] && frame < TYPING[key][2];
  const message = text('message', buyer.message ?? '');
  const consent = tween(frame, [CONSENT, CONSENT + 6], [0, 1]);
  return (
    <div style={{padding: '0 16px 20px'}}>
      <div style={{...M.sunken, borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 14}}>
        <ZoneTile size={48} />
        <div style={{flex: 1, minWidth: 0}}>
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
      <p style={{...T.footnote, color: DS.label3, margin: '12px 0 0', padding: '0 4px'}}>
        Le club confirme la table et le minimum, puis vous recontacte. Aucun paiement maintenant.
      </p>
      <Group title="Votre soirée" style={{marginTop: 24}}>
        <List>
          <Row label="Femmes">
            <Stepper value={6} />
          </Row>
          <div style={{height: 1, background: DIVIDER}} />
          <Row label="Hommes">
            <Stepper value={6} />
          </Row>
        </List>
      </Group>
      <Group
        title="Vos coordonnées"
        style={{marginTop: 24}}
        footer="Instagram facultatif : le club verra vos abonnés et vos interactions."
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <Field label="Prénom" value={text('first', buyer.first)} placeholder="Camille" focus={focus('first')} />
          <Field label="Nom" value={text('last', buyer.last)} placeholder="Martin" focus={focus('last')} />
          <Field label="Téléphone" value={text('phone', buyer.phone)} placeholder="06 12 34 56 78" focus={focus('phone')} />
          <Field label="E-mail" value={text('email', buyer.email)} placeholder="vous@exemple.fr" focus={focus('email')} />
          <Field
            label="Instagram"
            value=""
            placeholder="votrecompte (facultatif)"
            prefix={
              <span style={{color: DS.label2, borderRadius: 6, background: 'rgb(255 246 232 / 0.08)', padding: '0 6px', lineHeight: '24px'}}>@</span>
            }
          />
        </div>
      </Group>
      <Group title="Message" style={{marginTop: 24}}>
        <div style={{...(focus('message') ? M.sunkenFocus : M.sunken), borderRadius: 14, height: 84, padding: '12px 16px', ...T.ui}}>
          <span style={{color: message ? DS.label : DS.label3}}>
            {message || (focus('message') ? '' : 'Anniversaire, bouteilles souhaitées… (facultatif)')}
          </span>
          {focus('message') ? <Caret /> : null}
        </div>
      </Group>
      <div style={{marginTop: 24}}>
        <List>
          <div style={{minHeight: 56, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
            <div>
              <div style={T.ui}>Sous-total</div>
              <div style={{...T.caption, color: DS.label3}}>Minimum pour {buyer.people} personnes</div>
            </div>
            <div style={{...T.headline, ...T.num}}>{euro(TABLE.minimum)}</div>
          </div>
        </List>
      </div>
      <div style={{marginTop: 24}}>
        <List>
          <div style={{minHeight: 56, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
            <span style={T.ui}>J’accepte d’être recontacté par le club au sujet de cette demande</span>
            <SwitchTrack on={consent} />
          </div>
        </List>
      </div>
      <p style={{...T.caption, color: DS.label3, margin: '8px 0 0', padding: '0 4px'}}>
        Vos coordonnées ne servent qu’à cette demande. VYRA les transmet à {NIGHT.club} par e-mail (Resend) et WhatsApp
        (Meta).
      </p>
    </div>
  );
}

/** The sheet after sending: the steps done, the disc in the light and its check, the reference. */
function Sent({frame}: {frame: number}) {
  const disc = tween(frame, [DONE + 2, DONE + 16], [0, 1]);
  const stroke = tween(frame, [DONE + 10, DONE + 24], [0, 1]);
  const text = tween(frame, [DONE + 14, DONE + 30], [0, 1]);
  const rise = {opacity: text, transform: `translateY(${(1 - text) * 10}px)`};
  return (
    <AbsoluteFill style={{opacity: tween(frame, [DONE, DONE + 8], [0, 1])}}>
      <div style={{position: 'absolute', top: 12, right: 12}}>
        <CloseButton />
      </div>
      <div style={{position: 'absolute', top: 56, left: 0, right: 0, padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        <Steps current={3} />
        <div
          style={{
            ...M.brandPill,
            marginTop: 20,
            width: 64,
            height: 64,
            borderRadius: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${0.4 + 0.6 * disc})`,
            opacity: disc,
          }}
        >
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={DS.label} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5 10 17.5 19 7" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - stroke} />
          </svg>
        </div>
        <div style={{...rise, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{...T.title, marginTop: 20}}>Demande transmise</div>
          <div style={{...T.callout, color: DS.label2, marginTop: 6}}>
            Table {TABLE.label} · {NIGHT.club}
          </div>
          <div style={{...M.sculpt, marginTop: 20, height: 44, borderRadius: 22, padding: '0 8px 0 16px', display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{...T.eyebrow, color: DS.label3}}>Réf.</span>
            <span style={{...T.callout, ...T.num, fontWeight: 500, letterSpacing: '0.08em'}}>{buyer.reference}</span>
            <span style={{width: 28, height: 28, borderRadius: 14, background: 'rgb(255 246 232 / 0.08)', color: DS.label2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {Icon.copy(14)}
            </span>
          </div>
          <p style={{...T.ui, color: DS.label2, margin: '20px 0 0', maxWidth: 342}}>
            {/* the app opens on « Ce n’est pas encore une réservation » : the site's films say no word of it */}
            L’équipe de {NIGHT.club} vous recontacte pour confirmer la table, le minimum et les modalités.
          </p>
          <p style={{...T.footnote, color: DS.label3, margin: '8px 0 0'}}>
            Un récapitulatif part à <span style={{color: DS.label2}}>{buyer.email}</span>.
          </p>
        </div>
      </div>
      <div style={{...rise, position: 'absolute', left: 16, right: 16, bottom: 16}}>
        <Btn>Revenir à la visite</Btn>
      </div>
    </AbsoluteFill>
  );
}

export const Guest = () => {
  const frame = useCurrentFrame();
  const sheet = tween(frame, [SHEET_IN[0], SHEET_IN[1]], [0, 1]);
  const scroll = tween(frame, [SCROLL_1[0], SCROLL_1[1]], [0, SCROLLED[0]]) + tween(frame, [SCROLL_2[0], SCROLL_2[1]], [0, SCROLLED[1] - SCROLLED[0]]);
  const sent = frame >= DONE;
  const top = SHEET_TOP + (SENT_TOP - SHEET_TOP) * tween(frame, [DONE, DONE + 12], [0, 1]);
  const lit = tween(frame, [CONSENT + 1, CONSENT + 7], [0, 1]);
  const fadeOut = tween(frame, [GUEST_DURATION - 14, GUEST_DURATION - 1], [0, 1]);
  return (
    <Screen>
      <Sequence durationInFrames={FILM}>
        <Video src={staticFile('vyra-site/guest-app.mp4')} muted />
      </Sequence>
      {frame >= FILM ? (
        <Freeze frame={FILM - 1}>
          <Video src={staticFile('vyra-site/guest-app.mp4')} muted />
        </Freeze>
      ) : null}
      {TAPS.map((tap) => (
        <Tap key={tap.at} {...tap} />
      ))}
      <Tap {...ASK} />
      {/* the room dims and blurs under the form */}
      <AbsoluteFill style={{background: `rgb(0 0 0 / ${0.45 * sheet})`, backdropFilter: sheet > 0 ? `blur(${6 * sheet}px)` : undefined}} />
      <div
        style={{
          ...M.glassThick,
          position: 'absolute',
          left: 0,
          right: 0,
          top,
          bottom: 0,
          transform: `translateY(${(1 - sheet) * 820}px)`,
          borderRadius: '32px 32px 0 0',
          overflow: 'hidden',
          color: DS.label,
        }}
      >
        <GlassRim />
        {sent ? (
          <Sent frame={frame} />
        ) : (
          <>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: HEADER, padding: '8px 12px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
              <div>
                <div style={T.headline}>Demande de table</div>
                <Steps current={2} style={{marginTop: 4}} />
              </div>
              <CloseButton />
            </div>
            <div style={{position: 'absolute', top: HEADER, left: 0, right: 0, bottom: FOOTER, overflow: 'hidden'}}>
              <div style={{transform: `translateY(${-scroll}px)`}}>
                <FormContent frame={frame} />
              </div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: FOOTER, padding: '12px 16px 16px'}}>
              <Btn lit={lit} pressed={pressAt(frame, SEND.at)}>
                Envoyer la demande
              </Btn>
            </div>
          </>
        )}
      </div>
      {!sent ? <Tap {...SEND} /> : null}
      <AbsoluteFill style={{background: DS.ink, opacity: fadeOut}} />
    </Screen>
  );
};
