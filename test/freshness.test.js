const { test } = require('node:test');
const assert = require('node:assert/strict');
const { financialReview } = require('../lib/freshness');

test('review dates expire independently from the response timestamp', () => {
  const club = { financialReviewedAt: '2026-10-23' };
  assert.equal(financialReview(club, Date.parse('2026-10-23T18:00:00Z')).financialReviewStatus, 'reviewed');
  assert.equal(financialReview(club, Date.parse('2026-11-27T00:00:00Z')).financialReviewStatus, 'overdue');
  assert.equal(financialReview(club, Date.parse('2026-11-27T00:00:00Z')).financialReviewDueAt, '2026-11-27');
});

test('missing, invalid and future review dates never imply a current review', () => {
  for (const value of [undefined, 'invalid', '2026-02-31', '2027-01-01']) {
    const result = financialReview({ financialReviewedAt: value }, Date.parse('2026-10-23'));
    assert.equal(result.financialReviewStatus, 'unverified');
    assert.equal(result.financialReviewedAt, null);
    assert.equal(result.financialReviewDueAt, null);
  }
});
