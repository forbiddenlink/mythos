import roster from "@/data/pantheon-rosters.json";

export const DEITY_IDS_BY_PANTHEON: Record<string, readonly string[]> = roster;

export const PANTHEON_IDS: string[] = Object.keys(roster);

export function hasExploredPantheon(
  explored: readonly string[],
  pantheonId: string,
): boolean {
  const short = pantheonId.replace(/-pantheon$/, "");
  return explored.includes(pantheonId) || explored.includes(short);
}

export function isPantheonComplete(
  pantheonId: string,
  deitiesViewed: readonly string[],
): boolean {
  const ids = DEITY_IDS_BY_PANTHEON[pantheonId];
  if (!ids || ids.length === 0) {
    return false;
  }
  const viewed = new Set(deitiesViewed);
  return ids.every((id) => viewed.has(id));
}
