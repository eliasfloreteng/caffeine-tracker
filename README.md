# Caffeine Tracker

A web app that tracks your caffeine intake and models how it metabolizes over time, helping you make informed decisions about sleep quality.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/eliasfloreteng/caffeine-tracker-app)

## Features

- **Real-time caffeine level** — shows how much caffeine remains in your body right now
- **Pharmacokinetic modeling** — uses first-order elimination kinetics with a 6.5-hour half-life for accurate predictions
- **Bedtime insights** — projects your caffeine level at bedtime and calculates how much more you can safely consume
- **Decay chart** — 48-hour visualization (past 24h + next 24h) of your caffeine curve
- **11 beverages** — espresso, drip coffee, cold brew, lattes, teas, energy drinks, and more
- **Consumption log** — editable history with adjustable timestamps
- **Persistent storage** — data saved to browser localStorage, no account needed

## Tech Stack

- **Framework**: Next.js + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Validation**: Zod + React Hook Form

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # lint
```

## How It Works

Caffeine elimination follows first-order kinetics:

```
C(t) = C₀ × e^(−k × t)     where k = ln(2) / 6.5h ≈ 0.1066 h⁻¹
```

All logged doses are summed at the current time to give your total active caffeine level. The app warns you when your projected bedtime level exceeds 50 mg.
