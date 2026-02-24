import { useState, useEffect } from "react";

// ─── CLAIM PAGE — shown when "Claim Your Listing" is clicked ─────────────────
export function ClaimPage({ navigate, prefillCourse }) {
  const [courseName, setCourseName] = useState(prefillCourse?.name || "");
  const [courseCity, setCourseCity] = useState(prefillCourse?.city || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!courseName.trim()) {
      setError("Please enter your course name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseName: courseName.trim(), courseCity: courseCity.trim() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a1209" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .claim-input { width:100%; padding:12px 14px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#fff; font-size:15px; font-family:'Source Sans 3',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .claim-input:focus { border-color:rgba(168,216,144,0.5); background:rgba(255,255,255,0.09); }
        .claim-input::placeholder { color:rgba(255,255,255,0.35); }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* Back */}
        <button onClick={() => navigate("home")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(200,216,184,0.5)", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, marginBottom:32, display:"flex", alignItems:"center", gap:6, padding:0 }}
          onMouseEnter={e => e.currentTarget.style.color="#a8d890"}
          onMouseLeave={e => e.currentTarget.style.color="rgba(200,216,184,0.5)"}>
          ← Back to directory
        </button>

        {/* Header */}
        <div style={{ animation:"fadeUp 0.4s ease both", marginBottom:40 }}>
          <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:800, letterSpacing:"0.25em", textTransform:"uppercase", color:"#c8a84b", marginBottom:10 }}>For Course Owners</div>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:900, color:"#fff", lineHeight:1.05, letterSpacing:"-0.02em", margin:"0 0 16px" }}>
            Claim Your<br /><span style={{ color:"#a8d890" }}>Featured Listing</span>
          </h1>
          <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:17, color:"rgba(200,216,184,0.65)", lineHeight:1.7, maxWidth:520 }}>
            Thousands of Nebraska golfers use LoveNebraskaGolf.com to plan their rounds. A Featured listing puts your course front and center.
          </p>
        </div>

        {/* What you get */}
        <div style={{ animation:"fadeUp 0.4s ease 0.08s both", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:36 }}>
          {[
            ["📸","Full photo gallery","Showcase up to 6 course photos"],
            ["⭐","Priority placement","Top of every relevant search result"],
            ["📍","Map & directions","Embedded map with one-tap navigation"],
            ["📞","Direct contact info","Phone, website, and booking link"],
            ["✏️","Custom description","Your story, in your words"],
            ["📘","Social links","Facebook, Instagram, Twitter badges"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:3, padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:700, color:"#e8f0d8", marginBottom:2 }}>{title}</div>
                <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(200,216,184,0.5)", lineHeight:1.4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing + form card */}
        <div style={{ animation:"fadeUp 0.4s ease 0.16s both", background:"linear-gradient(135deg,#1a0e00,#2a1800)", border:"2px solid rgba(200,168,75,0.35)", borderRadius:4, overflow:"hidden" }}>

          {/* Price banner */}
          <div style={{ background:"linear-gradient(135deg,#c8a84b,#e8c86b)", padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, color:"#1a1000", lineHeight:1 }}>$12.99</div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700, color:"rgba(26,16,0,0.65)", letterSpacing:"0.1em", textTransform:"uppercase" }}>per month · cancel anytime</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:700, color:"rgba(26,16,0,0.75)" }}>No setup fees</div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:700, color:"rgba(26,16,0,0.75)" }}>Cancel anytime</div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:700, color:"rgba(26,16,0,0.75)" }}>Live within 24 hours</div>
            </div>
          </div>

          <div style={{ padding:"28px" }}>
            <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(200,216,184,0.7)", marginBottom:22, lineHeight:1.6 }}>
              Tell us which course you own and we'll take you to secure checkout. After payment you'll fill out your full listing details.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              <div>
                <label style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(200,216,184,0.55)", display:"block", marginBottom:6 }}>Course Name *</label>
                <input
                  className="claim-input"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCheckout()}
                  placeholder="e.g. Holmes Golf Course"
                />
              </div>
              <div>
                <label style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(200,216,184,0.55)", display:"block", marginBottom:6 }}>City</label>
                <input
                  className="claim-input"
                  value={courseCity}
                  onChange={e => setCourseCity(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCheckout()}
                  placeholder="e.g. Lincoln"
                />
              </div>
            </div>

            {error && (
              <div style={{ background:"rgba(220,50,50,0.12)", border:"1px solid rgba(220,50,50,0.3)", borderRadius:3, padding:"10px 14px", fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"#f08080", marginBottom:16 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ width:"100%", background: loading ? "rgba(200,168,75,0.5)" : "linear-gradient(135deg,#c8a84b,#e8c86b)", color:"#1a1000", border:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:14, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"16px", borderRadius:3, cursor: loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"opacity 0.2s" }}>
              {loading ? (
                <>
                  <span style={{ display:"inline-block", width:16, height:16, border:"2px solid rgba(26,16,0,0.3)", borderTopColor:"#1a1000", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  Redirecting to Stripe...
                </>
              ) : (
                <>Proceed to Secure Checkout →</>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:14 }}>
              <span style={{ fontSize:14 }}>🔒</span>
              <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(200,216,184,0.4)" }}>Secured by Stripe · We never store your card details</span>
            </div>
          </div>
        </div>

        {/* Testimonial / trust */}
        <div style={{ marginTop:28, padding:"20px 24px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:3, animation:"fadeUp 0.4s ease 0.24s both" }}>
          <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(200,216,184,0.6)", lineHeight:1.7, margin:0, fontStyle:"italic" }}>
            "Nebraska golfers are actively searching for courses right now. A Featured listing means your course appears first — with photos, your phone number, and a direct link to your website."
          </p>
          <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(200,216,184,0.4)", marginTop:8 }}>— LoveNebraskaGolf.com</div>
        </div>

      </div>
    </div>
  );
}


// ─── SUCCESS PAGE — shown after Stripe payment, collects listing details ─────
export function SuccessPage({ navigate }) {
  const [sessionId, setSessionId] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    courseName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    courseWebsite: "",
    courseAddress: "",
    courseDescription: "",
    driveRange: false,
    holesCount: "18",
    greensFee: "",
    photoUrls: "",
    additionalNotes: "",
  });

  useEffect(() => {
    // Extract session_id from URL
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (sid) {
      setSessionId(sid);
      // We trust Stripe's redirect — mark as verified
      // Full server-side verification happens on submit
      setVerified(true);
    }
    setVerifying(false);
  }, []);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSubmit = async () => {
    if (!form.courseName.trim() || !form.contactName.trim() || !form.contactEmail.trim()) {
      setError("Please fill in Course Name, Your Name, and Email.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.error || "Submission failed. Please email zacharybaehr@gmail.com directly.");
      }
    } catch {
      setError("Network error. Please email zacharybaehr@gmail.com with your listing details.");
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width:"100%", padding:"11px 14px",
    background:"#fff", border:"1px solid #d4c9a8",
    borderRadius:3, color:"#2a2010",
    fontSize:14, fontFamily:"'Source Sans 3',sans-serif",
    outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s",
  };
  const labelStyle = {
    fontFamily:"'Source Sans 3',sans-serif", fontSize:11,
    fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
    color:"#8a7e60", display:"block", marginBottom:5,
  };
  const sectionHead = {
    fontFamily:"'Playfair Display',Georgia,serif", fontSize:18,
    fontWeight:900, color:"#1a2810", margin:"28px 0 14px",
    paddingBottom:8, borderBottom:"2px solid #e8e0cc",
  };

  if (verifying) return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Source Sans 3',sans-serif", color:"#8a7e60" }}>Verifying payment...</div>
    </div>
  );

  if (!verified) return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"#1a2810", marginBottom:12 }}>Payment not found</h2>
        <p style={{ fontFamily:"'Source Sans 3',sans-serif", color:"#8a7e60", marginBottom:20 }}>
          If you completed payment, please email <a href="mailto:zacharybaehr@gmail.com" style={{ color:"#3a5c30" }}>zacharybaehr@gmail.com</a> and we'll get your listing set up manually.
        </p>
        <button onClick={() => navigate("home")} style={{ background:"#1d3320", color:"#a8d890", border:"none", padding:"12px 24px", borderRadius:3, fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>Back to Directory</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:520, animation:"fadeUp 0.4s ease both" }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:36, fontWeight:900, color:"#1a2810", marginBottom:14, letterSpacing:"-0.02em" }}>You're on the list!</h1>
        <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:16, color:"#6a5e40", lineHeight:1.7, marginBottom:10 }}>
          Your listing details have been received. We'll have your Featured listing live on LoveNebraskaGolf.com within <strong>24 hours</strong>.
        </p>
        <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"#8a7e60", lineHeight:1.6, marginBottom:28 }}>
          A confirmation will be sent to <strong>{form.contactEmail}</strong>. Questions? Email <a href="mailto:zacharybaehr@gmail.com" style={{ color:"#3a5c30" }}>zacharybaehr@gmail.com</a>.
        </p>
        <button onClick={() => navigate("home")} style={{ background:"#1d3320", color:"#a8d890", border:"none", padding:"14px 32px", borderRadius:3, fontFamily:"'Source Sans 3',sans-serif", fontSize:14, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer" }}>
          Back to Directory
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .form-input:focus { border-color:#4a7c3a !important; }
        textarea { resize:vertical; }
      `}</style>

      {/* Success banner */}
      <div style={{ background:"linear-gradient(135deg,#1d3320,#2d4a28)", padding:"28px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 6px", letterSpacing:"-0.01em" }}>Payment confirmed!</h1>
          <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:15, color:"rgba(200,216,184,0.75)", margin:0 }}>
            Now fill in your listing details below — we'll have you live within 24 hours.
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px 80px", animation:"fadeUp 0.4s ease both" }}>

        {/* Contact info */}
        <h2 style={sectionHead}>Your Contact Info</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={labelStyle}>Your Name *</label>
            <input className="form-input" style={inputStyle} value={form.contactName} onChange={set("contactName")} placeholder="Jane Smith" />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input className="form-input" style={inputStyle} type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="you@example.com" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input className="form-input" style={inputStyle} type="tel" value={form.contactPhone} onChange={set("contactPhone")} placeholder="(402) 555-0000" />
          </div>
        </div>

        {/* Course info */}
        <h2 style={sectionHead}>Course Details</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={labelStyle}>Course Name *</label>
            <input className="form-input" style={inputStyle} value={form.courseName} onChange={set("courseName")} placeholder="Holmes Golf Course" />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={labelStyle}>Full Address</label>
            <input className="form-input" style={inputStyle} value={form.courseAddress} onChange={set("courseAddress")} placeholder="3701 S 70th Street, Lincoln, NE 68506" />
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input className="form-input" style={inputStyle} type="url" value={form.courseWebsite} onChange={set("courseWebsite")} placeholder="https://yourcourse.com" />
          </div>
          <div>
            <label style={labelStyle}>Greens Fee</label>
            <input className="form-input" style={inputStyle} value={form.greensFee} onChange={set("greensFee")} placeholder="e.g. $35–$55 or Members only" />
          </div>
          <div>
            <label style={labelStyle}>Number of Holes</label>
            <select className="form-input" style={{ ...inputStyle, cursor:"pointer" }} value={form.holesCount} onChange={set("holesCount")}>
              <option value="9">9 Holes</option>
              <option value="18">18 Holes</option>
              <option value="27">27 Holes</option>
              <option value="36">36 Holes</option>
            </select>
          </div>
          <div style={{ display:"flex", alignItems:"center" }}>
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginTop:20 }}>
              <input type="checkbox" checked={form.driveRange} onChange={set("driveRange")} style={{ width:18, height:18, accentColor:"#4a7c3a", cursor:"pointer" }} />
              <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, fontWeight:600, color:"#3a3020" }}>Has Driving Range</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <h2 style={sectionHead}>Course Description</h2>
        <div>
          <label style={labelStyle}>Tell golfers what makes your course special</label>
          <textarea
            className="form-input"
            style={{ ...inputStyle, minHeight:110, lineHeight:1.6 }}
            value={form.courseDescription}
            onChange={set("courseDescription")}
            placeholder="Describe your course — the terrain, signature holes, what golfers love about it, any recent improvements..."
          />
        </div>

        {/* Photos */}
        <h2 style={sectionHead}>Photos</h2>
        <div>
          <label style={labelStyle}>Photo URLs (one per line)</label>
          <textarea
            className="form-input"
            style={{ ...inputStyle, minHeight:90, lineHeight:1.7, fontFamily:"monospace", fontSize:12 }}
            value={form.photoUrls}
            onChange={set("photoUrls")}
            placeholder={"https://yourdomain.com/photo1.jpg\nhttps://yourdomain.com/photo2.jpg\n\nOr paste links from Facebook, Google Photos, Dropbox, etc."}
          />
          <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"#8a7e60", marginTop:6, lineHeight:1.5 }}>
            Don't have URLs? No problem — just reply to the confirmation email with photos attached and we'll upload them for you.
          </p>
        </div>

        {/* Notes */}
        <h2 style={sectionHead}>Anything Else?</h2>
        <div>
          <label style={labelStyle}>Additional notes for us</label>
          <textarea
            className="form-input"
            style={{ ...inputStyle, minHeight:80, lineHeight:1.6 }}
            value={form.additionalNotes}
            onChange={set("additionalNotes")}
            placeholder="Seasonal hours, tee time booking URL, social media links, anything else you'd like on your listing..."
          />
        </div>

        {error && (
          <div style={{ background:"#fef0f0", border:"1px solid #f0b8b8", borderRadius:3, padding:"12px 16px", fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"#c03030", marginTop:20 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ marginTop:24, width:"100%", background: submitting ? "#8aaa7a" : "linear-gradient(135deg,#2d5c28,#3a7030)", color:"#fff", border:"none", fontFamily:"'Source Sans 3',sans-serif", fontSize:15, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", padding:"18px", borderRadius:3, cursor: submitting ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          {submitting ? (
            <>
              <span style={{ display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
              Submitting...
            </>
          ) : "Submit My Listing →"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"#8a7e60", textAlign:"center", marginTop:14, lineHeight:1.6 }}>
          Your listing will be live within 24 hours. Questions? <a href="mailto:zacharybaehr@gmail.com" style={{ color:"#3a5c30" }}>zacharybaehr@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
