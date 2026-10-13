"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, CirclePlus, Filter, LogOut, Search, Sparkles, UsersRound } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isOverdue, isToday } from "@/lib/date";
import { STATUSES, type Lead, type User } from "@/lib/types";
import { LeadCard } from "./LeadCard";
import { LeadDialog } from "./LeadDialog";
import { Logo } from "./Logo";
import { NewLeadDialog } from "./NewLeadDialog";

export function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLeads(await api.leads(filter, debouncedSearch)); setError(""); }
    catch (err) { if (err instanceof ApiError && err.status === 401) onLogout(); else setError("We couldn't load your leads. Please try again."); }
    finally { setLoading(false); }
  }, [filter, debouncedSearch, onLogout]);

  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search), 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const today = useMemo(() => leads.filter((lead) => lead.follow_up_at && isToday(lead.follow_up_at)).sort((a, b) => new Date(a.follow_up_at!).getTime() - new Date(b.follow_up_at!).getTime()), [leads]);
  const overdue = useMemo(() => leads.filter((lead) => lead.follow_up_at && isOverdue(lead.follow_up_at)).length, [leads]);
  const allLeads = useMemo(() => leads.filter((lead) => !today.some((item) => item.id === lead.id)), [leads, today]);

  function applyChange(updated: Lead) {
    setLeads((current) => current.map((lead) => lead.id === updated.id ? updated : lead));
    setSelected(updated);
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="topbar-inner"><Logo /><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18} />{overdue > 0 && <i />}</button><div className="user-menu"><span>{user.full_name.split(" ").map((p) => p[0]).join("")}</span><div><b>{user.full_name}</b><small>Sales workspace</small></div><ChevronDown size={15} /></div><button className="logout-button" onClick={onLogout} aria-label="Sign out"><LogOut size={17} /></button></div></div></header>
      <div className="dashboard">
        <section className="welcome"><div><span className="eyebrow dark"><Sparkles size={14} />Monday momentum</span><h1>Good afternoon, {user.full_name.split(" ")[0]}.</h1><p>Here’s who needs your attention and where every opportunity stands.</p></div><button className="primary add-button" onClick={() => setAdding(true)}><CirclePlus size={17} />Add new lead</button></section>
        <section className="toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search leads" placeholder="Search by name or company…" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="filters"><span><Filter size={14} />Filter</span>{["All", ...STATUSES].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></section>
        {error && <div className="page-error">{error}<button onClick={load}>Retry</button></div>}
        {loading ? <div className="skeleton-list">{[1, 2, 3].map((n) => <div className="skeleton" key={n} />)}</div> : leads.length === 0 ? <section className="empty-state"><span><UsersRound size={27} /></span><h2>No leads found</h2><p>Try a different filter or add a new opportunity.</p><button className="primary" onClick={() => setAdding(true)}>Add your first lead</button></section> : <>
          {today.length > 0 && <section className="lead-section today-section"><div className="section-heading"><div><span className="section-kicker"><i />Today&apos;s focus</span><h2>Follow-ups due today</h2></div><span className="section-count">{today.length} {today.length === 1 ? "conversation" : "conversations"}</span></div><div className="lead-grid">{today.map((lead) => <LeadCard key={lead.id} lead={lead} featured onClick={() => setSelected(lead)} />)}</div></section>}
          <section className="lead-section"><div className="section-heading"><div><span className="section-kicker neutral">Pipeline</span><h2>{filter === "All" ? "All leads" : `${filter} leads`}</h2></div><span className="section-count">{allLeads.length} shown</span></div><div className="lead-grid">{allLeads.map((lead) => <LeadCard key={lead.id} lead={lead} onClick={() => setSelected(lead)} />)}</div>{allLeads.length === 0 && <p className="section-empty">All matching leads are already in today&apos;s focus.</p>}</section>
        </>}
      </div>
      {adding && <NewLeadDialog onClose={() => setAdding(false)} onCreated={(lead) => { setLeads((current) => [lead, ...current]); setAdding(false); }} />}
      {selected && <LeadDialog lead={selected} onClose={() => setSelected(null)} onChange={applyChange} />}
    </main>
  );
}
