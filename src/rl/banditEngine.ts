import {
  BankQuestion,
  CATEGORY_LABELS,
  FIFTY_QUESTION_BANK,
  QuestionCategoryId,
  ShopperProfile,
  TIER_METADATA,
  TierNumber,
} from '../data/rlQuestions';

export type BanditAlgorithm = 'thompson' | 'ucb1';

export interface CategoryArmStats {
  armKey: string; // `${profile}::${category}`
  profile: ShopperProfile;
  category: QuestionCategoryId;
  categoryLabel: string;
  alpha: number;
  beta: number;
  impressions: number;
  conversions: number;
}

export interface TierArmStats {
  tier: TierNumber;
  name: string;
  alpha: number;
  beta: number;
  impressions: number;
  conversions: number;
}

export interface SessionQuestionStep {
  questionId: string;
  tier: TierNumber;
  effectiveIntensityTier: TierNumber;
  category: QuestionCategoryId;
  categoryLabel: string;
  userOptionPicked: 'ai_pc' | 'normal_pc';
  sideNoteShown: string;
  rlReason: string;
}

export interface EpisodeRecord {
  id: string;
  timestamp: number;
  profile: ShopperProfile;
  algorithm: BanditAlgorithm;
  finalChoice: 'ai_pc' | 'normal_pc';
  reward: number; // 1.0 or 0.0
  normieSelectionsInSession: number;
  peakIntensityReached: TierNumber;
  steps: SessionQuestionStep[];
  policyNote: string;
}

export interface RLPolicyState {
  algorithm: BanditAlgorithm;
  totalEpisodes: number;
  totalAiPcWins: number;
  categoryArms: Record<string, CategoryArmStats>;
  tierArms: Record<number, TierArmStats>;
  episodes: EpisodeRecord[];
}

export interface SelectedBankAction {
  question: BankQuestion;
  scheduledTier: TierNumber;
  effectiveIntensityTier: TierNumber;
  scoreUsed: number;
  reason: string;
}

const STORAGE_KEY = 'intel_aipc_rl_50q_v2';

const ALL_CATEGORIES: QuestionCategoryId[] = [
  'battery_portability',
  'productivity_multitasking',
  'privacy_security',
  'cost_value',
  'creative_work',
  'hardware_compatibility',
  'future_proofing',
  'social_proof',
];

const ALL_PROFILES: ShopperProfile[] = ['student', 'creator', 'gamer', 'professional'];

function sampleStandardNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function sampleGamma(shape: number): number {
  if (shape < 1) {
    return sampleGamma(1 + shape) * Math.pow(Math.random(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const x = sampleStandardNormal();
    let v = 1 + c * x;
    if (v <= 0) continue;
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function sampleBeta(alpha: number, beta: number): number {
  const x = sampleGamma(Math.max(0.1, alpha));
  const y = sampleGamma(Math.max(0.1, beta));
  return x / (x + y);
}

export function buildCategoryArmKey(
  profile: ShopperProfile,
  category: QuestionCategoryId
): string {
  return `${profile}::${category}`;
}

export function createInitialPolicyState(): RLPolicyState {
  const categoryArms: Record<string, CategoryArmStats> = {};
  for (const profile of ALL_PROFILES) {
    for (const category of ALL_CATEGORIES) {
      const key = buildCategoryArmKey(profile, category);
      categoryArms[key] = {
        armKey: key,
        profile,
        category,
        categoryLabel: CATEGORY_LABELS[category],
        alpha: 1.0,
        beta: 1.0,
        impressions: 0,
        conversions: 0,
      };
    }
  }

  const tierArms: Record<number, TierArmStats> = {};
  for (const meta of TIER_METADATA) {
    tierArms[meta.tier] = {
      tier: meta.tier,
      name: meta.name,
      alpha: 1.0,
      beta: 1.0,
      impressions: 0,
      conversions: 0,
    };
  }

  return {
    algorithm: 'thompson',
    totalEpisodes: 0,
    totalAiPcWins: 0,
    categoryArms,
    tierArms,
    episodes: [],
  };
}

export function loadPolicyState(): RLPolicyState {
  if (typeof window === 'undefined') return createInitialPolicyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialPolicyState();
    const parsed = JSON.parse(raw) as RLPolicyState;
    if (!parsed || !parsed.categoryArms || !parsed.tierArms) {
      return createInitialPolicyState();
    }
    return parsed;
  } catch {
    return createInitialPolicyState();
  }
}

export function savePolicyState(state: RLPolicyState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues
  }
}

/**
 * Computes the adaptive persuasion intensity tier (1..5) based on current base tier
 * and the shopper's previous answers (if they lean Normal Laptop, intensity escalates).
 */
export function computeAdaptiveIntensityTier(
  scheduledTier: TierNumber,
  normieSelectionsSoFar: number,
  lastAnswerWasNormie: boolean
): TierNumber {
  if (scheduledTier === 1) return 1; // Tier 1 is always Basic Gauging
  let boost = 0;
  if (lastAnswerWasNormie) boost += 1;
  if (normieSelectionsSoFar >= 2 && scheduledTier < 5) boost += 1;
  const escalated = Math.min(5, scheduledTier + boost) as TierNumber;
  return escalated;
}

export function selectNextTierQuestion(
  policy: RLPolicyState,
  profile: ShopperProfile,
  scheduledTier: TierNumber,
  usedQuestionIds: string[],
  normieSelectionsSoFar: number,
  lastAnswerWasNormie: boolean
): SelectedBankAction | null {
  const effectiveIntensityTier = computeAdaptiveIntensityTier(
    scheduledTier,
    normieSelectionsSoFar,
    lastAnswerWasNormie
  );

  let pool = FIFTY_QUESTION_BANK.filter(
    (q) => q.tier === effectiveIntensityTier && !usedQuestionIds.includes(q.id)
  );
  if (pool.length === 0) {
    pool = FIFTY_QUESTION_BANK.filter(
      (q) => q.tier === scheduledTier && !usedQuestionIds.includes(q.id)
    );
  }
  if (pool.length === 0) {
    pool = FIFTY_QUESTION_BANK.filter((q) => !usedQuestionIds.includes(q.id));
  }
  if (pool.length === 0) return null;

  const totalProfilePulls = Object.values(policy.categoryArms)
    .filter((a) => a.profile === profile)
    .reduce((sum, a) => sum + a.impressions, 0);

  // Score each available category via Thompson Sampling or UCB1
  const categoryScores: Partial<Record<QuestionCategoryId, number>> = {};
  const availableCategories = Array.from(new Set(pool.map((q) => q.category)));

  for (const cat of availableCategories) {
    const key = buildCategoryArmKey(profile, cat);
    const arm = policy.categoryArms[key];
    if (!arm) continue;

    let score = 0;
    if (policy.algorithm === 'thompson') {
      score = sampleBeta(arm.alpha, arm.beta);
    } else {
      const mean = arm.alpha / (arm.alpha + arm.beta);
      const explore = Math.sqrt(
        (1.6 * Math.log(Math.max(2, totalProfilePulls + 2))) /
          Math.max(1, arm.impressions + 1)
      );
      score = mean + explore;
    }

    // If shopper leaned Normal PC previously, boost high-leverage persuasion categories
    if (normieSelectionsSoFar >= 1) {
      if (cat === 'privacy_security' || cat === 'future_proofing' || cat === 'cost_value') {
        score += 0.14;
      }
    }

    categoryScores[cat] = score;
  }

  let winningCategory = availableCategories[0];
  let bestScore = -1;
  for (const cat of availableCategories) {
    const sc = categoryScores[cat] ?? 0;
    if (sc > bestScore) {
      bestScore = sc;
      winningCategory = cat;
    }
  }

  const matching = pool.filter((q) => q.category === winningCategory);
  const chosenQuestion = matching[Math.floor(Math.random() * matching.length)] ?? pool[0];

  const winArm = policy.categoryArms[buildCategoryArmKey(profile, chosenQuestion.category)];
  const escalatedText =
    effectiveIntensityTier > scheduledTier
      ? `Escalated to Tier ${effectiveIntensityTier} intensity after prior Normal PC choice`
      : `${policy.algorithm === 'thompson' ? 'Thompson' : 'UCB1'} (${winArm.alpha.toFixed(1)}α/${winArm.beta.toFixed(1)}β)`;

  return {
    question: chosenQuestion,
    scheduledTier,
    effectiveIntensityTier,
    scoreUsed: bestScore,
    reason: escalatedText,
  };
}

export function updatePolicyWithReward(
  policy: RLPolicyState,
  params: {
    profile: ShopperProfile;
    finalChoice: 'ai_pc' | 'normal_pc';
    steps: SessionQuestionStep[];
  }
): RLPolicyState {
  const reward = params.finalChoice === 'ai_pc' ? 1.0 : 0.0;
  const nextCategoryArms: Record<string, CategoryArmStats> = { ...policy.categoryArms };
  const nextTierArms: Record<number, TierArmStats> = { ...policy.tierArms };

  const uniqueCategories = Array.from(new Set(params.steps.map((s) => s.category)));
  const uniqueTiers = Array.from(new Set(params.steps.map((s) => s.effectiveIntensityTier)));

  for (const cat of uniqueCategories) {
    const key = buildCategoryArmKey(params.profile, cat);
    const existing = nextCategoryArms[key];
    if (!existing) continue;
    nextCategoryArms[key] = {
      ...existing,
      impressions: existing.impressions + 1,
      conversions: existing.conversions + (reward === 1.0 ? 1 : 0),
      alpha: existing.alpha + (reward === 1.0 ? 1.0 : 0),
      beta: existing.beta + (reward === 0.0 ? 1.0 : 0),
    };
  }

  for (const t of uniqueTiers) {
    const existing = nextTierArms[t];
    if (!existing) continue;
    nextTierArms[t] = {
      ...existing,
      impressions: existing.impressions + 1,
      conversions: existing.conversions + (reward === 1.0 ? 1 : 0),
      alpha: existing.alpha + (reward === 1.0 ? 1.0 : 0),
      beta: existing.beta + (reward === 0.0 ? 1.0 : 0),
    };
  }

  const normieCount = params.steps.filter((s) => s.userOptionPicked === 'normal_pc').length;
  const peakIntensityReached = params.steps.reduce<TierNumber>(
    (max, s) => (s.effectiveIntensityTier > max ? s.effectiveIntensityTier : max),
    1
  );

  const catNames = uniqueCategories
    .slice(0, 3)
    .map((c) => CATEGORY_LABELS[c])
    .join(', ');

  const policyNote =
    reward === 1.0
      ? `Reward +1.0: Boosted α for ${catNames} across Tiers ${uniqueTiers.join(', ')} (${params.profile}).`
      : `Reward 0.0: Incremented β for ${catNames}; Thompson Sampling will pivot toward stronger persuasion paths next.`;

  const episode: EpisodeRecord = {
    id: `ep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    profile: params.profile,
    algorithm: policy.algorithm,
    finalChoice: params.finalChoice,
    reward,
    normieSelectionsInSession: normieCount,
    peakIntensityReached,
    steps: params.steps,
    policyNote,
  };

  return {
    ...policy,
    totalEpisodes: policy.totalEpisodes + 1,
    totalAiPcWins: policy.totalAiPcWins + (reward === 1.0 ? 1 : 0),
    categoryArms: nextCategoryArms,
    tierArms: nextTierArms,
    episodes: [episode, ...policy.episodes].slice(0, 50),
  };
}

export function simulateWalkInBatch(policy: RLPolicyState, count = 10): RLPolicyState {
  let current = policy;

  for (let i = 0; i < count; i++) {
    const profile = ALL_PROFILES[i % ALL_PROFILES.length];
    const usedIds: string[] = [];
    const steps: SessionQuestionStep[] = [];
    let normieCount = 0;
    let lastWasNormie = false;
    let persuasionScore = 0;

    for (const tier of [1, 2, 3, 4, 5] as TierNumber[]) {
      const action = selectNextTierQuestion(
        current,
        profile,
        tier,
        usedIds,
        normieCount,
        lastWasNormie
      );
      if (!action) break;

      usedIds.push(action.question.id);

      // Realistic shopper propensity model:
      // High-leverage persuasion categories & escalated tiers convert skeptical shoppers more effectively
      const isHighLeverage =
        action.question.category === 'privacy_security' ||
        action.question.category === 'future_proofing' ||
        action.question.category === 'battery_portability';
      const aiProb = isHighLeverage ? 0.68 : 0.48;
      const pickedAi = Math.random() < aiProb;

      if (!pickedAi) {
        normieCount += 1;
        lastWasNormie = true;
      } else {
        lastWasNormie = false;
        persuasionScore += 0.14;
      }

      if (action.effectiveIntensityTier >= 4) {
        persuasionScore += 0.1;
      }

      steps.push({
        questionId: action.question.id,
        tier: action.question.tier,
        effectiveIntensityTier: action.effectiveIntensityTier,
        category: action.question.category,
        categoryLabel: CATEGORY_LABELS[action.question.category],
        userOptionPicked: pickedAi ? 'ai_pc' : 'normal_pc',
        sideNoteShown: pickedAi
          ? action.question.optionA.sideNote
          : action.question.optionB.sideNote,
        rlReason: action.reason,
      });
    }

    const finalConversionProb = Math.min(0.92, Math.max(0.18, 0.34 + persuasionScore));
    const finalChoice: 'ai_pc' | 'normal_pc' =
      Math.random() < finalConversionProb ? 'ai_pc' : 'normal_pc';

    current = updatePolicyWithReward(current, {
      profile,
      finalChoice,
      steps,
    });
  }

  return current;
}
