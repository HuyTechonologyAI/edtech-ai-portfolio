import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ALL_LIFECYCLE_STATUSES,
  AI_HR_OFFICERS,
  HARD_RULES_CATALOG,
  calculateWeightedKPIScore,
  classifyKPIBand,
  validateLifecycleTransition,
  generateInitialLifecycleRecords,
} from '../data/ai-hr-lifecycle';
import { AI_WORKFORCE_63 } from '../data/ai-workforce-63';

describe('AI HR Lifecycle Management & Governance Engine (Master Prompt V2.0)', () => {
  it('defines all 11 lifecycle statuses correctly', () => {
    assert.strictEqual(ALL_LIFECYCLE_STATUSES.length, 11);
    const codes = ALL_LIFECYCLE_STATUSES.map(s => s.code);
    assert.ok(codes.includes('candidate'));
    assert.ok(codes.includes('screening'));
    assert.ok(codes.includes('sandbox_testing'));
    assert.ok(codes.includes('pending_approval'));
    assert.ok(codes.includes('probation'));
    assert.ok(codes.includes('active'));
    assert.ok(codes.includes('improvement_plan'));
    assert.ok(codes.includes('suspended'));
    assert.ok(codes.includes('quarantined'));
    assert.ok(codes.includes('retired'));
    assert.ok(codes.includes('rejected'));
  });

  it('configures the 5 core AI HR officers accurately', () => {
    // Mai Hoa - emp_60 (HR-LEAD)
    const emp60 = AI_HR_OFFICERS['emp_60'];
    assert.ok(emp60);
    assert.strictEqual(emp60.name, 'Mai Hoa');
    assert.strictEqual(emp60.gender, 'Nữ');
    assert.strictEqual(emp60.code, 'HR-LEAD');

    // Hữu Phúc - emp_61 (HR-BENCH)
    const emp61 = AI_HR_OFFICERS['emp_61'];
    assert.ok(emp61);
    assert.strictEqual(emp61.name, 'Hữu Phúc');
    assert.strictEqual(emp61.gender, 'Nam');
    assert.strictEqual(emp61.code, 'HR-BENCH');

    // Kiều Oanh - emp_62 (HR-LIC)
    const emp62 = AI_HR_OFFICERS['emp_62'];
    assert.ok(emp62);
    assert.strictEqual(emp62.name, 'Kiều Oanh');
    assert.strictEqual(emp62.gender, 'Nữ');
    assert.strictEqual(emp62.code, 'HR-LIC');

    // Gia Linh - emp_63 (AUDIT-CUST)
    const emp63 = AI_HR_OFFICERS['emp_63'];
    assert.ok(emp63);
    assert.strictEqual(emp63.name, 'Gia Linh');
    assert.strictEqual(emp63.gender, 'Nữ');
    assert.strictEqual(emp63.code, 'AUDIT-CUST');

    // Thiên Ân - emp_57 (CISO)
    const emp57 = AI_HR_OFFICERS['emp_57'];
    assert.ok(emp57);
    assert.strictEqual(emp57.name, 'Thiên Ân');
    assert.strictEqual(emp57.gender, 'Nam');
    assert.strictEqual(emp57.code, 'CISO');
  });

  it('catalogs exactly 14 Hard Rules with appropriate severity', () => {
    assert.strictEqual(HARD_RULES_CATALOG.length, 14);
    const ruleIds = HARD_RULES_CATALOG.map(r => r.ruleId);
    for (let i = 1; i <= 14; i++) {
      const paddedId = `HR-RULE-${String(i).padStart(2, '0')}`;
      assert.ok(ruleIds.includes(paddedId), `Rule ${paddedId} must exist`);
    }

    // Critical rules must map to QUARANTINE
    const criticalRules = HARD_RULES_CATALOG.filter(r => r.severity === 'CRITICAL');
    assert.ok(criticalRules.length >= 7);
    criticalRules.forEach(r => {
      assert.strictEqual(r.defaultAction, 'QUARANTINE');
    });
  });

  it('calculates weighted KPI scores matching 35/20/20/15/10 weights', () => {
    const perfectScore = calculateWeightedKPIScore({
      qualityScore: 100,
      completionScore: 100,
      complianceScore: 100,
      resourceScore: 100,
      speedScore: 100,
    });
    assert.strictEqual(perfectScore, 100);

    const testScore = calculateWeightedKPIScore({
      qualityScore: 80, // 80 * 0.35 = 28
      completionScore: 90, // 90 * 0.20 = 18
      complianceScore: 100, // 100 * 0.20 = 20
      resourceScore: 70, // 70 * 0.15 = 10.5
      speedScore: 60, // 60 * 0.10 = 6
    }); // Total = 82.5
    assert.strictEqual(testScore, 82.5);

    const bandGood = classifyKPIBand(testScore);
    assert.strictEqual(bandGood.band, 'GOOD');

    const underperforming = classifyKPIBand(55);
    assert.strictEqual(underperforming.band, 'UNDERPERFORMING');
    assert.ok(underperforming.actionRecommendation.includes('Hữu Phúc'));
  });

  it('strictly validates lifecycle transitions and enforces Human Gate', () => {
    // 1. Same status is disallowed
    const sameTransition = validateLifecycleTransition({
      agentId: 'emp_01',
      fromStatus: 'active',
      toStatus: 'active',
      requestedBy: 'emp_60',
      reason: 'No change',
    });
    assert.strictEqual(sameTransition.allowed, false);

    // 2. Candidate directly to active is disallowed
    const candidateToActive = validateLifecycleTransition({
      agentId: 'emp_new',
      fromStatus: 'candidate',
      toStatus: 'active',
      requestedBy: 'emp_60',
      reason: 'Bypass attempt',
    });
    assert.strictEqual(candidateToActive.allowed, false);
    assert.strictEqual(candidateToActive.requiresHumanGate, true);

    // 3. Reactivating a quarantined agent requires human gate approval
    const quarantinedToActiveNoApproval = validateLifecycleTransition({
      agentId: 'emp_04',
      fromStatus: 'quarantined',
      toStatus: 'active',
      requestedBy: 'emp_57',
      reason: 'Reactivate',
      humanApproved: false,
    });
    assert.strictEqual(quarantinedToActiveNoApproval.allowed, false);
    assert.strictEqual(quarantinedToActiveNoApproval.requiresHumanGate, true);

    const quarantinedToActiveWithApproval = validateLifecycleTransition({
      agentId: 'emp_04',
      fromStatus: 'quarantined',
      toStatus: 'active',
      requestedBy: 'emp_57',
      reason: 'Reactivate with admin approval',
      humanApproved: true,
    });
    assert.strictEqual(quarantinedToActiveWithApproval.allowed, true);

    // 4. Offboarding to retired requires human gate approval
    const retireNoApproval = validateLifecycleTransition({
      agentId: 'emp_10',
      fromStatus: 'active',
      toStatus: 'retired',
      requestedBy: 'emp_60',
      reason: 'Retire agent',
      humanApproved: false,
    });
    assert.strictEqual(retireNoApproval.allowed, false);
    assert.strictEqual(retireNoApproval.requiresHumanGate, true);
  });

  it('initializes full 63 employee records with verified identity and avatars', () => {
    const records = generateInitialLifecycleRecords(AI_WORKFORCE_63);
    assert.strictEqual(records.length, 63);

    // All must be active and verified
    records.forEach(rec => {
      assert.strictEqual(rec.status, 'active');
      assert.strictEqual(rec.identityVerified, true);
      assert.strictEqual(rec.avatarVerified, true);
      assert.ok(rec.kpiScore >= 75);
    });

    // Check unique agentIds
    const ids = new Set(records.map(r => r.agentId));
    assert.strictEqual(ids.size, 63);
  });
});
