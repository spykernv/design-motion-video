// « Vos clients choisissent » — the guest's side of a night, on a phone: the app filmed on the demo
// venue (public/vyra-site/guest-app.mp4: the room, a tap on Le Phare, a tap on P1, its sheet), then
// the request form and the screen after sending, drawn after the app's (table-panel.tsx). Loops.
import {Video} from '@remotion/media';
import {AbsoluteFill, Freeze, Sequence, staticFile, useCurrentFrame} from 'remotion';

import {NIGHT, REQUESTS, TABLE} from './data';
import {euro, GLASS, LUMEN, tween, typed} from './theme';
import {Eyebrow, GoldButton, Icon, Screen, Tap, TierTile} from './ui';

/** The film of the app: 233 frames at 30 fps; its taps, read from guest-taps.json. */
const FILM = 233;
const TAPS = [
  {at: 53, x: 168, y: 405},
  {at: 133, x: 195, y: 341},
];
const ASK = {at: 214, x: 195, y: 772};

const SHEET_IN = [220, 238] as const;
const SCROLL_1 = [262, 280] as const;
const SCROLL_2 = [330, 346] as const;
const CONSENT = 382;
const SEND = {at: 396, x: 195, y: 777};
const DONE = 402;
export const GUEST_DURATION = 495;

const buyer = REQUESTS[0];
const SHEET_TOP = 52;
const HEADER = 96;

function Row({label, value, placeholder, last = false}: {label: string; value: string; placeholder: string; last?: boolean}) {
  return (
    <div
      style={{
        height: 49,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: last ? 'none' : `1px solid ${GLASS.hairline}`,
        fontSize: 15,
      }}
    >
      <span>{label}</span>
      <span style={{color: value ? GLASS.label : GLASS.label3}}>{value || placeholder}</span>
    </div>
  );
}

function Stepper({label, value}: {label: string; value: number}) {
  const button = (text: string, on: boolean) => (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        background: on ? GLASS.fill : 'transparent',
        border: `1px solid ${GLASS.hairline}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: on ? GLASS.label : GLASS.label3,
        fontSize: 18,
      }}
    >
      {text}
    </div>
  );
  return (
    <div style={{height: 49, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 0 16px', fontSize: 15}}>
      <span>{label}</span>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        {button('−', true)}
        <span style={{width: 18, textAlign: 'center', fontWeight: 500}}>{value}</span>
        {button('+', true)}
      </div>
    </div>
  );
}

const group = {
  borderRadius: 16,
  background: GLASS.fill2,
  border: `1px solid ${GLASS.hairline}`,
  overflow: 'hidden',
} as const;

/** The form's content, as it scrolls under its header (table-panel.tsx, the request form). */
function FormContent({frame}: {frame: number}) {
  const first = typed(buyer.first, frame, 282, 18);
  const last = typed(buyer.last, frame, 290, 18);
  const phone = typed(buyer.phone, frame, 296, 30);
  const email = typed(buyer.email, frame, 312, 34);
  const message = typed(buyer.message ?? '', frame, 348, 40);
  const consent = tween(frame, [CONSENT, CONSENT + 6], [0, 1]);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 0, padding: '0 16px'}}>
      <div style={{...group, display: 'flex', alignItems: 'center', gap: 12, padding: 12}}>
        <TierTile size={48} />
        <div style={{flex: 1}}>
          <div style={{fontSize: 18, fontWeight: 500}}>Table {TABLE.label}</div>
          <div style={{fontSize: 13, color: GLASS.label2}}>
            {TABLE.zone} · {TABLE.level}
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: 12, color: GLASS.label2}}>à partir de</div>
          <div style={{fontSize: 20, fontWeight: 600, color: LUMEN.price}}>{euro(TABLE.minimum)}</div>
        </div>
      </div>
      <p style={{fontSize: 13, lineHeight: '18px', color: GLASS.label2, margin: '12px 2px 0'}}>
        Le club confirme la table et le minimum, puis vous recontacte. Aucun paiement maintenant.
      </p>
      <div style={{marginTop: 24, marginBottom: 8, paddingLeft: 2}}>
        <Eyebrow>Votre soirée</Eyebrow>
      </div>
      <div style={group}>
        <Stepper label="Femmes" value={6} />
        <div style={{height: 1, background: GLASS.hairline}} />
        <Stepper label="Hommes" value={6} />
      </div>
      <div style={{marginTop: 24, marginBottom: 8, paddingLeft: 2}}>
        <Eyebrow>Vos coordonnées</Eyebrow>
      </div>
      <div style={group}>
        <Row label="Prénom" value={first} placeholder="Camille" />
        <Row label="Nom" value={last} placeholder="Martin" />
        <Row label="Téléphone" value={phone} placeholder="06 12 34 56 78" />
        <Row label="E-mail" value={email} placeholder="vous@exemple.fr" />
        <Row label="Instagram" value="" placeholder="@ votrecompte (facultatif)" last />
      </div>
      <div style={{marginTop: 24, marginBottom: 8, paddingLeft: 2}}>
        <Eyebrow>Message</Eyebrow>
      </div>
      <div style={{...group, height: 80, padding: '12px 16px', fontSize: 15, lineHeight: '21px', color: message ? GLASS.label : GLASS.label3}}>
        {message || 'Anniversaire, bouteilles souhaitées… (facultatif)'}
      </div>
      <div style={{...group, marginTop: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div style={{fontSize: 15}}>Sous-total</div>
          <div style={{fontSize: 12, color: GLASS.label2}}>Minimum pour {buyer.people} personnes</div>
        </div>
        <div style={{fontSize: 20, fontWeight: 600, color: LUMEN.price}}>{euro(TABLE.minimum)}</div>
      </div>
      <div style={{display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, padding: '0 2px'}}>
        <div style={{width: 46, height: 28, borderRadius: 14, background: consent > 0.5 ? LUMEN.accent : GLASS.fill, position: 'relative', flexShrink: 0}}>
          <div style={{position: 'absolute', top: 2, left: 2 + 18 * consent, width: 24, height: 24, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgb(0 0 0 / 0.4)'}} />
        </div>
        <div style={{fontSize: 13, lineHeight: '18px', color: GLASS.label2}}>
          J’accepte d’être recontacté par le club au sujet de cette demande
        </div>
      </div>
    </div>
  );
}

/** The sheet after sending: the gold disc and its check, the reference, nothing confirmed yet. */
function Sent({frame}: {frame: number}) {
  const disc = tween(frame, [DONE + 2, DONE + 16], [0, 1]);
  const stroke = tween(frame, [DONE + 10, DONE + 24], [0, 1]);
  const text = tween(frame, [DONE + 14, DONE + 30], [0, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 150, opacity: tween(frame, [DONE, DONE + 8], [0, 1])}}>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          background: LUMEN.pill,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${0.6 + 0.4 * disc})`,
          opacity: disc,
          boxShadow: '0 12px 40px rgb(201 164 106 / 0.35)',
        }}
      >
        <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke={LUMEN.on} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - stroke} />
        </svg>
      </div>
      <div style={{opacity: text, transform: `translateY(${(1 - text) * 10}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 26, fontWeight: 500, marginTop: 26}}>Demande transmise</div>
        <div style={{fontSize: 15, color: GLASS.label2, marginTop: 6}}>
          Table {TABLE.label} · {NIGHT.club}
        </div>
        <div style={{marginTop: 16, padding: '7px 14px', borderRadius: 999, background: GLASS.fill, border: `1px solid ${GLASS.hairline}`, fontSize: 13, letterSpacing: '0.04em'}}>
          Réf. {buyer.reference}
        </div>
        <p style={{fontSize: 14, lineHeight: '20px', color: GLASS.label2, textAlign: 'center', maxWidth: 300, marginTop: 22}}>
          L’équipe de {NIGHT.club} vous recontacte pour confirmer la table, le minimum et les modalités.
        </p>
        <p style={{fontSize: 13, color: GLASS.label3, marginTop: 4}}>Un récapitulatif part à {buyer.email}.</p>
        <div style={{marginTop: 34, width: 300, height: 48, borderRadius: 24, border: `1px solid ${GLASS.hairlineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15}}>
          Revenir à la visite
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const Guest = () => {
  const frame = useCurrentFrame();
  const sheet = tween(frame, [SHEET_IN[0], SHEET_IN[1]], [0, 1]);
  const scroll = tween(frame, [SCROLL_1[0], SCROLL_1[1]], [0, 270]) + tween(frame, [SCROLL_2[0], SCROLL_2[1]], [0, 290]);
  const sent = frame >= DONE;
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
      <Tap {...ASK} light={false} />
      {/* the room dims under the form */}
      <AbsoluteFill style={{background: `rgb(0 0 0 / ${0.45 * sheet})`}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: SHEET_TOP,
          bottom: 0,
          transform: `translateY(${(1 - sheet) * 820}px)`,
          borderRadius: '30px 30px 0 0',
          background: GLASS.thick,
          backdropFilter: 'blur(40px) saturate(190%)',
          borderTop: `1px solid ${GLASS.hairlineStrong}`,
          overflow: 'hidden',
        }}
      >
        {sent ? (
          <Sent frame={frame} />
        ) : (
          <>
            <div style={{position: 'absolute', top: HEADER, left: 0, right: 0, bottom: 96, overflow: 'hidden'}}>
              <div style={{transform: `translateY(${-scroll}px)`}}>
                <FormContent frame={frame} />
              </div>
            </div>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: HEADER, padding: '20px 16px 0', background: GLASS.thick}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{fontSize: 20, fontWeight: 500}}>Demande de table</div>
                <div style={{width: 36, height: 36, borderRadius: 18, background: GLASS.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GLASS.label2}}>
                  {Icon.close(16)}
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13}}>
                <div style={{width: 18, height: 18, borderRadius: 9, background: GLASS.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GLASS.label2}}>{Icon.check(10)}</div>
                <div style={{width: 14, height: 1, background: GLASS.hairlineStrong}} />
                <div style={{width: 18, height: 18, borderRadius: 9, background: LUMEN.accent, color: LUMEN.on, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2</div>
                <span style={{fontWeight: 500}}>Coordonnées</span>
                <div style={{width: 14, height: 1, background: GLASS.hairlineStrong}} />
                <div style={{width: 18, height: 18, borderRadius: 9, border: `1px solid ${GLASS.hairlineStrong}`, color: GLASS.label3, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>3</div>
              </div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, padding: '14px 16px 0', background: `linear-gradient(180deg, rgb(17 15 21 / 0) 0%, ${GLASS.thick} 22%)`}}>
              <GoldButton pressed={tween(frame, [SEND.at - 4, SEND.at], [0, 1]) * (1 - tween(frame, [SEND.at + 2, SEND.at + 8], [0, 1]))}>
                Envoyer la demande
              </GoldButton>
            </div>
          </>
        )}
      </div>
      {!sent ? <Tap {...SEND} light={false} /> : null}
      <AbsoluteFill style={{background: `rgb(6 4 8 / ${fadeOut})`}} />
    </Screen>
  );
};
