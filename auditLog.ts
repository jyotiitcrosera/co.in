export function formatAuditAction(action: string) {
  return action
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatAuditActor(actor: string, actorRole: string) {
  return `${actor} · ${actorRole}`;
}
