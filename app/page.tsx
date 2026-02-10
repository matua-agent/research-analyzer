"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Loader2, ArrowRight, Copy, Check, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AnalysisResult {
  summary: string;
  keyFindings: string[];
  methodology: string;
  limitations: string[];
  practicalApplications: string[];
  criticalQuestions: string[];
}

const EXAMPLE_ABSTRACT = `Background: Exercise-induced fatigue during prolonged endurance events leads to progressive declines in power output, a phenomenon termed "durability." This study investigated the relationship between carbohydrate mouth rinse frequency and the preservation of power output during prolonged cycling.

Methods: Twelve trained cyclists (VO2max: 62.3 ± 4.1 mL/kg/min) completed three 3-hour cycling trials at 65% of peak power, followed by a 20-minute time trial. Conditions included: no rinse (CON), rinse every 15 minutes (R15), and rinse every 30 minutes (R30).

Results: Time trial power output was significantly higher in R15 (287 ± 24 W) compared to CON (271 ± 22 W, p = 0.003) and R30 (278 ± 23 W, p = 0.041). R15 also showed attenuated cardiac drift (3.2 ± 1.1% vs 6.8 ± 2.3% in CON). No significant differences in RPE were observed between conditions at matched time points during the steady-state phase.

Conclusion: Frequent carbohydrate mouth rinsing preserved end-exercise performance and attenuated cardiovascular drift during prolonged cycling, suggesting a centrally mediated mechanism for durability preservation.`;

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [streamText, setStreamText] = useState("");

  async function analyze() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setStreamText("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setInput("");
    setResult(null);
    setError("");
    setStreamText("");
  }

  async function copyResult() {
    if (!result) return;
    const text = formatResultAsText(result);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            <FlaskConical className="w-8 h-8 text-[var(--accent-light)]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Research Analyzer</h1>
        </div>
        <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
          Paste any research paper, abstract, or scientific text. Get an instant AI-powered breakdown
          with key findings, methodology review, and practical applications.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          /* Input Phase */
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your research paper, abstract, or scientific text here..."
                className="w-full h-64 p-5 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl resize-none focus:outline-none focus:border-[var(--accent)]/50 transition-colors text-[15px] leading-relaxed placeholder:text-[var(--muted)]/50"
              />
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setInput(EXAMPLE_ABSTRACT)}
                  className="text-sm text-[var(--muted)] hover:text-[var(--accent-light)] transition-colors"
                >
                  Try an example →
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)]">
                    {input.length.toLocaleString()} chars
                  </span>
                  <button
                    onClick={analyze}
                    disabled={!input.trim() || loading}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-sm text-[var(--muted)]">AI is reading your paper...</span>
                </div>
                <div className="space-y-2">
                  {["Extracting key findings", "Reviewing methodology", "Identifying limitations", "Generating insights"].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 1.5 }}
                      className="text-sm text-[var(--muted)]/60"
                    >
                      → {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Results Phase */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Analyze another
              </button>
              <button
                onClick={copyResult}
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy all"}
              </button>
            </div>

            {/* Summary */}
            <Section title="📋 Plain English Summary" delay={0}>
              <div className="prose">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            </Section>

            {/* Key Findings */}
            <Section title="🔬 Key Findings" delay={0.1}>
              <ul className="space-y-2">
                {result.keyFindings.map((f, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#d4d4d4]">
                    <span className="text-[var(--accent-light)] font-mono text-sm mt-0.5">{i + 1}.</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Methodology */}
            <Section title="🧪 Methodology Review" delay={0.2}>
              <div className="prose">
                <ReactMarkdown>{result.methodology}</ReactMarkdown>
              </div>
            </Section>

            {/* Limitations */}
            <Section title="⚠️ Limitations" delay={0.3}>
              <ul className="space-y-2">
                {result.limitations.map((l, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#d4d4d4]">
                    <span className="text-[var(--warning)] mt-1">•</span>
                    {l}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Practical Applications */}
            <Section title="💡 Practical Applications" delay={0.4}>
              <ul className="space-y-2">
                {result.practicalApplications.map((a, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#d4d4d4]">
                    <span className="text-[var(--success)] mt-1">→</span>
                    {a}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Critical Questions */}
            <Section title="❓ Questions to Explore" delay={0.5}>
              <ul className="space-y-2">
                {result.criticalQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#d4d4d4]">
                    <span className="text-[var(--accent-light)]">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[var(--muted)]/40">
        Built with Next.js + Claude AI · Research Analyzer v0.1
      </footer>
    </main>
  );
}

function Section({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-6 p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl"
    >
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

function formatResultAsText(result: AnalysisResult): string {
  return `RESEARCH ANALYSIS
=================

SUMMARY
${result.summary}

KEY FINDINGS
${result.keyFindings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

METHODOLOGY
${result.methodology}

LIMITATIONS
${result.limitations.map((l) => `• ${l}`).join("\n")}

PRACTICAL APPLICATIONS
${result.practicalApplications.map((a) => `→ ${a}`).join("\n")}

QUESTIONS TO EXPLORE
${result.criticalQuestions.map((q) => `? ${q}`).join("\n")}`;
}
