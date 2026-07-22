# Year 5 Maths Coach

An interactive practice app for the Victorian **Year 5 NAPLAN numeracy** test.

Built to be used independently by a 10-year-old: every question has layered help
(hints → worked solution → concept guide), so getting stuck never means getting
stuck for long.

## What it does

**31 topics across all five NAPLAN strands**

| Strand | Topics |
| --- | --- |
| 🔢 Number | Place value, rounding, + and −, multiplication, division & remainders, factors & multiples, equivalent fractions, adding fractions, fractions of amounts, decimals, percentages, money |
| 🧩 Algebra | Number patterns, missing numbers, multi-step word problems, balancing sentences, estimating |
| 📏 Measurement | Perimeter, area, volume, unit conversion, time & duration, angles |
| 📐 Space | 2D shapes, 3D objects, symmetry, coordinates, flips/slides/turns |
| 📊 Statistics | Reading graphs, averages, chance |

**Questions are generated, not stored.** Every practice set is freshly built, so
she can repeat a topic as often as she likes without memorising answers.

**Three levels of help on every single question**

1. 💡 **Hints** — revealed one at a time, smallest nudge first, never the answer.
2. 📝 **Show me how** — the full worked solution, step by step.
3. 📚 **How does this work?** — a concept guide with the method, a worked
   example, and the mistake to watch out for.

After two wrong attempts the worked solution appears automatically rather than
letting her guess repeatedly.

**Adaptive difficulty.** Each topic tracks its own level 1–3. Five correct in a
row moves her up; a run of struggling moves her back down, so practice stays in
the zone where she can succeed.

**Mock test mode.** 40 questions across all strands, 50 minutes on the clock, no
hints — matching the real paper. The results break down by strand and point at
what to practise next.

**Progress tracking.** Stars, accuracy, per-topic mastery, and mock test history,
all stored on the device. Two stars for an unaided correct answer, one if help
was used.

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL it prints.

## Checking the maths

```bash
npm run check
```

This hammers every question generator 300 times and asserts that answers are
present and numeric where expected, multiple-choice options actually contain the
correct answer, there are no duplicate options, and nothing leaks `undefined`.
Run it after touching anything in `src/curriculum/`.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to the `gh-pages` branch.

One-time setup on GitHub: **Settings → Pages → Source: Deploy from a branch →
`gh-pages` / root**.

The app then lives at:

```
https://dagost2.github.io/mathapp_year5/
```

> The `base` in `vite.config.ts` is `/mathapp_year5/` and must match the repo
> name. If you rename the repo, change it there and in `index.html`.

## Installing on the iPad

1. Open the URL above in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.

It then runs full screen like a normal app, and works offline — the service
worker caches everything, and all questions are generated on the device.

## Project layout

```
src/
  curriculum/
    types.ts          Question/Skill model + seeded RNG
    index.ts          Strand registry, practice sets, mock test builder
    skills/           One file per strand — the generators and guides live here
  components/
    QuestionCard.tsx  The core answer/feedback/help loop
    Visual.tsx        All diagrams, as inline SVG
    Keypad.tsx        On-screen number pad
    Help.tsx          Hints, worked solutions, guide modal
  pages/              Home, Practice, Test, Progress
  store/useStore.ts   Progress + mastery, persisted to localStorage
```

### Adding a new topic

Add a `Skill` to the relevant file in `src/curriculum/skills/`. It needs a
`guide` (summary, steps, example, watch-out) and a `generate(level, rng)`
function returning a `Question`. It appears in the UI automatically. Run
`npm run check` afterwards.
