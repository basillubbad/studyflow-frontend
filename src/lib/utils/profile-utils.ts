/**
 * Generates initials from a name.
 * Extracts the first two characters of the name.
 * Supports both Arabic and English names gracefully.
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "?";
  
  const trimmedName = name.trim();
  if (trimmedName.length === 0) return "?";
  
  // Take first two characters
  const initials = trimmedName.slice(0, 2);
  
  // Uppercase for English/Latin characters
  return initials.toUpperCase();
}

/**
 * Returns a deterministic background color class based on a seed string (like name or ID).
 * Uses a curated set of professional, accessible colors.
 */
export function getAvatarColor(seed: string): string {
  if (!seed) return "bg-slate-500";
  
  const colors = [
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-purple-600",
    "bg-fuchsia-600",
    "bg-pink-600",
    "bg-rose-600",
    "bg-orange-600",
    "bg-amber-600",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
  ];
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
