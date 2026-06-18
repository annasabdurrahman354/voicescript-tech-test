export interface RankableReporter {
  id: string;
  name: string;
  city: string;
  available: boolean;
}

export interface RankingCriteria {
  locationType: 'PHYSICAL' | 'REMOTE';
  jobCity?: string;
}

/**
 * Scores a reporter based on suitability:
 * - 2 points: Physical job, same city
 * - 1 point: Remote job (all available equally eligible)
 * - 0 points: Physical job, different city (fallback)
 */
function scoreReporter(criteria: RankingCriteria, reporter: RankableReporter): number {
  if (criteria.locationType === 'PHYSICAL' && criteria.jobCity === reporter.city) {
    return 2;
  }
  if (criteria.locationType === 'REMOTE') {
    return 1;
  }
  return 0;
}

export function rankReporters(
  reporters: RankableReporter[],
  criteria: RankingCriteria,
): RankableReporter[] {
  const available = reporters.filter((r) => r.available);

  return [...available].sort((a, b) => {
    const scoreA = scoreReporter(criteria, a);
    const scoreB = scoreReporter(criteria, b);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return a.name.localeCompare(b.name);
  });
}

export function selectBestReporter(
  reporters: RankableReporter[],
  criteria: RankingCriteria,
): RankableReporter | null {
  const ranked = rankReporters(reporters, criteria);
  return ranked[0] ?? null;
}
