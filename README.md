# Research Analyzer 🧪

AI-powered research paper analysis tool. Paste any research paper, abstract, or scientific text and get an instant structured breakdown.

## Features

- **Plain English Summary** — Jargon-free overview accessible to anyone
- **Key Findings** — Quantitative results extracted and highlighted
- **Methodology Review** — Critical assessment of study design and rigor
- **Limitations** — Identified weaknesses and caveats
- **Practical Applications** — Real-world implications for practitioners
- **Questions to Explore** — Follow-up research directions

## Stack

- Next.js 16 (App Router)
- Claude AI (Anthropic API)
- Tailwind CSS 4
- Framer Motion
- TypeScript

## Setup

```bash
npm install
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
npm run dev
```

## How It Works

1. Paste your research text (abstract, full paper, or excerpt)
2. Claude AI analyzes the content and returns structured JSON
3. Results are displayed in a clean, categorized format
4. Copy the full analysis to clipboard with one click

Built by [Harrison](https://github.com/harry-supermix) — bridging sports science and AI.
