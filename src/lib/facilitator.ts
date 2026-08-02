/** Facilitator / school cohort calendar + session plan outline */

export interface CohortWeek {
  week: number;
  title: string;
  focus: string;
  facilitatorNotes: string[];
  learnerActions: string[];
}

export const cohortCalendar: CohortWeek[] = [
  {
    week: 1,
    title: "Orient & join",
    focus: "Safety, purpose, cohort code, orientation assessment",
    facilitatorNotes: [
      "Share POPIA/consent note: journals private; scores shared only with consent.",
      "Demo unlock path for late joiners.",
      "Create org code on /learn/coach if not done.",
    ],
    learnerActions: [
      "Join cohort code on /learn/org",
      "Complete orientation",
      "Opt in/out of coach progress sharing",
    ],
  },
  {
    week: 2,
    title: "Baseline",
    focus: "Full six-face pre-assessment",
    facilitatorNotes: [
      "Protect quiet time; no comparing scores aloud.",
      "Remind: honest baseline enables real growth measurement.",
    ],
    learnerActions: [
      "Complete pre-assessment",
      "Read narrative feedback",
      "Review weekly plan on dashboard",
    ],
  },
  {
    week: 3,
    title: "Choices & Principles",
    focus: "Decision craft and ethical spine",
    facilitatorNotes: [
      "Run one I–Thou circle (practice library).",
      "Celebrate process, not performative answers.",
    ],
    learnerActions: [
      "Complete Choices course sessions",
      "Complete Principles sessions",
      "One micro-practice + reflection",
    ],
  },
  {
    week: 4,
    title: "Mental & Emotional",
    focus: "Cognition and regulation under pressure",
    facilitatorNotes: [
      "Optional peer observation: 5-item pulse (name emotion, listen, reframe).",
    ],
    learnerActions: [
      "Mental + Emotional sessions",
      "Daily micro-practice on weakest face",
    ],
  },
  {
    week: 5,
    title: "Physical & Spiritual",
    focus: "Presence, energy, purpose",
    facilitatorNotes: [
      "Link to wellbeing policies without medical advice.",
      "Purpose circle for adults; kindness leadership for kids.",
    ],
    learnerActions: [
      "Physical + Spiritual sessions",
      "Protect one recovery ritual",
    ],
  },
  {
    week: 6,
    title: "Integration week",
    focus: "Catch-up, weakest-face deep practice",
    facilitatorNotes: [
      "Use coach heat map to target faces below cohort median.",
      "No shame language—stretch is the product.",
    ],
    learnerActions: [
      "Finish incomplete sessions",
      "Extra micro-practices on bottom two faces",
    ],
  },
  {
    week: 7,
    title: "Re-measure",
    focus: "Post-assessment + growth report",
    facilitatorNotes: [
      "Same conditions as baseline if possible.",
      "Export CSV for school reporting; keep journals out of exports.",
    ],
    learnerActions: [
      "Complete post-assessment",
      "Download growth PDF",
      "Optional share link for coach",
    ],
  },
  {
    week: 8,
    title: "Celebrate & certify",
    focus: "Certificates, verify IDs, next pathway",
    facilitatorNotes: [
      "Public verify URLs for certificates.",
      "Invite alumni micro-practice streak for 30 days.",
      "Book next pilot / facilitator clinic.",
    ],
    learnerActions: [
      "Claim certificate",
      "Join community clinic if offered",
      "Set 30-day practice streak goal",
    ],
  },
];

export const safeguardingKids = [
  "No forced public sharing of personal scores or journal text.",
  "Facilitators never grade ‘character’—only completion and growth effort.",
  "Escalate safeguarding concerns via school policy, not Super-Cube® chat.",
  "Parental/guardian communication should emphasise development, not ranking.",
];
