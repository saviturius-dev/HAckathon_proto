import React, { useState } from 'react';
import { BarChart3, BookOpen, Play, RotateCcw } from 'lucide-react';
import {
  CATEGORY_LABELS,
  FIFTY_QUESTION_BANK,
  QuestionCategoryId,
  SHOPPER_PROFILES,
  ShopperProfile,
  TIER_METADATA,
  TierNumber,
} from '../data/rlQuestions';
import { BanditAlgorithm, RLPolicyState } from '../rl/banditEngine';
import { soundEngine } from '../utils/sound';

interface RLPolicyLabProps {
  policy: RLPolicyState;
  selectedProfile: ShopperProfile;
  onChangeAlgorithm: (algo: BanditAlgorithm) => void;
  onSimulateBatch: () => void;
  onResetPolicy: () => void;
}

export const RLPolicyLab: React.FC<RLPolicyLabProps> = ({
  policy,
  selectedProfile,
  onChangeAlgorithm,
  onSimulateBatch,
  onResetPolicy,
}) => {
  const [inspectProfile, setInspectProfile] = useState<ShopperProfile>(selectedProfile);
  const [bankTierFilter, setBankTierFilter] = useState<TierNumber>(1);
  const [bankCategoryFilter, setBankCategoryFilter] = useState<QuestionCategoryId | 'all'>('all');
  const [resetArmed, setResetArmed] = useState(false);

  const profileArms = Object.values(policy.categoryArms)
    .filter((a) => a.profile === inspectProfile)
    .sort((a, b) => {
      const rateA = a.alpha / (a.alpha + a.beta);
      const rateB = b.alpha / (b.alpha + b.beta);
      return rateB - rateA;
    });

  const tierList = Object.values(policy.tierArms).sort((a, b) => a.tier - b.tier);

  const filteredQuestions = FIFTY_QUESTION_BANK.filter((q) => {
    if (q.tier !== bankTierFilter) return false;
    if (bankCategoryFilter !== 'all' && q.category !== bankCategoryFilter) return false;
    return true;
  });

  const conversionRate =
    policy.totalEpisodes > 0
      ? ((policy.totalAiPcWins / policy.totalEpisodes) * 100).toFixed(1)
      : '0.0';

  const handleResetClick = () => {
    if (!resetArmed) {
      soundEngine.playClick();
      setResetArmed(true);
      return;
    }
    soundEngine.playClick();
    setResetArmed(false);
    onResetPolicy();
  };

  return (
    <section aria-labelledby="rl-lab-heading" className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded px-2.5 py-1 bg-[#78A890] text-[#1E131D] text-xs font-mono font-bold">
            <span>50-Question Thompson Sampling Engine</span>
            <span aria-hidden="true">·</span>
            <span>8 Categories × 5 Tiers</span>
          </div>
          <h2 id="rl-lab-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E131D]">
            RL Policy Lab &amp; 50-Question Persuasion Bank
          </h2>
          <p className="text-sm sm:text-base text-[#4A2545] leading-relaxed">
            Tracks Beta(α, β) posterior distributions across all 8 persuasive categories and 5
            escalation tiers. Choosing an Intel AI PC (+1.0) raises α; choosing a Normal PC (0.0)
            raises β so the policy automatically shifts toward stronger angles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playWin();
              onSimulateBatch();
            }}
            className="px-4 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#D98A6C] text-[#1E131D] text-xs font-bold hover:bg-[#4A2545] hover:text-[#F4EFE6] cursor-pointer inline-flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Simulate 10 Walk-Ins</span>
          </button>

          <button
            type="button"
            onClick={handleResetClick}
            onBlur={() => setResetArmed(false)}
            className={`px-4 py-2.5 min-h-[44px] rounded-md border-2 text-xs font-bold cursor-pointer inline-flex items-center gap-2 whitespace-nowrap transition-colors ${
              resetArmed
                ? 'border-[#1E131D] bg-[#1E131D] text-[#D98A6C]'
                : 'border-[#1E131D] bg-[#F4EFE6] text-[#1E131D] hover:bg-[#4A2545] hover:text-[#F4EFE6]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{resetArmed ? 'Confirm Reset Weights' : 'Reset Weights'}</span>
          </button>
        </div>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border-2 border-[#1E131D] bg-[#4A2545] p-5 space-y-1 text-[#F4EFE6]">
          <div className="text-xs font-mono text-[#F4EFE6]/80">Total Walk-In Episodes</div>
          <div className="text-3xl font-extrabold font-display tabular-nums">
            {policy.totalEpisodes}
          </div>
        </div>

        <div className="rounded-xl border-2 border-[#1E131D] bg-[#4A2545] p-5 space-y-1 text-[#F4EFE6]">
          <div className="text-xs font-mono text-[#F4EFE6]/80">Intel AI PC Wins (+1.0)</div>
          <div className="text-3xl font-extrabold font-display text-[#78A890] tabular-nums">
            {policy.totalAiPcWins}
          </div>
        </div>

        <div className="rounded-xl border-2 border-[#1E131D] bg-[#D98A6C] p-5 space-y-1 text-[#1E131D]">
          <div className="text-xs font-mono font-bold">AI PC Conversion Rate</div>
          <div className="text-3xl font-extrabold font-display tabular-nums">
            {conversionRate}%
          </div>
        </div>

        <div className="rounded-xl border-2 border-[#1E131D] bg-[#4A2545] p-5 space-y-2.5 text-[#F4EFE6]">
          <div className="text-xs font-mono text-[#F4EFE6]/80">Bandit Policy</div>
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#1E131D] border border-[#F4EFE6]/15">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onChangeAlgorithm('thompson');
              }}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                policy.algorithm === 'thompson'
                  ? 'bg-[#D98A6C] text-[#1E131D]'
                  : 'text-[#F4EFE6]/80 hover:text-[#F4EFE6]'
              }`}
            >
              Thompson
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onChangeAlgorithm('ucb1');
              }}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                policy.algorithm === 'ucb1'
                  ? 'bg-[#D98A6C] text-[#1E131D]'
                  : 'text-[#F4EFE6]/80 hover:text-[#F4EFE6]'
              }`}
            >
              UCB1
            </button>
          </div>
        </div>
      </div>

      {/* Tier Posteriors Overview (5 Progressive Tiers) */}
      <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-5 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-[#1E131D]">
          5-Tier Persuasion Escalation Posteriors
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {tierList.map((t) => {
            const exp = ((t.alpha / (t.alpha + t.beta)) * 100).toFixed(1);
            return (
              <div
                key={t.tier}
                className="rounded-lg border border-[#1E131D]/30 bg-[#F4EFE6] p-4 space-y-2"
              >
                <div className="text-xs font-mono font-bold text-[#4A2545]">{t.name}</div>
                <div className="text-2xl font-extrabold font-display text-[#1E131D] tabular-nums">
                  {exp}%
                </div>
                <div className="text-[11px] font-mono text-[#4A2545] tabular-nums">
                  α={t.alpha.toFixed(1)} · β={t.beta.toFixed(1)} · {t.impressions} runs
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Arm Weights Table by Shopper Profile */}
      <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#4A2545]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[#1E131D]">
              8 Category Posteriors by Shopper Profile
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter arms by profile">
            {SHOPPER_PROFILES.map((p) => {
              const active = inspectProfile === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setInspectProfile(p.id);
                  }}
                  className={`px-3 py-1.5 min-h-[36px] rounded-md text-xs font-bold cursor-pointer transition-colors whitespace-nowrap border ${
                    active
                      ? 'bg-[#4A2545] text-[#F4EFE6] border-[#1E131D]'
                      : 'bg-[#F4EFE6] text-[#4A2545] border-[#1E131D]/30 hover:bg-[#4A2545] hover:text-[#F4EFE6]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-[#1E131D] text-xs font-mono text-[#4A2545]">
                <th className="py-3 pr-4">Category Tag</th>
                <th className="py-3 pr-4 text-right tabular-nums">Impressions</th>
                <th className="py-3 pr-4 text-right tabular-nums">Conversions</th>
                <th className="py-3 pr-4 text-right tabular-nums">α (Win)</th>
                <th className="py-3 pr-4 text-right tabular-nums">β (Miss)</th>
                <th className="py-3 text-right tabular-nums">Expected Conv.</th>
              </tr>
            </thead>
            <tbody>
              {profileArms.map((arm) => {
                const estRate = (arm.alpha / (arm.alpha + arm.beta)) * 100;
                return (
                  <tr
                    key={arm.armKey}
                    className="border-b border-[#1E131D]/15 hover:bg-[#4A2545]/10 transition-colors"
                  >
                    <td className="py-3 pr-4 font-bold text-[#1E131D]">{arm.categoryLabel}</td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-[#1E131D]">
                      {arm.impressions}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-[#1E131D]">
                      {arm.conversions}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums font-bold text-[#2F5E48]">
                      {arm.alpha.toFixed(1)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums font-bold text-[#9C3E24]">
                      {arm.beta.toFixed(1)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      <div className="inline-flex items-center gap-2.5">
                        <div className="w-20 h-2 rounded border border-[#1E131D]/40 bg-[#EAE2D3] overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#78A890]"
                            style={{ width: `${Math.min(100, estRate)}%` }}
                          />
                        </div>
                        <span className="text-[#1E131D] font-bold">{estRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 50-Question Bank Inspector (All 5 Tiers × 10 Questions) */}
      <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4A2545]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[#1E131D]">
              Full 50-Question Persuasion Bank ({FIFTY_QUESTION_BANK.length} Total)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TIER_METADATA.map((t) => {
              const active = bankTierFilter === t.tier;
              return (
                <button
                  key={t.tier}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setBankTierFilter(t.tier);
                  }}
                  className={`px-3 py-1.5 min-h-[36px] rounded-md text-xs font-bold cursor-pointer border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#4A2545] text-[#F4EFE6] border-[#1E131D]'
                      : 'bg-[#F4EFE6] text-[#4A2545] border-[#1E131D]/30 hover:bg-[#4A2545] hover:text-[#F4EFE6]'
                  }`}
                >
                  Tier {t.tier} (10)
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filter row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBankCategoryFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer border ${
              bankCategoryFilter === 'all'
                ? 'bg-[#78A890] text-[#1E131D] border-[#1E131D]'
                : 'bg-[#F4EFE6] text-[#4A2545] border-[#1E131D]/25'
            }`}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORY_LABELS) as QuestionCategoryId[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setBankCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer border ${
                bankCategoryFilter === cat
                  ? 'bg-[#78A890] text-[#1E131D] border-[#1E131D]'
                  : 'bg-[#F4EFE6] text-[#4A2545] border-[#1E131D]/25'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-[#1E131D]/25 bg-[#F4EFE6] p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="font-bold text-[#4A2545]">
                  {q.id.toUpperCase()} · {CATEGORY_LABELS[q.category]}
                </span>
                <span className="text-[#4A2545]">
                  Tier {q.tier} · Q{q.indexInTier}/10
                </span>
              </div>
              <div className="text-sm font-bold text-[#1E131D]">{q.question}</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
                <div className="rounded bg-[#FAF6EE] border border-[#1E131D]/20 p-3 space-y-1.5">
                  <div className="font-mono font-bold text-[#2F5E48]">Option A (Pro AI)</div>
                  <p className="text-[#1E131D]">{q.optionA.label}</p>
                  <p className="text-[#4A2545] italic">Side Note: {q.optionA.sideNote}</p>
                </div>
                <div className="rounded bg-[#FAF6EE] border border-[#1E131D]/20 p-3 space-y-1.5">
                  <div className="font-mono font-bold text-[#9C3E24]">Option B (Normal)</div>
                  <p className="text-[#1E131D]">{q.optionB.label}</p>
                  <p className="text-[#4A2545] italic">Side Note: {q.optionB.sideNote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Episode Reward Log */}
      <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1E131D]">Recent Walk-In Episode Log</h3>
          <span className="text-xs font-mono text-[#4A2545] tabular-nums">
            Showing latest {Math.min(10, policy.episodes.length)} episodes
          </span>
        </div>

        {policy.episodes.length === 0 ? (
          <p className="text-sm text-[#4A2545]">
            No episodes recorded yet. Complete a Live Session or click &ldquo;Simulate 10
            Walk-Ins&rdquo; above to watch the Contextual Bandit update its policy weights.
          </p>
        ) : (
          <div className="space-y-2.5">
            {policy.episodes.slice(0, 10).map((ep) => (
              <div
                key={ep.id}
                className="rounded-lg bg-[#F4EFE6] border border-[#1E131D]/25 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 font-bold ${
                        ep.reward === 1
                          ? 'bg-[#78A890] text-[#1E131D]'
                          : 'bg-[#4A2545] text-[#F4EFE6]'
                      }`}
                    >
                      {ep.finalChoice === 'ai_pc' ? 'AI PC (+1.0)' : 'Normal PC (0.0)'}
                    </span>
                    <span aria-hidden="true" className="text-[#4A2545]">
                      ·
                    </span>
                    <span className="text-[#1E131D] font-bold capitalize">{ep.profile}</span>
                    <span aria-hidden="true" className="text-[#4A2545]">
                      ·
                    </span>
                    <span className="text-[#4A2545] tabular-nums">
                      Peak Tier {ep.peakIntensityReached} · Normie picks:{' '}
                      {ep.normieSelectionsInSession}/{ep.steps.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A2545]">{ep.policyNote}</p>
                </div>

                <div className="text-[11px] font-mono font-bold text-[#4A2545] shrink-0">
                  {ep.algorithm === 'thompson' ? 'Thompson' : 'UCB1'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
