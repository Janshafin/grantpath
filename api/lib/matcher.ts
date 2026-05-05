// ============================================================
// FIXED matcher.ts — replace api/lib/matcher.ts with this file
// BUG FIX 2: statewide logic was allowing scholarships with
// zipCodes.length === 0 (e.g. s008 CT STEM) to match ANY user
// even when statewide=false was intended. Fixed to only bypass
// zip check when statewide === true explicitly.
// ============================================================

import type { Scholarship, StudentQuery } from '@/types/index.js';
import { SCORING, MATCH_REASONS } from './constants.js';
import { sanitizeArray, parseGpa } from './utils.js';

export function matchScholarships(scholarships: Scholarship[], query: StudentQuery): Scholarship[] {
  const zipCode        = (query.zipCode || '').trim();
  const userGpa        = parseGpa(query.gpa);
  const userMajor      = (query.major || '').toLowerCase().trim();
  const userDemographics = sanitizeArray(query.demographics);

  const matched = scholarships.filter(s => {

    // ── 1. Location check ──────────────────────────────────
    // BUG FIX: original had `|| s.zipCodes.length === 0` which
    // made ALL scholarships with no zip list pass regardless of
    // their statewide flag. Now only statewide=true bypasses zip.
    const matchesZip =
      s.statewide ||                          // explicitly statewide
      (zipCode && s.zipCodes.includes(zipCode)); // local zip match

    if (!matchesZip) return false;

    // ── 2. GPA check ───────────────────────────────────────
    if (userGpa < s.gpaMin) return false;

    // ── 3. Major check ─────────────────────────────────────
    const lowerMajors = sanitizeArray(s.majors);
    const matchesMajor =
      lowerMajors.includes('any') ||
      (userMajor && lowerMajors.includes(userMajor));
    if (!matchesMajor) return false;

    // ── 4. Demographics check ──────────────────────────────
    const lowerDemos = sanitizeArray(s.demographics);
    const matchesDemographics =
      lowerDemos.includes('any') ||
      lowerDemos.some(d => userDemographics.includes(d));
    if (!matchesDemographics) return false;

    return true;
  });

  // ── Score and annotate ────────────────────────────────────
  const scored = matched.map(s => {
    let score: number = SCORING.BASE_SCORE;
    const reasonParts: string[] = [];

    if (zipCode && s.zipCodes.includes(zipCode)) {
      score += SCORING.LOCAL_ZIP;
      reasonParts.push(MATCH_REASONS.LOCAL_ZIP);
    } else if (s.statewide) {
      score += SCORING.STATEWIDE;
      reasonParts.push(MATCH_REASONS.STATEWIDE);
    }

    if (userGpa >= s.gpaMin && s.gpaMin > 0) {
      score += SCORING.GPA_MATCH;
      reasonParts.push(MATCH_REASONS.GPA);
    }

    const lowerMajors = sanitizeArray(s.majors);
    if (!lowerMajors.includes('any') && userMajor && lowerMajors.includes(userMajor)) {
      score += SCORING.MAJOR_MATCH;
      reasonParts.push(MATCH_REASONS.MAJOR);
    }

    const lowerDemos = sanitizeArray(s.demographics);
    if (!lowerDemos.includes('any') && lowerDemos.some(d => userDemographics.includes(d))) {
      score += SCORING.DEMOGRAPHIC_MATCH;
      reasonParts.push(MATCH_REASONS.DEMOGRAPHIC);
    }

    score = Math.min(score, SCORING.MAX_SCORE);

    return {
      ...s,
      matchScore: score,
      matchReason: reasonParts.length > 0
        ? `Matches your ${reasonParts.join(', ')}.`
        : 'Statewide — open to all Connecticut students.'
    };
  });

  scored.sort((a, b) => b.amount - a.amount);
  return scored;
}
