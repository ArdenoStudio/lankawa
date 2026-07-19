export function formatCadence(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  if (minutes < 10080) {
    const days = Math.round(minutes / 1440);
    return days === 1 ? "1 day" : `${days} days`;
  }
  const weeks = Math.round(minutes / 10080);
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}

export function formatAdapter(
  adapter: "api" | "scrape" | "partner" | "seed",
  labels: Record<"api" | "scrape" | "partner" | "seed", string>,
): string {
  return labels[adapter];
}
