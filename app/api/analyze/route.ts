import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a research paper analyst. Given scientific text (a full paper, abstract, or excerpt), produce a structured analysis in valid JSON format.

Return ONLY valid JSON with this exact structure:
{
  "summary": "A 2-3 sentence plain English summary accessible to a non-specialist. No jargon.",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "methodology": "A paragraph reviewing the study design, sample size, statistical approach, and overall rigor. Note strengths and weaknesses.",
  "limitations": ["Limitation 1", "Limitation 2", ...],
  "practicalApplications": ["Application 1", "Application 2", ...],
  "criticalQuestions": ["Question 1", "Question 2", ...]
}

Guidelines:
- keyFindings: 3-6 specific, quantitative findings where possible
- limitations: 3-5 methodological or interpretive limitations
- practicalApplications: 3-5 real-world implications for practitioners, coaches, clinicians, or researchers
- criticalQuestions: 3-5 follow-up questions the paper raises
- Be critical but fair. Highlight both strengths and weaknesses.
- If the text is not a research paper, still extract whatever structured insights you can.`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (text.length > 100000) {
      return NextResponse.json({ error: "Text too long (max 100,000 characters)" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Analyze this research text and return the structured JSON analysis:\n\n${text}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response format" }, { status: 500 });
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const result = JSON.parse(jsonStr);

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("Analysis error:", e);
    if (e instanceof SyntaxError) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
