export type SanctionType =
  | "avertissement"
  | "exclusion"
  | "expulsion"
  | "bannissement"
  | "autre";

// Barème de points pour chaque type de sanction
export const SANCTION_WEIGHTS: Record<SanctionType, number> = {
  avertissement: 2,
  exclusion: 3,
  expulsion: 5,
  bannissement: 15,
  autre: 2,
};

// Structure d'une sanction
export interface SanctionRow {
  sanction_id: string;   // ID unique
  user_id: string;       // ID du membre sanctionné
  author_id: string;     // ID du modérateur
  type: string;          // type de sanction ("avertissement", "mute", etc.)
  reason: string;        // raison de la sanction
  duration: string | null; // durée éventuelle ("10m", "7d", null…)
  timestamp: number;     // date de la sanction (UNIX timestamp en secondes)
}

// Calcule le score de risque total en tenant compte de l'ancienneté des sanctions
export function calculateRiskScore(rows: SanctionRow[]): number {
  const now = Date.now() / 1000;
  let score = 0;

  for (const row of rows) {
    const type = (row.type.toLowerCase() as SanctionType) || "autre";
    const weight = SANCTION_WEIGHTS[type] ?? SANCTION_WEIGHTS.autre;

    const age = now - row.timestamp;

    // Facteur de décroissance
    let decayFactor = 1;
    if (age > 365 * 24 * 3600) decayFactor = 0.1;   // +1 an -> presque négligeable
    else if (age > 180 * 24 * 3600) decayFactor = 0.25; // +6 mois -> quart
    else if (age > 90 * 24 * 3600) decayFactor = 0.5;   // +3 mois -> moitié

    score += weight * decayFactor;
  }

  return Math.round(score);
}

// Structure représentant un niveau de risque
export interface RiskLevel {
  label: string;
  badge: string;
}

// Associe un score à un palier de risque
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 20)
    return { label: "Critique", badge: "☢️" };
  if (score >= 12)
    return { label: "Élevé", badge: "⚡" };
  if (score >= 7)
    return { label: "Modéré", badge: "🟠" };
  if (score >= 3)
    return { label: "Faible", badge: "🟡" };

  return { label: "Mineur", badge: "🟢" };
}
