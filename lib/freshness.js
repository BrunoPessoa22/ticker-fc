const REVIEW_INTERVAL_DAYS = 35;
const DAY_MS = 24 * 60 * 60 * 1000;

function financialReview(club, now = Date.now()) {
  const reviewedAt = club.financialReviewedAt ?? null;
  const reviewedMs = reviewedAt ? Date.parse(`${reviewedAt}T00:00:00Z`) : NaN;
  const valid = Number.isFinite(reviewedMs) && /^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)
    && new Date(reviewedMs).toISOString().slice(0, 10) === reviewedAt && reviewedMs <= now;
  const dueMs = valid ? reviewedMs + REVIEW_INTERVAL_DAYS * DAY_MS : null;
  return {
    financialPeriodEnd: club.financialPeriodEnd ?? null,
    financialReviewedAt: valid ? reviewedAt : null,
    financialSourcePublishedAt: club.financialSourcePublishedAt ?? null,
    financialSourceUrl: club.financialSourceUrl ?? null,
    financialSourceLabel: club.financialSourceLabel ?? null,
    financialReviewDueAt: dueMs == null ? null : new Date(dueMs).toISOString().slice(0, 10),
    financialReviewStatus: !valid ? 'unverified' : now >= dueMs ? 'overdue' : 'reviewed',
  };
}

module.exports = { financialReview, REVIEW_INTERVAL_DAYS };
