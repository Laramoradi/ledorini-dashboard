import { useState, useEffect } from "react";

/* ─── SUPABASE CONFIG ───────────────────────────────────── */
const SUPABASE_URL = "https://vdkpusjmygpdzhdhfzjh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZka3B1c2pteWdwZHpoZGhmempoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTQxNDksImV4cCI6MjA5NDg3MDE0OX0.bD17TbCx4m-h8MfgrWHr27m5uM2Bd_o-RZc4IwisCHw";
const RAILWAY_URL = "https://ledorini-autopilot-2-production.up.railway.app";

async function supabase(table, query = "") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!r.ok) return [];
  return r.json();
}

const TABS = [
  { id: "overview",   label: "Übersicht",    icon: "◉" },
  { id: "content",    label: "Content",      icon: "✦" },
  { id: "plan",       label: "Wochenplan",   icon: "◷" },
  { id: "konkurrenz", label: "Konkurrenz",   icon: "◎" },
  { id: "settings",  label: "Einstellungen", icon: "⚙" },
];

/* ─── SETUP SCREEN ──────────────────────────────────────── */
function SetupScreen({ onSave }) {
  const [url, setUrl]   = useState(SUPABASE_URL);
  const [key, setKey]   = useState("");
  const [testing, setTesting] = useState(false);
  const [error, setError]     = useState("");

  const test = async () => {
    setTesting(true); setError("");
    try {
      const r = await fetch(`${url}/rest/v1/einstellungen?limit=1`, {
        headers: { "apikey": key, "Authorization": `Bearer ${key}` },
      });
      if (!r.ok) throw new Error("Verbindung fehlgeschlagen");
      onSave(url, key);
    } catch (e) {
      setError("Key ungültig. Bitte den Supabase Anon Key eingeben.");
    }
    setTesting(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0e0e12", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:rgba(255,255,255,0.2)}`}</style>
      <div style={{ maxWidth:420, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:11, letterSpacing:4, color:"rgba(255,255,255,0.2)", textTransform:"uppercase", marginBottom:12 }}>Ledorini</div>
          <div style={{ fontSize:32, fontFamily:"'DM Serif Display',serif", color:"#fff", lineHeight:1.2 }}>Live Dashboard</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:10 }}>Verbinde deine Supabase Datenbank</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:28 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Supabase Anon Key</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:16, lineHeight:1.6 }}>
            Supabase → Settings → API Keys → <span style={{ color:"#e8956d" }}>Publishable key</span> kopieren
          </div>
          <input type="password" value={key} onChange={e => { setKey(e.target.value); setError(""); }}
            placeholder="sb_publishable_..." style={{ width:"100%", borderRadius:12, border:`1.5px solid ${error ? "#e8956d50" : "rgba(255,255,255,0.1)"}`, background:"rgba(255,255,255,0.04)", padding:"13px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", marginBottom:10 }} />
          {error && <div style={{ fontSize:12, color:"#e8956d", marginBottom:10 }}>⚠ {error}</div>}
          <button onClick={test} disabled={!key || testing} style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", background: key && !testing ? "#e8956d" : "rgba(255,255,255,0.06)", color: key && !testing ? "#fff" : "rgba(255,255,255,0.2)", fontSize:14, fontWeight:700, cursor: key && !testing ? "pointer" : "not-allowed" }}>
            {testing ? "Verbindung wird geprüft…" : "✦ Dashboard öffnen"}
          </button>
          <div style={{ marginTop:18, padding:"14px 16px", background:"rgba(255,255,255,0.02)", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>So findest du den Key</div>
            {["1. supabase.com öffnen","2. Dein Projekt 'Das Ledorini' öffnen","3. Links auf Settings → API Keys","4. 'Publishable key' kopieren","5. Hier einfügen"].map((s,i) => (
              <div key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginBottom:5, lineHeight:1.5 }}>{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── OVERVIEW ──────────────────────────────────────────── */
function Overview({ sbUrl, sbKey, serverStatus }) {
  const [stats, setStats]     = useState(null);
  const [content, setContent] = useState([]);
  const [medien, setMedien]   = useState([]);

  useEffect(() => {
    const load = async () => {
      const [c, m] = await Promise.all([
        fetch(`${sbUrl}/rest/v1/content?order=erstellt_am.desc&limit=5`, { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }).then(r => r.json()).catch(() => []),
        fetch(`${sbUrl}/rest/v1/medien?order=erstellt_am.desc&limit=5`, { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }).then(r => r.json()).catch(() => []),
      ]);
      setContent(Array.isArray(c) ? c : []);
      setMedien(Array.isArray(m) ? m : []);
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const STAT_CARDS = [
    { label:"Server Status", value: serverStatus === "online" ? "🟢 Online" : "🔴 Offline", sub:"24/7 aktiv", color:"#7eca9c" },
    { label:"Medien erkannt", value: medien.length || "0", sub:"in Google Drive", color:"#7c9fce" },
    { label:"Content erstellt", value: content.length || "0", sub:"KI-generierte Posts", color:"#e8956d" },
    { label:"Geplante Posts", value: content.filter(c => c.status === "geplant").length || "0", sub:"bereit zum Posten", color:"#c4a7e7" },
  ];

  return (
    <div>
      <SH eyebrow="Live Daten" title="Übersicht" desc="Echtzeit-Status deines Ledorini Autopilot Systems." />
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
        {STAT_CARDS.map((s,i) => (
          <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${s.color}20`, borderRadius:18, padding:"18px 16px" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:10 }}>{s.label}</div>
            <div style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Letzte Medien */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"20px 22px", marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>📁 Letzte Medien aus Google Drive</div>
        {medien.length === 0 ? (
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.25)", textAlign:"center", padding:"20px 0" }}>
            Noch keine Medien — wirf ein Foto in den 01_Neu Ordner!
          </div>
        ) : medien.map((m,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:12 }}>
            <div style={{ fontSize:20 }}>{m.dateityp === "bild" ? "🖼" : "🎥"}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>{m.dateiname}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{new Date(m.erstellt_am).toLocaleString("de-AT")}</div>
            </div>
            <StatusBadge status={m.status} />
          </div>
        ))}
      </div>

      {/* Letzter Content */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"20px 22px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>✨ Letzter KI-Content</div>
        {content.length === 0 ? (
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.25)", textAlign:"center", padding:"20px 0" }}>
            Noch kein Content — KI wartet auf Fotos und Anthropic API Key!
          </div>
        ) : content.slice(0,3).map((c,i) => (
          <div key={i} style={{ marginBottom:14, padding:"14px 16px", background:"rgba(255,255,255,0.03)", borderRadius:12, borderLeft:`3px solid ${GC[c.ziel] || "#e8956d"}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, flexWrap:"wrap", gap:6 }}>
              <span style={{ fontSize:11, fontWeight:700, color:GC[c.ziel] || "#e8956d", textTransform:"uppercase", letterSpacing:1 }}>{c.ziel} · {c.plattform}</span>
              <StatusBadge status={c.status} />
            </div>
            <div style={{ fontSize:14, color:"#fff", fontFamily:"'DM Serif Display',serif", marginBottom:6 }}>{c.hook}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>{c.caption?.substring(0,100)}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CONTENT ───────────────────────────────────────────── */
function ContentView({ sbUrl, sbKey }) {
  const [items, setItems] = useState([]);
  const [open, setOpen]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${sbUrl}/rest/v1/content?order=erstellt_am.desc&limit=20`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
    }).then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <SH eyebrow="KI-generiert" title="Content" desc="Alle Posts die deine KI erstellt hat — bereit zum Posten." />
      {loading && <div style={{ textAlign:"center", padding:40 }}><Spin /></div>}
      {!loading && items.length === 0 && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:16 }}>📸</div>
          <div style={{ fontSize:15, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>Noch kein Content</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:8 }}>Wirf ein Foto in Google Drive 01_Neu — die KI erstellt alles automatisch sobald der Anthropic Key aktiv ist!</div>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {items.map((c,i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
            background:"rgba(255,255,255,0.03)", border:`1px solid ${open===i ? (GC[c.ziel]||"#e8956d")+"50" : "rgba(255,255,255,0.07)"}`,
            borderRadius:16, padding:"16px 18px", cursor:"pointer", transition:"all .2s",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{ fontSize:11, fontWeight:700, color:GC[c.ziel]||"#e8956d", background:(GC[c.ziel]||"#e8956d")+"18", padding:"2px 9px", borderRadius:99, textTransform:"uppercase" }}>{c.ziel}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", flex:1 }}>{c.hook}</div>
              <StatusBadge status={c.status} />
              <div style={{ color:"rgba(255,255,255,0.15)", fontSize:12 }}>{open===i?"▲":"▼"}</div>
            </div>
            {open===i && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:4 }}>📝 Caption</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.7, marginBottom:12 }}>{c.caption}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:4 }}>📣 CTA</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:12 }}>{c.call_to_action}</div>
                {c.hashtags?.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {c.hashtags.map((h,j) => <span key={j} style={{ fontSize:11, color:GC[c.ziel]||"#e8956d", background:(GC[c.ziel]||"#e8956d")+"15", padding:"3px 10px", borderRadius:99 }}>#{h}</span>)}
                  </div>
                )}
                <div style={{ marginTop:12, fontSize:11, color:"rgba(255,255,255,0.2)" }}>⏰ {c.beste_postzeit} · 📱 {c.plattform}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── WOCHENPLAN ────────────────────────────────────────── */
function PlanView({ sbUrl, sbKey }) {
  const [plan, setPlan]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]     = useState(null);

  useEffect(() => {
    const kw = getKW(new Date());
    fetch(`${sbUrl}/rest/v1/wochenplaene?kalenderwoche=eq.${kw}&limit=1`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
    }).then(r => r.json()).then(d => { setPlan(Array.isArray(d) && d[0] ? d[0] : null); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <SH eyebrow="Jeden Montag automatisch" title="Wochenplan" desc="Der KI-generierte Content-Plan für diese Woche." />
      {loading && <div style={{ textAlign:"center", padding:40 }}><Spin /></div>}
      {!loading && !plan && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:16 }}>📅</div>
          <div style={{ fontSize:15, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>Noch kein Wochenplan</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:8 }}>Wird jeden Montag um 08:00 automatisch erstellt — sobald der Anthropic Key aktiv ist!</div>
        </div>
      )}
      {plan && (
        <>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 18px", marginBottom:14, display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ fontSize:11, letterSpacing:2, color:"rgba(255,255,255,0.25)", textTransform:"uppercase" }}>KW {plan.kalenderwoche}</div>
            <div style={{ width:1, height:14, background:"rgba(255,255,255,0.08)" }}/>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontStyle:"italic" }}>„{plan.motto}"</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {plan.tage?.map((d,i) => {
              const gc = GC[d.goal] || "#e8956d";
              return (
                <div key={i} onClick={() => setOpen(open===i?null:i)} style={{ background:open===i?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)", border:`1px solid ${open===i?gc+"40":"rgba(255,255,255,0.06)"}`, borderRadius:14, padding:"14px 16px", cursor:"pointer", transition:"all .2s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <div style={{ fontSize:15, fontFamily:"'DM Serif Display',serif", color:"#fff", minWidth:24 }}>{d.tag}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>{d.datum}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:gc, background:gc+"18", padding:"2px 9px", borderRadius:99, textTransform:"uppercase" }}>{d.goal}</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", flex:1 }}>{d.thema}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>{d.plattform} · {d.format}</div>
                    <div style={{ color:"rgba(255,255,255,0.15)", fontSize:12 }}>{open===i?"▲":"▼"}</div>
                  </div>
                  {open===i && (
                    <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize:13, color:gc, fontStyle:"italic", marginBottom:6 }}>„{d.hook}"</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", lineHeight:1.6 }}>💡 {d.tipp}</div>
                      {d.warum && <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)", lineHeight:1.6, marginTop:4 }}>🧠 {d.warum}</div>}
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

/* ─── KONKURRENZ ────────────────────────────────────────── */
function KonkurrenzView({ sbUrl, sbKey }) {
  const [analysen, setAnalysen] = useState([]);
  const [konkurrenten, setKonkurrenten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${sbUrl}/rest/v1/konkurrenten?order=erstellt_am.desc`, { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }).then(r => r.json()).catch(() => []),
      fetch(`${sbUrl}/rest/v1/konkurrenz_analysen?order=erstellt_am.desc&limit=1`, { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }).then(r => r.json()).catch(() => []),
    ]).then(([k, a]) => { setKonkurrenten(Array.isArray(k)?k:[]); setAnalysen(Array.isArray(a)?a:[]); setLoading(false); });
  }, []);

  const addKonkurrent = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await fetch(`${sbUrl}/rest/v1/konkurrenten`, {
      method:"POST",
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}`, "Content-Type":"application/json", Prefer:"return=minimal" },
      body: JSON.stringify({ name, instagram: handle, platform:"Instagram", aktiv:true }),
    });
    setKonkurrenten(p => [...p, { name, instagram: handle }]);
    setName(""); setHandle(""); setSaving(false);
  };

  return (
    <div>
      <SH eyebrow="Jeden Montag" title="Konkurrenz" desc="Trage deine Mitbewerber ein — die KI analysiert sie automatisch." />
      
      {/* Konkurrenten hinzufügen */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"20px 22px", marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>+ Konkurrenten hinzufügen</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (z.B. Party Palast)" style={inputStyle} />
          <input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="Instagram @handle" style={inputStyle} />
        </div>
        <button onClick={addKonkurrent} disabled={!name.trim() || saving} style={{ padding:"10px 20px", borderRadius:10, border:"none", background: name.trim() ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)", color: name.trim() ? "#fff" : "rgba(255,255,255,0.2)", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          {saving ? "Wird gespeichert…" : "Hinzufügen"}
        </button>
      </div>

      {/* Liste */}
      {loading && <Spin />}
      {!loading && konkurrenten.length === 0 && (
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.25)", textAlign:"center", padding:24 }}>Noch keine Konkurrenten eingetragen</div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {konkurrenten.map((k,i) => (
          <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{k.name}</div>
              {k.instagram && <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>@{k.instagram}</div>}
            </div>
            <div style={{ fontSize:11, color:"#7eca9c", background:"#7eca9c18", padding:"3px 10px", borderRadius:99 }}>Aktiv</div>
          </div>
        ))}
      </div>

      {analysen[0] && (
        <div style={{ marginTop:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"20px 22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:12 }}>📊 Letzte Analyse</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.7 }}>{analysen[0].zusammenfassung}</div>
          {analysen[0].empfehlung && <div style={{ marginTop:10, fontSize:13, color:"#e8956d", fontStyle:"italic" }}>💡 {analysen[0].empfehlung}</div>}
        </div>
      )}
    </div>
  );
}

/* ─── SETTINGS ──────────────────────────────────────────── */
function SettingsView({ sbUrl, sbKey, onClear }) {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${sbUrl}/rest/v1/einstellungen`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
    }).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const s = {};
        d.forEach(row => { s[row.schluessel] = row.wert; });
        setSettings(s);
      }
    }).catch(() => {});
  }, []);

  const PC = { instagram:"#e8956d", tiktok:"#7c9fce", facebook:"#7eca9c" };
  const plats = settings.plattformen || { instagram:true, tiktok:true, facebook:false };
  const mix   = settings.content_mix || { vertrauen:30, reichweite:40, buchung:30 };
  const freq  = settings.posts_pro_woche || "5";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <SH eyebrow="Dein Autopilot" title="Einstellungen" desc="Live-Einstellungen direkt aus deiner Supabase Datenbank." />

      <div style={{ background:"rgba(126,202,156,0.08)", border:"1px solid rgba(126,202,156,0.2)", borderRadius:14, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#7eca9c", marginBottom:3 }}>✓ Supabase verbunden</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>{sbUrl.split("//")[1]}</div>
        </div>
        <button onClick={onClear} style={{ padding:"7px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.35)", fontSize:12, cursor:"pointer" }}>Trennen</button>
      </div>

      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"18px 20px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>📅 Posts pro Woche</div>
        <div style={{ fontSize:44, fontFamily:"'DM Serif Display',serif", color:"#e8956d" }}>{freq}</div>
      </div>

      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"18px 20px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>📱 Plattformen</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["instagram","tiktok","facebook"].map(p => (
            <div key={p} style={{ padding:"9px 18px", borderRadius:10, border:`1.5px solid ${plats[p] ? PC[p]+"60" : "rgba(255,255,255,0.08)"}`, background: plats[p] ? PC[p]+"18" : "rgba(255,255,255,0.03)", color: plats[p] ? PC[p] : "rgba(255,255,255,0.3)", fontSize:13, fontWeight:700 }}>{p}</div>
          ))}
        </div>
      </div>

      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"18px 20px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>🎯 Content-Mix</div>
        {[["vertrauen","#e8956d"],["reichweite","#7c9fce"],["buchung","#7eca9c"]].map(([key,color]) => (
          <div key={key} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>{key}</span>
              <span style={{ fontSize:13, fontWeight:700, color }}>{mix[key]}%</span>
            </div>
            <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:99, height:4 }}>
              <div style={{ background:color, borderRadius:99, height:4, width:`${mix[key]}%` }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"18px 20px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.4)", marginBottom:12 }}>🚀 Nächste Schritte</div>
        {[
          ["⏳", "Anthropic API Key", "KI aktivieren → Content wird automatisch erstellt"],
          ["⏳", "Instagram API", "Auto-Posting auf Instagram"],
          ["⏳", "ManyChat Pro", "Kommentar-Trigger aktivieren"],
          ["✅", "Supabase", "Datenbank läuft"],
          ["✅", "Railway Server", "24/7 online"],
          ["✅", "Google Drive", "Verbunden"],
          ["✅", "Make.com", "Automatisierung aktiv"],
          ["✅", "ManyChat", "DM-Bot läuft"],
        ].map(([icon, title, desc], i) => (
          <div key={i} style={{ display:"flex", gap:12, marginBottom:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:14, flexShrink:0 }}>{icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color: icon==="✅" ? "#7eca9c" : "rgba(255,255,255,0.5)" }}>{title}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", lineHeight:1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── HELPERS ───────────────────────────────────────────── */
const GC = { vertrauen:"#e8956d", reichweite:"#7c9fce", buchung:"#7eca9c" };
const inputStyle = { borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", padding:"10px 12px", color:"#fff", fontSize:13, outline:"none", fontFamily:"inherit", width:"100%" };

function SH({ eyebrow, title, desc }) {
  return <div style={{ marginBottom:24 }}><div style={{ fontSize:11, letterSpacing:3, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", marginBottom:6 }}>{eyebrow}</div><div style={{ fontSize:22, fontFamily:"'DM Serif Display',serif", color:"#fff", marginBottom:8 }}>{title}</div><div style={{ fontSize:13, color:"rgba(255,255,255,0.35)", lineHeight:1.7, maxWidth:520 }}>{desc}</div></div>;
}
function Spin() { return <div style={{ width:30, height:30, borderRadius:"50%", margin:"0 auto", border:"2px solid rgba(255,255,255,0.06)", borderTop:"2px solid rgba(255,255,255,0.5)", animation:"spin .8s linear infinite" }}/>; }
function StatusBadge({ status }) {
  const colors = { neu:"#7c9fce", verarbeitet:"#c4a7e7", geplant:"#e8956d", gepostet:"#7eca9c", fehler:"#ef4444", entwurf:"#94a3b8" };
  const c = colors[status] || "#94a3b8";
  return <span style={{ fontSize:10, fontWeight:700, color:c, background:c+"18", padding:"3px 8px", borderRadius:99, textTransform:"uppercase", flexShrink:0 }}>{status}</span>;
}
function getKW(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - y) / 86400000) + 1) / 7);
}

/* ─── APP ───────────────────────────────────────────────── */
export default function App() {
  const [sbUrl, setSbUrl] = useState(() => sessionStorage.getItem("sbUrl") || "");
  const [sbKey, setSbKey] = useState(() => sessionStorage.getItem("sbKey") || "");
  const [tab, setTab]     = useState("overview");
  const [time, setTime]   = useState(new Date());
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  
  useEffect(() => {
    fetch(RAILWAY_URL).then(() => setServerStatus("online")).catch(() => setServerStatus("offline"));
  }, []);

  const save = (url, key) => { sessionStorage.setItem("sbUrl", url); sessionStorage.setItem("sbKey", key); setSbUrl(url); setSbKey(key); };
  const clear = () => { sessionStorage.removeItem("sbUrl"); sessionStorage.removeItem("sbKey"); setSbUrl(""); setSbKey(""); };

  if (!sbUrl || !sbKey) return <SetupScreen onSave={save} />;

  const VIEWS = {
    overview:   <Overview sbUrl={sbUrl} sbKey={sbKey} serverStatus={serverStatus} />,
    content:    <ContentView sbUrl={sbUrl} sbKey={sbKey} />,
    plan:       <PlanView sbUrl={sbUrl} sbKey={sbKey} />,
    konkurrenz: <KonkurrenzView sbUrl={sbUrl} sbKey={sbKey} />,
    settings:   <SettingsView sbUrl={sbUrl} sbKey={sbKey} onClear={clear} />,
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0e0e12", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#fff", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;600;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}
        button,input,textarea,select{font-family:inherit}
        input::placeholder{color:rgba(255,255,255,0.2)}
      `}</style>

      {/* TOP BAR */}
      <div style={{ height:54, borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", position:"sticky", top:0, background:"#0e0e12", zIndex:50, flexShrink:0 }}>
        <div><span style={{ fontSize:16, fontFamily:"'DM Serif Display',serif", color:"#fff" }}>Ledorini</span><span style={{ fontSize:10, color:"rgba(255,255,255,0.18)", marginLeft:10, letterSpacing:2, textTransform:"uppercase" }}>Autopilot</span></div>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: serverStatus==="online" ? "#7eca9c" : "#ef4444", animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>{serverStatus === "online" ? "Server online" : "Server offline"}</span>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.15)" }}>{time.toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"})}</div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, padding:"24px 18px 96px", maxWidth:680, width:"100%", margin:"0 auto" }}>{VIEWS[tab]}</div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(10,10,14,0.97)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"11px 4px 9px", border:"none", background:"transparent", display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }}>
            <div style={{ fontSize:17, color:tab===t.id?"#e8956d":"rgba(255,255,255,0.2)", transition:"all .2s", transform:tab===t.id?"scale(1.15)":"scale(1)" }}>{t.icon}</div>
            <div style={{ fontSize:9, fontWeight:tab===t.id?700:400, letterSpacing:0.5, color:tab===t.id?"#e8956d":"rgba(255,255,255,0.2)", textTransform:"uppercase" }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
