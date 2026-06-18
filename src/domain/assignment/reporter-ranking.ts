// src/domain/assignment/reporter-ranking.ts
// Pure reporter ranking/matching logic.
// No Prisma, no Express — only plain TypeScript types and data manipulation.

export interface RankableReporter {
  id: string;
  name: string;
  city: string;
  available: boolean;
}

export interface RankingCriteria {
  locationType: 'PHYSICAL' | 'REMOTE';
  jobCity?: string; // only relevant for PHYSICAL jobs
}

/**
 * Scores a single reporter based on how well they match the job's criteria.
 *
 * Scoring:
 * - 2 points: Physical job AND reporter is in the same city (best match)
 * - 1 point:  Remote job (all available reporters are equally eligible)
 * - 0 points: Physical job, different city (lowest priority but still a fallback)
 *
 * Using discrete scores makes it easy to add future criteria (e.g. ratings, load balancing)
 * without changing the sort logic.
 */
function scoreReporter(criteria: RankingCriteria, reporter: RankableReporter): number {
  if (criteria.locationType === 'PHYSICAL' && criteria.jobCity === reporter.city) {
    return 2;
  }
  if (criteria.locationType === 'REMOTE') {
    return 1;
  }
  return 0; // physical job, reporter is in a different city
}

/**
 * Ranks all available reporters by suitability for a given job.
 *
 * - Unavailable reporters are excluded entirely
 * - Reporters are sorted descending by score
 * - Ties are broken alphabetically by name for determinism
 */
export function rankReporters(
  reporters: RankableReporter[],
  criteria: RankingCriteria,
): RankableReporter[] {
  const available = reporters.filter((r) => r.available);

  return [...available].sort((a, b) => {
    const scoreA = scoreReporter(criteria, a);
    const scoreB = scoreReporter(criteria, b);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // higher score first
    }

    // Alphabetical tiebreaker ensures the same input always produces the same output
    return a.name.localeCompare(b.name);
  });
}

/**
 * Returns the single best reporter for a job, or null if none are available.
 * This is what the assignment service should call.
 */
export function selectBestReporter(
  reporters: RankableReporter[],
  criteria: RankingCriteria,
): RankableReporter | null {
  const ranked = rankReporters(reporters, criteria);
  return ranked[0] ?? null;
}
