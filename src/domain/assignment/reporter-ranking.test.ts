// src/domain/assignment/reporter-ranking.test.ts
import { describe, it, expect } from 'vitest';
import {
  rankReporters,
  selectBestReporter,
  type RankableReporter,
} from './reporter-ranking';

// ── Test fixtures ─────────────────────────────────────────────────────────────

const jakartaReporter: RankableReporter = {
  id: '1',
  name: 'Alice',
  city: 'Jakarta',
  available: true,
};
const surabayaReporter: RankableReporter = {
  id: '2',
  name: 'Bob',
  city: 'Surabaya',
  available: true,
};
const unavailableReporter: RankableReporter = {
  id: '3',
  name: 'Carol',
  city: 'Jakarta',
  available: false,
};
const bandungReporter: RankableReporter = {
  id: '4',
  name: 'Dave',
  city: 'Bandung',
  available: true,
};

// ─────────────────────────────────────────────────────────────────────────────

describe('rankReporters — PHYSICAL jobs', () => {
  it('ranks same-city reporter above other-city reporter', () => {
    const ranked = rankReporters([surabayaReporter, jakartaReporter], {
      locationType: 'PHYSICAL',
      jobCity: 'Jakarta',
    });
    expect(ranked[0]?.id).toBe(jakartaReporter.id);
  });

  it('falls back to other-city reporters if no same-city match exists', () => {
    // No Bali reporter; should still return available reporters, not empty
    const ranked = rankReporters([jakartaReporter, surabayaReporter], {
      locationType: 'PHYSICAL',
      jobCity: 'Bali',
    });
    expect(ranked.length).toBe(2);
  });

  it('sorts deterministically by name when scores are equal', () => {
    // Both are physical reporters in different cities (score = 0)
    const ranked = rankReporters([surabayaReporter, bandungReporter], {
      locationType: 'PHYSICAL',
      jobCity: 'Jakarta',
    });
    // "Bob" < "Dave" alphabetically
    expect(ranked[0]?.name).toBe('Bob');
    expect(ranked[1]?.name).toBe('Dave');
  });
});

describe('rankReporters — REMOTE jobs', () => {
  it('includes all available reporters for remote jobs', () => {
    const ranked = rankReporters([jakartaReporter, surabayaReporter, bandungReporter], {
      locationType: 'REMOTE',
    });
    expect(ranked.length).toBe(3);
  });

  it('sorts remote reporters alphabetically (all have equal score)', () => {
    const ranked = rankReporters([surabayaReporter, jakartaReporter, bandungReporter], {
      locationType: 'REMOTE',
    });
    expect(ranked.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Dave']);
  });

  it('ignores jobCity for remote assignments', () => {
    const withCity = rankReporters([jakartaReporter, surabayaReporter], {
      locationType: 'REMOTE',
      jobCity: 'Jakarta',
    });
    const withoutCity = rankReporters([jakartaReporter, surabayaReporter], {
      locationType: 'REMOTE',
    });
    expect(withCity.map((r) => r.id)).toEqual(withoutCity.map((r) => r.id));
  });
});

describe('rankReporters — availability filtering', () => {
  it('excludes unavailable reporters entirely', () => {
    const ranked = rankReporters([jakartaReporter, unavailableReporter], {
      locationType: 'PHYSICAL',
      jobCity: 'Jakarta',
    });
    expect(ranked.every((r) => r.available)).toBe(true);
    expect(ranked.find((r) => r.id === unavailableReporter.id)).toBeUndefined();
  });

  it('returns empty array if all reporters are unavailable', () => {
    const ranked = rankReporters([unavailableReporter], { locationType: 'REMOTE' });
    expect(ranked).toEqual([]);
  });
});

describe('selectBestReporter', () => {
  it('returns the top-ranked reporter', () => {
    const best = selectBestReporter([surabayaReporter, jakartaReporter], {
      locationType: 'PHYSICAL',
      jobCity: 'Jakarta',
    });
    expect(best?.id).toBe(jakartaReporter.id);
  });

  it('returns null for an empty reporter list', () => {
    const best = selectBestReporter([], { locationType: 'PHYSICAL', jobCity: 'Jakarta' });
    expect(best).toBeNull();
  });

  it('returns null when all reporters are unavailable', () => {
    const best = selectBestReporter([unavailableReporter], { locationType: 'REMOTE' });
    expect(best).toBeNull();
  });
});
