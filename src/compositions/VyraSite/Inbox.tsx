// « La demande arrive » — the manager's phone when a request comes in: the WhatsApp message and the
// e-mail VYRA sends at once (app: docs/notifications.md, src/server/notify/messages.ts), then the
// e-mail opened. The demo venue's messages say « démo », as the app's do. Plays once, on a tap.
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';

import {NIGHT, REQUESTS, TABLE} from './data';
import {euro, LUMEN, tween} from './theme';
import {Icon, Screen, Tap} from './ui';

export const INBOX_DURATION = 270;
const WHATSAPP_IN = 16;
const MAIL_IN = 52;
const OPEN = {at: 100, x: 195, y: 455};
const buyer = REQUESTS[0];

const MAIL = {page: '#f4f4f5', card: '#ffffff', ink: '#18181b', muted: '#71717a', rule: '#e4e4e7'};

function AppIcon({kind}: {kind: 'whatsapp' | 'mail'}) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 9,
        background: kind === 'whatsapp' ? 'linear-gradient(180deg, #5df37f, #1fbe4c)' : 'linear-gradient(180deg, #5ab8ff, #1a73e8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {kind === 'whatsapp' ? Icon.message(20) : Icon.mail(20)}
    </div>
  );
}

function Notification({kind, app, title, body, shown}: {kind: 'whatsapp' | 'mail'; app: string; title: string; body: string; shown: number}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 22,
        background: 'rgb(38 34 40 / 0.62)',
        backdropFilter: 'blur(30px) saturate(160%)',
        border: '1px solid rgb(255 255 255 / 0.08)',
        opacity: shown,
        transform: `translateY(${(1 - shown) * 40}px) scale(${0.94 + 0.06 * shown})`,
      }}
    >
      <AppIcon kind={kind} />
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgb(255 255 255 / 0.62)'}}>
          <span>{app}</span>
          <span>maintenant</span>
        </div>
        <div style={{fontSize: 15, fontWeight: 600, marginTop: 1}}>{title}</div>
        <div
          style={{
            fontSize: 15,
            lineHeight: '20px',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function MailRow({label, value}: {label: string; value: string}) {
  return (
    <div style={{display: 'flex', gap: 12, padding: '7px 0', borderTop: `1px solid ${MAIL.rule}`, fontSize: 14, lineHeight: '19px'}}>
      <span style={{width: 84, flexShrink: 0, color: MAIL.muted}}>{label}</span>
      <span style={{color: MAIL.ink}}>{value}</span>
    </div>
  );
}

/** The e-mail to the manager (app: messages.ts, html.ts), in its mail app. */
function Mail() {
  return (
    <div style={{background: MAIL.page, minHeight: 1200, color: MAIL.ink, fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'}}>
      <div style={{background: '#fff', padding: '58px 16px 14px', borderBottom: `1px solid ${MAIL.rule}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 4, color: '#1a73e8', fontSize: 16}}>
          {Icon.chevronLeft(20)} Boîte de réception
        </div>
        <div style={{fontSize: 19, fontWeight: 600, marginTop: 14, lineHeight: '24px'}}>
          [Démo] Nouvelle demande · Table {TABLE.label} · {NIGHT.name} · {buyer.people} pers. · {buyer.reference}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 12}}>
          <div style={{width: 34, height: 34, borderRadius: 17, background: '#161410', color: '#f2eee5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em'}}>V</div>
          <div style={{fontSize: 14}}>
            <div style={{fontWeight: 600}}>VYRA (démo)</div>
            <div style={{color: MAIL.muted, fontSize: 13}}>Répondre à : {buyer.first} {buyer.last}</div>
          </div>
        </div>
      </div>
      <div style={{padding: 14}}>
        <div style={{background: MAIL.card, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgb(0 0 0 / 0.06)'}}>
          <div style={{height: 4, background: LUMEN.accent}} />
          <div style={{padding: '18px 18px 20px'}}>
            <div style={{fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: MAIL.muted, fontWeight: 600}}>
              {NIGHT.club} · Nouvelle demande · Démo
            </div>
            <div style={{fontSize: 22, fontWeight: 700, marginTop: 8, lineHeight: '27px'}}>
              Table {TABLE.label} · {TABLE.zone}
            </div>
            <div style={{fontSize: 14, color: MAIL.muted, marginTop: 4}}>
              {NIGHT.name} · {NIGHT.date} · {buyer.people} personnes
            </div>
            <div style={{fontSize: 13, fontWeight: 600, marginTop: 18, marginBottom: 4}}>Client</div>
            <MailRow label="Nom" value={`${buyer.first} ${buyer.last}`} />
            <MailRow label="Téléphone" value={buyer.phone} />
            <MailRow label="E-mail" value={buyer.email} />
            <MailRow label="Message" value={buyer.message ?? ''} />
            <div style={{display: 'flex', gap: 8, marginTop: 14}}>
              <div style={{padding: '11px 16px', borderRadius: 8, background: LUMEN.accent, color: LUMEN.on, fontSize: 14, fontWeight: 600}}>Répondre sur WhatsApp</div>
              <div style={{padding: '11px 16px', borderRadius: 8, border: `1px solid ${MAIL.rule}`, fontSize: 14, fontWeight: 600}}>Appeler</div>
            </div>
            <div style={{fontSize: 13, fontWeight: 600, marginTop: 22, marginBottom: 4}}>La demande</div>
            <MailRow label="Soirée" value={`${NIGHT.name} · ${NIGHT.date}`} />
            <MailRow label="Table" value={`${TABLE.label} · ${TABLE.zone}`} />
            <MailRow label="Personnes" value={String(buyer.people)} />
            <MailRow label="Minimum" value={`${euro(TABLE.minimum)} pour ${buyer.people} personnes`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Inbox = () => {
  const frame = useCurrentFrame();
  const whatsapp = tween(frame, [WHATSAPP_IN, WHATSAPP_IN + 14], [0, 1]);
  const mail = tween(frame, [MAIL_IN, MAIL_IN + 14], [0, 1]);
  const open = tween(frame, [OPEN.at + 4, OPEN.at + 20], [0, 1]);
  const scroll = tween(frame, [150, 230], [0, 238]);
  return (
    <Screen background="#000">
      <AbsoluteFill>
        <Img
          src={staticFile('vyra-site/wallpaper.jpg')}
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px) brightness(0.5) saturate(1.2)', transform: 'scale(1.12)'}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 96, opacity: 1 - open}}>
        <div style={{fontSize: 18, fontWeight: 500, color: 'rgb(255 255 255 / 0.86)'}}>{NIGHT.date}</div>
        <div style={{fontSize: 92, fontWeight: 300, lineHeight: '100px', letterSpacing: '-0.02em'}}>23:41</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 10, right: 10, top: 400, display: 'flex', flexDirection: 'column', gap: 8, opacity: 1 - open}}>
        <div style={{height: mail * 118, overflow: 'visible'}}>
          {mail > 0 ? (
            <Notification
              kind="mail"
              app="Mail"
              title="VYRA (démo)"
              body={`[Démo] Nouvelle demande · Table ${TABLE.label} · ${NIGHT.name} · ${buyer.people} pers. · ${buyer.reference}`}
              shown={mail}
            />
          ) : null}
        </div>
        <Notification
          kind="whatsapp"
          app="WhatsApp"
          title="VYRA"
          body={`Nouvelle demande de table ${buyer.reference} (démo) pour la soirée ${NIGHT.name} du ${NIGHT.date} au ${NIGHT.club}. Table : ${TABLE.label} (${TABLE.zone}) · ${buyer.people} pers. · minimum ${euro(TABLE.minimum)}. Client : ${buyer.first} ${buyer.last}`}
          shown={whatsapp}
        />
      </div>
      <Tap {...OPEN} />
      {open > 0 ? (
        <AbsoluteFill
          style={{
            opacity: open,
            transform: `scale(${0.9 + 0.1 * open})`,
            borderRadius: 40 * (1 - open),
            overflow: 'hidden',
          }}
        >
          <div style={{transform: `translateY(${-scroll}px)`}}>
            <Mail />
          </div>
        </AbsoluteFill>
      ) : null}
    </Screen>
  );
};
