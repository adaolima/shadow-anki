export function formatDueLabel(dueAt: string) {
  const dueTime = new Date(dueAt).getTime();
  const diffMs = dueTime - Date.now();

  if (diffMs <= 0) return 'now';

  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `in ${hours}h`;

  const days = Math.round(hours / 24);
  return `in ${days}d`;
}
