"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlarmClock, Building2, CalendarDays, LoaderCircle, Mail, MessageSquarePlus, Phone, Send } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, relativeTime } from "@/lib/date";
import { STATUSES, type Discussion, type Lead, type LeadStatus } from "@/lib/types";
import { Modal } from "./Modal";
import { StatusBadge } from "./LeadCard";

export function LeadDialog({ lead, onClose, onChange }: { lead: Lead; onClose: () => void; onChange: (lead: Lead) => void }) {
  const [notes, setNotes] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [withFollowUp, setWithFollowUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.discussions(lead.id).then(setNotes).catch(() => setError("Could not load the timeline.")).finally(() => setLoading(false)); }, [lead.id]);

  async function updateStatus(status: LeadStatus) {
    try { onChange(await api.updateStatus(lead.id, status)); }
    catch { setError("Could not update the status."); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!note.trim()) return;
    setSaving(true); setError("");
    try {
      const discussion = await api.addDiscussion(lead.id, { note, ...(withFollowUp && followUp ? { follow_up_at: new Date(followUp).toISOString() } : {}) });
      setNotes((current) => [discussion, ...current]);
      setNote(""); setFollowUp(""); setWithFollowUp(false);
      const refreshed = await api.leads();
      const updated = refreshed.find((item) => item.id === lead.id);
      if (updated) onChange(updated);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save discussion"); }
    finally { setSaving(false); }
  }

  return (
    <Modal onClose={onClose} label={`${lead.name} timeline`} className="timeline-modal">
      <header className="timeline-header">
        <div className="timeline-person"><div className="lead-avatar large">{lead.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div><div><h2>{lead.name}</h2><p><Building2 size={13} />{lead.company || "Independent"}</p></div></div>
        <div className="status-control"><StatusBadge status={lead.status} /><select aria-label="Update lead status" value={lead.status} onChange={(e) => updateStatus(e.target.value as LeadStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      </header>
      <div className="contact-strip">{lead.email && <span><Mail size={14} />{lead.email}</span>}{lead.phone && <span><Phone size={14} />{lead.phone}</span>}{lead.follow_up_at && <span><CalendarDays size={14} />Next: {formatDateTime(lead.follow_up_at)}</span>}</div>
      <div className="timeline-body">
        <div className="section-label"><span>Conversation history</span><b>{notes.length}</b></div>
        {loading ? <div className="timeline-loading"><LoaderCircle className="spin" /></div> : notes.length === 0 ? <div className="empty-timeline"><MessageSquarePlus size={24} /><p>No discussions yet.</p><span>Add the first note below to begin the timeline.</span></div> : <div className="timeline-list">{notes.map((item, index) => <article className="timeline-item" key={item.id}><span className={`timeline-dot ${index === 0 ? "active" : ""}`} /><div className="timeline-date">{formatDateTime(item.created_at)} <span>· {relativeTime(item.created_at)}</span></div><div className="timeline-note"><p>{item.note}</p>{item.follow_up_at && <span><AlarmClock size={13} />Follow-up set for {formatDateTime(item.follow_up_at)}</span>}</div></article>)}</div>}
      </div>
      <form className="composer" onSubmit={submit}>
        <textarea required placeholder="What did you discuss? Capture decisions, context and next steps…" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="composer-bottom">
          <label className="check-label"><input type="checkbox" checked={withFollowUp} onChange={(e) => setWithFollowUp(e.target.checked)} /><span />Set follow-up</label>
          {withFollowUp && <input className="date-input" type="datetime-local" required value={followUp} onChange={(e) => setFollowUp(e.target.value)} />}
          <button className="primary composer-save" disabled={saving || !note.trim()}>{saving ? <LoaderCircle className="spin" size={17} /> : <><Send size={15} />Save note</>}</button>
        </div>
        {error && <div className="form-error compact">{error}</div>}
      </form>
    </Modal>
  );
}

