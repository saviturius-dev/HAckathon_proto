# Intel AI PC Challenge — The Velvet Parlor

An interactive, in-store laptop discovery and persuasion prototype for shoppers at Reliance Digital, Croma, and Vijay Sales. The experience presents a five-tier question funnel, adapts which question appears using a contextual multi-armed bandit policy, records the shopper's final AI PC / Normal PC choice, and exposes a policy-inspection dashboard.

> This repository contains a client-side prototype. The reinforcement-learning policy is implemented in TypeScript and persisted in the browser; it is not a trained server-side model. The application currently has no implemented backend API or database.

## Contents

- [What the app does](#what-the-app-does)
- [Application flow](#application-flow)
- [Technology stack](#technology-stack)
- [Reinforcement-learning implementation](#reinforcement-learning-implementation)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Persistence and configuration](#persistence-and-configuration)
- [Implementation notes and limitations](#implementation-notes-and-limitations)

## What the app does

The app is designed as an interactive retail demo for discussing Intel Core Ultra AI PCs with Gen Z laptop shoppers.

A staff member selects a retail store and a shopper profile. The shopper then answers questions contrasting an AI-PC-oriented workflow with a conventional laptop workflow. Each answer reveals a neutral acknowledgement and a corresponding explanatory side note. At the end, the shopper makes a final AI PC vs. Normal PC choice.

Supported store selections:

- Reliance Digital
- Croma
- Vijay Sales

Supported shopper profiles:

- Student — lectures, group projects, portability
- Creator — photo/video editing and creative tools
- Gamer — gaming, voice communications and streaming
- Professional — calls, documents and multitasking

The question bank in `src/data/rlQuestions.ts` contains 50 questions: 10 questions in each of five tiers, distributed across eight categories. The session can run in either a quick mode (one question per tier; five questions) or a deep mode (two questions per tier; ten questions).

## Application flow

1. The user chooses a store and shopper profile.
2. The session starts at Tier 1 and selects a question from the matching question-bank tier.
3. The shopper chooses the AI PC or Normal PC response.
4. The app displays the selected response's neutral acknowledgement and side note.
5. The next question is selected using the current profile/category policy and the shopper's previous answers. Normal PC selections can increase the next question's effective persuasion tier.
6. After the scheduled questions, the shopper makes a final AI PC / Normal PC decision.
7. The final choice is recorded as an episode and updates the policy statistics.
8. If the final choice is AI PC, the Store Pass view is unlocked and displays an achievement-card-style offer.

The navigation has three views: Live Session, RL Policy Lab, and Store Pass.

## Technology stack

| Technology | Where it is used |
|---|---|
| React 19 | Component-based interface and application state in `src/App.tsx` and `src/components/` |
| TypeScript | Application, question-bank, and bandit-engine types and logic |
| Vite 8 | Development server and production bundling; configured in `vite.config.ts` |
| Tailwind CSS 4 | Utility styling; imported in `src/index.css` and integrated through `@tailwindcss/vite` |
| Lucide React | Interface icons in the React components |
| Browser Local Storage | Persists the RL policy state under `intel_aipc_rl_50q_v2` |
| Web Audio API | Synthesizes click, win, alert, and fan sound effects in `src/utils/sound.ts` |
| Canvas 2D API | Renders the animated rabbit decoration in `public/rabbits.js` |
| Google Fonts | Plus Jakarta Sans, Sora, and Space Mono are loaded by `index.html` |

The package manifest also declares `@google/genai`, Express, dotenv, Motion, and supporting build/type packages. In the current application source, there is no Gemini API client call, Express server/API route, dotenv-based runtime configuration, or Motion import. These packages should therefore be treated as declared dependencies/scaffolding, not as active application integrations.

## Reinforcement-learning implementation

The adaptive question-selection logic lives in `src/rl/banditEngine.ts`.

### Bandit choices

The policy supports two selection algorithms:

- **Thompson Sampling** (default): samples from a Beta distribution for each available shopper-profile/category arm.
- **UCB1-style scoring**: calculates the arm's empirical Beta mean plus an exploration bonus.

The Beta sampler is implemented locally using Gamma sampling and a standard-normal sampler; no external machine-learning library is used.

### Context and arms

The category arm key is `profile::category`. The engine initializes an arm for every combination of four shopper profiles and eight question categories (32 category arms). Each arm tracks:

- `alpha` and `beta` Beta parameters
- impressions
- conversions

The engine also tracks five tier-level arms and episode history.

### Adaptive question selection

`computeAdaptiveIntensityTier()` raises the effective tier when the shopper has selected the Normal PC option:

- Tier 1 always remains Tier 1.
- A most-recent Normal PC answer adds one tier.
- Two or more Normal PC selections add another tier, subject to the Tier 5 cap.

`selectNextTierQuestion()` first filters unused questions at the effective tier, then falls back to the scheduled tier, and finally to any remaining unused question. It scores the available categories for the selected shopper profile and chooses a question from the highest-scoring category. After at least one Normal PC selection, the implementation adds a score bonus to the privacy/security, future-proofing, and cost/value categories.

### Reward update

`updatePolicyWithReward()` treats the final decision as the episode reward:

- Final AI PC choice: reward `1.0`; increment `alpha` for the unique categories and effective tiers encountered in the session.
- Final Normal PC choice: reward `0.0`; increment `beta` for those unique categories and tiers.

The update is applied to each unique category/tier represented in the episode, rather than attributing a separate observed reward to every individual question. The episode stores the profile, algorithm, final choice, reward, selected steps, and policy note. The in-memory episode history is capped at 50 entries.

### Simulation mode

`simulateWalkInBatch()` generates synthetic walk-in episodes for the RL Policy Lab's “Simulate 10 Walk-Ins” control. It cycles through the four profiles, selects questions using the same policy, samples hypothetical answers and a final choice, and updates the policy. These are simulated outcomes, not real shopper observations or measured conversion data.

## Project structure

```text
.
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── public/
│   ├── rabbits.js
│   └── assets/
│       └── aistudio/
│           ├── Intel_AI_PC_Gaming_Challenge__CMRIT_Innovation_Hackathon_6304bbb6.html
│           ├── Paste_November_25__2026_-_6_22PM_0d383e60
│           └── image__1__3b954c6d.png
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components/
    │   ├── TopBar.tsx
    │   ├── PersuasionSession.tsx
    │   ├── RLPolicyLab.tsx
    │   └── StoreAchievementPass.tsx
    ├── data/
    │   └── rlQuestions.ts
    ├── rl/
    │   └── banditEngine.ts
    └── utils/
        └── sound.ts
```

### Important files

| File | Responsibility |
|---|---|
| `src/main.tsx` | React entry point; mounts `App` and imports global CSS |
| `src/App.tsx` | Owns selected store/profile, active view, policy state, persistence effect, session callbacks, sound toggle and reset/simulation handlers |
| `src/components/TopBar.tsx` | Desktop/mobile navigation and new-session / pass navigation |
| `src/components/PersuasionSession.tsx` | Shopper profile and session-depth controls; question flow, side-note display, final choice and episode submission |
| `src/components/RLPolicyLab.tsx` | Policy metrics, algorithm selection, arm inspection, question-bank filtering, simulation and reset controls |
| `src/components/StoreAchievementPass.tsx` | Achievement-card view; creates pass text and supports copy/download |
| `src/data/rlQuestions.ts` | Store/profile/category/tier types, tier metadata, 50-question bank and final-decision choices |
| `src/rl/banditEngine.ts` | Bandit state, Beta sampler, adaptive tier calculation, question selection, reward updates and synthetic episode simulation |
| `src/utils/sound.ts` | Web Audio sound-effect engine |
| `src/index.css` | Tailwind import and project font theme |
| `public/rabbits.js` | Standalone animated rabbit decoration using Canvas 2D |
| `vite.config.ts` | React and Tailwind Vite plugins, `@` alias, asset-copy build hook and optional HMR/file-watch disabling |
| `index.html` | HTML shell, metadata, Google Fonts, React entry script and rabbit script |

## Run locally

Requirements: Node.js and npm.

```bash
git clone https://github.com/saviturius-dev/HAckathon_proto.git
cd HAckathon_proto
npm install
npm run dev
```

Vite is configured to serve on port 3000 and bind to `0.0.0.0`. Open the local URL printed by Vite (normally `http://localhost:3000`).

Available scripts:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run TypeScript type-checking with `tsc --noEmit` |
| `npm run clean` | Remove `dist` and `server.js` |

## Persistence and configuration

The RL policy is saved in the browser's Local Storage using the key:

```text
intel_aipc_rl_50q_v2
```

This means policy data is local to the browser/device and browser profile. It is not shared between store terminals or users, and clearing browser storage removes the saved policy. The “Reset Weights” action resets the policy in the running app.

The repository includes `.env.example` with `GEMINI_API_KEY` and `APP_URL` placeholders, and `metadata.json` declares a server-side Gemini capability. However, the current checked-in source does not call the Gemini SDK or implement a server endpoint. The variables are therefore not required to run the current client-side prototype. Do not put real credentials in committed files.

## Implementation notes and limitations

- The bandit is a hand-coded contextual/category-selection mechanism, not a neural network or externally trained RL model.
- The policy uses the shopper profile as context for category arms. The selected store is currently UI/session context; it is not part of the arm key.
- The final AI PC / Normal PC decision supplies the reward used to update the categories and tiers seen during the episode.
- The “Simulate 10 Walk-Ins” feature produces synthetic data. Do not present its results as actual customer conversion rates.
- Question copy and side notes are static content in `src/data/rlQuestions.ts`; they are not generated dynamically by Gemini.
- The Store Pass is generated entirely in the browser. The pass code is deterministic by store, and the complimentary add-on/gaming-bag offer is text embedded in the UI; no redemption API, inventory check, or store-system integration is implemented in this repository.
- The project includes an additional animated rabbit easter-egg script in `public/rabbits.js`, loaded by `index.html`.
- The question bank contains hardware/AI capability claims. Those statements are authored content and are not validated by the bandit engine.

