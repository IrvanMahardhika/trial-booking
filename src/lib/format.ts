export function formatClassDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}
