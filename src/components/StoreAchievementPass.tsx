import React, { useMemo, useState } from 'react';
import { Award, Clock, Copy, Download, Gift, Lock, Sparkles } from 'lucide-react';
import { ShopperProfile, StoreName } from '../data/rlQuestions';
import { EpisodeRecord } from '../rl/banditEngine';
import { soundEngine } from '../utils/sound';

interface StoreAchievementPassProps {
  storeName: StoreName;
  profile: ShopperProfile;
  latestAiWinEpisode: EpisodeRecord | null;
  onStartSession: () => void;
}

const STORE_HINTS: Record<StoreName, string> = {
  'Reliance Digital': 'Show at the Intel AI PC Demo Table or Billing Desk',
  Croma: 'Present to the Croma Intel Brand Specialist',
  'Vijay Sales': 'Redeem with your Vijay Sales Floor Advisor',
};

export const StoreAchievementPass: React.FC<StoreAchievementPassProps> = ({
  storeName,
  profile,
  latestAiWinEpisode,
  onStartSession,
}) => {
  const [copied, setCopied] = useState(false);

  const passCode = useMemo(() => {
    const prefix =
      storeName === 'Reliance Digital' ? 'RD' : storeName === 'Croma' ? 'CR' : 'VS';
    return `INTEL-${prefix}-AI27`;
  }, [storeName]);

  const buildPassText = () => {
    const pathList = latestAiWinEpisode
      ? latestAiWinEpisode.steps
          .map((s, idx) => `${idx + 1}. [Tier ${s.effectiveIntensityTier}] ${s.categoryLabel} (${s.questionId})`)
          .join('\n')
      : '';
    return [
      `INTEL® CORE™ ULTRA AI PC — GAME ACHIEVEMENT CARD`,
      `Store: ${storeName}`,
      `Shopper Profile: ${profile}`,
      `Pass Code: ${passCode}`,
      ``,
      `Special In-Store Offer:`,
      `Present your Game Achievement Card to an Intel / Store Representative at this point to receive a complimentary VIP add-on / gaming bag for your Intel AI PC today.`,
      ``,
      `5-Tier Persuasion Path:`,
      pathList,
    ].join('\n');
  };

  const handleCopy = async () => {
    soundEngine.playClick();
    try {
      await navigator.clipboard.writeText(buildPassText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownload = () => {
    soundEngine.playWin();
    const blob = new Blob([buildPassText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intel-ai-pc-vip-pass-${passCode.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-labelledby="pass-heading" className="space-y-8">
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded px-2.5 py-1 bg-[#78A890] text-[#1E131D] text-xs font-mono font-bold">
          <span>In-Store Game Achievement Card</span>
          <span aria-hidden="true">·</span>
          <span>{storeName}</span>
        </div>
        <h2 id="pass-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E131D]">
          {latestAiWinEpisode
            ? 'Thank You for Engaging. Your VIP Store Card Is Ready.'
            : 'Complete a 5-Tier Session & Choose Intel AI PC to Unlock Your VIP Pass.'}
        </h2>
      </div>

      {!latestAiWinEpisode ? (
        <div className="rounded-xl border-2 border-[#1E131D] bg-[#FAF6EE] p-8 text-center space-y-5">
          <Lock className="w-10 h-10 text-[#4A2545] mx-auto" aria-hidden="true" />
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-[#1E131D]">VIP Store Pass Locked</h3>
            <p className="text-sm text-[#4A2545]">
              Complete the progressive 5-tier session and select the Intel Core Ultra AI PC at the
              final computing decision screen to unlock your in-store offer.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartSession}
            className="px-5 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#D98A6C] text-[#1E131D] text-xs font-bold cursor-pointer hover:bg-[#4A2545] hover:text-[#F4EFE6] transition-colors"
          >
            Start Live Session
          </button>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-[#1E131D] bg-[#D98A6C] p-6 sm:p-8 space-y-6 text-[#1E131D]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b-2 border-[#1E131D]/25 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1E131D]">
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>GAME ACHIEVEMENT CARD</span>
                <span aria-hidden="true">·</span>
                <span>{storeName.toUpperCase()}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E131D]">
                Intel® Core™ Ultra AI PC VIP Pass
              </h3>
              <p className="text-xs font-medium text-[#1E131D]/85">{STORE_HINTS[storeName]}</p>
            </div>

            <div className="rounded-lg bg-[#1E131D] border-2 border-[#1E131D] px-4 py-3 text-left sm:text-right shrink-0">
              <div className="text-[11px] font-mono text-[#F4EFE6]/75">PASS CODE</div>
              <div className="text-lg font-mono font-bold text-[#78A890] tabular-nums">
                {passCode}
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-[#1E131D] bg-[#F4EFE6] p-5 space-y-3 text-[#1E131D]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded px-2.5 py-0.5 bg-[#78A890] text-[#1E131D] text-xs font-mono font-bold">
                <Gift className="w-3.5 h-3.5" aria-hidden="true" />
                <span>SPECIAL IN-STORE OFFER</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#4A2545]">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Valid Today Only · Limited VIP Stock</span>
              </div>
            </div>

            <p className="text-base sm:text-lg font-bold text-[#1E131D] leading-relaxed">
              Special In-Store Offer: Present your Game Achievement Card to an Intel / Store
              Representative at this point to receive a complimentary VIP add-on / gaming bag for
              your Intel AI PC today.
            </p>
          </div>

          <div className="rounded-lg border-2 border-[#1E131D] bg-[#4A2545] p-4 space-y-2 text-[#F4EFE6]">
            <div className="text-xs font-mono font-bold text-[#78A890]">
              Personalized Priorities Confirmed
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {latestAiWinEpisode.steps.map((s, idx) => (
                <div
                  key={`${s.questionId}-${idx}`}
                  className="flex items-center gap-2 text-xs font-medium text-[#F4EFE6]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#78A890] shrink-0" aria-hidden="true" />
                  <span>
                    Tier {s.effectiveIntensityTier} · {s.categoryLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#1E131D] text-[#F4EFE6] text-xs font-bold hover:bg-[#4A2545] cursor-pointer inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Download className="w-4 h-4 text-[#78A890]" aria-hidden="true" />
              <span>Save Achievement Card</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#F4EFE6] text-[#1E131D] text-xs font-bold hover:bg-[#4A2545] hover:text-[#F4EFE6] cursor-pointer inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Copy className="w-4 h-4" aria-hidden="true" />
              <span>{copied ? 'Copied for Store Rep' : 'Copy Pass Details'}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
