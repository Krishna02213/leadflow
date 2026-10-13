import { AlarmClock, ArrowUpRight, Building2, Clock3, MessageSquareText } from "lucide-react";
import { formatFollowUp, isOverdue, relativeTime } from "@/lib/date";
import type { Lead } from "@/lib/types";

export function StatusBadge({ status }: { status: Lead["status"] }) {
  return <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}><i />{status}</span>;
}

export function LeadCard({ lead, onClick, featured = false }: { lead: Lead; onClick: () => void; featured?: boolean }) {
  const overdue = Boolean(lead.follow_up_at && isOverdue(lead.follow_up_at));
  return (
    <button className={`lead-card ${featured ? "featured" : ""} ${overdue ? "overdue" : ""}`} onClick={onClick}>
      <div className="lead-main">
        <div className="lead-avatar">{lead.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
        <div className="lead-copy">
          <div className="lead-title"><h3>{lead.name}</h3><StatusBadge status={lead.status} /></div>
          <div className="company"><Building2 size={13} />{lead.company || "Independent"}</div>
          <p>{lead.last_discussion?.note || "No discussions yet. Open this lead to start the conversation."}</p>
          <div className="lead-meta">
            <span><MessageSquareText size={13} />{lead.discussion_count} {lead.discussion_count === 1 ? "note" : "notes"}</span>
            <span><Clock3 size={13} />{lead.last_discussion ? relativeTime(lead.last_discussion.created_at) : relativeTime(lead.created_at)}</span>
          </div>
        </div>
      </div>
      <div className="lead-action">
        {lead.follow_up_at && <span className={`follow-chip ${overdue ? "danger" : ""}`}><AlarmClock size={14} />{overdue ? "Overdue · " : ""}{formatFollowUp(lead.follow_up_at)}</span>}
        <span className="open-arrow"><ArrowUpRight size={17} /></span>
      </div>
    </button>
  );
}

