import { ArrowUpRight } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <span className="logo-mark"><ArrowUpRight size={17} strokeWidth={2.5} /></span>
      <span>LeadFlow</span>
    </div>
  );
}

