// A real-time recording of the app's guest screens with scripted taps (Chrome's screencast, drawn at
// twice the size), for VyraSite-Guest: run from C:/dev/vyra-dice with its dev server up, e.g.
// pnpm exec tsx <this file> http://localhost:3002/lumen-club/samedi-soir <out> 390 844 wait:1.8 "text:Le Phare" wait:2.6 "click:[aria-label^='Table P1']" wait:3.2
// then ffmpeg -f concat -safe 0 -i <out>/frames.ffconcat -vf "fps=30,format=yuv420p" -c:v libx264 -crf 12 public/vyra-site/guest-app.mp4
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const [url, out, w, h, ...steps] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
import { spawn } from "node:child_process"
import os from "node:os"
const PORT = 9336
const chrome = spawn(
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(os.tmpdir(), "vyra-film-chrome")}`,
    `--window-size=${process.argv[4]},${process.argv[5]}`,
    "--force-device-scale-factor=2",
    "--hide-scrollbars",
    "--ignore-gpu-blocklist",
    "--no-first-run",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "about:blank",
  ],
  { stdio: "ignore" },
)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
for (let i = 0; i < 80; i++) {
  try {
    await fetch(`http://127.0.0.1:${PORT}/json/version`)
    break
  } catch {
    await sleep(250)
  }
}
class Browser {
  ws!: WebSocket
  seq = 0
  pending = new Map<number, (v: any) => void>()
  listeners = new Set<(m: any) => void>()
  errors: string[] = []
  static sleep = sleep
  static async open() {
    const targets = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()) as any[]
    const page = targets.find((t) => t.type === "page")
    const b = new Browser()
    b.ws = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => { b.ws.onopen = resolve; b.ws.onerror = reject })
    b.ws.onmessage = (event) => {
      const msg = JSON.parse(String(event.data))
      if (msg.id && b.pending.has(msg.id)) { b.pending.get(msg.id)!(msg.result); b.pending.delete(msg.id); return }
      if (msg.method === "Runtime.exceptionThrown") b.errors.push(JSON.stringify(msg.params).slice(0, 300))
      for (const l of b.listeners) l(msg)
    }
    await b.send("Page.enable")
    await b.send("Runtime.enable")
    return b
  }
  send(method: string, params: Record<string, unknown> = {}): Promise<any> {
    return new Promise((resolve) => { const id = ++this.seq; this.pending.set(id, resolve); this.ws.send(JSON.stringify({ id, method, params })) })
  }
  async evaluate<T>(expression: string): Promise<T> {
    const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
    return r?.result?.value as T
  }
  async viewport(width: number, height: number, mobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile })
    await this.send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false })
  }
  async goto(url: string) {
    const loaded = new Promise((resolve) => {
      const f = (m: any) => { if (m.method === "Page.loadEventFired") { this.listeners.delete(f); resolve(null) } }
      this.listeners.add(f)
      setTimeout(resolve, 60_000)
    })
    await this.send("Page.navigate", { url })
    await loaded
  }
  async waitFor(expression: string, timeout = 180_000) {
    const t0 = Date.now()
    while (Date.now() - t0 < timeout) { if (await this.evaluate<boolean>(expression)) return true; await sleep(300) }
    return false
  }
  async click(x: number, y: number) {
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"])
      await this.send("Input.dispatchMouseEvent", { type, x, y, button: type === "mouseMoved" ? "none" : "left", clickCount: 1 })
  }
  close() { this.ws.close() }
}

const READY =
  "!!document.querySelector('canvas') && !document.querySelector('[aria-label^=\"Chargement de la visite\"]')"
type Frame = { data: string; metadata: { timestamp: number }; sessionId: number }
const club = new URL(url).pathname.split("/")[1]

const b = await Browser.open()
try {
  await b.goto("about:blank")
  await b.viewport(Number(w), Number(h), true)
  await b.goto(new URL(url).origin)
  await b.evaluate(`sessionStorage.setItem('vyra-intro-seen:${club}', '1')`)
  await b.goto(url)
  if (!(await b.waitFor(READY))) throw new Error("scene not loaded")
  await Browser.sleep(2500)
  await b.evaluate(`(() => {
    [...document.querySelectorAll("button")].find((el) => /^Refuser$/.test((el.textContent ?? "").trim()))?.click();
    document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
    return true;
  })()`)
  await Browser.sleep(1500)

  const frames: { t: number; file: string }[] = []
  const taps: { t: number; x: number; y: number; what: string }[] = []
  const listeners = (b as unknown as { listeners: Set<(m: { method?: string; params?: unknown }) => void> })
    .listeners
  const onFrame = (m: { method?: string; params?: unknown }) => {
    if (m.method !== "Page.screencastFrame") return
    const f = m.params as Frame
    const file = `s${String(frames.length).padStart(4, "0")}.jpg`
    writeFileSync(path.join(out, file), Buffer.from(f.data, "base64"))
    frames.push({ t: f.metadata.timestamp, file })
    void b.send("Page.screencastFrameAck", { sessionId: f.sessionId })
  }
  listeners.add(onFrame)
  await b.send("Page.startScreencast", {
    format: "jpeg",
    quality: 90,
    maxWidth: Number(w) * 2,
    maxHeight: Number(h) * 2,
    everyNthFrame: 1,
  })
  const t0 = Date.now() / 1000
  for (const step of steps) {
    const [kind, ...rest] = step.split(":")
    const arg = rest.join(":")
    if (kind === "wait") await Browser.sleep(Number(arg) * 1000)
    else {
      const finder =
        kind === "text"
          ? `[...document.querySelectorAll("button, a")].find((e) => (e.textContent ?? "").replace(/\\s+/g, " ").trim().startsWith(${JSON.stringify(arg)}))`
          : `document.querySelector(${JSON.stringify(arg)})`
      const at = await b.evaluate<[number, number] | null>(`(() => {
        const el = ${finder};
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return [r.x + r.width / 2, r.y + r.height / 2];
      })()`)
      if (!at) {
        console.log("not found:", step)
        continue
      }
      taps.push({ t: Date.now() / 1000 - t0, x: at[0], y: at[1], what: arg })
      await b.click(at[0], at[1])
    }
  }
  await b.send("Page.stopScreencast")
  listeners.delete(onFrame)
  const lines = ["ffconcat version 1.0"]
  frames.forEach((f, i) => {
    const next = frames[i + 1]?.t ?? f.t + 1 / 30
    lines.push(`file ${f.file}`, `duration ${(next - f.t).toFixed(4)}`)
  })
  writeFileSync(path.join(out, "frames.ffconcat"), lines.join("\n") + "\n")
  writeFileSync(
    path.join(out, "taps.json"),
    JSON.stringify({ start: frames[0]?.t ?? 0, wallStart: t0, taps }, null, 2),
  )
  console.log("frames", frames.length, "span", frames.length ? (frames.at(-1)!.t - frames[0].t).toFixed(2) : 0)
  console.log("taps", JSON.stringify(taps))
  if (b.errors.length) console.log("page errors:", [...new Set(b.errors)].slice(0, 8).join("\n"))
} finally {
  await b.goto("about:blank").catch(() => {})
  b.close()
  chrome.kill()
}
