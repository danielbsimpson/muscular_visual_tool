# ExoView

**Visualize your body. Understand your training.**

ExoView is an interactive, browser-based 3D tool for exploring the human body and
planning evidence-based training. Zoom into muscles, bones, and the respiratory and
cardiovascular systems to learn what they are and how they work, discover exercises
that develop each area, read the science behind them, and build a weekly routine that
shows — as a **heat map** — exactly what you're targeting.

> Status: 🚧 Early development. See [`implementation_plan.md`](implementation_plan.md)
> for the roadmap and [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) for the full
> concept.

## Features

- 🧍 **Interactive 3D body** — rotate, pan, zoom; toggle and layer body systems.
- 🔎 **Explore structures** — click any muscle or bone for its name, description, and
  function; search and fly to any structure.
- 🏋️ **Exercise library** — exercises linked to the structures they target, with
  technique cues, common mistakes, and easier/harder variations.
- 📚 **Backed by science** — training recommendations link to curated scientific
  studies explaining *why* they work.
- 🗓️ **Weekly planner + heat map** — build a 7-day routine and see which muscles,
  bones, and systems it targets, with likely growth/soreness zones highlighted.
- 📶 **Works offline** — installable PWA; no account required.

## Body Systems

| System | Status |
| --- | --- |
| Muscular | Planned — M1 |
| Skeletal (bones) | Planned — M1 |
| Respiratory | Planned — M2 |
| Cardiovascular / Vascular | Planned — M2 |

## Tech Stack

- **Framework**: React + TypeScript
- **3D**: Three.js via `@react-three/fiber` and `@react-three/drei`
- **Data**: Static JSON datasets, fully client-side
- **Persistence**: IndexedDB / localStorage (saved routines)
- **Delivery**: Installable PWA with offline support
- **Backend**: None for the MVP (data layer designed to allow a future API)

## Getting Started

> These steps describe the intended setup. The project scaffold is created in
> milestone **M0** (see the implementation plan).

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Project Structure (planned)

```
exoview/
├── docs/                  # Concept, design, and data documentation
│   └── PROJECT_BRIEF.md
├── public/                # Static assets, 3D models, PWA manifest
├── src/
│   ├── components/        # UI components
│   ├── viewer/            # 3D scene, camera, picking, heat map
│   ├── data/              # Structure/exercise/study datasets + loaders
│   ├── features/          # Explore, exercises, planner
│   ├── state/             # Client state + persistence
│   └── types/             # Shared TypeScript models
├── README.md
└── implementation_plan.md
```

## Roadmap

1. **M1 — Explore**: 3D model, system toggles, structure selection & info (muscular +
   skeletal), search, accessible fallback.
2. **M2 — Train**: exercise library, scientific studies, respiratory & cardiovascular
   systems.
3. **M3 — Plan**: weekly routine planner, heat map, saved routines, PWA/offline.

See [`implementation_plan.md`](implementation_plan.md) for full details.

## Disclaimer

ExoView is an educational and planning tool. It does **not** provide medical, diagnostic,
or personalized health advice. Consult a qualified professional before starting any new
exercise program.

## License

To be determined.
