export function relativeTime(value: string): string {
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000], ["month", 2_592_000], ["week", 604_800],
    ["day", 86_400], ["hour", 3_600], ["minute", 60],
  ];
  for (const [unit, size] of ranges) {
    if (Math.abs(seconds) >= size || unit === "minute") return formatter.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function isToday(value: string): boolean {
  return dateKey(new Date(value)) === dateKey(new Date());
}

export function isOverdue(value: string): boolean {
  return new Date(value).getTime() < Date.now() && !isToday(value);
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

export function formatFollowUp(value: string): string {
  const date = new Date(value);
  if (isToday(value)) return `Today, ${new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date)}`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

