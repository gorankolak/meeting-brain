import { z } from "zod";

const requestSchema = z.object({
  meetingTitle: z.string().optional().default(""),
  transcript: z.string().min(20, "Transcript must be at least 20 characters."),
  sourceType: z.string().default("pasted_notes")
});

const responseSchema = z.object({
  meeting_title: z.string(),
  meeting_type: z.string(),
  source_type: z.string(),
  generated_at: z.string(),
  summary: z.string(),
  decisions: z.array(
    z.object({
      id: z.string(),
      decision: z.string(),
      reasoning: z.string(),
      owner: z.string(),
      confidence: z.enum(["high", "medium", "low"])
    })
  ),
  action_items: z.array(
    z.object({
      id: z.string(),
      task: z.string(),
      owner: z.string(),
      deadline: z.string(),
      priority: z.enum(["high", "medium", "low", "unclear"]),
      status: z.literal("open"),
      notes: z.string()
    })
  ),
  risks: z.array(
    z.object({
      id: z.string(),
      risk: z.string(),
      impact: z.string(),
      mitigation: z.string(),
      owner: z.string()
    })
  ),
  open_questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      owner: z.string(),
      notes: z.string()
    })
  ),
  next_steps: z.array(z.string()),
  stakeholders: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      involvement: z.string()
    })
  ),
  jira_tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      assignee: z.string(),
      due_date: z.string(),
      priority: z.string(),
      labels: z.array(z.string())
    })
  )
});

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function sentenceList(transcript) {
  return transcript
    .split(/\n+/)
    .map((line) => line.replace(/^\[[^\]]+\]\s*/, "").trim())
    .filter(Boolean);
}

function inferOwner(text) {
  const match = text.match(/^([A-Z][a-z]+):/);
  return match ? match[1] : "Unclear";
}

function buildFallbackReport({ meetingTitle, transcript, sourceType }) {
  const lines = sentenceList(transcript);
  const decisions = [];
  const actionItems = [];
  const risks = [];
  const openQuestions = [];
  const nextSteps = [];
  const stakeholders = new Map();

  lines.forEach((line, index) => {
    const owner = inferOwner(line);
    if (owner !== "Unclear") {
      stakeholders.set(owner, {
        name: owner,
        role: "Meeting participant",
        involvement: "Referenced in meeting notes"
      });
    }

    const normalized = line.toLowerCase();
    if (/\b(decision|agreed|let's|proceeds only|will)\b/.test(normalized)) {
      decisions.push({
        id: `DEC-${String(decisions.length + 1).padStart(3, "0")}`,
        decision: line.replace(/^[A-Z][a-z]+:\s*/, ""),
        reasoning: "Derived from transcript wording.",
        owner,
        confidence: "medium"
      });
    }

    if (/\b(please|will|need to|confirm|debug|notify|prepare)\b/.test(normalized)) {
      actionItems.push({
        id: `ACT-${String(actionItems.length + 1).padStart(3, "0")}`,
        task: line.replace(/^[A-Z][a-z]+:\s*/, ""),
        owner,
        deadline: "",
        priority: normalized.includes("today") || normalized.includes("wednesday") ? "high" : "medium",
        status: "open",
        notes: "Extracted from transcript."
      });
    }

    if (/\b(block|issue|risk|concern|error|delay|502)\b/.test(normalized)) {
      risks.push({
        id: `RSK-${String(risks.length + 1).padStart(3, "0")}`,
        risk: line.replace(/^[A-Z][a-z]+:\s*/, ""),
        impact: "May affect delivery timeline or release quality.",
        mitigation: "Follow up in the next working session.",
        owner
      });
    }

    if (/\b(question|unclear|unresolved)\b/.test(normalized)) {
      openQuestions.push({
        id: `Q-${String(openQuestions.length + 1).padStart(3, "0")}`,
        question: line.replace(/^[A-Z][a-z]+:\s*/, ""),
        owner,
        notes: "Needs follow-up."
      });
    }

    if (index < 3) {
      nextSteps.push(line.replace(/^[A-Z][a-z]+:\s*/, ""));
    }
  });

  const jiraTasks = actionItems.map((item) => ({
    title: item.task,
    description: item.notes,
    assignee: item.owner,
    due_date: item.deadline,
    priority: item.priority,
    labels: ["meeting-brain", "follow-up"]
  }));

  return {
    meeting_title: meetingTitle || "Generated Meeting Report",
    meeting_type: "general",
    source_type: sourceType,
    generated_at: new Date().toISOString(),
    summary:
      lines.slice(0, 3).join(" ").slice(0, 420) ||
      "Meeting Brain could not derive a detailed summary from the supplied input.",
    decisions,
    action_items: actionItems,
    risks,
    open_questions: openQuestions,
    next_steps: [...new Set(nextSteps)].slice(0, 5),
    stakeholders: Array.from(stakeholders.values()),
    jira_tasks: jiraTasks
  };
}

function buildGeminiPrompt(input) {
  return `You are Meeting Brain, an expert PMO meeting analyst.
Return JSON only and match the required schema exactly.
Do not invent names, dates, or responsibilities.
Use "Unclear" when a string field cannot be reliably extracted.

Schema fields:
meeting_title, meeting_type, source_type, generated_at, summary, decisions, action_items, risks, open_questions, next_steps, stakeholders, jira_tasks

Transcript:
${input.transcript}`;
}

async function generateWithGemini(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { report: buildFallbackReport(input), mode: "mock" };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildGeminiPrompt(input) }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = JSON.parse(text);
  parsed.generated_at = parsed.generated_at || new Date().toISOString();
  parsed.meeting_title = parsed.meeting_title || input.meetingTitle || "Generated Meeting Report";
  parsed.source_type = parsed.source_type || input.sourceType;

  return { report: parsed, mode: "llm" };
}

export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    const input = requestSchema.parse(JSON.parse(event.body || "{}"));
    const result = await generateWithGemini(input);
    const validated = responseSchema.parse(result.report);
    return json(200, { report: validated, mode: result.mode });
  } catch (error) {
    return json(400, { error: error.message || "Unable to generate report." });
  }
}
