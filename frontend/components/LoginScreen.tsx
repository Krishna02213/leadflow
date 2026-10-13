"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Logo } from "./Logo";

export function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("demo@leadflow.dev");
  const [password, setPassword] = useState("demo1234");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const result = await api.login(email, password);
      localStorage.setItem("leadflow_token", result.access_token);
      onLogin(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally { setLoading(false); }
  }

  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="story-content">
          <Logo light />
          <div className="story-copy">
            <span className="eyebrow"><Sparkles size={15} /> Your focused sales workspace</span>
            <h1>Every promising lead deserves a thoughtful follow-up.</h1>
            <p>Turn scattered conversations into clear next steps—and keep every relationship moving forward.</p>
          </div>
          <div className="story-proof">
            {[
              "Know exactly who needs attention today",
              "Keep every conversation in one clear timeline",
              "Move opportunities forward with confidence",
            ].map((text) => <div key={text}><span><Check size={14} /></span>{text}</div>)}
          </div>
        </div>
        <div className="story-orb story-orb-one" /><div className="story-orb story-orb-two" />
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-logo"><Logo /></div>
          <span className="login-icon"><LockKeyhole size={20} /></span>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to pick up where you left off.</p>
          <form onSubmit={submit}>
            <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
            <label>Password
              <span className="password-field">
                <input type={visible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </span>
            </label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary wide" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <>Sign in <ArrowRight size={17} /></>}</button>
          </form>
          <div className="demo-hint"><span>Demo access</span><code>demo@leadflow.dev</code><code>demo1234</code></div>
        </div>
      </section>
    </main>
  );
}

