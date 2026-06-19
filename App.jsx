import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";

/* =================================================================
   Hesabên Dikanê — Barbershop POS  (React + Supabase)
   ملف واحد، مثل Time Capsule. كل البيانات من Supabase.
   ================================================================= */

const C = {
  ink: "#1a1410", bg: "#f5f1e8", card: "#fffdf7", brass: "#b08d3f",
  brassDark: "#8a6d28", line: "#e3dcc9", green: "#3f7d4f", red: "#b04a3f",
  muted: "#8a7f6b", blue: "#3a5a78",
};

const CURRENCIES = [
  { code: "GBP", sym: "£" }, { code: "USD", sym: "$" }, { code: "EUR", sym: "€" },
];

const T = {
  kmr: {
    appTitle: "Hesabên Dikanê", appSub: "Xizmet, Dahat û Baxşîş",
    tabPOS: "Kase", tabSales: "Hesab", tabTips: "Baxşîş", tabServices: "Mîheng",
    todayTotal: "Dahata îro", monthTotal: "Dahata vê mehê",
    pickWorker: "Karker hilbijêre", pickServices: "Xizmetan hilbijêre",
    total: "Giştî", subtotal: "Bin-giştî", tipLabel: "Baxşîş", clear: "Paqij",
    checkout: "Tomar bike",
    noWorkerFirst: "Pêşî karkerekî hilbijêre", noServiceFirst: "Bi kêmanî xizmetekê hilbijêre",
    saved: "Hat tomarkirin ✓",
    done: "Temam", cancel: "Betal", delete: "Jê bibe",
    salesLog: "Firotan", noSales: "Hîn tu firotan tune.",
    tipsFor: "Baxşîş", manageWorkers: "Karker", manageServices: "Xizmet",
    newWorker: "Navê karkerê nû", name: "Nav", add: "Zêde bike",
    newService: "Xizmeta nû", price: "Biha",
    noWorkers: "Hîn tu karker tune. Di Mîheng de zêde bike.", noServices: "Hîn tu xizmet tune.",
    thisMonth: "vê mehê", tipFor: "Baxşîş ji bo", amount: "Şumar",
    workerSummary: "Performansa karkeran", cuts: "firotan", avg: "Navînî",
    topServices: "Xizmetên herî firotî", periodToday: "Îro", periodMonth: "Meh", periodAll: "Hemû",
    tipsTotal: "Tevahiya baxşîşan", confirmDel: "Jê bibim?", export: "Derxe CSV",
    optional: "(bijarte)", loading: "Tê barkirin…", other: "Ya din", tipAmount: "Mîqdara baxşîşê",
    signIn: "Têkeve", signUp: "Hesab veke", signOut: "Derkeve",
    email: "E-mail", password: "Şîfre", shopName: "Navê dikanê", currency: "Dirav",
    haveAccount: "Hesabê te heye? Têkeve", noAccount: "Hesabê te tune? Veke",
    settings: "Mîheng", save: "Tomar bike", saved2: "Hat tomarkirin",
    authErr: "E-mail an şîfre xelet e", checkEmail: "E-maila xwe kontrol bike",
    pinTitle: "Koda parastinê", pinEnter: "Koda PIN binivîse", pinWrong: "Koda xelet",
    pinUnlock: "Veke", pinSet: "Koda PIN saz bike", pinSetHint: "Ji bo parastina Hesab û Mîheng",
    pinChange: "Koda PIN biguherîne", pinRemove: "Koda PIN rake", pinNew: "Koda nû (4 reqem)",
    pinSaved: "Kod hat tomarkirin", pinLock: "Kilît bike", pinSecurity: "Parastin",
    lockWhich: "Kîjan rûpel bên parastin", lockReports: "Hesab", lockTips: "Baxşîş", lockSettings: "Mîheng", lockBranches: "Guhertina şaxan",
    branches: "Şaxe", addBranch: "Şaxek nû", branchName: "Navê şaxê", confirmDelBranch: "Tu dixwazî vê şaxê û hemû daneyên wê jê bibî?", lastBranch: "Divê bi kêmî yek şax hebe",
  },
  ckb: {
    appTitle: "حیسابی دوکان", appSub: "خزمەت، داهات و بەخشیش",
    tabPOS: "قاسە", tabSales: "حیساب", tabTips: "بەخشیش", tabServices: "ڕێکخستن",
    todayTotal: "داهاتی ئەمڕۆ", monthTotal: "داهاتی ئەم مانگە",
    pickWorker: "کارمەند هەڵبژێرە", pickServices: "خزمەتەکان هەڵبژێرە",
    total: "گشتی", subtotal: "ژێر-گشتی", tipLabel: "بەخشیش", clear: "پاک",
    checkout: "تۆمار بکە",
    noWorkerFirst: "یەکەم کارمەندێک هەڵبژێرە", noServiceFirst: "بەلایەنی کەم خزمەتێک هەڵبژێرە",
    saved: "تۆمار کرا ✓",
    done: "تەمام", cancel: "پاشگەزبوونەوە", delete: "سڕینەوە",
    salesLog: "فرۆشتن", noSales: "هێشتا هیچ فرۆشتنێک نیە.",
    tipsFor: "بەخشیش", manageWorkers: "کارمەند", manageServices: "خزمەت",
    newWorker: "ناوی کارمەندی نوێ", name: "ناو", add: "زیاد بکە",
    newService: "خزمەتی نوێ", price: "نرخ",
    noWorkers: "هێشتا کارمەند نیە. لە ڕێکخستن زیادی بکە.", noServices: "هێشتا خزمەت نیە.",
    thisMonth: "ئەم مانگە", tipFor: "بەخشیش بۆ", amount: "بڕ",
    workerSummary: "کارایی کارمەندان", cuts: "فرۆشتن", avg: "تێکڕا",
    topServices: "زۆرترین فرۆشراو", periodToday: "ئەمڕۆ", periodMonth: "مانگ", periodAll: "هەموو",
    tipsTotal: "کۆی بەخشیش", confirmDel: "بیسڕمەوە؟", export: "دەرهێنان CSV",
    optional: "(ئیختیاری)", loading: "بار دەکرێ…", other: "ئەوەی تر", tipAmount: "بڕی بەخشیش",
    signIn: "بچۆ ژوورەوە", signUp: "هەژمار بکەرەوە", signOut: "بچۆ دەرەوە",
    email: "ئیمەیڵ", password: "وشەی نهێنی", shopName: "ناوی دوکان", currency: "دراو",
    haveAccount: "هەژمارت هەیە؟ بچۆ ژوورەوە", noAccount: "هەژمارت نیە؟ بیکەرەوە",
    settings: "ڕێکخستن", save: "تۆمار بکە", saved2: "تۆمار کرا",
    authErr: "ئیمەیڵ یان وشەی نهێنی هەڵەیە", checkEmail: "ئیمەیڵی خۆت بپشکنە",
    pinTitle: "کۆدی پاراستن", pinEnter: "کۆدی PIN بنووسە", pinWrong: "کۆد هەڵەیە",
    pinUnlock: "کردنەوە", pinSet: "کۆدی PIN دابنێ", pinSetHint: "بۆ پاراستنی حیساب و ڕێکخستن",
    pinChange: "کۆدی PIN بگۆڕە", pinRemove: "کۆدی PIN لاببە", pinNew: "کۆدی نوێ (٤ ژمارە)",
    pinSaved: "کۆد تۆمار کرا", pinLock: "قوفڵ بکە", pinSecurity: "پاراستن",
    lockWhich: "کام پەڕە بپارێزرێت", lockReports: "حیساب", lockTips: "بەخشیش", lockSettings: "ڕێکخستن", lockBranches: "گۆڕینی لق",
    branches: "لقەکان", addBranch: "لقی نوێ", branchName: "ناوی لق", confirmDelBranch: "دڵنیایت لە سڕینەوەی ئەم لقە و هەموو داتاکانی؟", lastBranch: "دەبێت لانیکەم یەک لق هەبێت",
  },
  en: {
    appTitle: "Shop Accounts", appSub: "Services, Revenue & Tips",
    tabPOS: "Register", tabSales: "Reports", tabTips: "Tips", tabServices: "Settings",
    todayTotal: "Today's revenue", monthTotal: "This month",
    pickWorker: "Select barber", pickServices: "Select services",
    total: "Total", subtotal: "Subtotal", tipLabel: "Tip", clear: "Clear",
    checkout: "Save",
    noWorkerFirst: "Select a barber first", noServiceFirst: "Select at least one service",
    saved: "Saved ✓",
    done: "Done", cancel: "Cancel", delete: "Delete",
    salesLog: "Sales", noSales: "No sales yet.",
    tipsFor: "Tips", manageWorkers: "Barbers", manageServices: "Services",
    newWorker: "New barber name", name: "Name", add: "Add",
    newService: "New service", price: "Price",
    noWorkers: "No barbers yet. Add them in Settings.", noServices: "No services yet.",
    thisMonth: "this month", tipFor: "Tip for", amount: "Amount",
    workerSummary: "Barber performance", cuts: "sales", avg: "Avg",
    topServices: "Top services", periodToday: "Today", periodMonth: "Month", periodAll: "All",
    tipsTotal: "Total tips", confirmDel: "Delete?", export: "Export CSV",
    optional: "(optional)", loading: "Loading…", other: "Other", tipAmount: "Tip amount",
    signIn: "Sign in", signUp: "Create account", signOut: "Sign out",
    email: "E-mail", password: "Password", shopName: "Shop name", currency: "Currency",
    haveAccount: "Have an account? Sign in", noAccount: "No account? Create one",
    settings: "Settings", save: "Save", saved2: "Saved",
    authErr: "Wrong e-mail or password", checkEmail: "Check your e-mail",
    pinTitle: "Protected", pinEnter: "Enter PIN", pinWrong: "Wrong PIN",
    pinUnlock: "Unlock", pinSet: "Set a PIN", pinSetHint: "To protect Reports & Settings",
    pinChange: "Change PIN", pinRemove: "Remove PIN", pinNew: "New PIN (4 digits)",
    pinSaved: "PIN saved", pinLock: "Lock", pinSecurity: "Security",
    lockWhich: "Which pages to protect", lockReports: "Reports", lockTips: "Tips", lockSettings: "Settings", lockBranches: "Switching branches",
    branches: "Branches", addBranch: "New branch", branchName: "Branch name", confirmDelBranch: "Delete this branch and all its data?", lastBranch: "You must have at least one branch",
  },
};

// اللغات التي تُكتب من اليمين لليسار
const RTL_LANGS = ["ckb"];
const isRTL = (lang) => RTL_LANGS.includes(lang);

const MONTHS = {
  kmr: ["Rêbendan","Reşemî","Adar","Avrêl","Gulan","Pûşper","Tîrmeh","Tebax","Îlon","Cotmeh","Mijdar","Berfanbar"],
  ckb: ["ڕێبەندان","ڕەشەمە","ئادار","نیسان","گوڵان","پووشپەڕ","تیرمەه","گەلاوێژ","ڕەزبەر","گەڵاڕێزان","سەرماوەز","بەفرانبار"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};

const TIP_PRESETS = [1, 2, 3, 5, 6, 7, 8, 9, 10];

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const monthKey = (iso) => iso.slice(0, 7);
const monthLabel = (key, lang) => {
  const [y, m] = key.split("-");
  return `${MONTHS[lang][parseInt(m,10)-1]} ${y}`;
};
const svcName = (s, lang) => (lang === "ckb" ? s.name_ckb : s.name_kmr);

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLang] = useState("kmr");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try { const l = localStorage.getItem("lang"); if (l) setLang(l); } catch (e) {}
  }, []);
  const switchLang = (n) => { setLang(n); try { localStorage.setItem("lang", n); } catch (e) {} };

  if (authLoading) {
    return <div style={{ ...wrap, alignItems: "center", justifyContent: "center" }}><div style={{ color: C.muted, fontSize: 18 }}>{T.kmr.loading}</div></div>;
  }
  if (!session) return <AuthScreen lang={lang} switchLang={switchLang} />;
  return <Main session={session} lang={lang} switchLang={switchLang} />;
}

/* ---------- مبدّل اللغة (3 لغات) ---------- */
const LANGS = [["kmr","Kurmancî"],["ckb","سۆرانی"],["en","English"]];
function LangToggle({ lang, switchLang }) {
  return (
    <div style={langToggle} dir="ltr">
      {LANGS.map(([code, label]) => (
        <button key={code} onClick={() => switchLang(code)}
          style={{ ...langBtn, background: lang===code?C.ink:"transparent", color: lang===code?C.bg:C.muted }}>
          {label}
        </button>
      ))}
    </div>
  );
}

/* ---------- مبدّل الفرع (بتصميم متناسق) ---------- */
function BranchSwitch({ branches, branchId, switchBranch, isRTLnow, locked }) {
  const [open, setOpen] = useState(false);
  const current = branches.find(b => b.id === branchId);
  // لو مقفول: الضغط على الزر يطلب الـPIN؛ بعد الفتح يقدر يفتح القائمة ويختار
  const onBtnClick = () => {
    if (locked) {
      switchBranch(branchId);  // يستدعي requestSwitchBranch -> يطلب PIN لأنه مقفول
    } else {
      setOpen(o => !o);
    }
  };
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onBtnClick} style={branchBtn}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>
          {current ? current.name : ""}
        </span>
        <span style={{ fontSize: 11 }}>{locked ? "\uD83D\uDD12" : <span style={{ fontSize: 10, color: C.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", display: "inline-block" }}>{"\u25BC"}</span>}</span>
      </button>
      {open && !locked && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ ...branchMenu, [isRTLnow ? "left" : "right"]: 0 }}>
            {branches.map(b => (
              <button key={b.id}
                onClick={() => { switchBranch(b.id); setOpen(false); }}
                style={{ ...branchItem, background: b.id===branchId ? C.ink : "transparent", color: b.id===branchId ? C.bg : C.ink }}>
                {b.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- مفتاح بنمط iPhone ---------- */
function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} aria-pressed={on} dir="ltr"
      style={{
        width: 52, height: 31, borderRadius: 31, border: "none", padding: 2,
        background: on ? C.green : "#d4cdba", position: "relative",
        transition: "background .2s", cursor: "pointer", flex: "0 0 auto",
      }}>
      <span style={{
        display: "block", width: 27, height: 27, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.3)", transition: "transform .2s",
        transform: on ? "translateX(21px)" : "translateX(0)",
      }} />
    </button>
  );
}

/* ---------- شاشة الدخول / التسجيل ---------- */
function AuthScreen({ lang, switchLang }) {
  const t = T[lang];
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMsg(""); setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMsg(t.authErr);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setMsg(error.message);
        else setMsg(t.checkEmail);
      }
    } finally { setBusy(false); }
  };

  return (
    <div style={wrap} dir={isRTL(lang) ? "rtl" : "ltr"}>
      <style>{globalCSS}</style>
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "60px 20px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ ...logoMark, width: 56, height: 56, fontSize: 28, margin: "0 auto 14px" }}>{"\u2702"}</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: C.ink }}>{t.appTitle}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{t.appSub}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <LangToggle lang={lang} switchLang={switchLang} />
        </div>
        <div style={formCard}>
          <label style={lbl}>{t.email}</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} style={inp} autoComplete="email" />
          <label style={lbl}>{t.password}</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inp} autoComplete={mode==="signin"?"current-password":"new-password"} />
          <button style={{ ...doneBtn, width: "100%", marginTop: 6, opacity: busy?.6:1 }} onClick={submit} disabled={busy}>
            {mode === "signin" ? t.signIn : t.signUp}
          </button>
          {msg && <div style={{ color: msg===t.checkEmail?C.green:C.red, textAlign: "center", marginTop: 12, fontWeight: 600, fontSize: 14 }}>{msg}</div>}
          <button onClick={() => { setMode(mode==="signin"?"signup":"signin"); setMsg(""); }}
            style={{ background: "none", border: "none", color: C.brassDark, marginTop: 16, width: "100%", fontWeight: 600, fontSize: 14 }}>
            {mode === "signin" ? t.noAccount : t.haveAccount}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- التطبيق الرئيسي بعد الدخول ---------- */
function Main({ session, lang, switchLang }) {
  const t = T[lang];
  const [tab, setTab] = useState("pos");
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [sales, setSales] = useState([]);
  const [tips, setTips] = useState([]);
  const [unlocked, setUnlocked] = useState(false);   // هل تم فتح القفل هذه الجلسة
  const [pinPrompt, setPinPrompt] = useState(null);   // التبويب المطلوب فتحه

  // تحميل المحل والفروع واختيار الفرع الحالي
  const loadShopAndBranches = useCallback(async () => {
    const { data: shopData } = await supabase.from("shops").select("*").single();
    setShop(shopData);
    const { data: br } = await supabase.from("branches").select("*").order("created_at");
    const list = br || [];
    setBranches(list);
    // اختر الفرع المحفوظ، أو أول فرع
    let saved = null;
    try { saved = localStorage.getItem("branchId"); } catch (e) {}
    const chosen = list.find(b => b.id === saved) || list[0];
    setBranchId(chosen ? chosen.id : null);
    return chosen ? chosen.id : null;
  }, []);

  // تحميل بيانات فرع معيّن
  const loadBranchData = useCallback(async (bid) => {
    if (!bid) { setWorkers([]); setServices([]); setSales([]); setTips([]); return; }
    const [w, s, sa, ti] = await Promise.all([
      supabase.from("workers").select("*").eq("active", true).eq("branch_id", bid).order("created_at"),
      supabase.from("services").select("*").eq("active", true).eq("branch_id", bid).order("sort_order"),
      supabase.from("sales").select("*").eq("branch_id", bid).order("created_at", { ascending: false }),
      supabase.from("tips").select("*").eq("branch_id", bid).order("created_at", { ascending: false }),
    ]);
    setWorkers(w.data || []); setServices(s.data || []);
    setSales(sa.data || []); setTips(ti.data || []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const bid = await loadShopAndBranches();
    await loadBranchData(bid);
    setLoading(false);
  }, [loadShopAndBranches, loadBranchData]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // عند تبديل الفرع — لو محمي بالـPIN ولسا ما فُتح، اطلب الكود
  const branchLocked = PROTECTED_branches() && shop?.pin && !unlocked;
  function PROTECTED_branches() {
    const arr = Array.isArray(shop?.locked_pages) ? shop.locked_pages : [];
    return arr.includes("branches");
  }
  const requestSwitchBranch = (bid) => {
    if (branchLocked) {
      setPinPrompt("branches");
    } else {
      switchBranch(bid);
    }
  };
  const switchBranch = async (bid) => {
    setBranchId(bid);
    try { localStorage.setItem("branchId", bid); } catch (e) {}
    setTab("pos");
    await loadBranchData(bid);
  };

  const curSym = useMemo(() => CURRENCIES.find(c => c.code === shop?.currency)?.sym || "", [shop]);
  const fmt = useCallback((n) => `${curSym}${new Intl.NumberFormat("en-US").format(Math.round(n*100)/100)}`, [curSym]);

  const PROTECTED = Array.isArray(shop?.locked_pages) ? shop.locked_pages : [];
  // الانتقال لتبويب: لو محمي وفيه PIN ولسا ما فُتح، اطلب الكود
  const goTab = (target) => {
    if (PROTECTED.includes(target) && shop?.pin && !unlocked) {
      setPinPrompt(target);
    } else {
      setTab(target);
    }
  };
  const onUnlock = () => {
    setUnlocked(true);
    // لو كان قفل الفروع: بس نفتح القفل، والمستخدم يختار الفرع بنفسه بعدها
    if (pinPrompt !== "branches") setTab(pinPrompt);
    setPinPrompt(null);
  };
  const lockNow = () => { setUnlocked(false); setTab("pos"); };

  if (loading) {
    return <div style={{ ...wrap, alignItems: "center", justifyContent: "center" }}><div style={{ color: C.muted, fontSize: 18 }}>{t.loading}</div></div>;
  }

  return (
    <div style={wrap} dir={isRTL(lang) ? "rtl" : "ltr"}>
      <style>{globalCSS}</style>
      <header style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoMark}>{"\u2702"}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.ink }}>{branches.find(b=>b.id===branchId)?.name || shop?.name || t.appTitle}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{t.appSub}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {branches.length > 1 && (
            <BranchSwitch branches={branches} branchId={branchId} switchBranch={requestSwitchBranch} isRTLnow={isRTL(lang)} locked={branchLocked} />
          )}
          {shop?.pin && unlocked && <button onClick={lockNow} style={signOutBtn}>{t.pinLock}</button>}
          <LangToggle lang={lang} switchLang={switchLang} />
          <button onClick={() => supabase.auth.signOut()} style={signOutBtn}>{t.signOut}</button>
        </div>
      </header>
      <nav style={nav}>
        <TabBtn active={tab==="pos"} onClick={()=>goTab("pos")} label={t.tabPOS} />
        <TabBtn active={tab==="sales"} onClick={()=>goTab("sales")} label={t.tabSales} locked={PROTECTED.includes("sales") && shop?.pin && !unlocked} />
        <TabBtn active={tab==="tips"} onClick={()=>goTab("tips")} label={t.tabTips} locked={PROTECTED.includes("tips") && shop?.pin && !unlocked} />
        <TabBtn active={tab==="services"} onClick={()=>goTab("services")} label={t.tabServices} locked={PROTECTED.includes("services") && shop?.pin && !unlocked} />
      </nav>
      <main style={main}>
        {tab==="pos" && <POSPage {...{shop,branchId,workers,services,sales,setSales,tips,setTips,t,lang,fmt}} />}
        {tab==="sales" && <SalesPage {...{sales,setSales,workers,t,lang,fmt}} />}
        {tab==="tips" && <TipsPage {...{shop,branchId,workers,tips,setTips,t,lang,fmt}} />}
        {tab==="services" && <SettingsPage {...{shop,setShop,branchId,branches,setBranches,switchBranch,workers,setWorkers,services,setServices,t,lang,reload:loadAll}} />}
      </main>
      {pinPrompt && <PinModal shop={shop} t={t} lang={lang} onUnlock={onUnlock} onCancel={()=>setPinPrompt(null)} />}
    </div>
  );
}

/* ---------- نافذة إدخال PIN ---------- */
function PinModal({ shop, t, lang, onUnlock, onCancel }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (val === shop.pin) onUnlock();
    else { setErr(true); setVal(""); }
  };
  return (
    <div style={modalOverlay} onClick={onCancel}>
      <div style={modalBox} onClick={(e)=>e.stopPropagation()} dir={isRTL(lang)?"rtl":"ltr"}>
        <div style={{ fontSize: 30, textAlign: "center", marginBottom: 6 }}>{"\uD83D\uDD12"}</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: C.ink, textAlign: "center", marginBottom: 14 }}>{t.pinTitle}</div>
        <input type="password" inputMode="numeric" value={val} autoFocus
          onChange={(e)=>{ setVal(e.target.value); setErr(false); }}
          onKeyDown={(e)=>{ if(e.key==="Enter") submit(); }}
          placeholder={t.pinEnter} style={{ ...inp, textAlign: "center", fontSize: 22, letterSpacing: 4 }} />
        {err && <div style={{ color: C.red, textAlign: "center", marginBottom: 10, fontWeight: 700 }}>{t.pinWrong}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={doneBtn} onClick={submit}>{t.pinUnlock}</button>
          <button style={cancelBtn} onClick={onCancel}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label, locked }) {
  return <button onClick={onClick} style={{ flex: 1, padding: "12px 0", border: "none", background: active?C.ink:"transparent", color: active?C.bg:C.muted, fontWeight: 700, fontSize: 14, borderRadius: 11, transition: "all .15s" }}>{label}{locked ? " \uD83D\uDD12" : ""}</button>;
}

/* ---------- الكاشير ---------- */
function POSPage({ shop, branchId, workers, services, sales, setSales, tips, setTips, t, lang, fmt }) {
  const [worker, setWorker] = useState(null);
  const [cart, setCart] = useState({});
  const [tip, setTip] = useState("");
  const [otherOpen, setOtherOpen] = useState(false);
  const [flash, setFlash] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const cartList = Object.entries(cart).filter(([,q])=>q>0).map(([id,q])=>({ s: services.find(x=>x.id===id), q })).filter(x=>x.s);
  const subtotal = cartList.reduce((sum,{s,q})=>sum+Number(s.price)*q, 0);
  const tipNum = parseFloat(tip) || 0;
  const total = subtotal + tipNum;

  const inc = (id) => setCart(c=>({ ...c, [id]:(c[id]||0)+1 }));
  const dec = (id) => setCart(c=>({ ...c, [id]:Math.max(0,(c[id]||0)-1) }));

  const today = todayISO();
  const todaySales = sales.filter(s=>s.sold_at===today);
  const todayTotal = todaySales.reduce((sum,s)=>sum+Number(s.subtotal), 0);

  const reset = () => { setCart({}); setWorker(null); setTip(""); setPctTip(null); setOtherOpen(false); setFlash(""); };

  const checkout = async () => {
    if (!worker) { setFlash(t.noWorkerFirst); return; }
    if (cartList.length === 0) { setFlash(t.noServiceFirst); return; }
    setBusy(true);
    const items = cartList.map(({s,q})=>({ serviceId:s.id, name:svcName(s,lang), price:Number(s.price), qty:q }));
    const { data: sale, error } = await supabase.from("sales").insert({
      shop_id: shop.id, branch_id: branchId, worker_id: worker, items, subtotal, tip: tipNum, sold_at: today,
    }).select().single();
    if (!error && sale) {
      setSales([sale, ...sales]);
      if (tipNum > 0) {
        const { data: tipRow } = await supabase.from("tips").insert({
          shop_id: shop.id, branch_id: branchId, worker_id: worker, amount: tipNum, from_sale: true, tip_date: today,
        }).select().single();
        if (tipRow) setTips([tipRow, ...tips]);
      }
      reset(); setOk(true); setTimeout(()=>setOk(false), 1600);
    }
    setBusy(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Stat label={t.todayTotal} value={fmt(todayTotal)} color={C.green} sub={`${todaySales.length} ${t.cuts}`} />
      </div>
      {workers.length===0 ? <Empty text={t.noWorkers} /> : (
        <>
          <div style={sectionLbl}>{t.pickWorker}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
            {workers.map(w=>(
              <button key={w.id} onClick={()=>{ setWorker(w.id); setFlash(""); }}
                style={{ ...chip, borderColor: worker===w.id?C.brass:C.line, background: worker===w.id?C.ink:C.card, color: worker===w.id?C.bg:C.ink }}>{w.name}</button>
            ))}
          </div>
          <div style={sectionLbl}>{t.pickServices}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10, marginBottom:18 }}>
            {services.map(s=>{
              const q = cart[s.id]||0;
              return (
                <div key={s.id} style={{ ...svcCard, borderColor: q>0?C.brass:C.line, background: q>0?"#fdf8ec":C.card }}>
                  <button onClick={()=>{ inc(s.id); setFlash(""); }} style={svcTap}>
                    <div style={{ fontWeight:800, fontSize:16, color:C.ink }}>{svcName(s,lang)}</div>
                    <div style={{ fontSize:14, color:C.brassDark, fontWeight:700, marginTop:4 }}>{fmt(Number(s.price))}</div>
                  </button>
                  {q>0 && (
                    <div style={qtyRow}>
                      <button style={qtyBtn} onClick={()=>dec(s.id)}>−</button>
                      <span style={{ fontWeight:800, color:C.ink, minWidth:20, textAlign:"center" }}>{q}</span>
                      <button style={qtyBtn} onClick={()=>inc(s.id)}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {subtotal>0 && (
            <div style={{ ...formCard, marginBottom:14, animation:"slideUp .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ color:C.muted }}>{t.subtotal}</span>
                <span style={{ fontWeight:700, color:C.ink }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ color:C.muted }}>{t.tipLabel} <span style={{ fontSize:11 }}>{t.optional}</span></span>
                {tipNum>0 && <span style={{ fontWeight:800, color:C.brassDark }}>+{fmt(tipNum)}</span>}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {TIP_PRESETS.map(amt=>{
                  const on = !otherOpen && parseFloat(tip)===amt;
                  return <button key={amt} onClick={()=>{ setOtherOpen(false); setTip(on?"":String(amt)); }}
                    style={{ ...tipChip, borderColor:on?C.brass:C.line, background:on?C.ink:C.card, color:on?C.bg:C.ink }}>{amt}</button>;
                })}
                <button onClick={()=>{ setOtherOpen(true); setTip(""); }}
                  style={{ ...tipChip, borderColor:otherOpen?C.brass:C.line, background:otherOpen?C.ink:C.card, color:otherOpen?C.bg:C.ink }}>{t.other}</button>
                <button onClick={()=>{ setOtherOpen(false); setTip(""); }} style={{ ...tipChip, borderColor:C.line, background:C.card, color:C.muted }}>{t.clear}</button>
              </div>
              {otherOpen && (
                <input type="number" inputMode="decimal" autoFocus value={tip}
                  onChange={(e)=>setTip(e.target.value)} placeholder={t.tipAmount}
                  style={{ ...inp, marginTop:10, marginBottom:0 }} />
              )}
            </div>
          )}
          <div style={checkoutBar}>
            <div>
              <div style={{ fontSize:12, color:C.muted }}>{t.total}</div>
              <div style={{ fontSize:30, fontWeight:900, color:C.ink }}>{fmt(total)}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {(subtotal>0||worker) && <button style={clearBtn} onClick={reset}>{t.clear}</button>}
              <button style={{ ...checkoutBtn, opacity:busy?.6:1 }} onClick={checkout} disabled={busy}>{t.checkout}</button>
            </div>
          </div>
          {flash && <div style={{ color:C.red, textAlign:"center", marginTop:12, fontWeight:700 }}>{flash}</div>}
        </>
      )}
      {ok && <div style={toast}>{t.saved}</div>}
    </div>
  );
}

function Stat({ label, value, color, sub }) {
  return (
    <div style={{ ...statCard, flex:1, margin:0, padding:"14px 16px" }}>
      <div style={{ fontSize:12, color:C.muted, marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:900, color }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

/* ---------- التقارير ---------- */
function SalesPage({ sales, setSales, workers, t, lang, fmt }) {
  const [period, setPeriod] = useState("month");
  const wName = (id) => workers.find(w=>w.id===id)?.name || "—";
  const today = todayISO();

  const filtered = useMemo(()=>{
    if (period==="today") return sales.filter(s=>s.sold_at===today);
    if (period==="month") return sales.filter(s=>monthKey(s.sold_at)===monthKey(today));
    return sales;
  }, [sales, period, today]);

  const totalRev = filtered.reduce((sum,s)=>sum+Number(s.subtotal),0);
  const totalTips = filtered.reduce((sum,s)=>sum+Number(s.tip||0),0);
  const count = filtered.length;
  const avg = count?totalRev/count:0;

  const perWorker = workers.map(w=>{
    const ws = filtered.filter(s=>s.worker_id===w.id);
    return { name:w.name, total:ws.reduce((s,x)=>s+Number(x.subtotal),0), count:ws.length };
  }).filter(p=>p.count>0).sort((a,b)=>b.total-a.total);

  const svcCount = {};
  filtered.forEach(s=>(s.items||[]).forEach(i=>{ svcCount[i.name]=(svcCount[i.name]||0)+i.qty; }));
  const topSvc = Object.entries(svcCount).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const del = async (id) => {
    if (!window.confirm(t.confirmDel)) return;
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (!error) setSales(sales.filter(s=>s.id!==id));
  };

  const exportCSV = () => {
    const rows = [["date","worker","services","subtotal","tip"]];
    filtered.forEach(s=>rows.push([s.sold_at, wName(s.worker_id), (s.items||[]).map(i=>`${i.name} x${i.qty}`).join(" | "), s.subtotal, s.tip||0]));
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`hesab-${period}-${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={periodBar}>
        {[["today",t.periodToday],["month",t.periodMonth],["all",t.periodAll]].map(([k,l])=>(
          <button key={k} onClick={()=>setPeriod(k)} style={{ ...periodBtn, background:period===k?C.ink:"transparent", color:period===k?C.bg:C.muted }}>{l}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
        <Stat label={t.monthTotal} value={fmt(totalRev)} color={C.green} sub={`${count} ${t.cuts}`} />
        <Stat label={t.tipsTotal} value={fmt(totalTips)} color={C.brassDark} />
        <Stat label={t.avg} value={fmt(avg)} color={C.blue} />
      </div>
      {topSvc.length>0 && (
        <div style={{ ...formCard, marginBottom:16 }}>
          <div style={{ ...sectionLbl, marginBottom:8 }}>{t.topServices}</div>
          {topSvc.map(([name,c],i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom: i<topSvc.length-1?`1px solid ${C.line}`:"none" }}>
              <span style={{ color:C.ink, fontWeight:600 }}>{name}</span>
              <span style={{ color:C.brassDark, fontWeight:700 }}>{c}×</span>
            </div>
          ))}
        </div>
      )}
      {perWorker.length>0 && (
        <div style={{ marginBottom:16 }}>
          <div style={sectionLbl}>{t.workerSummary}</div>
          {perWorker.map((p,i)=>(
            <div key={i} style={row}>
              <span style={{ fontWeight:700, color:C.ink, flex:1 }}>{p.name}</span>
              <span style={{ color:C.muted, fontSize:13 }}>{p.count} {t.cuts}</span>
              <span style={{ fontWeight:800, color:C.green, minWidth:70, textAlign:"right" }}>{fmt(p.total)}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ ...sectionLbl, marginBottom:0 }}>{t.salesLog}</div>
        {filtered.length>0 && <button style={exportBtn} onClick={exportCSV}>{t.export}</button>}
      </div>
      {filtered.length===0 ? <Empty text={t.noSales} /> : filtered.map(s=>(
        <div key={s.id} style={{ ...row, flexDirection:"column", alignItems:"stretch", gap:4 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:800, color:C.ink }}>{wName(s.worker_id)}</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontWeight:800, color:C.green }}>{fmt(Number(s.subtotal))}</span>
              {Number(s.tip)>0 && <span style={{ fontSize:12, color:C.brassDark }}>+{fmt(Number(s.tip))}</span>}
              <button style={{ ...delBtn, padding:"2px 8px" }} onClick={()=>del(s.id)}>✕</button>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted }}>
            <span>{(s.items||[]).map(i=>`${i.name}${i.qty>1?` ×${i.qty}`:""}`).join(" + ")}</span>
            <span>{s.sold_at}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- البخشيش ---------- */
function TipsPage({ shop, branchId, workers, tips, setTips, t, lang, fmt }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const curMonth = monthKey(todayISO());
  const monthTotalFor = (wid) => tips.filter(x=>x.worker_id===wid && monthKey(x.tip_date)===curMonth).reduce((sum,x)=>sum+Number(x.amount),0);
  const grandTotal = workers.reduce((sum,w)=>sum+monthTotalFor(w.id),0);

  const submitTip = async () => {
    const amt = parseFloat(amount);
    if (!selected || !amt || amt<=0) return;
    setBusy(true);
    const { data, error } = await supabase.from("tips").insert({
      shop_id: shop.id, branch_id: branchId, worker_id: selected, amount: amt, from_sale: false, tip_date: todayISO(),
    }).select().single();
    if (!error && data) { setTips([data, ...tips]); setAmount(""); setSelected(null); }
    setBusy(false);
  };
  const worker = workers.find(w=>w.id===selected);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13, color:C.muted }}>{t.tipsFor} · {monthLabel(curMonth,lang)}</div>
        <div style={{ fontWeight:800, color:C.brassDark, fontSize:18 }}>{fmt(grandTotal)}</div>
      </div>
      {workers.length===0 ? <Empty text={t.noWorkers} /> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10 }}>
          {workers.map(w=>(
            <button key={w.id} onClick={()=>{ setSelected(w.id); setAmount(""); }} style={{ ...svcCard, padding:"16px 14px", borderColor:selected===w.id?C.brass:C.line, background:selected===w.id?"#fdf8ec":C.card }}>
              <div style={{ fontWeight:800, fontSize:16, color:C.ink }}>{w.name}</div>
              <div style={{ fontSize:13, color:C.brassDark, fontWeight:700, marginTop:4 }}>{fmt(monthTotalFor(w.id))} {t.thisMonth}</div>
            </button>
          ))}
        </div>
      )}
      {worker && (
        <div style={{ ...formCard, marginTop:16, animation:"pop .15s" }}>
          <div style={{ fontWeight:800, color:C.ink, marginBottom:8 }}>{t.tipFor} {worker.name}</div>
          <input type="number" inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder={t.amount} style={inp} autoFocus />
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ ...doneBtn, opacity:busy?.6:1 }} onClick={submitTip} disabled={busy}>{t.done}</button>
            <button style={cancelBtn} onClick={()=>setSelected(null)}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- الإعدادات: المحل + العمّال + الخدمات ---------- */
function SettingsPage({ shop, setShop, branchId, branches, setBranches, switchBranch, workers, setWorkers, services, setServices, t, lang, reload }) {
  const [newName, setNewName] = useState("");
  const [svcN, setSvcN] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [shopName, setShopName] = useState(shop?.name || "");
  const [currency, setCurrency] = useState(shop?.currency || "USD");
  const [savedMsg, setSavedMsg] = useState(false);
  const [pinVal, setPinVal] = useState("");
  const [pinMsg, setPinMsg] = useState(false);
  const [lockedPages, setLockedPages] = useState(Array.isArray(shop?.locked_pages) ? shop.locked_pages : []);
  const [newBranch, setNewBranch] = useState("");

  // إضافة فرع جديد (مع 4 خدمات افتراضية)
  const addBranch = async () => {
    const n = newBranch.trim(); if (!n) return;
    const { data: br, error } = await supabase.from("branches").insert({ shop_id: shop.id, name: n }).select().single();
    if (!error && br) {
      await supabase.from("services").insert([
        { shop_id: shop.id, branch_id: br.id, name_kmr: "Skin Fade", name_ckb: "Skin Fade", price: 15, sort_order: 1 },
        { shop_id: shop.id, branch_id: br.id, name_kmr: "Por (Normal)", name_ckb: "Qij (Asayi)", price: 12, sort_order: 2 },
        { shop_id: shop.id, branch_id: br.id, name_kmr: "Ri", name_ckb: "Ris", price: 7, sort_order: 3 },
        { shop_id: shop.id, branch_id: br.id, name_kmr: "Por + Ri", name_ckb: "Qij + Ris", price: 18, sort_order: 4 },
      ]);
      setBranches([...branches, br]);
      setNewBranch("");
    }
  };
  // إعادة تسمية الفرع
  const renameBranch = async (id, name) => {
    setBranches(branches.map(b=>b.id===id?{...b, name}:b));
    await supabase.from("branches").update({ name }).eq("id", id);
  };
  // حذف فرع (مع كل بياناته) - ممنوع حذف آخر فرع
  const delBranch = async (id) => {
    if (branches.length <= 1) { window.alert(t.lastBranch); return; }
    if (!window.confirm(t.confirmDelBranch)) return;
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (!error) {
      const remaining = branches.filter(b=>b.id!==id);
      setBranches(remaining);
      if (branchId === id && remaining[0]) switchBranch(remaining[0].id);
    }
  };

  const toggleLock = async (page) => {
    const next = lockedPages.includes(page) ? lockedPages.filter(p=>p!==page) : [...lockedPages, page];
    setLockedPages(next);
    const { data } = await supabase.from("shops").update({ locked_pages: next }).eq("id", shop.id).select().single();
    if (data) setShop(data);
  };

  const saveShop = async () => {
    const { data, error } = await supabase.from("shops").update({ name: shopName, currency }).eq("id", shop.id).select().single();
    if (!error && data) { setShop(data); setSavedMsg(true); setTimeout(()=>setSavedMsg(false), 1500); }
  };
  const savePin = async () => {
    const clean = pinVal.trim();
    if (clean && !/^\d{4,6}$/.test(clean)) return;   // 4-6 أرقام
    const newPin = clean === "" ? null : clean;
    const { data, error } = await supabase.from("shops").update({ pin: newPin }).eq("id", shop.id).select().single();
    if (!error && data) { setShop(data); setPinVal(""); setPinMsg(true); setTimeout(()=>setPinMsg(false), 1500); }
  };
  const removePin = async () => {
    const { data, error } = await supabase.from("shops").update({ pin: null }).eq("id", shop.id).select().single();
    if (!error && data) { setShop(data); setPinVal(""); setPinMsg(true); setTimeout(()=>setPinMsg(false), 1500); }
  };
  const addWorker = async () => {
    const n = newName.trim(); if (!n) return;
    const { data, error } = await supabase.from("workers").insert({ shop_id: shop.id, branch_id: branchId, name: n }).select().single();
    if (!error && data) { setWorkers([...workers, data]); setNewName(""); }
  };
  const delWorker = async (id) => {
    if (!window.confirm(t.confirmDel)) return;
    const { error } = await supabase.from("workers").update({ active: false }).eq("id", id);
    if (!error) setWorkers(workers.filter(w=>w.id!==id));
  };
  const addService = async () => {
    const n = svcN.trim(); const p = parseFloat(svcPrice);
    if (!n || !p || p<=0) return;
    const { data, error } = await supabase.from("services").insert({
      shop_id: shop.id, branch_id: branchId, name_kmr: n, name_ckb: n, price: p, sort_order: services.length+1,
    }).select().single();
    if (!error && data) { setServices([...services, data]); setSvcN(""); setSvcPrice(""); }
  };
  const delService = async (id) => {
    if (!window.confirm(t.confirmDel)) return;
    const { error } = await supabase.from("services").update({ active: false }).eq("id", id);
    if (!error) setServices(services.filter(s=>s.id!==id));
  };
  const editPrice = async (id, val) => {
    const p = parseFloat(val); const price = isNaN(p)?0:p;
    setServices(services.map(s=>s.id===id?{...s, price}:s));
    await supabase.from("services").update({ price }).eq("id", id);
  };

  return (
    <div>
      <div style={sectionLbl}>{t.settings}</div>
      <div style={{ ...formCard, marginBottom:20 }}>
        <label style={lbl}>{t.shopName}</label>
        <input value={shopName} onChange={(e)=>setShopName(e.target.value)} style={inp} />
        <label style={lbl}>{t.currency}</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
          {CURRENCIES.map(c=>(
            <button key={c.code} onClick={()=>setCurrency(c.code)}
              style={{ ...tipChip, borderColor:currency===c.code?C.brass:C.line, background:currency===c.code?C.ink:C.card, color:currency===c.code?C.bg:C.ink }}>
              {c.sym} {c.code}
            </button>
          ))}
        </div>
        <button style={{ ...doneBtn, width:"100%" }} onClick={saveShop}>{savedMsg ? t.saved2 : t.save}</button>
      </div>

      <div style={sectionLbl}>{t.pinSecurity}</div>
      <div style={{ ...formCard, marginBottom:20 }}>
        <label style={lbl}>{shop?.pin ? t.pinChange : t.pinSet}</label>
        <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>{t.pinSetHint}</div>
        <input type="number" inputMode="numeric" value={pinVal} onChange={(e)=>setPinVal(e.target.value)}
          placeholder={t.pinNew} style={inp} />
        <button style={{ ...doneBtn, width:"100%" }} onClick={savePin}>
          {pinMsg ? t.pinSaved : (shop?.pin ? t.pinChange : t.save)}
        </button>
        {shop?.pin && (
          <button onClick={removePin}
            style={{ background:"none", border:"none", color:C.red, marginTop:12, width:"100%", fontWeight:700, fontSize:14 }}>
            {t.pinRemove}
          </button>
        )}
        {shop?.pin && (
          <div style={{ marginTop:18, paddingTop:18, borderTop:`1px solid ${C.line}` }}>
            <div style={{ ...lbl, marginBottom:12 }}>{t.lockWhich}</div>
            {[["sales", t.lockReports], ["tips", t.lockTips], ["services", t.lockSettings], ["branches", t.lockBranches]].map(([page, label])=>(
              <div key={page} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0" }}>
                <span style={{ color:C.ink, fontWeight:600, fontSize:15 }}>{label}</span>
                <Toggle on={lockedPages.includes(page)} onChange={()=>toggleLock(page)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sectionLbl}>{t.branches}</div>
      <div style={{ ...formCard, marginBottom:20 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={newBranch} onChange={(e)=>setNewBranch(e.target.value)} placeholder={t.branchName} style={{ ...inp, marginBottom:0 }} />
          <button style={{ ...doneBtn, flex:"0 0 auto", width:"auto", padding:"0 18px" }} onClick={addBranch}>{t.add}</button>
        </div>
        {branches.length>0 && (
          <div style={{ marginTop:12 }}>
            {branches.map(b=>(
              <div key={b.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:"8px 0", borderBottom:`1px solid ${C.line}` }}>
                <input value={b.name} onChange={(e)=>renameBranch(b.id, e.target.value)}
                  style={{ ...inp, marginBottom:0, flex:1, fontWeight:700,
                    border: b.id===branchId ? `2px solid ${C.brass}` : `1px solid ${C.line}` }} />
                <button style={delBtn} onClick={()=>delBranch(b.id)} disabled={branches.length<=1}>{t.delete}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sectionLbl}>{t.manageWorkers}</div>
      <div style={{ ...formCard, marginBottom:20 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder={t.newWorker} style={{ ...inp, marginBottom:0 }} />
          <button style={{ ...doneBtn, flex:"0 0 auto", width:"auto", padding:"0 18px" }} onClick={addWorker}>{t.add}</button>
        </div>
        {workers.length>0 && (
          <div style={{ marginTop:12 }}>
            {workers.map(w=>(
              <div key={w.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.line}` }}>
                <span style={{ color:C.ink, fontWeight:600 }}>{w.name}</span>
                <button style={delBtn} onClick={()=>delWorker(w.id)}>{t.delete}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sectionLbl}>{t.manageServices}</div>
      <div style={formCard}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={svcN} onChange={(e)=>setSvcN(e.target.value)} placeholder={t.newService} style={{ ...inp, marginBottom:0, flex:2 }} />
          <input value={svcPrice} onChange={(e)=>setSvcPrice(e.target.value)} placeholder={t.price} type="number" inputMode="decimal" style={{ ...inp, marginBottom:0, flex:1, minWidth:0 }} />
          <button style={{ ...doneBtn, flex:"0 0 auto", width:"auto", padding:"0 18px" }} onClick={addService}>{t.add}</button>
        </div>
        {services.length===0 ? <div style={{ marginTop:12 }}><Empty text={t.noServices} /></div> : (
          <div style={{ marginTop:12 }}>
            {services.map(s=>(
              <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.line}`, gap:8 }}>
                <span style={{ color:C.ink, fontWeight:600, flex:1 }}>{svcName(s,lang)}</span>
                <input type="number" inputMode="decimal" defaultValue={s.price} onBlur={(e)=>editPrice(s.id, e.target.value)} style={{ ...inp, marginBottom:0, width:80, padding:"8px", textAlign:"center" }} />
                <button style={delBtn} onClick={()=>delService(s.id)}>{t.delete}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ textAlign:"center", padding:"36px 20px", color:C.muted, fontSize:15, lineHeight:1.7 }}>{text}</div>;
}

/* ---------- styles ---------- */
const globalCSS = `* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } @keyframes pop { from { transform: scale(.97); opacity: 0 } to { transform: scale(1); opacity: 1 } } @keyframes slideUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } } button { font-family: inherit; cursor: pointer; } input { font-family: inherit; } body { margin: 0; }`;
const wrap = { minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", maxWidth: 820, margin: "0 auto" };
const header = { padding: "18px 18px 14px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" };
const logoMark = { width: 42, height: 42, borderRadius: 11, background: C.ink, color: C.brass, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flex: "0 0 auto" };
const langToggle = { display: "flex", gap: 4, background: "#efe9da", borderRadius: 10, padding: 4 };
const langBtn = { border: "none", borderRadius: 7, padding: "7px 14px", fontWeight: 700, fontSize: 13, transition: "all .15s" };
const signOutBtn = { border: `1px solid ${C.line}`, background: C.card, color: C.muted, borderRadius: 9, padding: "8px 14px", fontWeight: 700, fontSize: 13 };
const branchBtn = { display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.line}`, background: C.card, color: C.ink, borderRadius: 9, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
const branchMenu = { position: "absolute", top: "calc(100% + 6px)", zIndex: 41, background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: 6, minWidth: 170, boxShadow: "0 8px 28px rgba(0,0,0,.16)", display: "flex", flexDirection: "column", gap: 4 };
const branchItem = { textAlign: "start", border: "none", borderRadius: 8, padding: "10px 12px", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" };
const nav = { display: "flex", gap: 6, padding: "10px 14px", background: "#efe9da", margin: "12px 14px 0", borderRadius: 14 };
const main = { padding: "18px 14px 40px", flex: 1, position: "relative" };
const statCard = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "20px 18px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,.04)" };
const sectionLbl = { fontSize: 13, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 };
const chip = { padding: "11px 18px", border: "2px solid", borderRadius: 12, fontWeight: 700, fontSize: 15, transition: "all .12s" };
const svcCard = { position: "relative", border: "2px solid", borderRadius: 14, transition: "all .12s", overflow: "hidden" };
const svcTap = { width: "100%", padding: "16px 14px", border: "none", background: "transparent", textAlign: "start" };
const qtyRow = { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "8px", borderTop: `1px solid ${C.line}`, background: "rgba(176,141,63,.08)" };
const qtyBtn = { width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.brass}`, background: C.card, color: C.brassDark, fontSize: 20, fontWeight: 800, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" };
const checkoutBar = { display: "flex", justifyContent: "space-between", alignItems: "center", background: C.card, border: `2px solid ${C.brass}`, borderRadius: 16, padding: "14px 18px" };
const checkoutBtn = { padding: "14px 28px", border: "none", background: C.green, color: "#fff", borderRadius: 12, fontWeight: 800, fontSize: 17 };
const clearBtn = { padding: "14px 18px", border: `1px solid ${C.line}`, background: "transparent", color: C.muted, borderRadius: 12, fontWeight: 700, fontSize: 14 };
const tipChip = { minWidth: 52, padding: "11px 16px", border: "2px solid", borderRadius: 11, fontWeight: 800, fontSize: 15, transition: "all .12s" };
const formCard = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 };
const lbl = { display: "block", fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 600 };
const inp = { width: "100%", padding: "13px", fontSize: 16, border: `1px solid ${C.line}`, borderRadius: 11, marginBottom: 12, background: "#fff", color: C.ink, outline: "none" };
const doneBtn = { flex: 1, padding: "13px", border: "none", background: C.green, color: "#fff", borderRadius: 11, fontWeight: 800, fontSize: 16 };
const cancelBtn = { flex: 1, padding: "13px", border: `1px solid ${C.line}`, background: "transparent", color: C.muted, borderRadius: 11, fontWeight: 700, fontSize: 15 };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, marginBottom: 8, gap: 10 };
const delBtn = { padding: "6px 12px", border: "none", background: "transparent", color: C.red, borderRadius: 8, fontWeight: 700, fontSize: 13 };
const periodBar = { display: "flex", gap: 4, background: "#efe9da", borderRadius: 12, padding: 4, marginBottom: 14 };
const periodBtn = { flex: 1, border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 14, transition: "all .15s" };
const exportBtn = { padding: "7px 14px", border: `1px solid ${C.line}`, background: C.card, color: C.blue, borderRadius: 9, fontWeight: 700, fontSize: 13 };
const toast = { position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#fff", padding: "14px 28px", borderRadius: 12, fontWeight: 800, fontSize: 16, boxShadow: "0 4px 16px rgba(0,0,0,.2)", zIndex: 50, animation: "slideUp .2s" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(26,20,16,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalBox = { background: C.card, borderRadius: 18, padding: 24, width: "100%", maxWidth: 340, boxShadow: "0 10px 40px rgba(0,0,0,.25)", animation: "pop .15s" };
