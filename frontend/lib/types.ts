export const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"] as const;
export type LeadStatus = (typeof STATUSES)[number];

export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface Discussion {
  id: number;
  note: string;
  follow_up_at: string | null;
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
  follow_up_at: string | null;
  created_at: string;
  updated_at: string;
  last_discussion: Discussion | null;
  discussion_count: number;
}

