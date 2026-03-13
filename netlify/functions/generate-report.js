import { z } from "zod";

const COPY = {
  hr: {
    unclear: "Nejasno",
    meetingParticipant: "Sudionik sastanka",
    referencedInNotes: "Spomenuto u bilješkama sa sastanka",
    derivedFromTranscript: "Izvedeno iz formulacije u zapisniku.",
    extractedFromTranscript: "Izdvojeno iz zapisnika.",
    riskImpact: "Može utjecati na rok isporuke ili kvalitetu izdanja.",
    mitigation: "Pratiti na sljedećoj radnoj sesiji.",
    followUp: "Potrebno praćenje.",
    fallbackTitle: "Generirani izvještaj sa sastanka",
    fallbackSummary: "Meeting Brain nije uspio izvući detaljan sažetak iz dostavljenog unosa.",
    transcriptTooShort: "Zapisnik mora imati najmanje 20 znakova.",
    methodNotAllowed: "Metoda nije dopuštena.",
    unableToGenerate: "Generiranje izvještaja nije uspjelo.",
    followUpLabel: "pracenje",
    unclearInstruction: "Koristi \"Nejasno\" kada polje nije moguće pouzdano izdvojiti.",
    outputLanguageInstruction: "Vrati sav prirodni jezik u hrvatskom jeziku."
  },
  en: {
    unclear: "Unclear",
    meetingParticipant: "Meeting participant",
    referencedInNotes: "Referenced in meeting notes",
    derivedFromTranscript: "Derived from transcript wording.",
    extractedFromTranscript: "Extracted from transcript.",
    riskImpact: "May affect delivery timeline or release quality.",
    mitigation: "Follow up in the next working session.",
    followUp: "Needs follow-up.",
    fallbackTitle: "Generated Meeting Report",
    fallbackSummary: "Meeting Brain could not derive a detailed summary from the supplied input.",
    transcriptTooShort: "Transcript must be at least 20 characters.",
    methodNotAllowed: "Method not allowed.",
    unableToGenerate: "Unable to generate report.",
    followUpLabel: "follow-up",
    unclearInstruction: "Use \"Unclear\" when a string field cannot be reliably extracted.",
    outputLanguageInstruction: "Return all natural-language field content in English."
  }
};

function getLanguage(language) {
  return language === "en" ? "en" : "hr";
}

function getCopy(language) {
  return COPY[getLanguage(language)];
}

function parsePayload(body) {
  try {
    return JSON.parse(body || "{}");
  } catch {
    return {};
  }
}

const requestSchema = z.object({
  meetingTitle: z.string().optional().default(""),
  transcript: z.string().min(20),
  sourceType: z.string().default("pasted_notes"),
  language: z.string().default("hr")
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
  return match ? match[1] : null;
}

function buildFallbackReport({ meetingTitle, transcript, sourceType, language }) {
  const copy = getCopy(language);
  const lines = sentenceList(transcript);
  const decisions = [];
  const actionItems = [];
  const risks = [];
  const openQuestions = [];
  const nextSteps = [];
  const stakeholders = new Map();

  lines.forEach((line, index) => {
    const owner = inferOwner(line) || copy.unclear;
    if (owner !== copy.unclear) {
      stakeholders.set(owner, {
        name: owner,
        role: copy.meetingParticipant,
        involvement: copy.referencedInNotes
      });
    }

    const normalized = line.toLowerCase();
    if (/\b(decision|agreed|let's|proceeds only|will)\b/.test(normalized)) {
      decisions.push({
        id: `DEC-${String(decisions.length + 1).padStart(3, "0")}`,
        decision: line.replace(/^[A-Z][a-z]+:\s*/, ""),
        reasoning: copy.derivedFromTranscript,
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
        notes: copy.extractedFromTranscript
      });
    }

    if (/\b(block|issue|risk|concern|error|delay|502)\b/.test(normalized)) {
      risks.push({
        id: `RSK-${String(risks.length + 1).padStart(3, "0")}`,
        risk: line.replace(/^[A-Z][a-z]+:\s*/, ""),
        impact: copy.riskImpact,
        mitigation: copy.mitigation,
        owner
      });
    }

    if (/\b(question|unclear|unresolved)\b/.test(normalized)) {
      openQuestions.push({
        id: `Q-${String(openQuestions.length + 1).padStart(3, "0")}`,
        question: line.replace(/^[A-Z][a-z]+:\s*/, ""),
        owner,
        notes: copy.followUp
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
    labels: ["meeting-brain", copy.followUpLabel]
  }));

  return {
    meeting_title: meetingTitle || copy.fallbackTitle,
    meeting_type: "general",
    source_type: sourceType,
    generated_at: new Date().toISOString(),
    summary: lines.slice(0, 3).join(" ").slice(0, 420) || copy.fallbackSummary,
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
  const copy = getCopy(input.language);

  return `You are Meeting Brain, an expert PMO meeting analyst.
Return JSON only and match the required schema exactly.
Do not invent names, dates, or responsibilities.
${copy.unclearInstruction}
${copy.outputLanguageInstruction}

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
  parsed.meeting_title = parsed.meeting_title || input.meetingTitle || getCopy(input.language).fallbackTitle;
  parsed.source_type = parsed.source_type || input.sourceType;

  return { report: parsed, mode: "llm" };
}

export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: COPY.hr.methodNotAllowed });
  }

  try {
    const input = requestSchema.parse(parsePayload(event.body));
    if (input.transcript.length < 20) {
      return json(400, { error: getCopy(input.language).transcriptTooShort });
    }

    const result = await generateWithGemini(input);
    const validated = responseSchema.parse(result.report);
    return json(200, { report: validated, mode: result.mode });
  } catch (error) {
    const payload = parsePayload(event.body);
    return json(400, { error: error.message || getCopy(payload.language).unableToGenerate });
  }
}
