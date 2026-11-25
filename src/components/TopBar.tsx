import React from 'react';

export type AppView = 'session' | 'rl-lab' | 'store-pass';

interface TopBarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  totalEpisodes: number;
  passUnlocked: boolean;
  onStartNewSession: () => void;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'session', label: 'Live Session' },
  { id: 'rl-lab', label: 'RL Policy Lab' },
  { id: 'store-pass', label: 'Store Pass' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  totalEpisodes,
  passUnlocked,
  onStartNewSession,
}) => {
  return (
    <header className="border-b-2 border-[#1E131D] bg-[#F4EFE6]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-4 py-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('session')}
          className="font-display text-lg font-extrabold tracking-tight text-[#1E131D] whitespace-nowrap shrink-0 cursor-pointer hover:text-[#4A2545] transition-colors"
        >
          Intel AI PC Bandit
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-[#1E131D]'
                    : 'text-[#4A2545]/80 hover:text-[#1E131D]'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'rl-lab' && totalEpisodes > 0 && (
                  <span className="ml-1.5 font-mono text-xs text-[#4A2545] tabular-nums">
                    ({totalEpisodes})
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-[3px] bg-[#78A890]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="shrink-0">
          {passUnlocked && activeView !== 'store-pass' ? (
            <button
              type="button"
              onClick={() => onSelectView('store-pass')}
              className="px-4 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#D98A6C] text-[#1E131D] text-xs font-bold tracking-wide whitespace-nowrap shrink-0 cursor-pointer hover:bg-[#4A2545] hover:text-[#F4EFE6] transition-colors"
            >
              View VIP Pass
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartNewSession}
              className="px-4 py-2.5 min-h-[44px] rounded-md border-2 border-[#1E131D] bg-[#D98A6C] text-[#1E131D] text-xs font-bold tracking-wide whitespace-nowrap shrink-0 cursor-pointer hover:bg-[#4A2545] hover:text-[#F4EFE6] transition-colors"
            >
              New Walk-In
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <nav
        className="flex md:hidden items-center gap-2 overflow-x-auto border-t border-[#1E131D]/20 px-4 py-2"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`px-3 py-2 min-h-[44px] rounded-md text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[#4A2545] text-[#F4EFE6]'
                  : 'text-[#4A2545] hover:bg-[#4A2545]/10'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
