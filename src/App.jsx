import { useState, useEffect, useCallback } from "react";
import { COURSES, REGIONS } from "./data/courses.js";
import { ClaimPage, SuccessPage } from "./pages/ClaimFlow.jsx";

// ─── FONTS & GLOBAL CSS ───────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Source+Sans+3:wght@300;400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a1209; }
  input::placeholder { color: rgba(255,255,255,0.38); }
  select option { background: #1a2a1a; color: #fff; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  .fade-up  { animation: fadeUp  0.45s ease both; }
  .fade-in  { animation: fadeIn  0.45s ease both; }
  .slide-in { animation: slideIn 0.35s ease both; }
  a { text-decoration: none; }
`;


// ─── SHARED COMPONENTS ───────────────────────────────────────────────────
function Nav({ navigate, currentPage }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position:"sticky", top:0, zIndex:200,
      background: scrolled ? "rgba(6,14,6,0.97)" : "rgba(6,14,6,0.88)",
      backdropFilter:"blur(14px)",
      borderBottom:"1px solid rgba(255,255,255,0.07)",
      transition:"background 0.3s",
    }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
        <button onClick={() => navigate("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>⛳</span>
          <span style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:20, fontWeight:900, letterSpacing:"-0.01em" }}>
            Love<span style={{ color:"#c8a84b" }}>Nebraska</span><span style={{ color:"#a8d890" }}>Golf</span>
          </span>
        </button>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[["Directory","search"],["Regions","home"],["Top Courses","home"]].map(([label, page]) => (
            <button key={label} onClick={() => navigate(page)}
              style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:600, color:"rgba(200,216,184,0.65)", letterSpacing:"0.06em", transition:"color 0.2s" }}
              onMouseEnter={e => e.target.style.color="#a8d890"}
              onMouseLeave={e => e.target.style.color="rgba(200,216,184,0.65)"}
            >{label}</button>
          ))}
          <a href="https://www.facebook.com/LoveNebraskaGolf/" target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", gap:5, color:"rgba(200,216,184,0.65)", fontSize:13, fontWeight:600, fontFamily:"'Source Sans 3',sans-serif", letterSpacing:"0.06em", textDecoration:"none", transition:"color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color="#a8d890"}
            onMouseLeave={e => e.currentTarget.style.color="rgba(200,216,184,0.65)"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <button style={{
            background:"#c8a84b", color:"#1a1000",
            fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:800,
            letterSpacing:"0.12em", textTransform:"uppercase",
            padding:"8px 16px", borderRadius:2, border:"none", cursor:"pointer",
          }} onClick={() => navigate("claim")}>List Your Course</button>
        </div>
      </div>
    </nav>
  );
}

function TypeBadge({ type }) {
  const map = { Public:{bg:"#1d3320",text:"#a8d890",border:"#2d5330"}, Private:{bg:"#1a1a2e",text:"#9898d8",border:"#2a2a4e"}, "Semi-Private":{bg:"#2e1d10",text:"#d8a870",border:"#4e3520"} };
  const c = map[type] || map["Public"];
  return <span style={{ background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"3px 8px", borderRadius:2, fontFamily:"'Source Sans 3',sans-serif", whiteSpace:"nowrap" }}>{type}</span>;
}

function CoursePhoto({ course, style = {} }) {
  const [err, setErr] = useState(false);
  const src = course.photos?.[0];
  if (!src || err) return (
    <div style={{ background:"linear-gradient(135deg,#1d3320,#2d4a28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, color:"rgba(168,216,144,0.2)", ...style }}>⛳</div>
  );
  return <img src={src} alt={course.name} onError={() => setErr(true)} style={{ objectFit:"cover", objectPosition:"center 60%", display:"block", ...style }} />;
}

// ─── HOMEPAGE ────────────────────────────────────────────────────────────
function HomePage({ navigate }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const featured = COURSES.filter(c => c.featured);

  const handleSearch = () => navigate("search", { query, region, type });

  return (
    <div style={{ minHeight:"100vh", background:"#0a1209" }}>

      {/* HERO */}
      <div style={{ position:"relative", minHeight:"88vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"60px 24px 100px" }}>
        <div className="fade-in" style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 120% 60% at 50% 100%,#1d3a10 0%,transparent 60%),radial-gradient(ellipse 80% 50% at 20% 80%,#2a4a08 0%,transparent 50%),linear-gradient(175deg,#0a1e28 0%,#0e1a08 35%,#1a2a08 55%,#0a1408 100%)" }} />
        <div style={{ position:"absolute", inset:0, opacity:0.035, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"256px 256px" }} />

        <div style={{ position:"relative", textAlign:"center", maxWidth:780, width:"100%" }}>
          <div className="fade-up" style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ height:1, width:40, background:"rgba(200,168,75,0.5)" }} />
            <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:800, letterSpacing:"0.25em", textTransform:"uppercase", color:"#c8a84b" }}>The Official Nebraska Golf Directory</span>
            <div style={{ height:1, width:40, background:"rgba(200,168,75,0.5)" }} />
          </div>

          <h1 className="fade-up" style={{ animationDelay:"0.08s", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(42px,7vw,82px)", fontWeight:900, color:"#fff", lineHeight:1.0, letterSpacing:"-0.025em", margin:"0 0 8px" }}>
            Every Course.<br /><span style={{ color:"#a8d890" }}>Every Corner</span><br />of Nebraska.
          </h1>

          <p className="fade-up" style={{ animationDelay:"0.16s", fontFamily:"'Source Sans 3',sans-serif", fontSize:"clamp(15px,2.5vw,19px)", fontWeight:300, color:"rgba(200,216,184,0.7)", margin:"18px auto 36px", lineHeight:1.6, maxWidth:520 }}>
            From the world-famous Sandhills to the Panhandle's big-sky prairie — 197 courses, 8 regions, one place to find your next round.
          </p>

          {/* Search bar */}
          <div className="fade-up" style={{ animationDelay:"0.24s", background:"rgba(0,0,0,0.55)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:4, padding:"22px 24px", maxWidth:680, margin:"0 auto 20px" }}>
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <div style={{ flex:1, position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, opacity:0.5 }}>⛳</span>
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSearch()} placeholder="Course name or city..." style={{ width:"100%", padding:"12px 14px 12px 36px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:3, color:"#fff", fontSize:15, fontFamily:"'Source Sans 3',sans-serif", outline:"none" }} />
              </div>
              <button onClick={handleSearch} style={{ background:"#c8a84b", color:"#1a1000", border:"none", padding:"12px 28px", borderRadius:3, fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", whiteSpace:"nowrap" }}>Find Courses</button>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              {[["All Regions",""], ...REGIONS.map(r => [r.name, r.name])].slice(0,5).map(([label,val]) => (
                <button key={label} onClick={() => setRegion(val)} style={{ flex:1, padding:"8px 6px", background: region===val ? "rgba(168,216,144,0.15)" : "rgba(255,255,255,0.06)", border:`1px solid ${region===val ? "rgba(168,216,144,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius:2, color: region===val ? "#a8d890" : "rgba(255,255,255,0.6)", fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>{label}</button>
              ))}
              <select value={type} onChange={e => setType(e.target.value)} style={{ flex:1, padding:"8px 8px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:2, color:"rgba(255,255,255,0.6)", fontFamily:"'Source Sans 3',sans-serif", fontSize:11, cursor:"pointer" }}>
                <option value="">Any Type</option><option>Public</option><option>Semi-Private</option><option>Private</option>
              </select>
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay:"0.32s", display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
            {[["18-Hole Courses","","","18"],["Public Courses","","Public",""],["Sandhills Golf","Sandhills","",""],["Driving Ranges","","",""]].map(([label,r,t,h]) => (
              <button key={label} onClick={() => navigate("search",{region:r,type:t,holes:h})} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(200,216,184,0.55)", borderBottom:"1px solid rgba(200,216,184,0.2)", paddingBottom:1, transition:"color 0.2s" }} onMouseEnter={e=>e.target.style.color="#a8d890"} onMouseLeave={e=>e.target.style.color="rgba(200,216,184,0.55)"}>{label}</button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", borderTop:"1px solid rgba(255,255,255,0.07)", padding:"14px 24px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"center" }}>
            {[["197","Golf Courses"],["8","Regions"],["93","Public Courses"],["1","Great State"]].map(([val,lbl],i) => (
              <div key={lbl} className="fade-up" style={{ animationDelay:`${0.4+i*0.08}s`, textAlign:"center", padding:"0 32px", borderRight: i<3 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:"#c8a84b", lineHeight:1 }}>{val}</div>
                <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(200,216,184,0.5)", marginTop:3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK FILTERS */}
      <div style={{ padding:"36px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
          {[["🌍","All Courses","197 total","","",""],["🟢","Public","93 courses","","Public",""],["🔵","Semi-Private","68 courses","","Semi-Private",""],["🔴","Private","28 courses","","Private",""],["⛳","18 Holes","126 courses","","","18"],["🏌️","9 Holes","65 courses","","","9"]].map(([icon,label,sub,r,t,h],i) => (
            <button key={label} onClick={() => navigate("search",{region:r,type:t,holes:h})} className="fade-up" style={{ animationDelay:`${i*50}ms`, display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"18px 12px", borderRadius:3, cursor:"pointer", border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.03)", transition:"all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.borderColor="rgba(168,216,144,0.25)";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";e.currentTarget.style.transform="none";}}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700, color:"#e8f0d8" }}>{label}</span>
              <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"rgba(200,216,184,0.4)", letterSpacing:"0.06em" }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BROWSE BY REGION */}
      <div style={{ padding:"64px 0" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, fontWeight:800, letterSpacing:"0.25em", textTransform:"uppercase", color:"#c8a84b", marginBottom:8 }}>Explore Nebraska</div>
              <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:900, color:"#fff", lineHeight:1.05, letterSpacing:"-0.02em" }}>Browse by Region</h2>
              <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(200,216,184,0.5)", marginTop:6, maxWidth:480 }}>Nebraska golf is as diverse as the state itself — from world-renowned links to quiet small-town tracks.</p>
            </div>
            <button onClick={() => navigate("search")} style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700, color:"#a8d890", background:"none", border:"1px solid rgba(168,216,144,0.3)", padding:"10px 20px", borderRadius:2, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>View All 197 Courses →</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {REGIONS.map((r,i) => {
              const [hov,setHov] = useState(false);
              return (
                <div key={r.name} onClick={() => navigate("search",{region:r.name})} className="fade-up" style={{ animationDelay:`${i*60}ms`, background:r.bg, borderRadius:3, border:`1px solid ${hov ? r.accent : "rgba(255,255,255,0.08)"}`, padding:"22px 20px", cursor:"pointer", transition:"all 0.25s", transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? `0 16px 48px rgba(0,0,0,0.4),0 0 0 1px ${r.accent}33` : "0 4px 16px rgba(0,0,0,0.2)" }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:26 }}>{r.icon}</span>
                    <span style={{ background:`${r.accent}22`, color:r.accent, border:`1px solid ${r.accent}44`, fontSize:9, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", padding:"3px 8px", borderRadius:2, fontFamily:"'Source Sans 3',sans-serif" }}>{r.courses} courses</span>
                  </div>
                  <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:20, fontWeight:900, color:"#fff", margin:"0 0 5px", letterSpacing:"-0.01em", lineHeight:1.1 }}>{r.name}</h3>
                  <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.55)", margin:"0 0 12px", lineHeight:1.5 }}>{r.tagline}</p>
                  <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:700, color:r.accent, letterSpacing:"0.1em", textTransform:"uppercase", opacity: hov ? 1 : 0.6, transition:"opacity 0.2s" }}>Explore →</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEATURED COURSES */}
      {featured.length > 0 && (
        <div style={{ padding:"0 0 64px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"64px 24px 0" }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, fontWeight:800, letterSpacing:"0.25em", textTransform:"uppercase", color:"#c8a84b", marginBottom:8 }}>⭐ Spotlight</div>
              <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(26px,3.5vw,38px)", fontWeight:900, color:"#fff", letterSpacing:"-0.02em" }}>Featured Courses</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {featured.map((c,i) => {
                const [hov,setHov] = useState(false);
                return (
                  <div key={c.slug} onClick={() => navigate("course",{slug:c.slug})} className="fade-up" style={{ animationDelay:`${i*80}ms`, borderRadius:3, overflow:"hidden", border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer", transform: hov?"translateY(-4px)":"none", boxShadow: hov?"0 20px 60px rgba(0,0,0,0.5)":"0 4px 20px rgba(0,0,0,0.3)", transition:"all 0.25s", position:"relative", height:250 }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
                    <CoursePhoto course={c} style={{ position:"absolute", inset:0, width:"100%", height:"100%", filter:"brightness(0.5) saturate(1.1)" }} />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.25) 55%,transparent 100%)" }} />
                    <div style={{ position:"absolute", top:12, right:12, background:"linear-gradient(135deg,#c8a84b,#e8c86b)", color:"#1a1000", fontSize:9, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", padding:"4px 10px", borderRadius:2, fontFamily:"'Source Sans 3',sans-serif" }}>⭐ Featured</div>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"16px" }}>
                      <div style={{ display:"flex", gap:5, marginBottom:6 }}><TypeBadge type={c.club_type} /><span style={{ background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:2, fontFamily:"'Source Sans 3',sans-serif", letterSpacing:"0.1em" }}>{c.holes} holes</span></div>
                      <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:16, fontWeight:900, color:"#fff", margin:"0 0 3px", lineHeight:1.15 }}>{c.name}</h3>
                      <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(255,255,255,0.6)", margin:"0 0 8px", lineHeight:1.4 }}>{c.city}, NE</p>
                      <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700, color:"#c8a84b" }}>{c.greens_fee}</span><span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"#a8d890", fontWeight:700 }}>View →</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CLAIM LISTING */}
      <div style={{ background:"linear-gradient(135deg,#1a0e00 0%,#2a1800 50%,#1a0e00 100%)", borderTop:"1px solid rgba(200,168,75,0.2)", borderBottom:"1px solid rgba(200,168,75,0.2)", padding:"48px 0" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:32, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:280 }}>
            <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, fontWeight:800, letterSpacing:"0.25em", textTransform:"uppercase", color:"#c8a84b", marginBottom:10 }}>For Course Owners</div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:12 }}>Is your course on the list?<br /><span style={{ color:"#c8a84b" }}>Make it stand out.</span></h2>
            <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(255,255,255,0.6)", lineHeight:1.65, maxWidth:480 }}>Thousands of Nebraska golfers use LoveNebraskaGolf.com to plan their rounds. A Featured listing puts your course first — photos, amenities, tee time links, and priority placement in every search.</p>
            <div style={{ display:"flex", gap:20, marginTop:18, flexWrap:"wrap" }}>
              {["📸 Photo gallery","⭐ Priority placement","📍 Map & directions","📞 Direct contact"].map(f => (
                <span key={f} style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"#a8d890" }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ background:"rgba(200,168,75,0.08)", border:"2px solid rgba(200,168,75,0.3)", borderRadius:4, padding:"28px 32px", textAlign:"center", minWidth:220 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:50, fontWeight:900, color:"#c8a84b", lineHeight:1 }}>$12.99</div>
            <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:18 }}>per month</div>
            <button style={{ background:"linear-gradient(135deg,#c8a84b,#e8c86b)", color:"#1a1000", border:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"13px 28px", borderRadius:3, cursor:"pointer", width:"100%", marginBottom:8 }} onClick={() => navigate("claim")}>Claim Your Listing</button>
            <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"rgba(255,255,255,0.35)" }}>No setup fees · Cancel anytime</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:"#040c04", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"44px 0 28px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:36, marginBottom:36 }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:18, fontWeight:900, marginBottom:10 }}>Love<span style={{ color:"#c8a84b" }}>Nebraska</span><span style={{ color:"#a8d890" }}>Golf</span></div>
              <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"rgba(200,216,184,0.4)", lineHeight:1.65, maxWidth:260, marginBottom:16 }}>The definitive guide to golf in Nebraska — 197 courses across 8 regions.</p>
              {/* Facebook CTA */}
              <a href="https://www.facebook.com/LoveNebraskaGolf/" target="_blank" rel="noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#3b5998", color:"#fff", borderRadius:3, padding:"9px 16px", textDecoration:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:700, transition:"opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Follow on Facebook
              </a>
            </div>
            {[
              { label:"Regions", items:[["East","search",{region:"East"}],["Sandhills","search",{region:"Sandhills"}],["Panhandle","search",{region:"Panhandle"}],["Northeast","search",{region:"Northeast"}]] },
              { label:"Browse",  items:[["All Courses","search",{}],["Public Courses","search",{type:"Public"}],["18-Hole Courses","search",{holes:"18"}],["Top Rated","search",{}]] },
              { label:"For Courses", items:[["Claim Listing","claim",{}],["About","home",{}],["Contact","home",{}]] },
            ].map(col => (
              <div key={col.label}>
                <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:"#c8a84b", marginBottom:12 }}>{col.label}</div>
                {col.items.map(([label,page,params]) => (
                  <button key={label} onClick={() => navigate(page, params)} style={{ display:"block", marginBottom:7, background:"none", border:"none", cursor:"pointer", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"rgba(200,216,184,0.45)", textAlign:"left" }} onMouseEnter={e=>e.target.style.color="#a8d890"} onMouseLeave={e=>e.target.style.color="rgba(200,216,184,0.45)"}>{label}</button>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:18, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10, alignItems:"center" }}>
            <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(200,216,184,0.28)" }}>© 2026 LoveNebraskaGolf.com · All rights reserved</span>
            <a href="https://www.facebook.com/LoveNebraskaGolf/" target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(200,216,184,0.35)", textDecoration:"none" }}
              onMouseEnter={e => e.currentTarget.style.color="#a8d890"}
              onMouseLeave={e => e.currentTarget.style.color="rgba(200,216,184,0.35)"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              facebook.com/LoveNebraskaGolf
            </a>
            <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(200,216,184,0.28)" }}>197 Courses · 8 Regions · Nebraska's Golf Directory</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── SEARCH / DIRECTORY PAGE ─────────────────────────────────────────────
function SearchPage({ navigate, initialFilters = {} }) {
  const [query,  setQuery]  = useState(initialFilters.query  || "");
  const [region, setRegion] = useState(initialFilters.region || "");
  const [type,   setType]   = useState(initialFilters.type   || "");
  const [holes,  setHoles]  = useState(initialFilters.holes  || "");
  const [range,  setRange]  = useState(false);
  const [sort,   setSort]   = useState("recommended");

  const filtered = COURSES.filter(c => {
    if (query  && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.city.toLowerCase().includes(query.toLowerCase())) return false;
    if (region && c.region !== region) return false;
    if (type   && c.club_type !== type) return false;
    if (holes === "9"  && c.holes !== "9")  return false;
    if (holes === "18" && c.holes !== "18") return false;
    if (holes === "27+" && parseInt(c.holes) < 27) return false;
    if (range  && c.driving_range !== "Yes") return false;
    return true;
  }).sort((a,b) => {
    if (sort === "recommended") return (b.featured?1:0) - (a.featured?1:0);
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const featuredResult = filtered.find(c => c.featured);
  const rest = filtered.filter(c => !c.featured);

  return (
    <div style={{ minHeight:"100vh", background:"#f0ebe0" }}>
      <style>{`.sr-row:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12); transform: translateY(-2px); } .sr-row { transition: all 0.2s; cursor: pointer; }`}</style>

      {/* Search bar */}
      <div style={{ background:"#1d3320", padding:"16px 0", borderBottom:"1px solid #2d4a28" }}>
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"0 20px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, opacity:0.5 }}>🔍</span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Course name or city..." style={{ width:"100%", padding:"10px 12px 10px 32px", background:"rgba(255,255,255,0.09)", border:"1px solid rgba(168,216,144,0.2)", borderRadius:2, color:"#e0f0d0", fontSize:14, fontFamily:"'Source Sans 3',sans-serif", outline:"none" }} />
          </div>
          <select value={region} onChange={e=>setRegion(e.target.value)} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.09)", border:"1px solid rgba(168,216,144,0.2)", borderRadius:2, color:"rgba(255,255,255,0.8)", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, cursor:"pointer" }}>
            <option value="">All Regions</option>{REGIONS.map(r=><option key={r.name}>{r.name}</option>)}
          </select>
          <select value={type} onChange={e=>setType(e.target.value)} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.09)", border:"1px solid rgba(168,216,144,0.2)", borderRadius:2, color:"rgba(255,255,255,0.8)", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, cursor:"pointer" }}>
            <option value="">All Types</option><option>Public</option><option>Semi-Private</option><option>Private</option>
          </select>
          <select value={holes} onChange={e=>setHoles(e.target.value)} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.09)", border:"1px solid rgba(168,216,144,0.2)", borderRadius:2, color:"rgba(255,255,255,0.8)", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, cursor:"pointer" }}>
            <option value="">Any Holes</option><option value="9">9 Holes</option><option value="18">18 Holes</option><option value="27+">27+ Holes</option>
          </select>
        </div>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"24px 20px 60px", display:"flex", gap:24, alignItems:"flex-start" }}>

        {/* Sidebar */}
        <div style={{ width:190, flexShrink:0 }}>
          <div style={{ background:"#fff", border:"1px solid #ddd6be", borderRadius:3, padding:"16px 14px", marginBottom:14 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:800, color:"#1a2810", marginBottom:10 }}>Course Type</div>
            {["All","Public","Semi-Private","Private"].map(t => (
              <button key={t} onClick={() => setType(t==="All"?"":t)} style={{ display:"block", width:"100%", textAlign:"left", background: (!type&&t==="All")||(type===t) ? "#1d3320" : "transparent", color: (!type&&t==="All")||(type===t) ? "#a8d890" : "#4a4030", border: (!type&&t==="All")||(type===t) ? "1px solid #1d3320" : "1px solid transparent", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:600, padding:"7px 9px", borderRadius:2, marginBottom:2, cursor:"pointer" }}>{t}</button>
            ))}
          </div>
          <div style={{ background:"#fff", border:"1px solid #ddd6be", borderRadius:3, padding:"16px 14px", marginBottom:14 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:800, color:"#1a2810", marginBottom:10 }}>Holes</div>
            {[["All",""],["9 Holes","9"],["18 Holes","18"],["27+ Holes","27+"]].map(([lbl,val]) => (
              <button key={lbl} onClick={() => setHoles(val)} style={{ display:"block", width:"100%", textAlign:"left", background: holes===val ? "#1d3320" : "transparent", color: holes===val ? "#a8d890" : "#4a4030", border: holes===val ? "1px solid #1d3320" : "1px solid transparent", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:600, padding:"7px 9px", borderRadius:2, marginBottom:2, cursor:"pointer" }}>{lbl}</button>
            ))}
          </div>
          <div style={{ background:"#fff", border:"1px solid #ddd6be", borderRadius:3, padding:"16px 14px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:800, color:"#1a2810", marginBottom:10 }}>Amenities</div>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", border:"1px solid #ddd6be", borderRadius:2, padding:"7px 9px" }}>
              <input type="checkbox" checked={range} onChange={e=>setRange(e.target.checked)} style={{ accentColor:"#4a7c3a" }} />
              <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:600, color:"#4a4030" }}>Driving Range</span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"#1a2810", margin:0 }}>
                {region ? `${region} Nebraska` : "Nebraska"} Golf Courses
              </h1>
              <p style={{ color:"#8a7e60", fontSize:12, margin:"3px 0 0", fontFamily:"'Source Sans 3',sans-serif" }}>{filtered.length} course{filtered.length!==1?"s":""} found</p>
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ border:"1px solid #ddd6be", borderRadius:2, padding:"6px 10px", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"#4a4030", background:"#fff", cursor:"pointer" }}>
              <option value="recommended">Sort: Recommended</option>
              <option value="name">Sort: A–Z</option>
            </select>
          </div>

          {/* Featured course card */}
          {featuredResult && (
            <div onClick={() => navigate("course",{slug:featuredResult.slug})} style={{ background:"linear-gradient(135deg,#0e1a0f 0%,#1d3320 60%,#162a18 100%)", border:"1px solid #3a6030", borderRadius:3, overflow:"hidden", marginBottom:16, cursor:"pointer", boxShadow:"0 12px 48px rgba(0,0,0,0.3)", position:"relative" }}>
              <div style={{ position:"absolute", top:0, right:0, background:"linear-gradient(135deg,#c8a84b,#e8c86b)", color:"#1a1000", fontSize:9, fontWeight:800, letterSpacing:"0.18em", textTransform:"uppercase", padding:"5px 16px 5px 10px", fontFamily:"'Source Sans 3',sans-serif", clipPath:"polygon(0 0,100% 0,100% 100%,8px 100%)", zIndex:2 }}>⭐ Featured Course</div>
              <div style={{ display:"flex" }}>
                <div style={{ width:200, flexShrink:0, position:"relative", overflow:"hidden", minHeight:180 }}>
                  <CoursePhoto course={featuredResult} style={{ width:"100%", height:"100%", position:"absolute", inset:0, filter:"brightness(0.7) saturate(1.2)" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,transparent 60%,#1d3320 100%)" }} />
                </div>
                <div style={{ flex:1, padding:"20px 22px 18px" }}>
                  <div style={{ display:"flex", gap:7, marginBottom:8 }}><TypeBadge type={featuredResult.club_type} /><span style={{ color:"#c8a84b", fontSize:11, fontWeight:700, fontFamily:"'Source Sans 3',sans-serif" }}>{featuredResult.holes} Holes · Par 72</span></div>
                  <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:22, fontWeight:900, color:"#fff", margin:"0 0 3px" }}>{featuredResult.name}</h2>
                  <div style={{ color:"rgba(200,216,184,0.55)", fontSize:12, marginBottom:9, fontFamily:"'Source Sans 3',sans-serif" }}>📍 {featuredResult.city}, NE</div>
                  <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, lineHeight:1.65, color:"rgba(200,216,184,0.8)", margin:"0 0 12px" }}>{featuredResult.description}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ color:"#c8a84b", fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700 }}>{featuredResult.greens_fee}</span>
                    <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, background:"#4a7c3a", color:"#fff", padding:"7px 16px", borderRadius:2, fontWeight:700, letterSpacing:"0.06em" }}>View Course →</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Claim banner */}
          <div style={{ border:"2px dashed #8a7450", borderRadius:3, background:"rgba(138,116,80,0.04)", padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, cursor:"pointer", flexWrap:"wrap" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#c8a84b";e.currentTarget.style.background="rgba(200,168,75,0.06)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#8a7450";e.currentTarget.style.background="rgba(138,116,80,0.04)";}}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#c8a84b,#e8c86b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⭐</div>
              <div>
                <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:15, fontWeight:800, color:"#1a1a0a", marginBottom:2 }}>Is this your golf course? Claim your Featured listing.</div>
                <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"#6a5e40" }}>Stand out with photos, full amenities, and priority placement. <strong style={{ color:"#4a7c3a" }}>Just $12.99/month.</strong></div>
              </div>
            </div>
            <div style={{ background:"linear-gradient(135deg,#c8a84b,#e8c86b)", color:"#1a1000", fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"9px 20px", borderRadius:2, whiteSpace:"nowrap", flexShrink:0, cursor:"pointer" }} onClick={() => navigate("claim")}>Claim for $12.99/mo →</div>
          </div>

          {/* Course rows */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {rest.map((course,i) => (
              <div key={course.slug} className="sr-row" onClick={() => navigate("course",{slug:course.slug})} style={{ display:"flex", background:"#f8f4ec", border:"1px solid #ddd6be", borderRadius:3, overflow:"hidden", animationDelay:`${i*40}ms` }}>
                <div style={{ width:130, minHeight:110, flexShrink:0, position:"relative", overflow:"hidden" }}>
                  <CoursePhoto course={course} style={{ width:"100%", height:"100%", position:"absolute", inset:0, filter:"brightness(0.82) saturate(1.1)" }} />
                  <div style={{ position:"absolute", bottom:5, left:6, background:"rgba(0,0,0,0.55)", color:"#a8d890", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:2, fontFamily:"'Source Sans 3',sans-serif" }}>{course.holes}h</div>
                </div>
                <div style={{ flex:1, padding:"12px 16px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:3 }}>
                      <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:16, fontWeight:800, color:"#1a2810", margin:0, lineHeight:1.2 }}>{course.name}</h3>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
                        <TypeBadge type={course.club_type} />
                        <span style={{ color:"#4a7c3a", fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:700 }}>{course.greens_fee}</span>
                      </div>
                    </div>
                    <div style={{ color:"#7a6e50", fontSize:11, marginBottom:5, fontFamily:"'Source Sans 3',sans-serif" }}>📍 {course.city}, NE · {course.region}</div>
                    <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, lineHeight:1.55, color:"#4a4030", margin:0 }}>{course.description}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8, flexWrap:"wrap", gap:6 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:"#7a6e50", fontFamily:"'Source Sans 3',sans-serif" }}>Par {course.par || "72"} · {course.holes} holes</span>
                      {course.driving_range==="Yes" && <span style={{ fontSize:11, color:"#4a7c3a", fontFamily:"'Source Sans 3',sans-serif" }}>✓ Range</span>}
                      {course.phone && <span style={{ fontSize:11, color:"#7a6e50", fontFamily:"'Source Sans 3',sans-serif" }}>📞 {course.phone}</span>}
                      {!course.website && course.social_facebook && (
                        <span style={{ fontSize:10, background:"#e8eeff", color:"#3b5998", border:"1px solid #c8d4f0", borderRadius:2, padding:"2px 7px", fontFamily:"'Source Sans 3',sans-serif", fontWeight:700, letterSpacing:"0.06em" }}>📘 Facebook</span>
                      )}
                    </div>
                    <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, background:"#1d3320", color:"#a8d890", padding:"4px 12px", borderRadius:2, fontWeight:600 }}>View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"#8a7e60" }}>
              <div style={{ fontSize:44, marginBottom:10 }}>🔍</div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:"#3a3020", marginBottom:6 }}>No courses match your filters.</p>
              <p style={{ fontSize:13 }}>Try adjusting your search or clearing a filter.</p>
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{ marginTop:28, background:"#1d3320", borderRadius:3, padding:"22px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:900, color:"#fff", marginBottom:3 }}>Own a course on this list?</div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(200,216,184,0.7)" }}>Reach thousands of Nebraska golfers. <strong style={{ color:"#c8a84b" }}>Starting at just $12.99/month.</strong></div>
            </div>
            <button style={{ background:"linear-gradient(135deg,#c8a84b,#e8c86b)", color:"#1a1000", border:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"11px 24px", borderRadius:2, cursor:"pointer", whiteSpace:"nowrap" }} onClick={() => navigate("claim")}>Get Featured · $12.99/mo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COURSE DETAIL PAGE ───────────────────────────────────────────────────
function CoursePage({ navigate, courseSlug }) {
  const course = COURSES.find(c => c.slug === courseSlug) || COURSES[0];
  const [tab, setTab] = useState("overview");
  const [faqOpen, setFaqOpen] = useState(null);

  const related = COURSES.filter(c =>
    c.slug !== course.slug &&
    c.region === course.region &&
    c.holes === course.holes &&
    c.club_type === course.club_type
  ).slice(0,4);

  const fallbackRelated = related.length < 2
    ? COURSES.filter(c => c.slug !== course.slug && c.region === course.region).slice(0,4)
    : related;

  const amenities = [
    { icon:"⛳", label:`${course.holes} Holes` },
    course.driving_range==="Yes" && { icon:"🏌️", label:"Driving Range" },
    { icon:"🎯", label:"Putting Green" },
    { icon:"🏪", label:"Pro Shop" },
    { icon:"🍺", label:"Bar & Grill" },
    { icon:"📚", label:"Lessons" },
    { icon:"🛒", label:"Club Rental" },
    { icon:"🛺", label:"Cart Rental" },
  ].filter(Boolean);

  const faqs = [
    { q:`How many holes does ${course.name} have?`, a:`${course.name} is a ${course.holes}-hole ${course.club_type.toLowerCase()} golf course${course.par ? ` with a par of ${course.par}` : ""}.` },
    { q:`Is ${course.name} public or private?`, a:`${course.name} is a ${course.club_type} course${course.club_type==="Public" ? " — no membership required." : "."}` },
    { q:`Where is ${course.name} located?`, a:`${course.name} is located in ${course.city}, Nebraska${course.region ? `, in the ${course.region} region` : ""}.${course.address_full ? ` Address: ${course.address_full}.` : ""}` },
    course.driving_range==="Yes" && { q:`Does ${course.name} have a driving range?`, a:`Yes, ${course.name} has a driving range open to players.` },
    course.phone && { q:`What is the phone number for ${course.name}?`, a:`You can reach ${course.name} at ${course.phone}.` },
  ].filter(Boolean);

  const mapQ = encodeURIComponent(course.address_full || `${course.name} ${course.city} Nebraska`);

  return (
    <div style={{ minHeight:"100vh", background:"#0e1a0f" }}>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"24px 20px 64px" }}>

        {/* Breadcrumb */}
        <nav style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(200,216,184,0.5)", marginBottom:16, letterSpacing:"0.04em" }}>
          <button onClick={() => navigate("home")} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(200,216,184,0.6)",fontFamily:"'Source Sans 3',sans-serif",fontSize:12 }} onMouseEnter={e=>e.target.style.color="#a8d890"} onMouseLeave={e=>e.target.style.color="rgba(200,216,184,0.6)"}>Home</button>
          {" › "}
          <button onClick={() => navigate("search")} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(200,216,184,0.6)",fontFamily:"'Source Sans 3',sans-serif",fontSize:12 }} onMouseEnter={e=>e.target.style.color="#a8d890"} onMouseLeave={e=>e.target.style.color="rgba(200,216,184,0.6)"}>Courses</button>
          {" › "}
          <button onClick={() => navigate("search",{region:course.region})} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(200,216,184,0.6)",fontFamily:"'Source Sans 3',sans-serif",fontSize:12 }} onMouseEnter={e=>e.target.style.color="#a8d890"} onMouseLeave={e=>e.target.style.color="rgba(200,216,184,0.6)"}>{course.region}</button>
          {" › "}
          <span style={{ color:"rgba(200,216,184,0.85)" }}>{course.name}</span>
        </nav>

        <div style={{ background:"#f5f0e8", borderRadius:4, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.6)" }}>

          {/* Hero */}
          <div style={{ position:"relative", height:320, overflow:"hidden" }}>
            <CoursePhoto course={course} style={{ width:"100%", height:"100%", position:"absolute", inset:0, filter:"brightness(0.72) saturate(1.1)", transition:"transform 8s ease" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 30%,rgba(14,26,15,0.45) 60%,rgba(14,26,15,0.9) 100%)" }} />
            <div style={{ position:"absolute", top:16, left:16, display:"flex", gap:7 }}>
              <TypeBadge type={course.club_type} />
              <span style={{ background:"rgba(14,26,15,0.65)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", fontFamily:"'Source Sans 3',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 10px", borderRadius:2 }}>{course.region} Nebraska</span>
            </div>
            <div style={{ position:"absolute", bottom:20, left:24, right:24 }}>
              <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(26px,5vw,40px)", fontWeight:900, color:"#fff", lineHeight:1.05, margin:"0 0 4px", textShadow:"0 2px 20px rgba(0,0,0,0.5)", letterSpacing:"-0.02em" }}>{course.name}</h1>
              <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:300, color:"rgba(255,255,255,0.7)", letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>{course.city} · Nebraska</p>
            </div>
          </div>

          {/* Stat strip */}
          <div style={{ display:"flex", background:"#1d3320", color:"#c8d8b8" }}>
            {[
              [course.holes, "Holes"],
              [course.par || "72", "Par"],
              [course.yards || "—", "Yards"],
              [course.year_opened || "—", "Est."],
            ].map(([val,lbl],i) => (
              <div key={lbl} style={{ flex:1, textAlign:"center", padding:"18px 8px", borderRight: i<3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, color:"#a8d890", lineHeight:1, display:"block" }}>{val}</span>
                <span style={{ fontSize:18, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(200,216,184,0.55)", marginTop:3, display:"block" }}>{lbl}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"2px solid #d4c9a8", padding:"0 24px", background:"#f5f0e8", overflowX:"auto" }}>
            {[["overview","🏌️","Overview"],["details","📋","Details"],["contact","📞","Contact"],["map","📍","Map"]].map(([id,icon,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ background:"none", border:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color: tab===id ? "#3a5c30" : "#8a7e60", padding:"13px 16px 11px", cursor:"pointer", borderBottom: tab===id ? "2px solid #3a5c30" : "2px solid transparent", marginBottom:-2, display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"color 0.15s" }}>
                <span>{icon}</span>{label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding:"26px 26px 22px", background:"#f5f0e8" }}>
            {tab==="overview" && (
              <>
                <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:18, lineHeight:1.75, color:"#3a3020", margin:"0 0 22px", borderLeft:"3px solid #4a7c3a", paddingLeft:14 }}>{course.description}</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {amenities.map(a => (
                    <div key={a.label} style={{ background:"#ede6d0", border:"1px solid #d4c9a8", borderRadius:3, padding:"10px 8px", textAlign:"center" }}>
                      <span style={{ fontSize:24, display:"block", marginBottom:5 }}>{a.icon}</span>
                      <span style={{ fontSize:14, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:"#5a4e30", fontFamily:"'Source Sans 3',sans-serif" }}>{a.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab==="details" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  ["Course Type", `${course.club_type}${course.club_type==="Public" ? " · Municipal" : ""}`],
                  ["Region", `${course.region} Nebraska`],
                  course.architect && ["Architect", course.architect],
                  course.year_opened && ["Year Opened", course.year_opened],
                  ["Holes", course.holes],
                  course.par && ["Par", course.par],
                  course.yards && ["Total Yards", `${course.yards} yds`],
                  ["Driving Range", course.driving_range==="Yes" ? "Yes" : "No"],
                  course.greens_fee && ["Greens Fee", course.greens_fee],
                ].filter(Boolean).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8a7e60" }}>{k}</span>
                    <span style={{ fontSize:14, color:"#2a2010" }}>{v}</span>
                  </div>
                ))}
                {course.address_full && (
                  <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:2 }}>
                    <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8a7e60" }}>Address</span>
                    <span style={{ fontSize:14, color:"#2a2010" }}>{course.address_full}</span>
                  </div>
                )}
              </div>
            )}
            {tab==="contact" && (() => {
              const primaryUrl = course.website || course.social_facebook;
              const isFbOnly = !course.website && course.social_facebook;
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {/* Address */}
                  {course.address_full && (
                    <div style={{ background:"#ede6d0", border:"1px solid #d4c9a8", borderRadius:3, padding:"12px 14px" }}>
                      <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#8a7e60", marginBottom:4 }}>Address</div>
                      <div style={{ fontSize:14, color:"#2a2010", lineHeight:1.5 }}>{course.address_full}</div>
                    </div>
                  )}

                  {/* Phone + Website row */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {course.phone && (
                      <a href={`tel:${course.phone}`} style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:"1px solid #d4c9a8", borderRadius:3, padding:"12px 14px", textDecoration:"none", transition:"border-color 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="#4a7c3a"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="#d4c9a8"}>
                        <span style={{ fontSize:22, flexShrink:0 }}>📞</span>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8a7e60", marginBottom:2 }}>Phone</div>
                          <div style={{ fontSize:14, fontWeight:600, color:"#3a5c30" }}>{course.phone}</div>
                        </div>
                      </a>
                    )}

                    {/* Website — or Facebook fallback */}
                    {primaryUrl && (
                      <a href={primaryUrl} target="_blank" rel="noreferrer"
                        style={{ display:"flex", alignItems:"center", gap:10, background: isFbOnly ? "#f0f4ff" : "#fff", border:`1px solid ${isFbOnly ? "#b8c8f0" : "#d4c9a8"}`, borderRadius:3, padding:"12px 14px", textDecoration:"none", transition:"border-color 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor= isFbOnly ? "#3b5998" : "#4a7c3a"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor= isFbOnly ? "#b8c8f0" : "#d4c9a8"}>
                        <span style={{ fontSize:22, flexShrink:0 }}>{isFbOnly ? "📘" : "🌐"}</span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color: isFbOnly ? "#3b5998" : "#8a7e60", marginBottom:2 }}>
                            {isFbOnly ? "Facebook Page" : "Website"}
                          </div>
                          <div style={{ fontSize:13, fontWeight:600, color: isFbOnly ? "#3b5998" : "#3a5c30", wordBreak:"break-all", lineHeight:1.3 }}>
                            {isFbOnly
                              ? primaryUrl.replace("https://www.facebook.com/","").replace(/\/$/,"")
                              : primaryUrl.replace(/^https?:\/\//,"").replace(/\/$/,"")}
                          </div>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Social row — show all available */}
                  {(course.social_facebook || course.social_twitter || course.social_instagram) && (
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#8a7e60", marginBottom:8 }}>Follow</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {course.social_facebook && (
                          <a href={course.social_facebook} target="_blank" rel="noreferrer"
                            style={{ display:"flex", alignItems:"center", gap:6, background:"#3b5998", color:"#fff", borderRadius:3, padding:"8px 14px", textDecoration:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700 }}>
                            📘 Facebook
                          </a>
                        )}
                        {course.social_instagram && (
                          <a href={course.social_instagram} target="_blank" rel="noreferrer"
                            style={{ display:"flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", color:"#fff", borderRadius:3, padding:"8px 14px", textDecoration:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700 }}>
                            📷 Instagram
                          </a>
                        )}
                        {course.social_twitter && (
                          <a href={course.social_twitter} target="_blank" rel="noreferrer"
                            style={{ display:"flex", alignItems:"center", gap:6, background:"#1da1f2", color:"#fff", borderRadius:3, padding:"8px 14px", textDecoration:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700 }}>
                            𝕏 Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {course.email && (
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#8a7e60", marginBottom:4 }}>Email</div>
                      <a href={`mailto:${course.email}`} style={{ fontSize:14, color:"#3a5c30" }}>{course.email}</a>
                    </div>
                  )}

                  {/* Tee times note */}
                  {course.club_type==="Public" && (
                    <div style={{ background:"#eaf4e8", border:"1px solid #b8d8b0", borderRadius:3, padding:"10px 14px", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"#2a4a22" }}>
                      ⛳ <strong>Public course</strong> — tee times available up to 1 week in advance. Call ahead or book online.
                    </div>
                  )}

                  {/* No contact fallback */}
                  {!course.phone && !primaryUrl && !course.email && (
                    <div style={{ background:"#f5f0e8", border:"1px solid #d4c9a8", borderRadius:3, padding:"14px 16px", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"#6a5e40", textAlign:"center" }}>
                      Contact details not yet available.{" "}
                      <a href={course.nebgolf_url} target="_blank" rel="noreferrer" style={{ color:"#3a5c30", fontWeight:700 }}>View on NebGolf.org →</a>
                    </div>
                  )}
                </div>
              );
            })()}
            {tab==="map" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ borderRadius:3, overflow:"hidden", border:"1px solid #d4c9a8", height:260, background:"#e8e0cc" }}>
                  <iframe title={`Map of ${course.name}`} src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=14`} width="100%" height="100%" style={{ border:0, display:"block" }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["📍 Google Maps",`https://maps.google.com/maps?q=${mapQ}`],["🗺 Apple Maps",`https://maps.apple.com/?q=${mapQ}`],["🚗 Waze",`https://waze.com/ul?q=${mapQ}`]].map(([lbl,href]) => (
                    <a key={lbl} href={href} target="_blank" rel="noreferrer" style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", border:"1px solid #d4c9a8", color:"#3a3020", background:"#ede6d0", padding:"8px 14px", borderRadius:2 }}>{lbl}</a>
                  ))}
                </div>
                {course.address_full && <div style={{ background:"#ede6d0", border:"1px solid #d4c9a8", borderRadius:3, padding:"11px 13px", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"#4a4030", lineHeight:1.6 }}><strong>📍 {course.address_full}</strong></div>}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          {(() => {
            const primaryUrl = course.website || course.social_facebook;
            const isFbOnly = !course.website && course.social_facebook;
            return (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", background:"#1d3320", gap:10, flexWrap:"wrap" }}>
                {course.phone
                  ? <a href={`tel:${course.phone}`} style={{ color:"#a8d890", fontSize:13, fontWeight:600, textDecoration:"none", letterSpacing:"0.04em" }}>{course.phone}</a>
                  : <span />}
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  {course.social_facebook && (
                    <a href={course.social_facebook} target="_blank" rel="noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:6, background:"#3b5998", color:"#fff", fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.08em", padding:"8px 14px", borderRadius:2, textDecoration:"none" }}>
                      📘 Facebook
                    </a>
                  )}
                  {primaryUrl && !isFbOnly && (
                    <a href={primaryUrl} target="_blank" rel="noreferrer"
                      style={{ background:"transparent", border:"1px solid rgba(200,216,184,0.4)", color:"#c8d8b8", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"10px 20px", borderRadius:2, textDecoration:"none" }}>
                      Visit Site
                    </a>
                  )}
                  {primaryUrl && (
                    <a href={primaryUrl} target="_blank" rel="noreferrer"
                      style={{ background:"#4a7c3a", color:"#fff", fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"10px 20px", borderRadius:2, textDecoration:"none" }}>
                      {isFbOnly ? "View on Facebook" : "Book Tee Time"}
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* FAQ */}
        <section style={{ marginTop:32 }}>
          <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:20, fontWeight:900, color:"#e8f0d8", margin:"0 0 12px", letterSpacing:"-0.01em" }}>Frequently Asked Questions</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {faqs.map((faq,i) => (
              <div key={i} style={{ border:"1px solid #d4c9a8", borderRadius:3, overflow:"hidden", background:"#fff" }}>
                <button onClick={() => setFaqOpen(faqOpen===i?null:i)} style={{ width:"100%", background:"none", border:"none", padding:"12px 14px", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'Source Sans 3',sans-serif", fontSize:14, fontWeight:700, color:"#1a2810", gap:10 }}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize:18, color:"#4a7c3a", flexShrink:0, transform: faqOpen===i?"rotate(45deg)":"none", transition:"transform 0.2s" }}>+</span>
                </button>
                {faqOpen===i && <div style={{ padding:"0 14px 12px", fontFamily:"'Source Sans 3',sans-serif", fontSize:14, lineHeight:1.65, color:"#4a4030", borderTop:"1px solid #e8e0cc" }}><div style={{ paddingTop:10 }}>{faq.a}</div></div>}
              </div>
            ))}
          </div>
        </section>

        {/* Related courses */}
        {fallbackRelated.length > 0 && (
          <section style={{ marginTop:36 }}>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:20, fontWeight:900, color:"#e8f0d8", margin:"0 0 4px", letterSpacing:"-0.01em" }}>Similar Courses Nearby</h2>
            <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"rgba(200,216,184,0.5)", margin:"0 0 14px" }}>
              Other <strong style={{ color:"rgba(200,216,184,0.75)" }}>{course.holes}-hole {course.club_type.toLowerCase()}</strong> courses in {course.region} Nebraska
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {fallbackRelated.map(r => {
                const [hov,setHov] = useState(false);
                return (
                  <div key={r.slug} onClick={() => { navigate("course",{slug:r.slug}); window.scrollTo(0,0); }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ background: hov?"#ede6d0":"#f5f0e8", border:"1px solid #ddd6be", borderRadius:3, overflow:"hidden", cursor:"pointer", transform: hov?"translateY(-3px)":"none", boxShadow: hov?"0 8px 24px rgba(0,0,0,0.1)":"none", transition:"all 0.2s" }}>
                    <div style={{ height:76, position:"relative", overflow:"hidden" }}>
                      <CoursePhoto course={r} style={{ width:"100%", height:"100%", position:"absolute", inset:0, filter:"brightness(0.7)" }} />
                      <div style={{ position:"absolute", bottom:4, left:6, background:"rgba(0,0,0,0.55)", color:"#a8d890", fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:2, fontFamily:"'Source Sans 3',sans-serif" }}>{r.holes}h · {r.club_type}</div>
                    </div>
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:13, fontWeight:800, color:"#1a2810", marginBottom:2, lineHeight:1.2 }}>{r.name}</div>
                      <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"#8a7e60", marginBottom:4 }}>{r.city}, NE</div>
                      <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"#4a7c3a", fontWeight:700 }}>{r.greens_fee}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP — ROUTER ────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [params, setParams] = useState({});

  // Handle direct URL visits — full deep linking support
  useEffect(() => {
    const path = window.location.pathname;
    const qp = new URLSearchParams(window.location.search);

    if (path === "/claim/success") {
      setPage("success");
    } else if (path === "/claim") {
      setPage("claim");
    } else if (qp.get("course")) {
      // lovenebraskagolf.com/?course=quarry-oaks-golf-club
      setPage("course");
      setParams({ slug: qp.get("course") });
    } else if (qp.get("region")) {
      // lovenebraskagolf.com/?region=Sandhills
      setPage("search");
      setParams({ region: qp.get("region") });
    } else if (qp.get("search")) {
      // lovenebraskagolf.com/?search=lincoln
      setPage("search");
      setParams({ query: qp.get("search") });
    }
  }, []);

  const navigate = useCallback((newPage, newParams = {}) => {
    setPage(newPage);
    setParams(newParams);
    // Update URL to be shareable and bookmarkable
    if (newPage === "claim")
      window.history.pushState({}, "", "/claim");
    else if (newPage === "success")
      window.history.pushState({}, "", "/claim/success");
    else if (newPage === "course" && newParams.slug)
      window.history.pushState({}, "", `/?course=${newParams.slug}`);
    else if (newPage === "search" && newParams.region)
      window.history.pushState({}, "", `/?region=${encodeURIComponent(newParams.region)}`);
    else if (newPage === "search" && newParams.query)
      window.history.pushState({}, "", `/?search=${encodeURIComponent(newParams.query)}`);
    else if (newPage === "search")
      window.history.pushState({}, "", "/?search=all");
    else
      window.history.pushState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Hide nav on success page
  const showNav = page !== "success";

  return (
    <div>
      <style>{GLOBAL_CSS}</style>
      {showNav && <Nav navigate={navigate} currentPage={page} />}
      <div className="fade-in" key={`${page}-${JSON.stringify(params)}`}>
        {page === "home"    && <HomePage navigate={navigate} />}
        {page === "search"  && <SearchPage navigate={navigate} initialFilters={params} />}
        {page === "course"  && <CoursePage navigate={navigate} courseSlug={params.slug} />}
        {page === "claim"   && <ClaimPage navigate={navigate} prefillCourse={params.course} />}
        {page === "success" && <SuccessPage navigate={navigate} />}
      </div>
    </div>
  );
}
