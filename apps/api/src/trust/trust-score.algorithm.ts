export interface TrustInputs {
  identity: {
    phoneVerified: boolean;
    kycVerified: boolean;
    providerConfidence: number;
    manualReviewPassed: boolean;
  };
  transactions: {
    successfulContributions: number;
    successfulRepayments: number;
    expectedObligations: number;
    failedTransactions: number;
    reversedTransactions: number;
    lateRepayments: number;
    activeMonths: number;
  };
  community: {
    verifiedGroupMemberships: number;
    verifiedMeetings: number;
    positiveReviews: number;
    negativeReviews: number;
    groupHistoryScore: number;
    confirmedFraudReports: number;
  };
}

export interface TrustScoreResult {
  score: number;
  identityComponent: number;
  transactionComponent: number;
  communityComponent: number;
  penalties: number;
  band: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
}

function clamp(value: number, min = 0, max = 1000): number {
  return Math.min(max, Math.max(min, value));
}

function safeRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function calculateTrustScore(input: TrustInputs): TrustScoreResult {
  const identityComponent = clamp(
    (input.identity.phoneVerified ? 150 : 0) +
      (input.identity.kycVerified ? 650 : 0) +
      clamp(input.identity.providerConfidence * 150) +
      (input.identity.manualReviewPassed ? 50 : 0),
  );

  const obligationSuccessRate = safeRatio(
    input.transactions.successfulContributions + input.transactions.successfulRepayments,
    Math.max(1, input.transactions.expectedObligations),
  );

  const transactionConsistency = clamp(obligationSuccessRate * 700);
  const activityBonus = clamp(input.transactions.activeMonths * 20, 0, 200);
  const transactionPenalties =
    input.transactions.failedTransactions * 25 +
    input.transactions.reversedTransactions * 50 +
    input.transactions.lateRepayments * 35;

  const transactionComponent = clamp(
    transactionConsistency + activityBonus - transactionPenalties,
  );

  const reviewTotal = input.community.positiveReviews + input.community.negativeReviews;

  const reviewScore =
    reviewTotal === 0
      ? 500
      : clamp((input.community.positiveReviews / reviewTotal) * 1000);

  const meetingScore = clamp(input.community.verifiedMeetings * 25);
  const membershipScore = clamp(input.community.verifiedGroupMemberships * 75);

  const communityComponent = clamp(
    reviewScore * 0.4 +
      meetingScore * 0.2 +
      membershipScore * 0.1 +
      input.community.groupHistoryScore * 0.3,
  );

  const penalties = clamp(input.community.confirmedFraudReports * 250, 0, 800);

  const rawScore =
    identityComponent * 0.4 +
    transactionComponent * 0.3 +
    communityComponent * 0.3 -
    penalties;

  const score = Math.round(clamp(rawScore));

  let band: TrustScoreResult['band'];

  if (score < 250) band = 'VERY_LOW';
  else if (score < 450) band = 'LOW';
  else if (score < 650) band = 'MODERATE';
  else if (score < 850) band = 'HIGH';
  else band = 'VERY_HIGH';

  return {
    score,
    identityComponent: Math.round(identityComponent),
    transactionComponent: Math.round(transactionComponent),
    communityComponent: Math.round(communityComponent),
    penalties: Math.round(penalties),
    band,
  };
}
