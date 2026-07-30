# Super-Cube Leadership Website

World-class leadership development and education site for **[www.super-cube.me](https://www.super-cube.me)**, presenting the **Super-Cube Leadership Model**—a multidimensional, human-centric framework developed by Craig Ross Muller (DBA, University of KwaZulu-Natal, 2020).

Content is informed by public scholarship and summaries of the model (including [Grokipedia: Super-Cube Leadership Model](https://grokipedia.com/page/Super-Cube_Leadership_Model)).

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** v4
- **Typography** matching [supplieradvisor.com](https://supplieradvisor.com):
  - Sans: `Inter, system-ui, sans-serif`
  - Mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace`

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home — model intro, constructs, stats, levels |
| `/the-model` | Deep dive: structure, philosophy, learning theory |
| `/constructs` | Six faces: Choices → Spiritual |
| `/programs` | Blended programmes & pathways |
| `/research` | Empirical validation summary |
| `/about` | Origins & authorship |
| `/contact` | Enquiry form |

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Design notes

- Cream / ink palette with gold accent
- Interactive CSS 3D Super-Cube on home & model pages
- Mobile-first navigation, accessible focus states
- Single content source: `src/lib/content.ts`
