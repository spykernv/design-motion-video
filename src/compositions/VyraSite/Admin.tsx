// « Vous décidez » and « Une table très demandée » — the manager's dashboard (/admin) on a phone,
// drawn after the app's (src/app/admin/page.tsx, src/components/admin/night-tables.tsx): the
// night, its tables, a table's requests, a buyer's card; on a night that takes offers, the
// highest one and « Proposer de surenchérir ». Demo data (data.ts). Clients.tsx shows the
// buyers' Instagram and the night's export. Since 2026-11-07 the dashboard takes the app's « Dark
// Sculpted » tokens as they are (charcoal, ivory, Inter): the films follow, the light where gold was.
import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

import {NIGHT, OTHER_TABLES, REQUESTS, TABLE, type Reach, type Request} from './data';
import {ADMIN, DS, euro, glow, INTER, light, tween} from './theme';
import {Icon, Screen, Tap} from './ui';

const STATUS: Record<string, string> = {Disponible: '#30d158', 'Sur demande': '#ffd60a', Complet: '#8e8e93'};

export function Badge({children, color}: {children: ReactNode; color?: string}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 22,
        padding: '0 8px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        border: `1px solid ${color ? `${color}55` : ADMIN.border}`,
        background: color ? `${color}1f` : 'transparent',
        color: color ?? ADMIN.muted,
      }}
    >
      {color ? <span style={{width: 6, height: 6, borderRadius: 3, background: color}} /> : null}
      {children}
    </span>
  );
}

export function Button({children, primary = false, pressed = 0, small = false}: {children: ReactNode; primary?: boolean; pressed?: number; small?: boolean}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: small ? 30 : 34,
        padding: small ? '0 10px' : '0 12px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        background: primary ? ADMIN.brand : ADMIN.secondary,
        color: primary ? ADMIN.brandOn : ADMIN.label,
        border: primary ? 'none' : `1px solid ${ADMIN.border}`,
        transform: `scale(${1 - 0.04 * pressed})`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

const DAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
/** Octobre 2026 starts on a Thursday; nights on the 3rd, 10th, 17th, 24th, 31st. */
function Calendar() {
  const cells = Array.from({length: 35}, (_, i) => i - 2);
  return (
    <div style={{border: `1px solid ${ADMIN.border}`, borderRadius: 12, background: ADMIN.card, padding: 12}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 500}}>
        <span style={{color: ADMIN.muted}}>{Icon.chevronLeft(16)}</span>
        octobre 2026
        <span style={{color: ADMIN.muted, transform: 'rotate(180deg)', display: 'inline-flex'}}>{Icon.chevronLeft(16)}</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginTop: 8, fontSize: 11, color: ADMIN.muted, textAlign: 'center'}}>
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2, marginTop: 4}}>
        {cells.map((day) => {
          const inMonth = day >= 1 && day <= 31;
          const night = inMonth && day % 7 === 3;
          const chosen = day === 10;
          return (
            <div key={day} style={{height: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 13}}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: chosen ? ADMIN.brand : 'transparent',
                  color: chosen ? ADMIN.brandOn : inMonth ? ADMIN.label : 'transparent',
                  fontWeight: chosen ? 600 : 400,
                }}
              >
                {inMonth ? day : ''}
              </span>
              <span style={{width: 4, height: 4, borderRadius: 2, marginTop: -2, background: night && !chosen ? ADMIN.brand : 'transparent'}} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableRow({label, status, minimum, capacity, requests, lit = 0, pressed = 0}: {label: string; status: string; minimum: number; capacity: string; requests: ReactNode; lit?: number; pressed?: number}) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderTop: `1px solid ${ADMIN.border}`,
        background: light(0.09 * lit),
        boxShadow: lit > 0.01 ? `inset 0 0 0 1px ${light(0.4 * lit)}, inset 0 0 18px -6px ${glow(0.4 * lit)}` : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: 16, fontWeight: 600, width: 30}}>{label}</span>
        <Badge color={STATUS[status]}>{status}</Badge>
      </div>
      <div style={{fontSize: 13, color: ADMIN.muted}}>
        {euro(minimum)} · {capacity}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontSize: 13, color: lit > 0.05 ? ADMIN.label : ADMIN.muted}}>{requests}</span>
        <div style={{display: 'flex', gap: 6}}>
          <Button small>Modifier</Button>
          <Button small pressed={pressed}>
            Demandes
          </Button>
        </div>
      </div>
    </div>
  );
}

const plural = (n: number) => (n === 0 ? 'Aucune demande' : `${n} demande${n > 1 ? 's' : ''}`);

/** The night's page under the sheet: its calendar, its name, its tables. */
export function NightPage({
  scroll,
  p1Requests,
  p1Lit,
  press,
  exportPress = 0,
}: {
  scroll: number;
  p1Requests: ReactNode;
  p1Lit: number;
  press: number;
  /** The tap on « Exporter la soirée (CSV) ». */
  exportPress?: number;
}) {
  return (
    <div style={{padding: '22px 16px', transform: `translateY(${-scroll}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div>
          <div style={{fontSize: 17, fontWeight: 600}}>{NIGHT.club}</div>
          <div style={{fontSize: 13, color: ADMIN.muted}}>equipe@exemple.fr</div>
        </div>
        <Button small>Se déconnecter</Button>
      </div>
      <div style={{marginTop: 18}}>
        <Calendar />
      </div>
      <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: 21, fontWeight: 600}}>{NIGHT.name}</span>
        <Badge>démo</Badge>
      </div>
      <div style={{fontSize: 13, color: ADMIN.muted, marginTop: 2}}>
        {NIGHT.dateTitle} · {NIGHT.doors} · {NIGHT.club}
      </div>
      <div style={{marginTop: 10}}>
        <Button small pressed={exportPress}>
          {Icon.download(14)} Exporter la soirée (CSV)
        </Button>
      </div>
      <div style={{marginTop: 16, border: `1px solid ${ADMIN.border}`, borderRadius: 12, background: ADMIN.card, overflow: 'hidden'}}>
        <div style={{padding: '10px 14px', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADMIN.muted}}>
          La Coursive · Bâbord · Tribord
        </div>
        {OTHER_TABLES.map((t) => (
          <TableRow key={t.label} {...t} requests={plural(t.requests)} />
        ))}
        <div style={{padding: '10px 14px', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADMIN.muted, borderTop: `1px solid ${ADMIN.border}`}}>
          {TABLE.zone}
        </div>
        <TableRow label={TABLE.label} status="Sur demande" minimum={TABLE.minimum} capacity={TABLE.capacity} requests={p1Requests} lit={p1Lit} pressed={press} />
      </div>
      <div style={{height: 400}} />
    </div>
  );
}

const COMPACT = new Intl.NumberFormat('fr-FR', {notation: 'compact', maximumFractionDigits: 1, roundingMode: 'trunc'} as Intl.NumberFormatOptions);
/** `850`, `48,2 k`: as the dashboard writes followers and interactions in the list. */
export const compact = (n: number) => COMPACT.format(n);

/**
 * Under the group, the buyer's Instagram as the list shows it (app: ReachFigures): followers and
 * interactions, or « Compte privé ». `lit` makes the followers stand out.
 */
function ReachFigures({reach, lit = 0}: {reach: Reach; lit?: number}) {
  const figure = (value: string, unit: string, shine = 0) => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 22,
        padding: '0 8px',
        borderRadius: 6,
        fontSize: 12,
        border: `1px solid ${shine > 0.01 ? light(0.3 + 0.6 * shine) : ADMIN.border}`,
        background: light(0.1 * shine),
        boxShadow: shine > 0.01 ? `0 0 ${20 * shine}px ${glow(0.45 * shine)}` : 'none',
        transform: `scale(${1 + 0.14 * shine})`,
        transformOrigin: 'left center',
        // room for the badge as it grows
        marginRight: 14 * shine,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{fontWeight: 600, color: ADMIN.label}}>{value}</span>
      <span style={{color: ADMIN.muted}}>{unit}</span>
    </span>
  );
  return (
    <div style={{display: 'flex', gap: 6, margin: '6px 0 4px'}}>
      {'private' in reach ? (
        figure('Compte privé', '')
      ) : (
        <>
          {figure(compact(reach.followers), 'abonnés', lit)}
          {figure(compact(reach.interactions), 'interactions')}
        </>
      )}
    </div>
  );
}

export function RequestRow({
  request,
  offers,
  lit = 0,
  pressed = 0,
  reach,
  reachLit = 0,
}: {
  request: Request;
  offers: boolean;
  lit?: number;
  pressed?: number;
  /** The buyer's Instagram, shown under the group as in the app. */
  reach?: Reach;
  reachLit?: number;
}) {
  const amount =
    request.offer !== null ? `Offre ${euro(request.offer)}` : `${euro(TABLE.minimum)} · sous-total`;
  return (
    <div
      style={{
        padding: '12px 14px',
        borderTop: `1px solid ${ADMIN.border}`,
        background: light(0.09 * lit + 0.05 * pressed),
        boxShadow: lit > 0.01 ? `inset 0 0 0 1px ${light(0.4 * lit)}, inset 0 0 18px -6px ${glow(0.4 * lit)}` : undefined,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8}}>
        <span style={{fontSize: 15, fontWeight: 500}}>
          {request.first} {request.last}
        </span>
        {offers ? (
          <span style={{fontSize: 14, fontWeight: request.offer !== null ? 700 : 400, color: request.offer !== null ? ADMIN.label : ADMIN.muted, whiteSpace: 'nowrap'}}>{amount}</span>
        ) : null}
      </div>
      <div style={{fontSize: 13, color: ADMIN.muted, marginTop: 2}}>{request.people} personnes</div>
      {reach ? <ReachFigures reach={reach} lit={reachLit} /> : null}
      <div style={{fontSize: 12, color: ADMIN.muted, marginTop: 2}}>
        {request.reference} · reçue le {request.receivedAt}
      </div>
    </div>
  );
}

/** The sheet a table's requests open in, from the right: three quarters of a phone. */
function Sheet({shown, children}: {shown: number; children: ReactNode}) {
  return (
    <>
      <AbsoluteFill style={{background: `rgb(0 0 0 / ${0.55 * shown})`}} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: 318,
          background: ADMIN.background,
          borderLeft: `1px solid ${ADMIN.border}`,
          transform: `translateX(${(1 - shown) * 330}px)`,
          boxShadow: '-20px 0 60px rgb(0 0 0 / 0.5)',
          overflow: 'hidden',
          fontFamily: INTER,
        }}
      >
        <div style={{position: 'absolute', right: 14, top: 18, color: ADMIN.muted}}>{Icon.close(16)}</div>
        {children}
      </div>
    </>
  );
}

export function SortSelect({label, pressed = 0}: {label: string; pressed?: number}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13}}>
      <span style={{color: ADMIN.muted, display: 'inline-flex', alignItems: 'center', gap: 4}}>
        {Icon.sort(14)} Trier
      </span>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${ADMIN.input}`, background: ADMIN.card, transform: `scale(${1 - 0.04 * pressed})`}}>
        {label} {Icon.chevronDown(14)}
      </span>
    </div>
  );
}

function BuyerCard({request}: {request: Request}) {
  const row = (label: string, value: string) => (
    <div key={label} style={{display: 'flex', gap: 10, padding: '8px 0', borderTop: `1px solid ${ADMIN.border}`, fontSize: 13}}>
      <span style={{width: 78, color: ADMIN.muted, flexShrink: 0}}>{label}</span>
      <span>{value}</span>
    </div>
  );
  const box = (label: string) => (
    <div style={{flex: 1, border: `1px solid ${ADMIN.border}`, borderRadius: 10, padding: '8px 10px', background: ADMIN.card}}>
      <div style={{fontSize: 11, color: ADMIN.muted}}>{label}</div>
      <div style={{fontSize: 17, fontWeight: 600}}>—</div>
    </div>
  );
  return (
    <div style={{padding: '18px 16px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: ADMIN.muted}}>
        {Icon.chevronLeft(15)} Toutes les demandes
      </div>
      <div style={{fontSize: 20, fontWeight: 600, marginTop: 10}}>
        {request.first} {request.last}
      </div>
      <div style={{fontSize: 12, color: ADMIN.muted}}>
        {request.reference} · reçue le {request.receivedAt}
      </div>
      <div style={{display: 'flex', gap: 6, marginTop: 12}}>
        <Button small>{Icon.message(14)} WhatsApp</Button>
        <Button small>{Icon.mail(14)} E-mail</Button>
      </div>
      <div style={{fontSize: 13, fontWeight: 500, marginTop: 16}}>Groupe · {request.people} personnes</div>
      <div style={{display: 'flex', gap: 8, marginTop: 8}}>
        {box('Femmes')}
        {box('Hommes')}
      </div>
      <div style={{marginTop: 14}}>
        {row('Référence', request.reference)}
        {row('Téléphone', request.phone)}
        {row('E-mail', request.email)}
        {row('Table', `${TABLE.label} · ${TABLE.zone}`)}
        {row('Soirée', NIGHT.name)}
        {request.message ? row('Message', request.message) : null}
      </div>
    </div>
  );
}

/* ── « Vous décidez »: a request comes in, the manager sorts the table's requests, opens one and
   answers on WhatsApp ── */

/** The sorts the dashboard offers on a night without offers (app: src/lib/admin/requests.ts). */
export const SORTS = [
  'Plus récentes',
  'Plus anciennes',
  'Plus de personnes',
  'Moins de personnes',
  'Plus d’abonnés',
  'Plus d’interactions',
];

/**
 * The select's list of sorts, `shown` from 0 to 1, the pointer on `hover`, the current one ticked;
 * over the rows, which stack to climb as they sort. `style` places it.
 */
export function SortMenu({shown, hover, style}: {shown: number; hover: number; style: CSSProperties}) {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 3,
        width: 200,
        padding: 4,
        borderRadius: 10,
        background: ADMIN.popover,
        border: `1px solid ${ADMIN.border}`,
        boxShadow: '0 16px 40px rgb(0 0 0 / 0.55)',
        opacity: shown,
        transform: `translateY(${(1 - shown) * -6}px) scale(${0.97 + 0.03 * shown})`,
        transformOrigin: 'top left',
        fontSize: 13,
        ...style,
      }}
    >
      {SORTS.map((label, i) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 30,
            padding: '0 10px',
            borderRadius: 6,
            background: i === hover ? ADMIN.secondary : 'transparent',
          }}
        >
          {label}
          {i === 0 ? <span style={{color: ADMIN.brand}}>{Icon.check(12)}</span> : null}
        </div>
      ))}
    </div>
  );
}

export const BOARD_DURATION = 420;
const ARRIVE = 46;
/** The taps: « Demandes » of P1, the sort, « Plus de personnes », Camille's request, « WhatsApp ». */
const OPEN_REQUESTS = {at: 86, x: 317, y: 633};
const OPEN_SORT = {at: 124, x: 214, y: 92};
const PICK_SORT = {at: 166, x: 196, y: 191};
const OPEN_BUYER = {at: 222, x: 230, y: 230};
const ANSWER = {at: 300, x: 136, y: 122};
const ROW = 76;

export const Board = () => {
  const frame = useCurrentFrame();
  const scroll = tween(frame, [8, 36], [0, 330]);
  const arrived = tween(frame, [ARRIVE, ARRIVE + 10], [0, 1]);
  const shine = arrived * (1 - tween(frame, [ARRIVE + 30, ARRIVE + 60], [0, 1]));
  const sheet = tween(frame, [OPEN_REQUESTS.at + 4, OPEN_REQUESTS.at + 20], [0, 1]);
  const menu = tween(frame, [OPEN_SORT.at + 2, OPEN_SORT.at + 10], [0, 1]) * (1 - tween(frame, [PICK_SORT.at + 2, PICK_SORT.at + 8], [0, 1]));
  // the pointer runs down the list before it picks
  const hover = Math.round(tween(frame, [OPEN_SORT.at + 14, PICK_SORT.at - 6], [0, 2]));
  const sorted = tween(frame, [PICK_SORT.at + 6, PICK_SORT.at + 26], [0, 1]);
  const buyer = tween(frame, [OPEN_BUYER.at + 4, OPEN_BUYER.at + 18], [0, 1]);
  const chat = tween(frame, [ANSWER.at + 4, ANSWER.at + 20], [0, 1]);
  const fadeOut = tween(frame, [BOARD_DURATION - 14, BOARD_DURATION - 1], [0, 1]);
  const press = (at: number) => tween(frame, [at - 5, at], [0, 1]) * (1 - tween(frame, [at + 2, at + 8], [0, 1]));
  const requests = REQUESTS.slice(0, 3);
  // most recent first, then the largest group first
  const byPeople = [...requests].sort((a, b) => b.people - a.people);
  const camille = requests[0];
  return (
    <Screen background={ADMIN.background}>
      <NightPage
        scroll={scroll}
        p1Requests={arrived > 0.5 ? plural(3) : plural(2)}
        p1Lit={shine}
        press={press(OPEN_REQUESTS.at)}
      />
      <Tap {...OPEN_REQUESTS} />
      <Sheet shown={sheet}>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${-buyer * 100}%)`, opacity: 1 - buyer}}>
          <div style={{padding: '18px 16px 0'}}>
            <div style={{fontSize: 17, fontWeight: 600}}>Demandes · Table {TABLE.label}</div>
            <div style={{fontSize: 13, color: ADMIN.muted}}>3 demandes · {NIGHT.name}</div>
            <SortSelect label={sorted > 0.01 ? 'Plus de personnes' : 'Plus récentes'} pressed={press(OPEN_SORT.at)} />
          </div>
          <div style={{position: 'relative', marginTop: 14, height: ROW * 3}}>
            {requests.map((request, i) => {
              const after = byPeople.indexOf(request);
              const y = ROW * (i + (after - i) * sorted);
              return (
                <div
                  key={request.reference}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: y,
                    height: ROW,
                    background: ADMIN.background,
                    // the row climbing the list passes over the others
                    zIndex: after < i ? 2 : 1,
                  }}
                >
                  <RequestRow
                    request={request}
                    offers={false}
                    lit={request === camille ? shine : 0}
                    pressed={request === camille ? press(OPEN_BUYER.at) : 0}
                  />
                </div>
              );
            })}
          </div>
          <SortMenu shown={menu} hover={hover} style={{left: 70, top: 112}} />
        </div>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - buyer) * 100}%)`}}>
          <BuyerCard request={camille} />
        </div>
      </Sheet>
      {sheet > 0.99 && menu < 0.5 && sorted < 0.01 ? <Tap {...OPEN_SORT} /> : null}
      {menu > 0.5 ? <Tap {...PICK_SORT} /> : null}
      {sorted > 0.99 && buyer < 1 ? <Tap {...OPEN_BUYER} /> : null}
      {buyer > 0.99 ? <Tap {...ANSWER} /> : null}
      {/* WhatsApp opens with the answer written: « Votre demande REF : table P1, soirée … » */}
      <AbsoluteFill style={{transform: `translateY(${(1 - chat) * 100}%)`, background: '#0b141a', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        <div style={{height: 104, background: '#1f2c34', display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px', gap: 10}}>
          <span style={{color: '#e9edef'}}>{Icon.chevronLeft(20)}</span>
          <div style={{width: 36, height: 36, borderRadius: 18, background: '#6a7175', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600}}>
            {camille.first[0]}
          </div>
          <div style={{color: '#e9edef', fontSize: 16, fontWeight: 600}}>
            {camille.first} {camille.last}
          </div>
        </div>
        <div style={{position: 'absolute', left: 8, right: 8, bottom: 30, display: 'flex', gap: 8, alignItems: 'flex-end'}}>
          <div style={{flex: 1, minHeight: 44, borderRadius: 22, background: '#1f2c34', color: '#e9edef', fontSize: 16, lineHeight: '21px', padding: '11px 16px'}}>
            {`Votre demande ${camille.reference} : table ${TABLE.label}, soirée ${NIGHT.name}`.slice(0, Math.max(0, Math.floor((frame - ANSWER.at - 18) * 2.2)))}
            <span style={{opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: '#25d366'}}>|</span>
          </div>
          <div style={{width: 44, height: 44, borderRadius: 22, background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b141a'}}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21 23 12 2 3v7l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: DS.ink, opacity: fadeOut}} />
    </Screen>
  );
};

/* ── The club's side of an offers night: the highest offer, « Proposer de surenchérir », and the
   list re-ranked once another buyer raises theirs (Offers.tsx tells the whole flow) ── */

/** Room left at the top of a scene of the offers' film for its label. */
export const LABEL_SPACE = 40;

/**
 * The table's requests on a night that takes offers, as the manager sees them. Frames are the
 * scene's own: `ask` the tap on « Proposer de surenchérir », `send` the tap on « Envoyer », `raise`
 * when Hugo's raised offer reaches the list.
 */
export function ClubScene({ask, send, raise}: {ask?: number; send?: number; raise?: number}) {
  const frame = useCurrentFrame();
  const dy = LABEL_SPACE;
  const dialog =
    ask !== undefined && send !== undefined
      ? tween(frame, [ask + 4, ask + 14], [0, 1]) * (1 - tween(frame, [send + 2, send + 10], [0, 1]))
      : 0;
  const toast =
    send !== undefined ? tween(frame, [send + 8, send + 18], [0, 1]) * (1 - tween(frame, [send + 46, send + 56], [0, 1])) : 0;
  const raised = raise !== undefined ? tween(frame, [raise, raise + 18], [0, 1]) : 0;
  const shine = raised * (1 - tween(frame, [(raise ?? 0) + 40, (raise ?? 0) + 70], [0, 1]));
  const press = (at?: number) =>
    at === undefined ? 0 : tween(frame, [at - 5, at], [0, 1]) * (1 - tween(frame, [at + 2, at + 8], [0, 1]));
  const [camille, hugo, ines] = REQUESTS;
  const hugoNow = {...hugo, offer: raised > 0.5 ? 3400 : hugo.offer};
  const top = raised > 0.5 ? hugoNow : camille;
  // Hugo's row climbs above Camille's once his offer is the highest
  const rowHeight = 74;
  const order = [
    {request: camille, y: rowHeight * raised},
    {request: hugoNow, y: rowHeight - rowHeight * raised},
    {request: ines, y: rowHeight * 2},
  ];
  return (
    <AbsoluteFill style={{background: ADMIN.background, fontFamily: INTER, color: ADMIN.label}}>
      <div style={{padding: `${22 + dy}px 16px 0`}}>
        <div style={{fontSize: 18, fontWeight: 600}}>Demandes · Table {TABLE.label}</div>
        <div style={{fontSize: 13, color: ADMIN.muted}}>3 demandes · {NIGHT.name} · soirée à offres</div>
        <SortSelect label="Plus gros montant" />
        <div style={{marginTop: 16, border: `1px solid ${light(0.32)}`, borderRadius: 12, background: light(0.04), boxShadow: `0 0 18px -6px ${glow(0.35)}`, padding: 14}}>
          <div style={{fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADMIN.muted}}>Offre la plus haute</div>
          <div style={{fontSize: 28, fontWeight: 600, color: ADMIN.brand, marginTop: 2}}>{euro(top.offer ?? 0)}</div>
          <div style={{fontSize: 13, color: ADMIN.muted}}>{top.reference} · 2 autres demandes en dessous</div>
          <div style={{marginTop: 12}}>
            <Button primary pressed={press(ask)}>
              Proposer de surenchérir
            </Button>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 16, right: 16, top: 300 + dy, height: rowHeight * 3, border: `1px solid ${ADMIN.border}`, borderRadius: 12, background: ADMIN.card, overflow: 'hidden', isolation: 'isolate'}}>
        {order.map(({request, y}) => (
          <div
            key={request.reference}
            style={{position: 'absolute', left: 0, right: 0, top: y - 1, height: rowHeight, background: ADMIN.card, zIndex: request === hugoNow ? 2 : 1}}
          >
            <RequestRow request={request} offers lit={request === hugoNow ? shine : 0} />
          </div>
        ))}
      </div>
      {ask !== undefined ? <Tap at={ask} x={112} y={254 + dy} light={false} /> : null}
      {/* the alert asking before anything is sent */}
      <AbsoluteFill style={{background: `rgb(0 0 0 / ${0.6 * dialog})`}} />
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 330 + dy,
          padding: 20,
          borderRadius: 14,
          background: ADMIN.popover,
          border: `1px solid ${ADMIN.border}`,
          opacity: dialog,
          transform: `scale(${0.95 + 0.05 * dialog})`,
        }}
      >
        <div style={{fontSize: 17, fontWeight: 600}}>Proposer de surenchérir</div>
        <p style={{fontSize: 14, lineHeight: '20px', color: ADMIN.muted, margin: '8px 0 0'}}>
          Prévenir par e-mail les 2 autres demandeurs que la table a reçu une offre de {euro(camille.offer ?? 0)} ? Chacun pourra relever la sienne. Aucun nom n’est donné.
        </p>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18}}>
          <Button>Annuler</Button>
          <Button primary pressed={press(send)}>
            Envoyer
          </Button>
        </div>
      </div>
      {send !== undefined && dialog > 0.5 ? <Tap at={send} x={312} y={479 + dy} light={false} /> : null}
      {/* sonner's toast, top centre */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: 26 + dy,
          padding: '12px 16px',
          borderRadius: 10,
          background: ADMIN.popover,
          border: `1px solid ${ADMIN.border}`,
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: toast,
          transform: `translateY(${(1 - toast) * -16}px)`,
          boxShadow: '0 10px 30px rgb(0 0 0 / 0.5)',
        }}
      >
        <span style={{color: ADMIN.label, display: 'inline-flex'}}>{Icon.circleCheck(16)}</span>2 demandeurs prévenus
      </div>
    </AbsoluteFill>
  );
}
