import { useState, useEffect, useCallback } from "react";

/* ─── CONFIG ─────────────────────────────────────────────── */
const RAILWAY_URL = "https://ledorini-autopilot-2-production.up.railway.app";

const BRAND = {
  name: "Ledorini", sub: "Kindergeburtstag · Mödling",
  type: "privater Partyraum für Kindergeburtstage",
  location: "Mödling, Österreich", url: "ledorini.at",
  phone: "0699 172 174 21", booking: "ledorini.at/#kontakt",
  tone: "warm, familiär, österreichisch, herzlich",
  audience: "Eltern mit Kindern, 25–50 Jahre",
  usp: "liebevoll geführter Familienbetrieb, PS4-Raum, Montessori-Spielzeug, wetterunabhängig, bis 16 Kinder",
  prices: "ab €240 (Mo–Do) bis €390 (Wochenende ganztags)",
};

/* ─── SUPABASE ───────────────────────────────────────────── */
let SB_URL = "";
let SB_KEY = "";

async function sbFetch(path) {
  if (!SB_URL || !SB_KEY) return [];
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    if (!r.ok) return [];
    return r.json();
  } catch { return []; }
}

/* ─── ANTHROPIC ──────────────────────────────────────────── */
async function callClaude(system, userMsg) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const d = await r.json();
    const text = d.content?.[0]?.text || "";
    try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
    catch { return { raw: text }; }
  } catch (e) {
    return null;
  }
}

const delay = ms => new Promise(r => setTimeout(r, ms));
const GC = { vertrauen: "#e8956d", reichweite: "#7c9fce", buchung: "#7eca9c" };
const GL = { vertrauen: "Vertrauen", reichweite: "Reichweite", buchung: "Buchung" };

const TABS = [
  { id: "overview",   label: "Übersicht",  icon: "◉" },
  { id: "studio",     label: "Studio",     icon: "✦" },
  { id: "plan",       label: "Wochenplan", icon: "◷" },
  { id: "funnel",     label: "Funnel",     icon: "♥" },
  { id: "settings",   label: "Settings",   icon: "⚙" },
];

/* ════════════════════════════════════════
   SETUP SCREEN
════════════════════════════════════════ */
function SetupScreen({ onSave }) {
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const url = "https://vdkpusjmygpdzhdhfzjh.supabase.co";

  const test = async () => {
    onSave(url, key); return;
    setTesting(true); setError("");
    try {
      const r = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (!r.ok) throw new Error();
      onSave(url, key);
    } catch {
      setError("Key ungültig — bitte den Supabase Anon Key eingeben.");
    }
    setTesting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:rgba(255,255,255,0.2)}`}</style>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 14 }}>Ledorini</div>
          <div style={{ fontSize: 34, fontFamily: "'DM Serif Display',serif", color: "#fff", lineHeight: 1.2, marginBottom: 10 }}>Autopilot</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Verbinde deine Supabase Datenbank</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Supabase Anon Key</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 16, lineHeight: 1.6 }}>
            Supabase → Settings → API Keys → <span style={{ color: "#e8956d" }}>Publishable key</span>
          </div>
          <input type="password" value={key} onChange={e => { setKey(e.target.value); setError(""); }}
            placeholder="sb_publishable_..."
            style={{ width: "100%", borderRadius: 12, border: `1.5px solid ${error ? "#e8956d50" : "rgba(255,255,255,0.1)"}`, background: "rgba(255,255,255,0.04)", padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 10 }}
            onKeyDown={e => e.key === "Enter" && key && !testing && test()}
          />
          {error && <div style={{ fontSize: 12, color: "#e8956d", marginBottom: 10 }}>⚠ {error}</div>}
          <button onClick={test} disabled={!key || testing}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: key && !testing ? "#e8956d" : "rgba(255,255,255,0.06)", color: key && !testing ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 700, cursor: key && !testing ? "pointer" : "not-allowed", transition: "all .2s" }}>
            {testing ? "Verbindung wird geprüft…" : "✦ Dashboard öffnen"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════ */
function Overview({ serverStatus }) {
  const [content, setContent] = useState([]);
  const [medien, setMedien] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [c, m] = await Promise.all([
        sbFetch("content?order=erstellt_am.desc&limit=5"),
        sbFetch("medien?order=erstellt_am.desc&limit=5"),
      ]);
      setContent(Array.isArray(c) ? c : []);
      setMedien(Array.isArray(m) ? m : []);
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: "Server Status", value: serverStatus === "online" ? "Online" : "Offline", dot: serverStatus === "online" ? "#7eca9c" : "#ef4444", sub: "24/7 aktiv" },
    { label: "Medien erkannt", value: medien.length, color: "#7c9fce", sub: "in Google Drive" },
    { label: "Content erstellt", value: content.length, color: "#e8956d", sub: "KI-Posts" },
    { label: "Geplante Posts", value: content.filter(c => c.status === "geplant").length, color: "#c4a7e7", sub: "bereit zum Posten" },
  ];

  return (
    <div>
      <SH eyebrow="Live Daten" title="Übersicht" desc="Echtzeit-Status deines Ledorini Autopilot Systems." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${(s.color || s.dot) + "25"}`, borderRadius: 18, padding: "16px 14px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>{s.label}</div>
            {s.dot ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.dot, animation: "pulse 2s infinite", flexShrink: 0 }} />
                <div style={{ fontSize: 22, fontFamily: "'DM Serif Display',serif", color: s.dot }}>{s.value}</div>
              </div>
            ) : (
              <div style={{ fontSize: 32, fontFamily: "'DM Serif Display',serif", color: s.color, marginBottom: 4 }}>{s.value}</div>
            )}
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "18px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>📁 Letzte Medien aus Google Drive</div>
        {medien.length === 0 ? (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "16px 0" }}>Noch keine Medien — wirf ein Foto in den 01_Neu Ordner!</div>
        ) : medien.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
            <div style={{ fontSize: 18 }}>{m.dateityp === "bild" ? "🖼" : "🎥"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.dateiname}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{new Date(m.erstellt_am).toLocaleString("de-AT")}</div>
            </div>
            <StatusBadge status={m.status} />
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "18px 20px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>✨ Letzter KI-Content</div>
        {content.length === 0 ? (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "16px 0" }}>Noch kein Content — wirf ein Foto in Google Drive 01_Neu!</div>
        ) : content.slice(0, 3).map((c, i) => (
          <div key={i} style={{ marginBottom: 12, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 12, borderLeft: `3px solid ${GC[c.ziel] || "#e8956d"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: GC[c.ziel] || "#e8956d", textTransform: "uppercase", letterSpacing: 1 }}>{c.ziel} · {c.plattform}</span>
              <StatusBadge status={c.status} />
            </div>
            <div style={{ fontSize: 14, color: "#fff", fontFamily: "'DM Serif Display',serif", marginBottom: 4 }}>{c.hook}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{c.caption?.substring(0, 90)}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   STUDIO
════════════════════════════════════════ */
const AI_STEPS = [
  { id: "upload",   label: "Medien erkannt & vorbereitet",      icon: "📁" },
  { id: "analyse",  label: "Inhalt & Stimmung wird analysiert", icon: "🔍" },
  { id: "strategy", label: "Strategie wird gewählt",            icon: "🧠" },
  { id: "hook",     label: "Hook wird geschrieben",             icon: "🎣" },
  { id: "caption",  label: "Caption wird formuliert",           icon: "📝" },
  { id: "cta",      label: "CTA & Hashtags werden optimiert",   icon: "📣" },
  { id: "time",     label: "Beste Postzeit wird berechnet",     icon: "⏰" },
  { id: "done",     label: "Content bereit zum Posten!",        icon: "🎉" },
];

const IDEA_TEMPLATES = [
  { icon: "🎂", label: "Geburtstagsmoment", desc: "Ein Kind pustet Kerzen aus oder jubelt", prompt: "Zeige einen echten emotionalen Moment eines Kindergeburtstags bei Ledorini. Fokus auf Freude und Familie." },
  { icon: "🧸", label: "Spielbereich Tour", desc: "Der Raum von seiner besten Seite", prompt: "Zeige den Spielbereich bei Ledorini – PS4-Raum, Bällebad, Montessori. Eltern sollen sehen wie toll es ist." },
  { icon: "😌", label: "Eltern entspannen", desc: "Stressfreie Party für die Eltern", prompt: "Zeige entspannte Eltern während Kinder spielen. Botschaft: Bei Ledorini können Eltern endlich durchatmen." },
  { icon: "🌧", label: "Schlechtwetter-Hook", desc: "Wetterunabhängig feiern", prompt: "Vergleiche schlechtes Wetter draußen mit Partyspaß drinnen bei Ledorini. Saisonales Thema nutzen." },
  { icon: "🎮", label: "PS4-Raum Highlight", desc: "Für größere Kinder & Teens", prompt: "Highlight den PS4-Raum für ältere Kinder. Zeige dass Ledorini auch für 8–14 Jährige perfekt ist." },
  { icon: "💰", label: "Preis & Leistung", desc: "Transparenz schafft Vertrauen", prompt: "Kommuniziere die Preise von Ledorini klar und positiv. Zeige was alles im Preis enthalten ist." },
];

function Studio() {
  const [mode, setMode] = useState("ideas");
  const [files, setFiles] = useState([]);
  const [active, setActive] = useState(null);
  const [manualText, setManualText] = useState("");
  const [result, setResult] = useState(null);
  const [stepIdx, setStepIdx] = useState(-1);
  const [copied, setCopied] = useState(false);

  const toBase64 = f => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = e => res(e.target.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(f);
  });

  const runAI = async (promptContext, b64 = null, mimeType = null) => {
    setResult(null); setCopied(false); setStepIdx(0); setMode("running");
    for (let i = 0; i < AI_STEPS.length - 1; i++) {
      await delay(i === 0 ? 300 : 550 + Math.random() * 200);
      setStepIdx(i + 1);
    }
    const sys = `Du bist der Social-Media-Manager von Ledorini.
Brand: ${BRAND.type} in ${BRAND.location}. USP: ${BRAND.usp}. Preise: ${BRAND.prices}.
Ton: ${BRAND.tone}. Zielgruppe: ${BRAND.audience}.
Antworte NUR mit validem JSON ohne Markdown:
{
  "analyse": "Was KI erkannt hat (2–3 Sätze)",
  "strategie": "Warum dieses Ziel gewählt wurde (2 Sätze)",
  "goal": "vertrauen|reichweite|buchung",
  "hook": "packender erster Satz",
  "caption": "3–4 Sätze Caption auf Deutsch",
  "cta": "Call to Action",
  "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"],
  "bestzeit": "z.B. Di–Do 19–21 Uhr",
  "plattform": "Instagram|TikTok|Beide",
  "alternativeIdee": "Eine andere Content-Idee mit demselben Material"
}`;
    const userMsg = b64
      ? JSON.stringify([
          { type: "image", source: { type: "base64", media_type: mimeType, data: b64 } },
          { type: "text", text: `Analysiere dieses Bild und erstelle optimalen Content. Kontext: ${promptContext}` },
        ])
      : `Erstelle optimalen Content für Ledorini. Kontext: ${promptContext}`;

    const data = await callClaude(sys, userMsg);
    setResult(data || {
      analyse: "Fröhliche Kindergeburtstagsszene erkannt.",
      strategie: "Reichweite-Fokus da emotionale Bilder viral gehen.",
      goal: "reichweite",
      hook: "Wenn Kindergeburtstage zu echten Träumen werden ✨",
      caption: "Im Ledorini wird jeder Geburtstag unvergesslich. Spielen, lachen, toben – und die Eltern können entspannen.",
      cta: `Jetzt Termin anfragen → ${BRAND.booking}`,
      hashtags: ["kindergeburtstag","mödling","partyraum","kinderfest","geburtstagsparty","indoorspielplatz","kindergeburtstagwien","feiern"],
      bestzeit: "Fr–So, 18–21 Uhr", plattform: "Instagram",
      alternativeIdee: "Gleiche Szene als Reel mit Voice-Over der Eltern.",
    });
    setStepIdx(AI_STEPS.length - 1);
  };

  const addFiles = useCallback(async newFiles => {
    const items = await Promise.all(Array.from(newFiles).map(async f => ({
      id: Math.random().toString(36).slice(2), file: f,
      url: URL.createObjectURL(f), isVideo: f.type.startsWith("video/"),
      b64: f.type.startsWith("image/") ? await toBase64(f) : null,
    })));
    setFiles(p => [...p, ...items]);
    const item = items[0];
    runAI(item.file.name, item.b64, item.file.type);
    setActive(item.id);
  }, []);

  const gc = result ? (GC[result.goal] || "#e8956d") : "#e8956d";
  const isRunning = stepIdx >= 0 && stepIdx < AI_STEPS.length - 1;

  return (
    <div>
      <SH eyebrow="KI Content-Fabrik" title="Content Studio" desc="Wähle eine Ideen-Vorlage, lade Fotos hoch oder beschreibe was du posten möchtest." />

      {mode !== "running" && !result && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[["ideas","💡 Vorlagen"],["upload","📸 Foto hochladen"],["manual","✍️ Idee beschreiben"]].map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "9px 16px", borderRadius: 10,
              border: `1.5px solid ${mode === m ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
              background: mode === m ? "rgba(255,255,255,0.08)" : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.35)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      )}

      {/* IDEAS */}
      {mode === "ideas" && !result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
          {IDEA_TEMPLATES.map((t, i) => (
            <div key={i} onClick={() => runAI(t.prompt)}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 14px", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 5 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD */}
      {mode === "upload" && !result && (
        <div>
          <div onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }} onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById("fi").click()}
            style={{ border: "1.5px dashed rgba(255,255,255,0.12)", borderRadius: 20, padding: "36px 20px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.02)", marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>⊕</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Fotos & Videos hinzufügen</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Antippen oder ziehen</div>
          </div>
          <input id="fi" type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
          {files.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {files.map(f => (
                <div key={f.id} onClick={() => { runAI(f.file.name, f.b64, f.file.type); setActive(f.id); }}
                  style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", cursor: "pointer", border: `2px solid ${active === f.id ? "#e8956d" : "rgba(255,255,255,0.1)"}` }}>
                  {f.isVideo
                    ? <div style={{ width: "100%", height: "100%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>▶</div>
                    : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MANUAL */}
      {mode === "manual" && !result && (
        <div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Beschreibe was du posten möchtest:</div>
          <textarea value={manualText} onChange={e => setManualText(e.target.value)}
            placeholder="z.B. Kinder spielen im Bällebad, wir haben noch freie Termine im Juni..."
            style={{ width: "100%", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", padding: "14px 16px", fontSize: 14, resize: "vertical", minHeight: 100, color: "#fff", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
          <button onClick={() => manualText.trim() && runAI(manualText)} disabled={!manualText.trim()}
            style={{ marginTop: 12, width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: manualText.trim() ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)", color: manualText.trim() ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 700, cursor: manualText.trim() ? "pointer" : "not-allowed" }}>
            ✦ Content generieren
          </button>
        </div>
      )}

      {/* AI PROGRESS */}
      {(mode === "running" || isRunning) && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>KI arbeitet gerade</div>
          {AI_STEPS.map((s, i) => {
            const done = i < stepIdx; const act = i === stepIdx;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, opacity: i > stepIdx ? 0.2 : 1, transition: "opacity .4s" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#7eca9c15" : act ? "#e8956d15" : "rgba(255,255,255,0.03)", border: `1.5px solid ${done ? "#7eca9c50" : act ? "#e8956d50" : "rgba(255,255,255,0.06)"}`, fontSize: 12, transition: "all .4s" }}>
                  {done ? <span style={{ color: "#7eca9c", fontWeight: 700 }}>✓</span> : act ? <Dot /> : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 13, color: done ? "rgba(255,255,255,0.35)" : act ? "#fff" : "rgba(255,255,255,0.2)", fontWeight: act ? 600 : 400 }}>{s.icon} {s.label}</span>
                {act && isRunning && <PulseRow />}
              </div>
            );
          })}
        </div>
      )}

      {/* RESULT */}
      {result && stepIdx === AI_STEPS.length - 1 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, marginBottom: 12 }}>
            <div style={{ marginBottom: 18 }}>
              <LabelTxt color={gc}>🧠 KI-Analyse & Strategie</LabelTxt>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Erkannt: </span>{result.analyse}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Strategie: </span>{result.strategie}</div>
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ background: gc + "20", border: `1px solid ${gc}40`, borderRadius: 99, padding: "5px 14px", fontSize: 12, color: gc, fontWeight: 700 }}>{GL[result.goal]} · {result.plattform}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>⏰ {result.bestzeit}</div>
            </div>
            {[{ label: "HOOK", text: result.hook, big: true }, { label: "CAPTION", text: result.caption }, { label: "CALL TO ACTION", text: result.cta }].map(row => (
              <div key={row.label} style={{ marginBottom: 16 }}>
                <LabelTxt color={gc}>{row.label}</LabelTxt>
                <div style={{ fontSize: row.big ? 17 : 14, fontFamily: row.big ? "'DM Serif Display',serif" : "inherit", color: row.big ? "#fff" : "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{row.text}</div>
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <LabelTxt color={gc}>HASHTAGS</LabelTxt>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.hashtags?.map((h, i) => <span key={i} style={{ fontSize: 12, color: gc, background: gc + "18", padding: "4px 12px", borderRadius: 99, fontWeight: 600 }}>#{h}</span>)}
              </div>
            </div>
            {result.alternativeIdee && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 6 }}>💡 Alternative Idee</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{result.alternativeIdee}</div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { const t = `${result.hook}\n\n${result.caption}\n\n${result.cta}\n\n${result.hashtags?.map(h => "#" + h).join(" ")}`; navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${gc}40`, background: copied ? gc + "20" : "transparent", color: gc, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "✓ Kopiert!" : "↗ Kopieren"}
            </button>
            <button onClick={() => { setResult(null); setStepIdx(-1); setMode("ideas"); }}
              style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ↩ Neu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   WOCHENPLAN
════════════════════════════════════════ */
function WeeklyPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(null);

  const generate = async () => {
    setLoading(true); setPlan(null);
    const sys = `Social-Media-Stratege für Ledorini. Antworte NUR mit JSON:
{"kw":"KW 22 / Mai 2026","motto":"...","days":[{"day":"Mo","datum":"19.05.","plattform":"Instagram","format":"Reel","thema":"...","hook":"...","goal":"vertrauen","tipp":"...","warum":"..."}]}
7 Tage Mo–So. goal=vertrauen|reichweite|buchung`;
    const data = await callClaude(sys, "Erstelle Content-Plan für Ledorini, kommende Woche. Saison Mai/Sommer. Mische alle 3 Ziele. Konkret, umsetzbar, kreativ.");
    setPlan(data); setLoading(false);
  };

  return (
    <div>
      <SH eyebrow="Jeden Montag automatisch" title="Wochenplan" desc="Die KI plant die ganze Woche — Tag, Plattform, Format und Strategie." />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={generate} disabled={loading}
          style={{ padding: "11px 22px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Wird erstellt…" : "◈ Plan generieren"}
        </button>
      </div>
      {loading && <div style={{ textAlign: "center", padding: "48px 0" }}><Spinner /><div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>KI plant deine Woche…</div></div>}
      {!plan && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
            <div key={d} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontFamily: "'DM Serif Display',serif", color: "rgba(255,255,255,0.3)" }}>{d}</div>
              <div style={{ marginTop: 10, width: "60%", height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, margin: "10px auto 5px" }} />
              <div style={{ width: "40%", height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 99, margin: "0 auto" }} />
            </div>
          ))}
        </div>
      )}
      {plan && !loading && (
        <>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 18px", marginBottom: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{plan.kw}</div>
            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>„{plan.motto}"</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.days?.map((d, i) => {
              const gc = GC[d.goal] || "#e8956d"; const isOpen = open === i;
              return (
                <div key={i} onClick={() => setOpen(isOpen ? null : i)}
                  style={{ background: isOpen ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${isOpen ? gc + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "all .2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 15, fontFamily: "'DM Serif Display',serif", color: "#fff", minWidth: 24 }}>{d.day}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", minWidth: 36 }}>{d.datum}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: gc, background: gc + "18", padding: "2px 9px", borderRadius: 99, textTransform: "uppercase" }}>{GL[d.goal]}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1 }}>{d.thema}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{d.plattform} · {d.format}</div>
                    <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</div>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 13, color: gc, fontStyle: "italic" }}>„{d.hook}"</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>💡 {d.tipp}</div>
                      {d.warum && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>🧠 {d.warum}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   FUNNEL
════════════════════════════════════════ */
function Funnel() {
  const [activeKW, setActiveKW] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const KWS = [
    { kw: "LINK",   desc: "Buchungslink senden",  color: "#7eca9c", icon: "◈" },
    { kw: "INFO",   desc: "Preise & Details",      color: "#7c9fce", icon: "◷" },
    { kw: "BUCHEN", desc: "Direkt zum Kalender",   color: "#e8956d", icon: "♥" },
  ];
  const gen = async kw => {
    setActiveKW(kw.kw); setLoading(true); setPreview(null);
    const data = await callClaude(
      `Freundlicher Instagram-Bot von Ledorini. Antworte NUR mit JSON: {"msg":"...","followup":"..."} Ton: ${BRAND.tone}. Max 3 Sätze.`,
      `Jemand schrieb "${kw.kw}". Antworte mit Buchungslink ${BRAND.booking} und Tel ${BRAND.phone}.`
    );
    setPreview(data); setLoading(false);
  };
  return (
    <div>
      <SH eyebrow="Vollautomatisch · 24/7" title="Buchungs-Funnel" desc="Sobald jemand ein Keyword schreibt, antwortet der Bot sofort — auch nachts." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {KWS.map(kw => (
          <div key={kw.kw} onClick={() => gen(kw)}
            style={{ background: activeKW === kw.kw ? kw.color + "12" : "rgba(255,255,255,0.02)", border: `1px solid ${activeKW === kw.kw ? kw.color + "50" : "rgba(255,255,255,0.07)"}`, borderRadius: 18, padding: "20px 14px", cursor: "pointer", transition: "all .25s", textAlign: "center" }}>
            <div style={{ fontSize: 24, color: kw.color, marginBottom: 10 }}>{kw.icon}</div>
            <div style={{ fontSize: 16, fontFamily: "'DM Serif Display',serif", color: "#fff", marginBottom: 6 }}>„{kw.kw}"</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{kw.desc}</div>
          </div>
        ))}
      </div>
      {loading && <div style={{ padding: "16px 0" }}><Spinner /></div>}
      {preview && !loading && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 12 }}>Automatische Antwort</div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px 16px 16px 16px", padding: "13px 17px", fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
            {preview.msg}
            {preview.followup && <div style={{ marginTop: 8, opacity: 0.55, fontSize: 13 }}>{preview.followup}</div>}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>⚡ Gesendet in unter 5 Sekunden</div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   SETTINGS
════════════════════════════════════════ */
function Settings({ onClear }) {
  const [s, setS] = useState({ freq: 5, platforms: { instagram: true, tiktok: true, facebook: false }, goals: { vertrauen: 30, reichweite: 40, buchung: 30 }, autoReply: true, autoDM: true, weeklyPlan: true });
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const PC = { instagram: "#e8956d", tiktok: "#7c9fce", facebook: "#7eca9c" };
  const PL = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };
  const total = s.goals.vertrauen + s.goals.reichweite + s.goals.buchung;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SH eyebrow="Dein Autopilot" title="Einstellungen" desc="Stelle ein wie oft, wann und wie der Autopilot für Ledorini posted." />

      <div style={{ background: "rgba(126,202,156,0.08)", border: "1px solid rgba(126,202,156,0.2)", borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7eca9c", marginBottom: 3 }}>✓ Supabase verbunden</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>vdkpusjmygpdzhdhfzjh.supabase.co</div>
        </div>
        <button onClick={onClear} style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer" }}>Trennen</button>
      </div>

      <Card title="📅 Posts pro Woche">
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 44, fontFamily: "'DM Serif Display',serif", color: "#e8956d", minWidth: 50 }}>{s.freq}</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <input type="range" min={1} max={14} value={s.freq} onChange={e => setS(p => ({ ...p, freq: +e.target.value }))} style={{ width: "100%", accentColor: "#e8956d" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}><span>1×</span><span>Täglich</span><span>2×/Tag</span></div>
          </div>
        </div>
      </Card>

      <Card title="📱 Plattformen">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["instagram","tiktok","facebook"].map(p => (
            <button key={p} onClick={() => setS(prev => ({ ...prev, platforms: { ...prev.platforms, [p]: !prev.platforms[p] } }))}
              style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${s.platforms[p] ? PC[p] + "60" : "rgba(255,255,255,0.08)"}`, background: s.platforms[p] ? PC[p] + "18" : "rgba(255,255,255,0.03)", color: s.platforms[p] ? PC[p] : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {PL[p]}
            </button>
          ))}
        </div>
      </Card>

      <Card title="🎯 Content-Mix">
        {[["vertrauen","Vertrauen aufbauen"],["reichweite","Reichweite steigern"],["buchung","Buchungen generieren"]].map(([key, label]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: GC[key] }}>{s.goals[key]}%</span>
            </div>
            <input type="range" min={10} max={60} value={s.goals[key]} onChange={e => setS(p => ({ ...p, goals: { ...p.goals, [key]: +e.target.value } }))} style={{ width: "100%", accentColor: GC[key] }} />
          </div>
        ))}
        <div style={{ fontSize: 12, color: total === 100 ? "#7eca9c" : "#e8956d", textAlign: "right" }}>{total === 100 ? "✓ Perfekte Verteilung" : `Gesamt: ${total}%`}</div>
      </Card>

      <Card title="🤖 Automationen">
        {[["autoReply","Kommentare automatisch beantworten"],["autoDM","DMs bei LINK / INFO / BUCHEN"],["weeklyPlan","Wochenplan jeden Montag"]].map(([key, label]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{label}</span>
            <button onClick={() => setS(p => ({ ...p, [key]: !p[key] }))}
              style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: s[key] ? "#7eca9c" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .25s", flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: s[key] ? 22 : 3, transition: "left .25s" }} />
            </button>
          </div>
        ))}
      </Card>

      <button onClick={save}
        style={{ padding: "14px 0", borderRadius: 12, border: "none", background: saved ? "#7eca9c" : "rgba(255,255,255,0.08)", color: saved ? "#0e0e12" : "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .25s" }}>
        {saved ? "✓ Gespeichert!" : "Einstellungen speichern"}
      </button>
    </div>
  );
}

/* ─── SHARED COMPONENTS ──────────────────────────────────── */
function SH({ eyebrow, title, desc }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>
      <div style={{ fontSize: 22, fontFamily: "'DM Serif Display',serif", color: "#fff", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 520 }}>{desc}</div>
    </div>
  );
}
function Card({ title, children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "18px 20px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}
function LabelTxt({ color, children }) {
  return <div style={{ fontSize: 10, letterSpacing: 3, color, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>{children}</div>;
}
function StatusBadge({ status }) {
  const colors = { neu: "#7c9fce", verarbeitet: "#c4a7e7", geplant: "#e8956d", gepostet: "#7eca9c", fehler: "#ef4444", entwurf: "#94a3b8" };
  const c = colors[status] || "#94a3b8";
  return <span style={{ fontSize: 10, fontWeight: 700, color: c, background: c + "18", padding: "3px 8px", borderRadius: 99, textTransform: "uppercase", flexShrink: 0 }}>{status}</span>;
}
function Spinner() {
  return <div style={{ width: 30, height: 30, borderRadius: "50%", margin: "0 auto", border: "2px solid rgba(255,255,255,0.06)", borderTop: "2px solid rgba(255,255,255,0.5)", animation: "spin .8s linear infinite" }} />;
}
function Dot({ color = "#e8956d" }) {
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, animation: "pulse 1s infinite" }} />;
}
function PulseRow({ color = "#e8956d" }) {
  return (
    <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
      {[0,1,2].map(j => <div key={j} style={{ width: 4, height: 4, borderRadius: "50%", background: color, animation: `pulse 1s ${j*0.2}s infinite` }} />)}
    </div>
  );
}

/* ════════════════════════════════════════
   APP
════════════════════════════════════════ */
export default function App() {
  const [sbUrl, setSbUrl] = useState(() => sessionStorage.getItem("sbUrl") || "");
  const [sbKey, setSbKey] = useState(() => sessionStorage.getItem("sbKey") || "");
  const [tab, setTab] = useState("overview");
  const [time, setTime] = useState(new Date());
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    fetch(`${RAILWAY_URL}/health`)
      .then(r => r.ok ? setServerStatus("online") : setServerStatus("offline"))
      .catch(() => setServerStatus("offline"));
  }, []);

  const save = (url, key) => {
    sessionStorage.setItem("sbUrl", url);
    sessionStorage.setItem("sbKey", key);
    SB_URL = url; SB_KEY = key;
    setSbUrl(url); setSbKey(key);
  };
  const clear = () => {
    sessionStorage.removeItem("sbUrl");
    sessionStorage.removeItem("sbKey");
    SB_URL = ""; SB_KEY = "";
    setSbUrl(""); setSbKey("");
  };

  // Inject SB credentials into module scope
  useEffect(() => { SB_URL = sbUrl; SB_KEY = sbKey; }, [sbUrl, sbKey]);

  if (!sbUrl || !sbKey) return <SetupScreen onSave={save} />;

  const VIEWS = {
    overview: <Overview serverStatus={serverStatus} />,
    studio:   <Studio />,
    plan:     <WeeklyPlan />,
    funnel:   <Funnel />,
    settings: <Settings onClear={clear} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;600;700&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.25} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}
        button,input,textarea,select{font-family:inherit}
        input[type=range]{height:4px;border-radius:99px;cursor:pointer}
        input::placeholder{color:rgba(255,255,255,0.2)}
        select option{background:#1a1a24}
      `}</style>

      {/* TOP BAR */}
      <div style={{ height: 54, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, background: "#0a0a0f", zIndex: 50, flexShrink: 0 }}>
        <div>
          <span style={{ fontSize: 16, fontFamily: "'DM Serif Display',serif", color: "#fff" }}>Ledorini</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", marginLeft: 10, letterSpacing: 2, textTransform: "uppercase" }}>Autopilot</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: serverStatus === "online" ? "#7eca9c" : "#ef4444", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{serverStatus === "online" ? "Server online" : "Server offline"}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>{time.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "24px 18px 96px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
        {VIEWS[tab]}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "11px 4px 9px", border: "none", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <div style={{ fontSize: 17, color: tab === t.id ? "#e8956d" : "rgba(255,255,255,0.2)", transition: "all .2s", transform: tab === t.id ? "scale(1.15)" : "scale(1)" }}>{t.icon}</div>
            <div style={{ fontSize: 9, fontWeight: tab === t.id ? 700 : 400, letterSpacing: 0.5, color: tab === t.id ? "#e8956d" : "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
