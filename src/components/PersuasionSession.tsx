import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Info,
  Laptop,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  FINAL_DECISION_CHOICES,
  SHOPPER_PROFILES,
  ShopperProfile,
  StoreName,
  TIER_METADATA,
  TierNumber,
} from '../data/rlQuestions';
import {
  EpisodeRecord,
  RLPolicyState,
  SelectedBankAction,
  SessionQuestionStep,
  selectNextTierQuestion,
} from '../rl/banditEngine';
import { soundEngine } from '../utils/sound';

interface PersuasionSessionProps {
  storeName: StoreName;
  policy: RLPolicyState;
  profile: ShopperProfile;
  onChangeProfile: (profile: ShopperProfile) => void;
  onRecordEpisode: (params: {
    profile: ShopperProfile;
    finalChoice: 'ai_pc' | 'normal_pc';
    steps: SessionQuestionStep[];
  }) => EpisodeRecord;
  onOpenPolicyLab: () => void;
  onOpenStorePass: () => void;
}

function buildTierSchedule(questionsPerTier: 1 | 2): TierNumber[] {
  const tiers: TierNumber[] = [1, 2, 3, 4, 5];
  if (questionsPerTier === 1) return tiers;
  return tiers.flatMap((t) => [t, t]);
}

export const PersuasionSession: React.FC<PersuasionSessionProps> = ({
  storeName,
  policy,
  profile,
  onChangeProfile,
  onRecordEpisode,
  onOpenPolicyLab,
  onOpenStorePass,
}) => {
  const [questionsPerTier, setQuestionsPerTier] = useState<1 | 2>(1);
  const [phase, setPhase] = useState<'questions' | 'final_decision' | 'completed'>('questions');
  const [steps, setSteps] = useState<SessionQuestionStep[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [pendingOption, setPendingOption] = useState<'ai_pc' | 'normal_pc' | null>(null);
  const [lastEpisode, setLastEpisode] = useState<EpisodeRecord | null>(null);
  const [lockedAction, setLockedAction] = useState<SelectedBankAction | null>(() =>
    selectNextTierQuestion(policy, profile, 1, [], 0, false)
  );

  const schedule = useMemo(() => buildTierSchedule(questionsPerTier), [questionsPerTier]);
  const totalQuestions = schedule.length;

  const normieCount = steps.filter((s) => s.userOptionPicked === 'normal_pc').length;
  const lastWasNormie =
    steps.length > 0 && steps[steps.length - 1].userOptionPicked === 'normal_pc';
  const currentScheduledTier = schedule[Math.min(steps.length, schedule.length - 1)] ?? 1;

  const currentAction = useMemo(() => {
    if (lockedAction) return lockedAction;
    return selectNextTierQuestion(
      policy,
      profile,
      currentScheduledTier,
      usedQuestionIds,
      normieCount,
      lastWasNormie
    );
  }, [lockedAction, policy, profile, currentScheduledTier, usedQuestionIds, normieCount, lastWasNormie]);

  const startFreshSession = (
    nextProfile: ShopperProfile = profile,
    nextPerTier: 1 | 2 = questionsPerTier
  ) => {
    soundEngine.playClick();
    setQuestionsPerTier(nextPerTier);
    setPhase('questions');
    setSteps([]);
    setUsedQuestionIds([]);
    setPendingOption(null);
    setLastEpisode(null);
    setLockedAction(selectNextTierQuestion(policy, nextProfile, 1, [], 0, false));
  };

  const handleProfileSwitch = (nextProfile: ShopperProfile) => {
    onChangeProfile(nextProfile);
    startFreshSession(nextProfile, questionsPerTier);
  };

  const handleDepthSwitch = (perTier: 1 | 2) => {
    startFreshSession(profile, perTier);
  };

  const handleAnswerOption = (choice: 'ai_pc' | 'normal_pc') => {
    if (!currentAction || pendingOption !== null) return;
    soundEngine.playClick();
    setPendingOption(choice);
  };

  const handleContinueAfterSideNote = () => {
    if (!currentAction || !pendingOption) return;
    soundEngine.playClick();

    const chosenOption =
      pendingOption === 'ai_pc'
        ? currentAction.question.optionA
        : currentAction.question.optionB;

    const newStep: SessionQuestionStep = {
      questionId: currentAction.question.id,
      tier: currentAction.question.tier,
      effectiveIntensityTier: currentAction.effectiveIntensityTier,
      category: currentAction.question.category,
      categoryLabel: CATEGORY_LABELS[currentAction.question.category],
      userOptionPicked: pendingOption,
      sideNoteShown: chosenOption.sideNote,
      rlReason: currentAction.reason,
    };

    const updatedSteps = [...steps, newStep];
    const updatedUsedIds = [...usedQuestionIds, currentAction.question.id];
    const updatedNormieCount = updatedSteps.filter(
      (s) => s.userOptionPicked === 'normal_pc'
    ).length;
    const updatedLastWasNormie = pendingOption === 'normal_pc';

    setSteps(updatedSteps);
    setUsedQuestionIds(updatedUsedIds);
    setPendingOption(null);

    if (updatedSteps.length >= totalQuestions) {
      setLockedAction(null);
      setPhase('final_decision');
    } else {
      const nextScheduledTier = schedule[updatedSteps.length];
      const nextAction = selectNextTierQuestion(
        policy,
        profile,
        nextScheduledTier,
        updatedUsedIds,
        updatedNormieCount,
        updatedLastWasNormie
      );
      setLockedAction(nextAction);
    }
  };

  const handleFinalChoice = (finalChoice: 'ai_pc' | 'normal_pc') => {
    if (finalChoice === 'ai_pc') {
      soundEngine.playWin();
    } else {
      soundEngine.playClick();
    }

    const ep = onRecordEpisode({
      profile,
      finalChoice,
      steps,
    });
    setLastEpisode(ep);
    setPhase('completed');
  };

  const selectedOptionObj =
    currentAction && pendingOption
      ? pendingOption === 'ai_pc'
        ? currentAction.question.optionA
        : currentAction.question.optionB
      : null;

  const activeTierMeta = currentAction
    ? TIER_METADATA.find((t) => t.tier === currentAction.effectiveIntensityTier) ?? TIER_METADATA[0]
    : TIER_METADATA[0];

  return (
    <section aria-labelledby="session-heading" className="space-y-8">
      {/* Shopper Profile & Cycle Depth Controls (Secondary Plum Shadow Container) */}
      <div className="rounded-xl border-2 border-[#1E131D] bg-[#4A2545] p-5 sm:p-6 space-y-5 text-[#F4EFE6]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-[#78A890]">
              Environment State (S) · 5-Tier Adaptive Funnel
            </div>
            <h2 id="session-heading" className="text-lg font-bold text-[#F4EFE6] mt-0.5">
              Choose your profile &amp; cycle depth at {storeName}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#F4EFE6]/80">Cycle Depth:</span>
            <div className="inline-flex rounded-md bg-[#1E131D] p-1 border border-[#F4EFE6]/15">
              <button
                type="button"
                onClick={() => handleDepthSwitch(1)}
                className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  questionsPerTier === 1
                    ? 'bg-[#78A890] text-[#1E131D]'
                    : 'text-[#F4EFE6]/80 hover:text-[#F4EFE6]'
                }`}
              >
                5-Tier Quick (5 Qs)
              </button>
              <button
                type="button"
                onClick={() => handleDepthSwitch(2)}
                className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  questionsPerTier === 2
                    ? 'bg-[#78A890] text-[#1E131D]'
                    : 'text-[#F4EFE6]/80 hover:text-[#F4EFE6]'
                }`}
              >
                5-Tier Deep (10 Qs)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SHOPPER_PROFILES.map((item) => {
            const active = profile === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleProfileSwitch(item.id)}
                aria-pressed={active}
                className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer space-y-1 ${
                  active
                    ? 'bg-[#D98A6C] border-[#1E131D] text-[#1E131D]'
                    : 'bg-[#1E131D]/45 border-[#F4EFE6]/20 text-[#F4EFE6] hover:bg-[#1E131D]/75 hover:border-[#78A890]'
                }`}
              >
                <div className="text-sm font-bold">{item.label}</div>
                <p
                  className={`text-xs leading-snug ${
                    active ? 'text-[#1E131D]/85' : 'text-[#F4EFE6]/80'
                  }`}
                >
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PHASE 1: PROGRESSIVE 5-TIER QUESTION & SUBTLE SIDE NOTE FLOW */}
      {phase === 'questions' && currentAction && (
        <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-5 sm:p-8 space-y-6">
          {/* Tier Progression Strip (1 -> 5) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-[#4A2545]">
                Step {steps.length + 1} of {totalQuestions} · {activeTierMeta.name} ·{' '}
                {CATEGORY_LABELS[currentAction.question.category]}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 bg-[#78A890] text-[#1E131D] font-bold tabular-nums">
                {activeTierMeta.intensityLabel}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {TIER_METADATA.map((t) => {
                const isDoneTier = currentAction.scheduledTier > t.tier;
                const isCurrentTier = currentAction.effectiveIntensityTier === t.tier;
                return (
                  <div
                    key={t.tier}
                    className={`h-2.5 rounded border border-[#1E131D] transition-colors ${
                      isCurrentTier
                        ? 'bg-[#D98A6C]'
                        : isDoneTier
                        ? 'bg-[#78A890]'
                        : 'bg-[#EAE2D3]'
                    }`}
                    title={t.name}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#4A2545]">
              <span>RL Selection: {currentAction.reason}</span>
              <span className="tabular-nums">Bank ID: {currentAction.question.id.toUpperCase()}</span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1E131D] leading-snug">
              {currentAction.question.question}
            </h3>
            <p className="text-xs text-[#4A2545]">
              Choose whichever fits your real routine—there are no right or wrong answers.
            </p>
          </div>

          {/* Option A (Pro AI Laptop) vs Option B (Normal Laptop) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[currentAction.question.optionA, currentAction.question.optionB].map((opt, idx) => {
              const isSelected = pendingOption === opt.id;
              const isDimmed = pendingOption !== null && !isSelected;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={pendingOption !== null}
                  onClick={() => handleAnswerOption(opt.id)}
                  className={`group p-5 sm:p-6 rounded-lg border-2 text-left transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#4A2545] border-[#1E131D] text-[#F4EFE6]'
                      : isDimmed
                      ? 'bg-[#EAE2D3]/60 border-[#1E131D]/20 text-[#1E131D]/50'
                      : 'bg-[#F4EFE6] border-[#1E131D] text-[#1E131D] hover:bg-[#4A2545] hover:text-[#F4EFE6] cursor-pointer'
                  }`}
                >
                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between text-xs font-mono font-bold ${
                        isSelected
                          ? 'text-[#78A890]'
                          : isDimmed
                          ? 'text-[#4A2545]/50'
                          : 'text-[#4A2545] group-hover:text-[#78A890]'
                      }`}
                    >
                      <span>Option {idx === 0 ? 'A' : 'B'}</span>
                      <span>{opt.id === 'ai_pc' ? 'AI Laptop Path' : 'Normal Laptop Path'}</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold leading-relaxed">{opt.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Neutral Acknowledgment + Option-Specific Subtle Side Note */}
          {pendingOption && selectedOptionObj && (
            <div className="rounded-lg border-2 border-[#1E131D] bg-[#4A2545] p-5 sm:p-6 space-y-4 text-[#F4EFE6]">
              <div className="text-sm font-medium text-[#F4EFE6]">
                {selectedOptionObj.neutralAck}
              </div>

              <div className="rounded-md bg-[#1E131D] border border-[#78A890]/60 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#78A890]">
                  <Info className="w-3.5 h-3.5 shrink-0 animate-sage-spark" aria-hidden="true" />
                  <span>Side Note · {CATEGORY_LABELS[currentAction.question.category]}</span>
                </div>
                <p className="text-sm sm:text-base text-[#F4EFE6] leading-relaxed">
                  {selectedOptionObj.sideNote}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleContinueAfterSideNote}
                  className="px-5 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#D98A6C] text-[#1E131D] text-xs font-bold hover:bg-[#F4EFE6] cursor-pointer inline-flex items-center gap-2 whitespace-nowrap transition-colors"
                >
                  <span>
                    {steps.length + 1 >= totalQuestions
                      ? 'Go to Final Choice'
                      : 'Continue to Next Tier'}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: FINAL COMPUTING DECISION SCREEN */}
      {phase === 'final_decision' && (
        <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-5 sm:p-8 space-y-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center rounded px-2.5 py-1 bg-[#78A890] text-[#1E131D] text-xs font-mono font-bold">
              Final Computing Decision · RL Ground Truth Signal
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E131D]">
              Which laptop platform best fulfills your everyday study, work, and creative needs?
            </h3>
            <p className="text-sm text-[#4A2545] leading-relaxed">
              Your selection records the final reward signal ($R = 1.0$ or $0.0$) and updates our
              5-tier Thompson Sampling policy.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* CHOICE 1: INTEL CORE ULTRA AI PC */}
            <button
              type="button"
              onClick={() => handleFinalChoice('ai_pc')}
              className="group p-6 rounded-xl border-2 border-[#1E131D] bg-[#D98A6C] text-[#1E131D] text-left cursor-pointer hover:bg-[#4A2545] hover:text-[#F4EFE6] transition-all flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded px-2 py-0.5 bg-[#1E131D] text-[#78A890] text-xs font-mono font-bold">
                    CHOICE 1
                  </span>
                  <Cpu className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="text-xl font-extrabold">{FINAL_DECISION_CHOICES.aiPc.title}</div>
                <ul className="space-y-1.5 text-sm">
                  {FINAL_DECISION_CHOICES.aiPc.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-bold">
                <span>Choose Intel Core Ultra AI PC</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </button>

            {/* CHOICE 2: TRADITIONAL NORMAL LAPTOP */}
            <button
              type="button"
              onClick={() => handleFinalChoice('normal_pc')}
              className="group p-6 rounded-xl border-2 border-[#1E131D] bg-[#F4EFE6] text-[#1E131D] text-left cursor-pointer hover:bg-[#4A2545] hover:text-[#F4EFE6] transition-all flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#4A2545] group-hover:text-[#78A890]">
                    CHOICE 2
                  </span>
                  <Laptop
                    className="w-5 h-5 text-[#4A2545] group-hover:text-[#F4EFE6]"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-xl font-extrabold">
                  {FINAL_DECISION_CHOICES.normalPc.title}
                </div>
                <ul className="space-y-1.5 text-sm text-[#4A2545] group-hover:text-[#F4EFE6]/85">
                  {FINAL_DECISION_CHOICES.normalPc.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span aria-hidden="true">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#4A2545] group-hover:text-[#F4EFE6]">
                <span>Choose Traditional Normal Laptop</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: POLICY UPDATE SUMMARY */}
      {phase === 'completed' && lastEpisode && (
        <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#1E131D]/15 pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded px-2.5 py-1 bg-[#78A890] text-[#1E131D] text-xs font-mono font-bold">
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  RL Policy Updated · Reward R = {lastEpisode.reward.toFixed(1)} · Peak Tier{' '}
                  {lastEpisode.peakIntensityReached}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#1E131D]">
                {lastEpisode.finalChoice === 'ai_pc'
                  ? 'You Chose the Intel® Core™ Ultra AI PC'
                  : 'You Chose a Traditional Normal Laptop'}
              </h3>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              {lastEpisode.finalChoice === 'ai_pc' && (
                <button
                  type="button"
                  onClick={onOpenStorePass}
                  className="px-5 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#D98A6C] text-[#1E131D] text-xs font-bold hover:bg-[#4A2545] hover:text-[#F4EFE6] cursor-pointer inline-flex items-center gap-2 whitespace-nowrap transition-colors"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Claim VIP Store Pass</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenPolicyLab}
                className="px-4 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#F4EFE6] text-[#1E131D] text-xs font-bold hover:bg-[#4A2545] hover:text-[#F4EFE6] cursor-pointer whitespace-nowrap transition-colors"
              >
                Inspect 50-Q Policy Lab
              </button>
              <button
                type="button"
                onClick={() => startFreshSession()}
                className="px-4 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#4A2545] text-[#F4EFE6] text-xs font-bold hover:bg-[#1E131D] cursor-pointer inline-flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Next Walk-In</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border-2 border-[#1E131D] bg-[#4A2545] p-4 space-y-2 text-[#F4EFE6]">
            <div className="text-xs font-mono font-bold text-[#78A890]">
              Bayesian Posterior Update
            </div>
            <p className="text-sm leading-relaxed">{lastEpisode.policyNote}</p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-[#4A2545]">
              Tier-by-Tier Persuasion Trajectory
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {lastEpisode.steps.map((s, i) => (
                <div
                  key={`${s.questionId}-${i}`}
                  className="rounded-lg bg-[#F4EFE6] border border-[#1E131D]/30 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#4A2545]">
                    <span>Tier {s.effectiveIntensityTier}</span>
                    <span>{s.questionId.toUpperCase()}</span>
                  </div>
                  <div className="text-xs font-bold text-[#1E131D]">{s.categoryLabel}</div>
                  <div className="text-[11px] font-mono text-[#4A2545]">
                    Picked: {s.userOptionPicked === 'ai_pc' ? 'Pro AI' : 'Normal'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
