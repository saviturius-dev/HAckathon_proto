import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { STORES, ShopperProfile, StoreName } from './data/rlQuestions';
import {
  BanditAlgorithm,
  EpisodeRecord,
  RLPolicyState,
  SessionQuestionStep,
  createInitialPolicyState,
  loadPolicyState,
  savePolicyState,
  simulateWalkInBatch,
  updatePolicyWithReward,
} from './rl/banditEngine';
import { AppView, TopBar } from './components/TopBar';
import { PersuasionSession } from './components/PersuasionSession';
import { RLPolicyLab } from './components/RLPolicyLab';
import { StoreAchievementPass } from './components/StoreAchievementPass';
import { soundEngine } from './utils/sound';

export default function App() {
  const [selectedStore, setSelectedStore] = useState<StoreName>('Reliance Digital');
  const [selectedProfile, setSelectedProfile] = useState<ShopperProfile>('student');
  const [activeView, setActiveView] = useState<AppView>('session');
  const [sessionKey, setSessionKey] = useState<number>(1);
  const [muted, setMuted] = useState<boolean>(false);

  const [policy, setPolicy] = useState<RLPolicyState>(() => loadPolicyState());
  const [latestAiWinEpisode, setLatestAiWinEpisode] = useState<EpisodeRecord | null>(() => {
    const initial = loadPolicyState();
    return initial.episodes.find((e) => e.finalChoice === 'ai_pc') ?? null;
  });

  useEffect(() => {
    savePolicyState(policy);
  }, [policy]);

  const handleToggleMute = () => {
    const next = !muted;
    soundEngine.muted = next;
    setMuted(next);
    if (!next) soundEngine.playClick();
  };

  const handleSelectStore = (store: StoreName) => {
    soundEngine.playClick();
    setSelectedStore(store);
  };

  const handleSelectView = (view: AppView) => {
    soundEngine.playClick();
    setActiveView(view);
  };

  const handleStartNewSession = () => {
    soundEngine.playClick();
    setSessionKey((k) => k + 1);
    setActiveView('session');
  };

  const handleRecordEpisode = (params: {
    profile: ShopperProfile;
    finalChoice: 'ai_pc' | 'normal_pc';
    steps: SessionQuestionStep[];
  }): EpisodeRecord => {
    const updated = updatePolicyWithReward(policy, params);
    const createdEpisode = updated.episodes[0];
    setPolicy(updated);
    if (createdEpisode.finalChoice === 'ai_pc') {
      setLatestAiWinEpisode(createdEpisode);
    }
    return createdEpisode;
  };

  const handleChangeAlgorithm = (algo: BanditAlgorithm) => {
    setPolicy((prev) => ({ ...prev, algorithm: algo }));
  };

  const handleSimulateBatch = () => {
    setPolicy((prev) => {
      const next = simulateWalkInBatch(prev, 10);
      const winEp = next.episodes.find((e) => e.finalChoice === 'ai_pc');
      if (winEp) setLatestAiWinEpisode(winEp);
      return next;
    });
  };

  const handleResetPolicy = () => {
    const fresh = createInitialPolicyState();
    setPolicy(fresh);
    setLatestAiWinEpisode(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFE6] text-[#1E131D]">
      <TopBar
        activeView={activeView}
        onSelectView={handleSelectView}
        totalEpisodes={policy.totalEpisodes}
        passUnlocked={latestAiWinEpisode !== null}
        onStartNewSession={handleStartNewSession}
      />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        {/* Hero Card in Terracotta Blush with Deep Aubergine Authority Border */}
        <section className="rounded-xl border-2 border-[#1E131D] bg-[#D98A6C] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex flex-wrap items-center gap-2 rounded px-2.5 py-1 bg-[#1E131D] text-[#78A890] text-xs font-mono font-bold">
                <span>50-Question 5-Tier RL Engine</span>
                <span aria-hidden="true">·</span>
                <span>{selectedStore} Floor Experience</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E131D] leading-[1.1]">
                Find Your Real Laptop Fit—No Right or Wrong Answers.
              </h1>
              <p className="text-base font-medium text-[#1E131D]/90 leading-relaxed">
                Progress from Tier 1 baseline gauging through Tier 5 high-stakes commitment. Our
                Thompson Sampling agent adapts intensity and side notes from your prior choices,
                then updates its policy from your final decision.
              </p>
            </div>

            {/* Store Selector + Audio Toggle */}
            <div className="flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-mono font-bold text-[#1E131D]">Retail Store</span>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#F4EFE6] bg-[#4A2545] hover:bg-[#1E131D] cursor-pointer py-1.5 px-2.5 rounded border border-[#1E131D] transition-colors"
                  aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
                >
                  {muted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#D98A6C]" aria-hidden="true" />
                      <span>Sound Off</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#78A890]" aria-hidden="true" />
                      <span>Sound On</span>
                    </>
                  )}
                </button>
              </div>

              <div
                className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg bg-[#4A2545] border-2 border-[#1E131D]"
                role="group"
                aria-label="Choose retail store"
              >
                {STORES.map((store) => {
                  const active = selectedStore === store;
                  return (
                    <button
                      key={store}
                      type="button"
                      onClick={() => handleSelectStore(store)}
                      aria-pressed={active}
                      className={`px-3 py-2 min-h-[40px] rounded-md text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#78A890] text-[#1E131D]'
                          : 'text-[#F4EFE6] hover:bg-[#1E131D]/50'
                      }`}
                    >
                      {store}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Active View */}
        {activeView === 'session' && (
          <PersuasionSession
            key={sessionKey}
            storeName={selectedStore}
            policy={policy}
            profile={selectedProfile}
            onChangeProfile={setSelectedProfile}
            onRecordEpisode={handleRecordEpisode}
            onOpenPolicyLab={() => handleSelectView('rl-lab')}
            onOpenStorePass={() => handleSelectView('store-pass')}
          />
        )}

        {activeView === 'rl-lab' && (
          <RLPolicyLab
            policy={policy}
            selectedProfile={selectedProfile}
            onChangeAlgorithm={handleChangeAlgorithm}
            onSimulateBatch={handleSimulateBatch}
            onResetPolicy={handleResetPolicy}
          />
        )}

        {activeView === 'store-pass' && (
          <StoreAchievementPass
            storeName={selectedStore}
            profile={selectedProfile}
            latestAiWinEpisode={latestAiWinEpisode}
            onStartSession={handleStartNewSession}
          />
        )}
      </main>

      {/* Deep Aubergine Footer */}
      <footer className="border-t-2 border-[#1E131D] bg-[#1E131D] text-[#F4EFE6]">
        <div className="mx-auto flex max-w-[1280px] flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-6 sm:px-6 text-xs">
          <div className="text-[#F4EFE6]/90 font-medium">
            Intel® Core™ Ultra AI PC · 50-Question 5-Tier Thompson Sampling Engine · {selectedStore}
          </div>
          <div className="font-mono font-bold tabular-nums text-[#78A890]">
            Episodes: {policy.totalEpisodes} · AI PC Wins: {policy.totalAiPcWins}
          </div>
        </div>
      </footer>
    </div>
  );
}
