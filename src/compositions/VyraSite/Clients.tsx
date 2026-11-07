// « Vos clients » — what the requests leave the club (app: /admin, VYR-89 and VYR-92): each buyer's
// Instagram beside the request and the sort by followers, a buyer's card with their history at the
// club, then the night exported and opened in a spreadsheet. A label names each step. Demo data
// (data.ts): the handles end in « .demo », the figures are made up.
import type {ReactNode} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';

import {Button, LABEL_SPACE, NightPage, RequestRow, SortMenu, SortSelect} from './Admin';
import {NIGHT, NIGHT_FILE, REACH, REQUESTS, TABLE, VISITS} from './data';
import {ADMIN, DS, glow, INTER, light, tween} from './theme';
import {Icon, Screen, SideLabel, Tap} from './ui';

export const CLIENTS_DURATION = 480;

const SCENES = [
  {from: 0, length: 176, text: 'Qui fait venir du monde'},
  {from: 170, length: 146, text: 'Qui revient'},
  {from: 310, length: 170, text: 'Votre fichier clients'},
] as const;

const dy = LABEL_SPACE;
const NUMBER = new Intl.NumberFormat('fr-FR');
const [camille, hugo, ines] = REQUESTS;

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

/** The club's side, and what the step shows. */
function Label() {
  const frame = useCurrentFrame();
  const scene = [...SCENES].reverse().find((s) => frame >= s.from) ?? SCENES[0];
  return <SideLabel club text={`${SCENES.indexOf(scene) + 1} · ${scene.text}`} />;
}

const press = (frame: number, at: number) => tween(frame, [at - 5, at], [0, 1]) * (1 - tween(frame, [at + 2, at + 8], [0, 1]));

/* ── 1 — the loge's requests, each buyer's Instagram beside theirs; sorted by followers, the
   biggest account climbs to the top ── */

const LIST_TOP = 130 + dy;
const ROW = 104;
const OPEN = {at: 36, x: 128, y: 97 + dy};
const PICK = {at: 92, x: 150, y: 256 + dy};
const OPEN_HUGO = {at: 160, x: 150, y: LIST_TOP + ROW / 2};

function Followers() {
  const frame = useCurrentFrame();
  const menu = tween(frame, [OPEN.at + 2, OPEN.at + 10], [0, 1]) * (1 - tween(frame, [PICK.at + 2, PICK.at + 8], [0, 1]));
  const hover = Math.round(tween(frame, [OPEN.at + 14, PICK.at - 6], [0, 4]));
  const sorted = tween(frame, [PICK.at + 6, PICK.at + 30], [0, 1]);
  const wow = tween(frame, [PICK.at + 24, PICK.at + 40], [0, 1]) * (1 - 0.35 * tween(frame, [PICK.at + 60, PICK.at + 80], [0, 1]));
  const rows = [
    {request: camille, before: 0, after: 1},
    {request: hugo, before: 1, after: 0},
    {request: ines, before: 2, after: 2},
  ];
  return (
    <AbsoluteFill style={{background: ADMIN.background, fontFamily: INTER, color: ADMIN.label}}>
      <div style={{padding: `${22 + dy}px 16px 0`}}>
        <div style={{fontSize: 18, fontWeight: 600}}>Demandes · Table {TABLE.label}</div>
        <div style={{fontSize: 13, color: ADMIN.muted}}>3 demandes · {NIGHT.name}</div>
        <SortSelect label={sorted > 0.01 ? 'Plus d’abonnés' : 'Plus récentes'} pressed={press(frame, OPEN.at)} />
      </div>
      <div style={{position: 'absolute', left: 16, right: 16, top: LIST_TOP, height: ROW * 3, border: `1px solid ${ADMIN.border}`, borderRadius: 12, background: ADMIN.card, overflow: 'hidden', isolation: 'isolate'}}>
        {rows.map(({request, before, after}) => (
          <div
            key={request.reference}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: ROW * (before + (after - before) * sorted) - 1,
              height: ROW,
              background: ADMIN.card,
              // the row climbing the list passes over the others
              zIndex: after < before ? 2 : 1,
            }}
          >
            <RequestRow
              request={request}
              offers={false}
              reach={REACH[request.reference]}
              reachLit={request === hugo ? wow : 0}
              pressed={request === hugo ? press(frame, OPEN_HUGO.at) : 0}
            />
          </div>
        ))}
      </div>
      <SortMenu shown={menu} hover={hover} style={{left: 74, top: 117 + dy}} />
      {menu < 0.5 && sorted < 0.01 ? <Tap {...OPEN} /> : null}
      {menu > 0.5 ? <Tap {...PICK} /> : null}
      {sorted > 0.99 ? <Tap {...OPEN_HUGO} /> : null}
    </AbsoluteFill>
  );
}

/* ── 2 — Hugo's card: his Instagram, read by its API, and his requests to the club ── */

function Stat({label, value, lit = 0}: {label: string; value: string; lit?: number}) {
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${lit > 0.01 ? light(0.3 + 0.5 * lit) : ADMIN.border}`,
        borderRadius: 10,
        padding: '8px 10px',
        background: lit > 0.01 ? light(0.07 * lit) : ADMIN.card,
        boxShadow: lit > 0.01 ? `0 0 ${22 * lit}px ${glow(0.35 * lit)}` : 'none',
      }}
    >
      <div style={{fontSize: 11, color: ADMIN.muted}}>{label}</div>
      <div style={{fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: ADMIN.label}}>{value}</div>
    </div>
  );
}

function HugoCard() {
  const frame = useCurrentFrame();
  const shown = tween(frame, [0, 16], [0, 1]);
  const count = tween(frame, [20, 52], [0, 1]);
  const reach = REACH[hugo.reference];
  const followers = 'private' in reach ? 0 : reach.followers;
  const interactions = 'private' in reach ? 0 : reach.interactions;
  const statLit = tween(frame, [44, 62], [0, 1]) * (1 - 0.4 * tween(frame, [90, 110], [0, 1]));
  const history = tween(frame, [84, 100], [0, 1]);
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
  const visits = VISITS[hugo.reference];
  return (
    <AbsoluteFill style={{background: ADMIN.background, fontFamily: INTER, color: ADMIN.label}}>
      <div style={{padding: `${18 + dy}px 16px`, transform: `translateX(${(1 - shown) * 60}px)`, opacity: shown}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: ADMIN.muted}}>
          {Icon.chevronLeft(15)} Toutes les demandes
        </div>
        <div style={{fontSize: 20, fontWeight: 600, marginTop: 10}}>
          {hugo.first} {hugo.last}
        </div>
        <div style={{fontSize: 12, color: ADMIN.muted}}>
          {hugo.reference} · reçue le {hugo.receivedAt}
        </div>
        <div style={{display: 'flex', gap: 6, marginTop: 12}}>
          <Button small>{Icon.message(14)} WhatsApp</Button>
          <Button small>{Icon.at(14)} Instagram</Button>
          <Button small>{Icon.mail(14)} E-mail</Button>
        </div>
        <div style={{fontSize: 13, fontWeight: 500, marginTop: 18}}>Instagram · @{reach.handle}</div>
        <div style={{display: 'flex', gap: 8, marginTop: 8}}>
          <Stat label="Abonnés" value={NUMBER.format(Math.round(followers * count))} lit={statLit} />
          <Stat label="Interactions / post" value={NUMBER.format(Math.round(interactions * count))} />
        </div>
        <div style={{fontSize: 11, lineHeight: '15px', color: ADMIN.muted, marginTop: 6}}>
          Compte pro · lu sur Instagram le 10/10 à 23:02 · interactions : moyenne des 12 derniers posts
        </div>
        <div style={{fontSize: 13, fontWeight: 500, marginTop: 18}}>Groupe · {hugo.people} personnes</div>
        <div style={{display: 'flex', gap: 8, marginTop: 8}}>
          {box('Femmes')}
          {box('Hommes')}
        </div>
        <div style={{marginTop: 8}}>
          <span
            style={{
              display: 'inline-block',
              fontSize: 12,
              padding: '3px 8px',
              marginLeft: -8,
              borderRadius: 6,
              color: history > 0.5 ? ADMIN.label : ADMIN.muted,
              background: light(0.1 * history),
              boxShadow: history > 0.01 ? `inset 0 0 0 1px ${light(0.4 * history)}, 0 0 ${18 * history}px ${glow(0.3 * history)}` : 'none',
            }}
          >
            {visits} demandes au club
          </span>
        </div>
        <div style={{marginTop: 14}}>
          {row('Référence', hugo.reference)}
          {row('Téléphone', NIGHT_FILE[1].phone)}
          {row('Table', `${TABLE.label} · ${TABLE.zone}`)}
          {row('Soirée', NIGHT.name)}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── 3 — « Exporter la soirée (CSV) », and the night's file in a spreadsheet ── */

const EXPORT = {at: 30, x: 111, y: 112 + dy};
const FILE_NAME = 'lumen-club-samedi-soir-2026-10-10.csv';

// the file's columns the film shows, in the export's order; it ends on followers and visits
const COLUMNS: {title: string; width: number; cell: (row: (typeof NIGHT_FILE)[number]) => string}[] = [
  {title: 'Nom', width: 92, cell: (r) => r.last},
  {title: 'Table', width: 60, cell: (r) => r.table},
  {title: 'Personnes', width: 86, cell: (r) => String(r.people)},
  {title: 'Téléphone', width: 124, cell: (r) => r.phone},
  {title: 'Instagram', width: 140, cell: (r) => r.instagram ?? ''},
  {title: 'Abonnés', width: 80, cell: (r) => (r.followers === null ? '' : String(r.followers))},
  {title: 'Demandes au club', width: 128, cell: (r) => String(r.visits)},
];
const FIRST = 92;
const SHEET = {page: '#ffffff', head: '#f4f4f5', rule: '#e4e4e7', ink: '#18181b', muted: '#71717a', lit: '#ece5d8'};

function Export() {
  const frame = useCurrentFrame();
  const toast = tween(frame, [EXPORT.at + 6, EXPORT.at + 16], [0, 1]) * (1 - tween(frame, [EXPORT.at + 40, EXPORT.at + 48], [0, 1]));
  const sheet = tween(frame, [EXPORT.at + 34, EXPORT.at + 52], [0, 1]);
  const width = COLUMNS.reduce((sum, c) => sum + c.width, 0);
  const scroll = tween(frame, [EXPORT.at + 66, EXPORT.at + 106], [0, width - (390 - FIRST)]);
  const fadeOut = tween(frame, [156, 169], [0, 1]);
  const cell = (text: string, w: number, head: boolean, lit = false) => (
    <div
      style={{
        width: w,
        flexShrink: 0,
        height: 38,
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        borderRight: `1px solid ${SHEET.rule}`,
        borderBottom: `1px solid ${SHEET.rule}`,
        fontSize: head ? 11.5 : 12.5,
        fontWeight: head ? 600 : 400,
        color: head ? SHEET.muted : SHEET.ink,
        background: lit ? SHEET.lit : head ? SHEET.head : SHEET.page,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{background: ADMIN.background, fontFamily: INTER, color: ADMIN.label}}>
      <div style={{position: 'absolute', inset: 0, top: dy, overflow: 'hidden'}}>
        <NightPage scroll={326} p1Requests="3 demandes" p1Lit={0} press={0} exportPress={press(frame, EXPORT.at)} />
      </div>
      <Tap at={EXPORT.at} x={EXPORT.x} y={EXPORT.y} />
      {/* the browser's download, top centre */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          right: 28,
          top: 26 + dy,
          padding: '12px 14px',
          borderRadius: 10,
          background: ADMIN.popover,
          border: `1px solid ${ADMIN.border}`,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: toast,
          transform: `translateY(${(1 - toast) * -16}px)`,
          boxShadow: '0 10px 30px rgb(0 0 0 / 0.5)',
        }}
      >
        <span style={{color: ADMIN.label, display: 'inline-flex'}}>{Icon.download(16)}</span>
        <span style={{display: 'flex', flexDirection: 'column'}}>
          <span style={{fontWeight: 500}}>{FILE_NAME}</span>
          <span style={{color: ADMIN.muted, fontSize: 12}}>Téléchargé · 6 demandes</span>
        </span>
      </div>
      {/* the file, opened in the club's spreadsheet */}
      <div style={{position: 'absolute', left: 0, right: 0, top: dy, bottom: 0, background: SHEET.page, transform: `translateY(${(1 - sheet) * 104}%)`, fontFamily: INTER}}>
        <div style={{height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', borderBottom: `1px solid ${SHEET.rule}`, color: SHEET.ink}}>
          <span style={{color: '#1f7a46'}}>{Icon.file(20)}</span>
          <span style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{fontSize: 14, fontWeight: 600}}>{FILE_NAME}</span>
            <span style={{fontSize: 12, color: SHEET.muted}}>6 demandes · 1 ligne chacune</span>
          </span>
        </div>
        <div style={{display: 'flex'}}>
          {/* the first column stays, the others slide */}
          <div style={{width: FIRST, flexShrink: 0, zIndex: 2, boxShadow: scroll < -1 || scroll > 1 ? '4px 0 10px rgb(0 0 0 / 0.08)' : 'none'}}>
            {cell('Prénom', FIRST, true)}
            {NIGHT_FILE.map((r) => (
              <div key={r.first}>{cell(r.first, FIRST, false, r.first === hugo.first)}</div>
            ))}
          </div>
          <div style={{overflow: 'hidden', flex: 1}}>
            <div style={{transform: `translateX(${-scroll}px)`, width}}>
              <div style={{display: 'flex'}}>{COLUMNS.map((c) => <div key={c.title}>{cell(c.title, c.width, true)}</div>)}</div>
              {NIGHT_FILE.map((r) => (
                <div key={r.first} style={{display: 'flex'}}>
                  {COLUMNS.map((c) => (
                    <div key={c.title}>{cell(c.cell(r), c.width, false, r.first === hugo.first)}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AbsoluteFill style={{background: DS.ink, opacity: fadeOut}} />
    </AbsoluteFill>
  );
}

export const Clients = () => {
  return (
    <Screen background={ADMIN.background}>
      {SCENES.map((scene, i) => (
        <Scene key={scene.text} from={scene.from} length={scene.length}>
          {i === 0 ? <Followers /> : i === 1 ? <HugoCard /> : <Export />}
        </Scene>
      ))}
      <Label />
    </Screen>
  );
};
