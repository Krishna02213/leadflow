"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { Modal } from "./Modal";

export function NewLeadDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (lead: Lead) => void }) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try { onCreated(await api.createLead(form)); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not create lead"); setLoading(false); }
  }
  return (
    <Modal onClose={onClose} label="Add a new lead" className="new-lead-modal">
      <header className="modal-header"><span className="modal-icon"><UserPlus size={19} /></span><div><h2>Add a new lead</h2><p>Capture the essentials—you can add context later.</p></div></header>
      <form className="modal-form" onSubmit={submit}>
        <label>Full name <b>*</b><input autoFocus required placeholder="e.g. Maya Patel" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <div className="form-row"><label>Company <span>Optional</span><input placeholder="e.g. Northstar Labs" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label><label>Phone <span>Optional</span><input placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label></div>
        <label>Email <span>Optional</span><input type="email" placeholder="maya@northstar.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        {error && <div className="form-error">{error}</div>}
        <footer className="modal-footer"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : "Create lead"}</button></footer>
      </form>
    </Modal>
  );
}

