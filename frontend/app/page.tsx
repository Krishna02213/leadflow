"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Dashboard } from "@/components/Dashboard";
import { LoginScreen } from "@/components/LoginScreen";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const logout = useCallback(() => { localStorage.removeItem("leadflow_token"); setUser(null); }, []);
  useEffect(() => {
    if (!localStorage.getItem("leadflow_token")) {
      Promise.resolve().then(() => setChecking(false));
      return;
    }
    api.me().then(setUser).catch(logout).finally(() => setChecking(false));
  }, [logout]);
  if (checking) return <div className="boot-screen"><div className="boot-mark">↗</div><span>LeadFlow</span></div>;
  return user ? <Dashboard user={user} onLogout={logout} /> : <LoginScreen onLogin={setUser} />;
}
