export type ShopperProfile = 'student' | 'gamer' | 'creator' | 'professional';
export type StoreName = 'Reliance Digital' | 'Croma' | 'Vijay Sales';

export type QuestionCategoryId =
  | 'battery_portability'
  | 'productivity_multitasking'
  | 'privacy_security'
  | 'cost_value'
  | 'creative_work'
  | 'hardware_compatibility'
  | 'future_proofing'
  | 'social_proof';

export type TierNumber = 1 | 2 | 3 | 4 | 5;

export interface TierMeta {
  tier: TierNumber;
  name: string;
  intensityLabel: string;
  purpose: string;
}

export interface QuestionChoiceOption {
  id: 'ai_pc' | 'normal_pc';
  label: string;
  sideNote: string;
  neutralAck: string;
}

export interface BankQuestion {
  id: string;
  tier: TierNumber;
  indexInTier: number;
  category: QuestionCategoryId;
  question: string;
  optionA: QuestionChoiceOption; // Pro AI Laptop
  optionB: QuestionChoiceOption; // Normal Laptop
}

export const STORES: StoreName[] = ['Reliance Digital', 'Croma', 'Vijay Sales'];

export const SHOPPER_PROFILES: {
  id: ShopperProfile;
  label: string;
  description: string;
}[] = [
  {
    id: 'student',
    label: 'Campus & Classes',
    description: 'Lectures, group projects, hostel Wi-Fi, and all-day portability',
  },
  {
    id: 'creator',
    label: 'Creator & Edits',
    description: 'Reels, photos, generative AI tools, and café/travel sessions',
  },
  {
    id: 'gamer',
    label: 'Gaming & Discord',
    description: 'Frame rates, voice comms, streaming overlays, and thermals',
  },
  {
    id: 'professional',
    label: 'Work & Hybrid',
    description: 'Back-to-back calls, confidential PDFs, and multi-tab speed',
  },
];

export const CATEGORY_LABELS: Record<QuestionCategoryId, string> = {
  battery_portability: 'Battery & Portability',
  productivity_multitasking: 'Productivity & Multitasking',
  privacy_security: 'Privacy & Security',
  cost_value: 'Cost & Long-Term Value',
  creative_work: 'Creative & Gaming Workloads',
  hardware_compatibility: 'Hardware & App Compatibility',
  future_proofing: 'Future-Proofing (40+ TOPS)',
  social_proof: 'Social Proof & Standards',
};

export const TIER_METADATA: TierMeta[] = [
  {
    tier: 1,
    name: 'Tier 1 · Basic Gauging',
    intensityLabel: 'Intensity 1/5 · Baseline Discovery',
    purpose: 'Gauge daily lifestyle, study/work habits, and pain points without defensiveness.',
  },
  {
    tier: 2,
    name: 'Tier 2 · Mild Persuasion',
    intensityLabel: 'Intensity 2/5 · Value Framing & Contrast',
    purpose: 'Introduce subtle comparative contrast between tri-engine AI silicon and traditional dual-chip PCs.',
  },
  {
    tier: 3,
    name: 'Tier 3 · Medium Persuasion',
    intensityLabel: 'Intensity 3/5 · Social Proof & Standards',
    purpose: 'Leverage peer adoption, Microsoft Copilot+ 40+ TOPS benchmarks, and opportunity cost.',
  },
  {
    tier: 4,
    name: 'Tier 4 · High Pre-Suasion',
    intensityLabel: 'Intensity 4/5 · Identity Priming & Loss Aversion',
    purpose: 'Apply identity priming, loss aversion, and single-chute framing tailored to prior answers.',
  },
  {
    tier: 5,
    name: 'Tier 5 · Direct High-Stakes Choice',
    intensityLabel: 'Intensity 5/5 · Commitment & Closing',
    purpose: 'Bring the shopper to a clear commitment by contrasting both 4-year computing paths.',
  },
];

export const FIFTY_QUESTION_BANK: BankQuestion[] = [
  // ============================================================================
  // TIER 1: BASIC GAUGING (10 Questions)
  // ============================================================================
  {
    id: 't1-q1',
    tier: 1,
    indexInTier: 1,
    category: 'battery_portability',
    question:
      'When you set up your workspace at a college library, cafe, or office, what is your primary seating priority?',
    optionA: {
      id: 'ai_pc',
      label:
        'Seating near any comfortable spot, relying on a laptop built for multi-day battery endurance that handles background tasks on a low-power engine.',
      sideNote:
        'Dedicated Neural Processing Units (NPUs) handle background tasks using a fraction of the power required by conventional CPUs, significantly extending battery life on the go.',
      neutralAck: 'Noted — comfort and freedom from wall outlets matter in your workspace.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Seating strictly next to a wall power outlet so you can keep your charger plugged in throughout the day.',
      sideNote:
        'Standard laptops rely entirely on the CPU and GPU for all tasks, which increases thermal output and drains battery faster during video calls or background syncs.',
      neutralAck: 'Got it — staying close to a power socket is part of your current routine.',
    },
  },
  {
    id: 't1-q2',
    tier: 1,
    indexInTier: 2,
    category: 'productivity_multitasking',
    question:
      'How do you currently handle online video meetings, group study sessions, or remote classes?',
    optionA: {
      id: 'ai_pc',
      label:
        'Keep your camera background blurred and noise cancellation active continuously without noticing system slowdowns.',
      sideNote:
        'Offloading continuous audio/video effects to an NPU frees up 100% of the CPU and GPU for smooth note-taking and browsing.',
      neutralAck: 'Recorded — uninterrupted video clarity helps keep calls effortless.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Turn off background blur or video entirely because system fans start spinning loudly and apps begin to lag.',
      sideNote:
        'On traditional PCs, processing video camera filters directly on the central processor can consume up to 30–40% of CPU capacity.',
      neutralAck: 'Understood — many users disable camera effects just to keep fans quiet.',
    },
  },
  {
    id: 't1-q3',
    tier: 1,
    indexInTier: 3,
    category: 'productivity_multitasking',
    question:
      'When summarizing long documents, research papers, or transcribing lectures, which method do you prefer?',
    optionA: {
      id: 'ai_pc',
      label:
        'Utilizing local AI tools that analyze files instantly on your device without needing an active internet connection.',
      sideNote:
        'On-device AI processing delivers immediate response times because data does not need to travel back and forth over congested Wi-Fi networks.',
      neutralAck: 'Logged — instant offline summarization keeps study sessions moving.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Copying text into browser-based cloud tools or manually reading through PDFs page by page.',
      sideNote:
        'Cloud-based AI tools depend on web connectivity and third-party server queues, which can introduce latency during peak hours.',
      neutralAck: 'Noted — browser cloud tools are a common fallback when working online.',
    },
  },
  {
    id: 't1-q4',
    tier: 1,
    indexInTier: 4,
    category: 'privacy_security',
    question:
      'How often do you work with private documents, personal creative projects, or confidential notes?',
    optionA: {
      id: 'ai_pc',
      label:
        "Frequently, and you prefer all file analysis to stay completely contained on your laptop's local storage.",
      sideNote:
        'Processing machine learning workloads locally on an NPU guarantees that sensitive files and personal data never leave your hard drive.',
      neutralAck: 'Captured — keeping private drafts strictly on your own drive is a priority.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        "Occasionally, and you don't mind uploading documents to external cloud servers for processing.",
      sideNote:
        'Uploading files to cloud services transmits data over external networks, making security dependent on remote server policies.',
      neutralAck: 'Got it — convenience often guides how documents are processed today.',
    },
  },
  {
    id: 't1-q5',
    tier: 1,
    indexInTier: 5,
    category: 'productivity_multitasking',
    question:
      'What is your typical reaction when multiple software applications are open at the same time?',
    optionA: {
      id: 'ai_pc',
      label:
        "Expect seamless multitasking where background tasks don't interrupt foreground responsiveness.",
      sideNote:
        'Heterogeneous chip architectures divide workloads across CPU, GPU, and NPU engines to prevent system bottlenecks.',
      neutralAck: 'Noted — smooth responsiveness across heavy tabs is your baseline.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Expect occasional stuttering or app freezes, so you regularly close tabs and background programs.',
      sideNote:
        'Traditional two-chip setups force the CPU to constantly switch contexts between system tasks and active applications.',
      neutralAck: 'Understood — closing tabs to rescue speed is a familiar habit on older PCs.',
    },
  },
  {
    id: 't1-q6',
    tier: 1,
    indexInTier: 6,
    category: 'cost_value',
    question: 'When shopping for tech products, how do you evaluate long-term value?',
    optionA: {
      id: 'ai_pc',
      label:
        'Investing in a platform configured to support next-generation software features for the next 4–5 years.',
      sideNote:
        'Buying hardware that meets modern Copilot+ specifications (40+ TOPS NPU) prevents premature obsolescence as software updates roll out.',
      neutralAck: 'Saved — planning for a full 4–5 year lifecycle shapes smart tech buys.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Purchasing the lowest-cost machine available today, even if it lacks hardware acceleration for upcoming software features.',
      sideNote:
        'Devices lacking dedicated AI hardware will rely entirely on paid cloud subscriptions or reduced feature sets in future OS updates.',
      neutralAck: 'Noted — keeping upfront checkout cost low is an instinct many shoppers share.',
    },
  },
  {
    id: 't1-q7',
    tier: 1,
    indexInTier: 7,
    category: 'creative_work',
    question: 'How do you approach photo editing, graphics work, or slide creation?',
    optionA: {
      id: 'ai_pc',
      label:
        'Using smart selection, automated subject masking, and instant image enhancement built into software like Adobe Photoshop.',
      sideNote:
        'Intel Core Ultra processors integrate OpenVINO acceleration to speed up creative filters in tools like Adobe Premiere Pro and Photoshop.',
      neutralAck: 'Recorded — automated visual tools save significant creative time.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Performing manual image cropping and adjustment step-by-step using standard tools.',
      sideNote:
        'Manual editing relies heavily on traditional CPU single-core speed, which takes significantly more time for complex batch operations.',
      neutralAck: 'Got it — manual edits work, though they demand more hands-on effort.',
    },
  },
  {
    id: 't1-q8',
    tier: 1,
    indexInTier: 8,
    category: 'creative_work',
    question: 'When gaming or streaming media on your laptop, what matters most?',
    optionA: {
      id: 'ai_pc',
      label:
        'High frame rates and smooth gameplay while background noise suppression runs silently without dropping FPS.',
      sideNote:
        'Intel Arc integrated graphics handle game rendering while the NPU manages real-time voice focus in Discord or streaming software.',
      neutralAck: 'Logged — clean squad audio without sacrificing FPS is the goal.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Lowering game graphic settings to prevent the laptop from overheating when running communication background apps.',
      sideNote:
        'When a single GPU handles both game graphics and background AI filters, thermal throttling can cause sudden frame rate drops.',
      neutralAck: 'Understood — dialing down graphics is a common trade-off on dual-chip machines.',
    },
  },
  {
    id: 't1-q9',
    tier: 1,
    indexInTier: 9,
    category: 'battery_portability',
    question: 'How do you manage laptop fan noise during quiet study environments or meetings?',
    optionA: {
      id: 'ai_pc',
      label:
        'Enjoy silent operation because background AI utilities run on a specialized low-wattage tile.',
      sideNote:
        'NPUs execute neural network math at ultra-low power levels, keeping fan activity to a minimum during sustained tasks.',
      neutralAck: 'Noted — quiet acoustics keep focus intact in libraries and meetings.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Accept loud fan noise as a normal side effect whenever demanding tasks or background updates run.',
      sideNote:
        'High CPU/GPU utilization generates heat quickly, triggering high-speed cooling fans to dissipate thermal energy.',
      neutralAck: 'Fair enough — loud fans have long been treated as unavoidable on standard laptops.',
    },
  },
  {
    id: 't1-q10',
    tier: 1,
    indexInTier: 10,
    category: 'hardware_compatibility',
    question: 'What is your preference regarding software application compatibility?',
    optionA: {
      id: 'ai_pc',
      label:
        'Native 100% compatibility with all standard Windows x86 applications, legacy software, and anti-cheat games.',
      sideNote:
        'Intel x86 architecture natively runs traditional Windows software out of the box without requiring performance-robbing translation layers.',
      neutralAck: 'Captured — expecting every app and game to launch cleanly is essential.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Basic software support, even if specialized niche apps or older utilities require workarounds.',
      sideNote:
        'Non-x86 architectures (like ARM) rely on emulation layers like Prism, which can cause driver conflicts or anti-cheat game crashes.',
      neutralAck: 'Understood — compatibility friction often goes unnoticed until a key app fails.',
    },
  },

  // ============================================================================
  // TIER 2: MILD PERSUASION (10 Questions)
  // ============================================================================
  {
    id: 't2-q1',
    tier: 2,
    indexInTier: 1,
    category: 'productivity_multitasking',
    question:
      'If you had to run a 3-hour collaborative video workshop while running research software, which system setup gives you more confidence?',
    optionA: {
      id: 'ai_pc',
      label:
        'A system with a dedicated NPU handling camera framing, background noise reduction, and eye contact correction automatically.',
      sideNote:
        'Offloading camera effects to an NPU reduces system power draw by up to 2.5x compared to running them on standard CPU cores.',
      neutralAck: 'Noted — keeping long workshops steady and responsive matters.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'A standard laptop where the CPU handles video decoding, background blur, and document edits simultaneously.',
      sideNote:
        'Running multiple continuous background tasks on a CPU can cause temperature spikes that shorten battery runtime significantly.',
      neutralAck: 'Got it — loading everything onto the CPU is how older laptops still operate.',
    },
  },
  {
    id: 't2-q2',
    tier: 2,
    indexInTier: 2,
    category: 'privacy_security',
    question:
      'When working with confidential personal data, medical records, or financial spreadsheets, how should AI assistance operate?',
    optionA: {
      id: 'ai_pc',
      label: 'Local execution on an NPU delivering 40+ TOPS, processing files completely offline.',
      sideNote:
        'Local AI execution complies with strict data protection standards because zero telemetry or file data leaves the physical device.',
      neutralAck: 'Recorded — local-only file handling gives full peace of mind.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Cloud-dependent AI that requires uploading file content to external servers over public networks.',
      sideNote:
        'Cloud AI models store user prompts and document extracts on remote infrastructure, introducing potential privacy trade-offs.',
      neutralAck: 'Understood — cloud convenience trades off local control over sensitive files.',
    },
  },
  {
    id: 't2-q3',
    tier: 2,
    indexInTier: 3,
    category: 'creative_work',
    question:
      'How important is it for your laptop to remain responsive while exporting a video or rendering a project?',
    optionA: {
      id: 'ai_pc',
      label:
        'Highly important—you want the GPU rendering graphics, the NPU processing AI filters, and the CPU keeping the OS fluid.',
      sideNote:
        'Tri-engine architecture distributes tasks across independent compute dies (CPU, GPU, NPU) to prevent system lockups.',
      neutralAck: 'Captured — multitasking smoothly during exports keeps momentum going.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Acceptable to pause all other work and wait while the CPU and GPU handle the entire render load.',
      sideNote:
        'Dual-chip systems experience system lag during heavy exports because CPU threads become saturated.',
      neutralAck: 'Noted — stepping away during exports has been the norm on dual-chip PCs.',
    },
  },
  {
    id: 't2-q4',
    tier: 2,
    indexInTier: 4,
    category: 'future_proofing',
    question:
      'When preparing for an exam or major presentation on a tight deadline, what is your biggest technical fear?',
    optionA: {
      id: 'ai_pc',
      label: 'Running out of memory or battery power during local document analysis.',
      sideNote:
        'Modern AI PCs combine low-power NPU processing with 16GB+ high-speed RAM to maintain smooth local file indexing.',
      neutralAck: 'Logged — 16GB+ memory and low-power AI protect deadline workflows.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Losing Wi-Fi access and being completely cut off from cloud-based assistance tools.',
      sideNote:
        'Traditional laptops without NPUs cannot run local AI models offline, rendering smart assistance features useless without internet.',
      neutralAck: 'Understood — Wi-Fi drops are a real risk when tools live purely in the cloud.',
    },
  },
  {
    id: 't2-q5',
    tier: 2,
    indexInTier: 5,
    category: 'battery_portability',
    question: 'How do you view laptop battery claims when reading manufacturer specifications?',
    optionA: {
      id: 'ai_pc',
      label:
        'You prioritize real-world efficiency rating systems like Intel Core Ultra Series 2/3, offering up to 20+ hours of video/productivity runtime.',
      sideNote:
        'Series 2 (200V) and Series 3 (Panther Lake) chips deliver up to 20 to 27 hours of battery life through dedicated low-power E-cores and NPUs.',
      neutralAck: 'Noted — real-world unplugged endurance counts far more than spec-sheet hype.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'You expect battery life to drop by half whenever you open video call apps or creative software.',
      sideNote:
        'Conventional processors draw peak power even during simple AI tasks like background noise suppression.',
      neutralAck: 'Got it — rapid drain under load is typical for conventional silicon.',
    },
  },
  {
    id: 't2-q6',
    tier: 2,
    indexInTier: 6,
    category: 'creative_work',
    question:
      'When editing photos in software like Adobe Lightroom, how much time do you want to spend on masking?',
    optionA: {
      id: 'ai_pc',
      label:
        'Instant AI-based subject selection that isolates people and objects in milliseconds via NPU acceleration.',
      sideNote:
        'Adobe Lightroom and Photoshop leverage OpenVINO neural execution to accelerate masking operations locally.',
      neutralAck: 'Captured — instant masking speeds up every creative edit.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Manual brush selection that requires painting around subject edges line by line.',
      sideNote:
        'Manual selection increases editing time and relies entirely on software rendering through standard CPU threads.',
      neutralAck: 'Noted — manual brush work gets the job done, though at a much slower pace.',
    },
  },
  {
    id: 't2-q7',
    tier: 2,
    indexInTier: 7,
    category: 'future_proofing',
    question:
      'What is your strategy for maintaining PC performance over a 4-year college or professional lifecycle?',
    optionA: {
      id: 'ai_pc',
      label:
        'Choosing a device with built-in hardware acceleration for local AI features that software updates will require.',
      sideNote:
        'Windows 11 Copilot+ features require a hardware floor of 40+ NPU TOPS, ensuring future software compatibility.',
      neutralAck: 'Logged — built-in NPU headroom keeps your laptop ready for upcoming updates.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Purchasing a standard laptop without an NPU and relying on external hardware add-ons or upgrades later.',
      sideNote:
        'NPUs are integrated directly into the processor SoC and cannot be upgraded or added to a laptop after purchase.',
      neutralAck: 'Good to know — unlike RAM or storage on some PCs, an NPU cannot be added later.',
    },
  },
  {
    id: 't2-q8',
    tier: 2,
    indexInTier: 8,
    category: 'hardware_compatibility',
    question:
      'How do you feel about software compatibility when switching between work, gaming, and specialized tools?',
    optionA: {
      id: 'ai_pc',
      label:
        'You want zero compatibility headaches—every x86 application, game, and utility should run natively.',
      sideNote:
        'Intel x86 architecture guarantees native execution across decades of Windows software without emulation overhead.',
      neutralAck: 'Noted — reliable native execution saves hours of troubleshooting.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'You are willing to check compatibility lists to see if your required apps support ARM translation layers.',
      sideNote:
        'Emulating x86 code on non-native architectures can reduce software performance by 20–30% or fail on kernel-level anti-cheat software.',
      neutralAck: 'Understood — checking compatibility tables adds friction to everyday downloads.',
    },
  },
  {
    id: 't2-q9',
    tier: 2,
    indexInTier: 9,
    category: 'productivity_multitasking',
    question:
      'When using live caption translation during international calls or lectures, how do you expect it to function?',
    optionA: {
      id: 'ai_pc',
      label: 'Real-time, on-device transcription that works seamlessly offline with zero audio delay.',
      sideNote:
        'On-device NPUs process live language models locally, translating speech in real-time without cloud buffering.',
      neutralAck: 'Recorded — instant offline captions make fast lectures easy to follow.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Web-based transcription that lags behind the speaker and drops out if Wi-Fi connection drops.',
      sideNote:
        'Cloud speech recognition introduces latency based on network congestion and server distance.',
      neutralAck: 'Got it — cloud captions depend entirely on steady network bandwidth.',
    },
  },
  {
    id: 't2-q10',
    tier: 2,
    indexInTier: 10,
    category: 'battery_portability',
    question: 'How do you evaluate laptop thermal comfort when working with a laptop on your lap?',
    optionA: {
      id: 'ai_pc',
      label:
        'Cool, quiet operation enabled by offloading repetitive background processing to power-efficient NPU tiles.',
      sideNote:
        'Intel Core Ultra NPU tiles feature dedicated SRAM and neural compute engines that operate at minimal wattage.',
      neutralAck: 'Noted — cool chassis temperatures make couch and travel work effortless.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Expecting the bottom of the laptop to get uncomfortably warm during prolonged video calls or multitasking.',
      sideNote:
        'High power draw on traditional CPUs generates thermal dissipation that heats the laptop chassis.',
      neutralAck: 'Understood — heat buildup is a familiar side effect of traditional CPUs.',
    },
  },

  // ============================================================================
  // TIER 3: MEDIUM PERSUASION (10 Questions)
  // ============================================================================
  {
    id: 't3-q1',
    tier: 3,
    indexInTier: 1,
    category: 'social_proof',
    question:
      'Industry analysis shows that over 80% of tech-forward students and creators are choosing Copilot+ certified laptops in 2026. What drives this shift?',
    optionA: {
      id: 'ai_pc',
      label:
        'The recognition that dedicated NPUs (40+ TOPS) unlock essential on-device AI tools and multi-day battery life.',
      sideNote:
        'Microsoft Copilot+ certification establishes a verified hardware benchmark of 40+ NPU TOPS and 16GB RAM for local AI execution.',
      neutralAck: 'Captured — peer adoption reflects practical battery and local AI gains.',
    },
    optionB: {
      id: 'normal_pc',
      label: "Sticking with older non-NPU architecture because you haven't evaluated modern AI workloads yet.",
      sideNote:
        "Laptops without an NPU fall below Microsoft's Copilot+ baseline and cannot run local Windows Studio Effects or local models.",
      neutralAck: 'Noted — many shoppers simply have not seen local AI workloads in action yet.',
    },
  },
  {
    id: 't3-q2',
    tier: 3,
    indexInTier: 2,
    category: 'future_proofing',
    question:
      "When tech reviewers evaluate 'Platform TOPS' versus 'NPU TOPS', why do experienced buyers look specifically at the NPU figure?",
    optionA: {
      id: 'ai_pc',
      label:
        'Because Microsoft Copilot+ eligibility strictly requires at least 40 dedicated NPU TOPS, regardless of total combined chip marketing numbers.',
      sideNote:
        "Combined 'Platform TOPS' add CPU, GPU, and NPU together, but Copilot+ local features specifically require 40+ TOPS on the standalone NPU.",
      neutralAck: 'Logged — checking dedicated NPU TOPS cuts through shelf marketing.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Relying on generic marketing labels without checking the Task Manager Performance tab for a true NPU entry.',
      sideNote:
        "Task Manager lists 'NPU' as a distinct hardware engine; if it's missing, the machine cannot run local Copilot+ tasks.",
      neutralAck: 'Good to know — a quick check in Windows Task Manager reveals whether an NPU exists.',
    },
  },
  {
    id: 't3-q3',
    tier: 3,
    indexInTier: 3,
    category: 'creative_work',
    question:
      'Creators working in 4K video editing report up to 2x faster timeline scrubbing when using Intel Core Ultra processors. Why?',
    optionA: {
      id: 'ai_pc',
      label:
        'Standalone Media Engines (AV1/HEVC hardware decoders) work alongside Intel Arc graphics to handle video codecs effortlessly.',
      sideNote:
        'Intel Core Ultra features disaggregated standalone media processing (SA Media) supporting 8K30 HDR and hardware AV1 encode.',
      neutralAck: 'Noted — dedicated media engines keep 4K timelines smooth.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Standard integrated graphics that force the main CPU to software-decode complex video footage.',
      sideNote:
        'Software video decoding bogs down CPU utilization, causing dropped frames and stuttering timeline playback.',
      neutralAck: 'Understood — timeline stutter is common without dedicated hardware decode.',
    },
  },
  {
    id: 't3-q4',
    tier: 3,
    indexInTier: 4,
    category: 'hardware_compatibility',
    question:
      'Why are university IT departments increasingly recommending laptops with x86 architecture over ARM alternatives for engineering and science students?',
    optionA: {
      id: 'ai_pc',
      label:
        'To guarantee native compatibility with specialized lab software, coding environments, and anti-cheat academic tools.',
      sideNote:
        'Intel x86 processors run 100% of Windows software natively, avoiding the emulation bugs that affect non-x86 chips.',
      neutralAck: 'Recorded — native x86 avoids unexpected lab and exam-day software blocks.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Choosing an ARM-based laptop and hoping that required university software has an ARM64 native build available.',
      sideNote:
        'Specialized CAD tools, kernel VPNs, and anti-cheat software frequently refuse to run under ARM emulation layers.',
      neutralAck: 'Got it — compatibility surprises often show up mid-semester.',
    },
  },
  {
    id: 't3-q5',
    tier: 3,
    indexInTier: 5,
    category: 'social_proof',
    question:
      'In a survey of remote professionals, 75% stated that background noise elimination was critical for career success. How does an Intel AI PC solve this?',
    optionA: {
      id: 'ai_pc',
      label:
        'Running Intel AI Boost (NPU) to suppress background dog barks and keyboard typing silently without slowing down work apps.',
      sideNote:
        'Intel AI Boost offloads AI noise filtering algorithms, keeping CPU usage low during intense video conferences.',
      neutralAck: 'Noted — crisp voice isolation makes café and hostel calls sound studio-grade.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Relying on basic software noise gates that clip your voice or consume heavy CPU power.',
      sideNote:
        'Software-only noise suppression running on the CPU can distort audio quality when system load increases.',
      neutralAck: 'Understood — software-only noise filters tend to struggle under multitasking.',
    },
  },
  {
    id: 't3-q6',
    tier: 3,
    indexInTier: 6,
    category: 'cost_value',
    question:
      "What is the hidden cost of purchasing an entry-level 'AI PC' with only 10–12 NPU TOPS in 2026?",
    optionA: {
      id: 'ai_pc',
      label:
        'Missing out on Copilot+ certification, which requires a minimum of 40 NPU TOPS to run next-gen local Windows features.',
      sideNote:
        'Entry NPUs (10–15 TOPS) support basic camera effects but cannot run advanced local AI models or Copilot+ experiences.',
      neutralAck: 'Captured — distinguishing 12 TOPS from 40+ TOPS prevents buying underpowered silicon.',
    },
    optionB: {
      id: 'normal_pc',
      label: "Assuming all laptops labeled 'AI' offer identical capabilities regardless of TOPS ratings.",
      sideNote:
        'TOPS (Trillions of Operations Per Second) measures actual NPU compute bandwidth; lower TOPS ratings limit feature support.',
      neutralAck: 'Noted — the "AI" sticker alone does not guarantee full 40+ TOPS capability.',
    },
  },
  {
    id: 't3-q7',
    tier: 3,
    indexInTier: 7,
    category: 'future_proofing',
    question:
      'How do software developers optimize AI applications to run smoothly across Intel CPUs, GPUs, and NPUs?',
    optionA: {
      id: 'ai_pc',
      label:
        "Leveraging Intel's OpenVINO toolkit, which automatically deploys deep learning models across the optimal hardware engine.",
      sideNote:
        "Intel's OpenVINO toolkit optimizes model execution across CPU, GPU, and NPU for maximum throughput and efficiency.",
      neutralAck: 'Logged — OpenVINO unlocks cross-engine acceleration across popular apps.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Relying on unoptimized generic software that runs exclusively on the main processor.',
      sideNote:
        'Unoptimized AI software running on standard CPUs consumes significantly more energy and runs with higher latency.',
      neutralAck: 'Got it — unoptimized software leaves performance and battery on the table.',
    },
  },
  {
    id: 't3-q8',
    tier: 3,
    indexInTier: 8,
    category: 'battery_portability',
    question:
      'When comparing laptop battery longevity during video streaming, why do Intel Series 2 (200V) laptops achieve up to 20+ hours?',
    optionA: {
      id: 'ai_pc',
      label:
        'Low-Power Efficient cores (LP-E cores) and ultra-thin SoC packaging handle media playback without powering up demanding P-cores.',
      sideNote:
        "Intel's hybrid architecture includes P-cores, E-cores, and LP-E cores managed by Intel Thread Director for optimal power distribution.",
      neutralAck: 'Noted — hybrid LP-E cores stretch battery endurance across full travel days.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Standard processors that must spin up power-hungry performance cores even for basic video decoding.',
      sideNote:
        'Traditional monolithic CPU architectures draw constant baseline power, shortening overall unplugged battery runtime.',
      neutralAck: 'Understood — waking full performance cores for light tasks drains cells faster.',
    },
  },
  {
    id: 't3-q9',
    tier: 3,
    indexInTier: 9,
    category: 'privacy_security',
    question:
      'Why are privacy-conscious organizations banning cloud-only AI assistants for sensitive projects?',
    optionA: {
      id: 'ai_pc',
      label:
        'Cloud AI tools upload prompt history and confidential attachments to external servers, creating data privacy risks.',
      sideNote:
        'On-device NPU processing handles sensitive data locally, ensuring private information never leaves your laptop.',
      neutralAck: 'Recorded — keeping work strictly local avoids cloud retention risks.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Assuming cloud privacy policies are sufficient for all personal and professional files.',
      sideNote:
        'Data transmitted to cloud AI servers can be retained for model training or subject to remote server breaches.',
      neutralAck: 'Noted — cloud convenience comes with shared external server exposure.',
    },
  },
  {
    id: 't3-q10',
    tier: 3,
    indexInTier: 10,
    category: 'creative_work',
    question:
      'What happens when you run modern AI creative tools like Paint Cocreator or Restyle Image on an Intel Core Ultra AI PC?',
    optionA: {
      id: 'ai_pc',
      label:
        'Generates detailed images locally in seconds using on-device NPU and GPU acceleration.',
      sideNote:
        'On-device generative image features execute directly on Intel silicon without requiring cloud credits or web access.',
      neutralAck: 'Captured — instant local generation eliminates wait queues and credit limits.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Requires waiting in cloud server queues or paying monthly subscription fees to generate images online.',
      sideNote:
        'Cloud image generation services often enforce queue delays, monthly generation caps, or subscription paywalls.',
      neutralAck: 'Got it — cloud queues and subscriptions add up quickly for regular creators.',
    },
  },

  // ============================================================================
  // TIER 4: HIGH PERSUASION / PRE-SUASION (10 Questions)
  // ============================================================================
  {
    id: 't4-q1',
    tier: 4,
    indexInTier: 1,
    category: 'future_proofing',
    question:
      'As a forward-thinking student or professional who values personal efficiency, how do you handle technological upgrades?',
    optionA: {
      id: 'ai_pc',
      label:
        'You choose future-proof hardware (Intel Core Ultra Series 2/3 with 40+ NPU TOPS) so your machine stays fast and relevant for years.',
      sideNote:
        'Aligning your hardware choice with emerging AI software standards protects your investment against rapid tech turnover.',
      neutralAck: 'Noted — staying ahead of software shifts keeps your setup relevant longer.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'You buy outdated architecture today and accept that you will need to replace your laptop much sooner.',
      sideNote:
        'Purchasing a non-AI PC in 2026 means opting out of local Windows 11 Copilot+ software features from day one.',
      neutralAck: 'Understood — short-term savings often bring an earlier upgrade cycle.',
    },
  },
  {
    id: 't4-q2',
    tier: 4,
    indexInTier: 2,
    category: 'privacy_security',
    question:
      'Do you consider yourself someone who values complete ownership and control over your private data?',
    optionA: {
      id: 'ai_pc',
      label:
        'Yes—you prefer local NPU processing where your photos, files, and search history remain 100% stored on your device.',
      sideNote:
        'People who value data sovereignty prioritize on-device AI hardware so personal information stays strictly offline and secure.',
      neutralAck: 'Recorded — owning your local AI pipeline aligns with strict privacy.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'No—you are comfortable letting remote cloud servers process and store your personal summaries and documents.',
      sideNote:
        'Cloud processing requires relinquishing local control, relying entirely on third-party security policies.',
      neutralAck: 'Got it — cloud reliance trades personal device control for third-party hosting.',
    },
  },
  {
    id: 't4-q3',
    tier: 4,
    indexInTier: 3,
    category: 'cost_value',
    question:
      'If you realized that buying a non-AI laptop today means losing access to local AI features, longer battery, and quiet operation, how would that affect your decision?',
    optionA: {
      id: 'ai_pc',
      label:
        'It confirms that spending a small price difference for an Intel AI PC is the smarter economic choice.',
      sideNote:
        'Evaluating total cost of ownership reveals that AI PCs deliver significantly higher long-term utility per dollar spent.',
      neutralAck: 'Captured — weighing 4-year utility reframes the upfront price gap.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'You would still buy a traditional laptop to save a small amount upfront, despite losing next-gen features.',
      sideNote:
        'Saving a minimal amount upfront can lead to higher subscription costs for cloud AI services later on.',
      neutralAck: 'Noted — upfront sticker discounts can feel compelling at the counter.',
    },
  },
  {
    id: 't4-q4',
    tier: 4,
    indexInTier: 4,
    category: 'creative_work',
    question:
      'As a creator or problem-solver who hates wasting time on tedious tasks, what is your stance on workflow automation?',
    optionA: {
      id: 'ai_pc',
      label:
        'You automate repetitive audio/video filtering and file searches using local NPU tools so you can focus on high-value work.',
      sideNote:
        'Efficient creators use on-device AI accelerators to eliminate hours of manual editing and sorting every week.',
      neutralAck: 'Logged — automating routine polish frees hours for actual creative work.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'You spend hours manually executing repetitive tasks that software could handle automatically in seconds.',
      sideNote:
        'Without an NPU, repetitive AI background automation consumes heavy CPU resources or runs too slowly to be practical.',
      neutralAck: 'Understood — manual workflows quickly eat into tight project schedules.',
    },
  },
  {
    id: 't4-q5',
    tier: 4,
    indexInTier: 5,
    category: 'hardware_compatibility',
    question:
      'When you are presenting in a high-stakes interview or client pitch, how important is absolute technical reliability?',
    optionA: {
      id: 'ai_pc',
      label:
        'Crucial—you rely on Intel x86 architecture for 100% native app stability and local NPU background noise removal.',
      sideNote:
        'Combining native x86 stability with local NPU audio filtering ensures flawless presentation delivery without glitches.',
      neutralAck: 'Noted — dependable software and clean audio protect high-stakes moments.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        "You hope that software translation layers or cloud Wi-Fi connections don't drop out during your pitch.",
      sideNote:
        'Unstable network connections or emulation software crashes during live calls can harm professional credibility.',
      neutralAck: 'Got it — hoping nothing glitches mid-pitch adds unnecessary stress.',
    },
  },
  {
    id: 't4-q6',
    tier: 4,
    indexInTier: 6,
    category: 'productivity_multitasking',
    question:
      'Consider this scenario: You are studying at a location with zero Wi-Fi, and you need to summarize a 100-page report urgently. Which laptop do you want in your bag?',
    optionA: {
      id: 'ai_pc',
      label: 'An Intel Core Ultra AI PC that runs local LLM summarization on-device in airplane mode.',
      sideNote:
        'Local NPU execution allows complex document analysis to function completely offline without internet reliance.',
      neutralAck: 'Recorded — offline local LLMs turn dead zones into productive time.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'A standard laptop that cannot run local AI tools, leaving you stranded until you find Wi-Fi.',
      sideNote:
        'Traditional laptops without NPUs cannot process AI models locally, rendering smart features unavailable offline.',
      neutralAck: 'Understood — losing assistance when Wi-Fi drops is a real dead-end.',
    },
  },
  {
    id: 't4-q7',
    tier: 4,
    indexInTier: 7,
    category: 'cost_value',
    question:
      'Do you take pride in making smart, calculated investments rather than falling for superficial marketing glitter and fancy laptop colors?',
    optionA: {
      id: 'ai_pc',
      label:
        'Yes—you look past outer shell aesthetics and focus on functional internal silicon capabilities like Intel Core Ultra.',
      sideNote:
        'Smart shoppers prioritize core computing engines (CPU, GPU, NPU) that sustain high performance over several years.',
      neutralAck: 'Captured — prioritizing internal silicon over lid color pays off daily.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'You choose laptops based primarily on low price tags or eye-catching chassis colors, ignoring internal chip specs.',
      sideNote:
        'Retail shoppers often get carried away by low price or color aesthetics, purchasing machines unsuited for long-term performance.',
      neutralAck: 'Noted — shelf polish can easily distract from what is inside the chassis.',
    },
  },
  {
    id: 't4-q8',
    tier: 4,
    indexInTier: 8,
    category: 'creative_work',
    question:
      'When you multi-task across gaming, streaming, and chatting with friends, do you expect your PC to keep up with your pace?',
    optionA: {
      id: 'ai_pc',
      label:
        'Absolutely—tri-engine Intel architecture lets the GPU render games while the NPU processes noise reduction.',
      sideNote:
        'Multi-engine allocation ensures that background voice filtering never steals precious GPU frames during competitive gaming.',
      neutralAck: 'Logged — keeping voice AI off the GPU protects competitive frame rates.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'You accept frame drops and lag as inevitable whenever background chat apps run alongside your game.',
      sideNote:
        'Single-engine task contention forces the GPU or CPU to throttle game performance to handle background tasks.',
      neutralAck: 'Got it — accepting stutter is common before experiencing tri-engine offloading.',
    },
  },
  {
    id: 't4-q9',
    tier: 4,
    indexInTier: 9,
    category: 'battery_portability',
    question:
      'How do you feel when you discover that your current laptop is burning battery power just to keep a camera background blurred?',
    optionA: {
      id: 'ai_pc',
      label:
        'Motivated to switch to an Intel AI PC that handles continuous camera tasks on an ultra-efficient NPU.',
      sideNote:
        'NPUs execute sustained matrix operations at up to 2.5x greater power efficiency than traditional processors.',
      neutralAck: 'Noted — stopping silent battery drain on calls makes an immediate difference.',
    },
    optionB: {
      id: 'normal_pc',
      label: "Indifferent—you don't mind keeping your laptop plugged into a wall outlet during every video call.",
      sideNote:
        'Running continuous camera effects on standard CPUs can reduce unplugged battery life by several hours.',
      neutralAck: 'Understood — living near a wall plug works until a socket is out of reach.',
    },
  },
  {
    id: 't4-q10',
    tier: 4,
    indexInTier: 10,
    category: 'social_proof',
    question:
      'If an expert sales consultant demonstrated that an Intel AI PC delivers better battery, native app compatibility, and local privacy for a similar price, what would you do?',
    optionA: {
      id: 'ai_pc',
      label:
        'Choose the Intel AI PC immediately based on clear technical superiority and functional value.',
      sideNote:
        'Comparing real-world feature advantages makes the decision to upgrade to an Intel AI PC straightforward.',
      neutralAck: 'Captured — clear side-by-side value makes the choice effortless.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Stick with a traditional laptop anyway, ignoring demonstrated performance advantages.',
      sideNote:
        'Rejecting functional hardware upgrades often stems from unfamiliarity with modern NPU advantages.',
      neutralAck: 'Noted — seeing a live demo on the floor often clarifies those gains.',
    },
  },

  // ============================================================================
  // TIER 5: DIRECT CHOICE & HIGH STAKES (10 Questions)
  // ============================================================================
  {
    id: 't5-q1',
    tier: 5,
    indexInTier: 1,
    category: 'cost_value',
    question:
      'You are at the store checkout counter deciding between two laptops at a similar price point. Which vision of computing do you take home?',
    optionA: {
      id: 'ai_pc',
      label:
        'Intel Core Ultra AI PC—featuring a dedicated NPU (40+ TOPS), tri-engine responsiveness, local privacy, and 20+ hour battery capability.',
      sideNote:
        'Selecting the Intel AI PC secures modern Copilot+ certification, native x86 stability, and long-term device relevance.',
      neutralAck: 'Recorded — future-ready silicon locks in 4 years of confidence.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Traditional Normal Laptop—lacking an NPU, relying on cloud AI subscriptions, and draining battery faster during video calls.',
      sideNote:
        'Choosing a traditional laptop leaves you reliant on older dual-chip processing without local AI acceleration.',
      neutralAck: 'Noted — traditional setups remain bound to dual-chip limits.',
    },
  },
  {
    id: 't5-q2',
    tier: 5,
    indexInTier: 2,
    category: 'future_proofing',
    question:
      'When you look back at your laptop purchase 3 years from now, which situation would you regret more?',
    optionA: {
      id: 'ai_pc',
      label:
        "Regretting buying an AI PC because it was 'too fast and had too much battery life' (virtually impossible).",
      sideNote:
        'Over-investing in chip capability and battery endurance consistently yields higher long-term user satisfaction.',
      neutralAck: 'Captured — nobody ever wishes their laptop had less battery or speed.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Regretting buying a normal laptop because it cannot run modern local AI tools and requires constant charging.',
      sideNote:
        "Buyers who skip the NPU in 2026 frequently report buyer's remorse as new OS features require local TOPS.",
      neutralAck: 'Understood — avoiding future regret is why hardware foresight matters today.',
    },
  },
  {
    id: 't5-q3',
    tier: 5,
    indexInTier: 3,
    category: 'hardware_compatibility',
    question:
      'For demanding engineering, creative, or business workloads, which processor architecture offers total peace of mind?',
    optionA: {
      id: 'ai_pc',
      label:
        'Intel Core Ultra—combining native x86 application compatibility with OpenVINO software optimization.',
      sideNote:
        "Intel's x86 platform guarantees 100% native software execution without emulation risks or app crashes.",
      neutralAck: 'Logged — native x86 + OpenVINO keeps specialized apps dependable.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        "Non-x86 or older architecture—hoping that your critical apps don't crash under translation layers.",
      sideNote:
        'Emulation overhead can cause unexpected software instability during critical assignment or work deadlines.',
      neutralAck: 'Noted — translation layers always carry a compatibility gamble.',
    },
  },
  {
    id: 't5-q4',
    tier: 5,
    indexInTier: 4,
    category: 'battery_portability',
    question:
      'How do you want your laptop to handle long days on campus or traveling without access to power outlets?',
    optionA: {
      id: 'ai_pc',
      label:
        'Confidently leave your heavy power brick at home, knowing your Intel Core Ultra AI PC provides multi-day mobility.',
      sideNote:
        'Intel Series 2 and Series 3 processors optimize power draw to deliver up to 20 to 27 hours of video playback.',
      neutralAck: 'Recorded — traveling light without a charger brick changes your daily carry.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'Carry your charger everywhere and scout for wall outlets in every room you enter.',
      sideNote:
        'Standard laptops without power-efficient NPUs require frequent charging during active daily use.',
      neutralAck: 'Got it — carrying a power brick everywhere remains the fallback on legacy PCs.',
    },
  },
  {
    id: 't5-q5',
    tier: 5,
    indexInTier: 5,
    category: 'privacy_security',
    question:
      'When personal photos, financial records, or private creative drafts are being processed by AI, where should that computing happen?',
    optionA: {
      id: 'ai_pc',
      label:
        "100% locally on your Intel AI PC's dedicated NPU, completely isolated from external servers.",
      sideNote:
        'Local hardware execution guarantees that your personal files remain private and securely stored on your laptop.',
      neutralAck: 'Captured — on-device execution keeps private work strictly yours.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Uploaded to external cloud data centers where security and retention policies are managed by third parties.',
      sideNote:
        'Transmitting private files to the cloud exposes your data to remote network vulnerabilities.',
      neutralAck: 'Understood — remote data centers introduce external dependencies.',
    },
  },
  {
    id: 't5-q6',
    tier: 5,
    indexInTier: 6,
    category: 'productivity_multitasking',
    question:
      'How do you want your laptop to manage multitasking when you are running a video call, 20 browser tabs, and editing a deck?',
    optionA: {
      id: 'ai_pc',
      label:
        'Intel Tri-Engine setup—CPU manages logic, GPU handles visuals, and NPU processes camera/mic AI.',
      sideNote:
        'Distributing workloads across three distinct engines keeps system performance smooth and thermal levels low.',
      neutralAck: 'Noted — dividing tasks across CPU, GPU, and NPU prevents slowdowns.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Standard Dual-Engine setup—forcing the CPU and GPU to choke on background tasks and active apps.',
      sideNote:
        'Two-chip processors suffer performance bottlenecks when forced to handle concurrent AI background loads.',
      neutralAck: 'Got it — dual-engine crowding is why older machines lag under heavy tabs.',
    },
  },
  {
    id: 't5-q7',
    tier: 5,
    indexInTier: 7,
    category: 'future_proofing',
    question:
      'When evaluating Microsoft Copilot+ certification, which standard guarantees your PC is ready for future Windows AI updates?',
    optionA: {
      id: 'ai_pc',
      label:
        'An Intel Core Ultra Series 2/3 laptop featuring an NPU with 40+ dedicated TOPS and 16GB+ RAM.',
      sideNote:
        'Meeting the 40+ NPU TOPS baseline ensures your system will support all local Windows 11 AI enhancements.',
      neutralAck: 'Logged — 40+ NPU TOPS and 16GB+ RAM clear the official Copilot+ bar.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'A standard laptop with 8GB RAM and no NPU, relying strictly on basic web cloud features.',
      sideNote:
        'Laptops below the 40 TOPS NPU baseline are excluded from running local Copilot+ features.',
      neutralAck: 'Noted — 8GB non-NPU machines are locked out of local Copilot+ updates.',
    },
  },
  {
    id: 't5-q8',
    tier: 5,
    indexInTier: 8,
    category: 'cost_value',
    question: 'Which laptop purchasing philosophy best aligns with your personal values as a smart consumer?',
    optionA: {
      id: 'ai_pc',
      label:
        "'Buy right, buy once'—investing in an Intel Core Ultra AI PC that delivers long-term performance, privacy, and battery life.",
      sideNote:
        'Discerning buyers choose hardware that stays powerful, power-efficient, and compatible over a 4+ year lifespan.',
      neutralAck: 'Recorded — buying once for 4+ years protects both time and money.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        "'Buy cheap, replace early'—settling for older non-NPU hardware that feels sluggish within a year.",
      sideNote:
        'Settling for outdated silicon leads to early upgrade cycles and lower overall satisfaction.',
      neutralAck: 'Understood — lower checkout prices often come with shorter lifespans.',
    },
  },
  {
    id: 't5-q9',
    tier: 5,
    indexInTier: 9,
    category: 'social_proof',
    question:
      'If you could guarantee that your laptop remains quiet, cool, fast, and secure for all 4 years of college or work, which chip would you choose?',
    optionA: {
      id: 'ai_pc',
      label:
        'Intel Core Ultra Processor—engineered with P-cores, E-cores, LP-E cores, Arc Graphics, and Intel AI Boost NPU.',
      sideNote:
        'Intel Core Ultra brings heterogeneous computing architecture built specifically for modern edge AI and personal productivity.',
      neutralAck: 'Captured — heterogeneous Intel silicon checks all four daily priorities.',
    },
    optionB: {
      id: 'normal_pc',
      label: 'A legacy 13th Gen or older traditional processor without dedicated AI hardware.',
      sideNote:
        'Legacy processors lack neural processing units, forcing all machine learning tasks onto standard CPU cores.',
      neutralAck: 'Noted — legacy silicon lacks the dedicated NPU tile modern apps expect.',
    },
  },
  {
    id: 't5-q10',
    tier: 5,
    indexInTier: 10,
    category: 'cost_value',
    question: 'You are ready to make your final choice. Which PC will you take home today?',
    optionA: {
      id: 'ai_pc',
      label:
        'Intel Core Ultra AI PC—The complete package with 40+ NPU TOPS, local privacy, multi-day battery, and 100% native x86 app compatibility.',
      sideNote:
        'Choosing next-generation performance secures uncompromised privacy, native compatibility, and industry-leading battery mobility.',
      neutralAck: 'Logged — your priorities align directly with an Intel Core Ultra AI PC.',
    },
    optionB: {
      id: 'normal_pc',
      label:
        'Traditional Laptop—Standard CPU/GPU setup with cloud-only AI reliance and traditional battery draw.',
      sideNote:
        'Traditional laptops provide standard computing but lack dedicated local AI hardware acceleration.',
      neutralAck: 'Noted — you are weighing a standard setup right up to checkout.',
    },
  },
];

export const FINAL_DECISION_CHOICES = {
  aiPc: {
    id: 'ai_pc' as const,
    title: 'Intel Core Ultra AI PC',
    bullets: [
      'Dedicated NPU (40+ to 50 TOPS) for local AI execution',
      'Multi-day battery endurance (Up to 20–27 hours)',
      '100% Native x86 App & Gaming Compatibility',
      'Local Data Privacy (Zero mandatory cloud uploads)',
    ],
    reward: 1.0,
  },
  normalPc: {
    id: 'normal_pc' as const,
    title: 'Traditional Normal Laptop',
    bullets: [
      'Standard Dual-Chip Setup (CPU + GPU only, No NPU)',
      'Cloud-dependent AI processing (Requires active Wi-Fi)',
      'Standard battery runtime (Requires frequent wall charging)',
      'Traditional CPU/GPU multitasking load',
    ],
    reward: 0.0,
  },
};
