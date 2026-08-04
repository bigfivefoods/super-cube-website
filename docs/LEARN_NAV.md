# Learn UX

## Layout

```
┌────────────┬──────────────────────────┐
│  Sidebar   │  Main content            │
│  Today     │  Screen / page 1         │
│  Learn     │  (fits neatly)           │
│  Check-in  │  ↓ scroll                │
│  Progress  │  Screen / page 2         │
│  You       │  …                       │
│  Pathway   │                          │
│  More…     │                          │
└────────────┴──────────────────────────┘
```

- **Sidebar always on** (sticky desktop; horizontal chips on small screens)
- **Main column**: stacked `LearnScreen` blocks — each is roughly one viewport “page”
- Scroll down in main for the **next page** of information

## Bottom tabs (mobile)

Same five destinations as the sidebar: Today · Learn · Check-in · Progress · You

## Today screens

1. Status + cube + pathway  
2. Do this next  
3. Destination map  

## Check-in wizard

Day → Faces (one at a time) → Journal → Done  

## Components

- `LearnShell` — sidebar + main  
- `LearnPage` / `LearnScreen` — neat scroll pages  
- `LearnPageHeader`, `LearnCard`, `LearnPageActions`, `LearnNavTile`  
