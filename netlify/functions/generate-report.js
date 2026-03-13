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

function stripSpeakerPrefix(text) {
  return text.replace(/^[A-Z][a-z]+:\s*/, "").trim();
}

function buildId(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function extractStructuredSignals({ transcript, language }) {
  const copy = getCopy(language);
  const lines = sentenceList(transcript);
  const decisions = [];
  const actionItems = [];
  const risks = [];
  const openQuestions = [];
  const nextSteps = [];
  const stakeholders = new Map();

  for (const line of lines) {
    const owner = inferOwner(line) || copy.unclear;
    const content = stripSpeakerPrefix(line);
    const normalized = content.toLowerCase();

    if (owner !== copy.unclear) {
      stakeholders.set(owner, {
        name: owner,
        role: copy.meetingParticipant,
        involvement: copy.referencedInNotes
      });
    }

    const decisionMatch =
      /\b(decision taken|agreed|approved|we decided|let's|drop ie support|release proceeds only)\b/.test(normalized);
    if (decisionMatch) {
      decisions.push({
        id: buildId("DEC", decisions.length),
        decision: content,
        reasoning: copy.derivedFromTranscript,
        owner,
        confidence: normalized.includes("decision taken") || normalized.includes("agreed") ? "high" : "medium"
      });
    }

    const actionMatch =
      /\b(i will|please|confirm|notify|debug|prepare|follow up|schedule|send|fix|resolve)\b/.test(normalized);
    if (actionMatch) {
      actionItems.push({
        id: buildId("ACT", actionItems.length),
        task: content,
        owner,
        deadline: /\b(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{1,2}\s?(am|pm))\b/.test(
          normalized
        )
          ? content.match(
              /\b(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{1,2}\s?(?:am|pm))\b/i
            )?.[0] || ""
          : "",
        priority: /\b(blocker|urgent|today|502|critical)\b/.test(normalized) ? "high" : "medium",
        status: "open",
        notes: copy.extractedFromTranscript
      });
    }

    const riskMatch =
      /\b(risk|blocker|concern|issue|error|502|legacy internet explorer|support is consuming)\b/.test(normalized);
    if (riskMatch) {
      risks.push({
        id: buildId("RSK", risks.length),
        risk: content,
        impact: copy.riskImpact,
        mitigation: copy.mitigation,
        owner
      });
    }

    const questionMatch = /\b(question|unresolved|whether)\b/.test(normalized);
    if (questionMatch) {
      openQuestions.push({
        id: buildId("Q", openQuestions.length),
        question: content,
        owner,
        notes: copy.followUp
      });
    }

    const nextStepMatch = actionMatch || /\b(next week|proceeds only|prioritize|focus on|drop ie support)\b/.test(normalized);
    if (nextStepMatch) {
      nextSteps.push(content);
    }
  }

  return {
    decisions,
    action_items: actionItems,
    risks,
    open_questions: openQuestions,
    next_steps: [...new Set(nextSteps)].slice(0, 5),
    stakeholders: Array.from(stakeholders.values())
  };
}

function buildFallbackReport({ meetingTitle, transcript, sourceType, language }) {
  const copy = getCopy(language);
  const lines = sentenceList(transcript);
  const extracted = extractStructuredSignals({ transcript, language });

  const jiraTasks = extracted.action_items.map((item) => ({
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
    decisions: extracted.decisions,
    action_items: extracted.action_items,
    risks: extracted.risks,
    open_questions: extracted.open_questions,
    next_steps: extracted.next_steps,
    stakeholders: extracted.stakeholders,
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

Quality rules:
- Keep summary to 3-5 sentences and avoid repeating transcript wording verbatim.
- Only include a decision when the transcript shows an actual agreement, approval, or clear direction.
- Do not repeat the same decision, risk, or action item with slightly different wording.
- Action items must be concrete follow-up tasks, not general discussion points.
- Next steps must be short imperative phrases, maximum 5 items.
- If no reliable item exists for a section, return an empty array for that section.
- Prefer specific owners from the transcript; otherwise use "${copy.unclear}".
- Keep each text field concise and remove filler phrases.

Schema fields:
meeting_title, meeting_type, source_type, generated_at, summary, decisions, action_items, risks, open_questions, next_steps, stakeholders, jira_tasks

Output requirements:
- decisions: 0-5 items
- action_items: 0-7 items
- risks: 0-5 items
- open_questions: 0-5 items
- next_steps: 0-5 items
- stakeholders: include only people clearly present in the transcript
- jira_tasks: derive only from action_items and avoid duplicates

Transcript:
${input.transcript}`;
}

function toStringValue(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function sanitizeText(value) {
  return toStringValue(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function normalizeKey(value) {
  return sanitizeText(value).toLowerCase();
}

function dedupeBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function isMeaningfulText(value) {
  const text = sanitizeText(value);
  if (!text) {
    return false;
  }

  const normalized = text.toLowerCase();
  return !["unclear", "nejasno", "n/a", "none", "unknown"].includes(normalized);
}

function normalizeGeneratedReport(input, report) {
  const copy = getCopy(input.language);
  const source = report && typeof report === "object" ? report : {};
  const fallbackReport = buildFallbackReport(input);
  const extractedSignals = extractStructuredSignals(input);

  const decisions = dedupeBy(
    (
      Array.isArray(source.decisions)
        ? source.decisions.map((item, index) => ({
            id: toStringValue(item?.id, `DEC-${String(index + 1).padStart(3, "0")}`),
            decision: sanitizeText(item?.decision),
            reasoning: sanitizeText(item?.reasoning) || copy.derivedFromTranscript,
            owner: sanitizeText(item?.owner) || copy.unclear,
            confidence: ["high", "medium", "low"].includes(item?.confidence) ? item.confidence : "medium"
          }))
        : []
    ).filter((item) => isMeaningfulText(item.decision)),
    (item) => normalizeKey(item.decision)
  ).slice(0, 5);

  const actionItems = dedupeBy(
    (
      Array.isArray(source.action_items)
        ? source.action_items.map((item, index) => ({
            id: toStringValue(item?.id, `ACT-${String(index + 1).padStart(3, "0")}`),
            task: sanitizeText(item?.task),
            owner: sanitizeText(item?.owner) || copy.unclear,
            deadline: sanitizeText(item?.deadline),
            priority: ["high", "medium", "low", "unclear"].includes(item?.priority)
              ? item.priority
              : "unclear",
            status: "open",
            notes: sanitizeText(item?.notes) || copy.extractedFromTranscript
          }))
        : []
    ).filter((item) => isMeaningfulText(item.task)),
    (item) => normalizeKey(item.task)
  ).slice(0, 7);

  const risks = dedupeBy(
    (
      Array.isArray(source.risks)
        ? source.risks.map((item, index) => ({
            id: toStringValue(item?.id, `RSK-${String(index + 1).padStart(3, "0")}`),
            risk: sanitizeText(item?.risk),
            impact: sanitizeText(item?.impact) || copy.riskImpact,
            mitigation: sanitizeText(item?.mitigation) || copy.mitigation,
            owner: sanitizeText(item?.owner) || copy.unclear
          }))
        : []
    ).filter((item) => isMeaningfulText(item.risk)),
    (item) => normalizeKey(item.risk)
  ).slice(0, 5);

  const openQuestions = dedupeBy(
    (
      Array.isArray(source.open_questions)
        ? source.open_questions.map((item, index) => ({
            id: toStringValue(item?.id, `Q-${String(index + 1).padStart(3, "0")}`),
            question: sanitizeText(item?.question),
            owner: sanitizeText(item?.owner) || copy.unclear,
            notes: sanitizeText(item?.notes) || copy.followUp
          }))
        : []
    ).filter((item) => isMeaningfulText(item.question)),
    (item) => normalizeKey(item.question)
  ).slice(0, 5);

  const nextSteps = dedupeBy(
    toStringArray(source.next_steps)
      .map((step) => sanitizeText(step))
      .filter(isMeaningfulText),
    (step) => normalizeKey(step)
  ).slice(0, 5);

  const stakeholders = dedupeBy(
    (
      Array.isArray(source.stakeholders)
        ? source.stakeholders.map((item) => ({
            name: sanitizeText(item?.name),
            role: sanitizeText(item?.role) || copy.meetingParticipant,
            involvement: sanitizeText(item?.involvement) || copy.referencedInNotes
          }))
        : []
    ).filter((item) => isMeaningfulText(item.name)),
    (item) => normalizeKey(item.name)
  ).slice(0, 8);

  const jiraTasks = dedupeBy(
    (
      Array.isArray(source.jira_tasks)
        ? source.jira_tasks.map((item) => ({
            title: sanitizeText(item?.title),
            description: sanitizeText(item?.description) || copy.extractedFromTranscript,
            assignee: sanitizeText(item?.assignee) || copy.unclear,
            due_date: sanitizeText(item?.due_date),
            priority: sanitizeText(item?.priority) || "unclear",
            labels: dedupeBy(
              toStringArray(item?.labels)
                .map((label) => sanitizeText(label))
                .filter(Boolean),
              (label) => normalizeKey(label)
            )
          }))
        : []
    ).filter((item) => isMeaningfulText(item.title)),
    (item) => normalizeKey(item.title)
  ).slice(0, 7);

  const summary = sanitizeText(source.summary);

  return {
    meeting_title: sanitizeText(source.meeting_title) || input.meetingTitle || copy.fallbackTitle,
    meeting_type: sanitizeText(source.meeting_type) || "general",
    source_type: sanitizeText(source.source_type) || input.sourceType,
    generated_at: sanitizeText(source.generated_at) || new Date().toISOString(),
    summary: summary || fallbackReport.summary,
    decisions: decisions.length ? decisions : fallbackReport.decisions,
    action_items: actionItems.length ? actionItems : extractedSignals.action_items,
    risks: risks.length ? risks : extractedSignals.risks,
    open_questions: openQuestions.length ? openQuestions : extractedSignals.open_questions,
    next_steps: nextSteps.length ? nextSteps : extractedSignals.next_steps,
    stakeholders: stakeholders.length ? stakeholders : extractedSignals.stakeholders,
    jira_tasks: jiraTasks.length
      ? jiraTasks
      : (actionItems.length ? actionItems : extractedSignals.action_items).map((item) => ({
          title: item.task,
          description: item.notes,
          assignee: item.owner,
          due_date: item.deadline,
          priority: item.priority,
          labels: ["meeting-brain", copy.followUpLabel]
        }))
  };
}

function serializeError(error) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const serialized = {
    name: error.name,
    message: error.message,
    stack: error.stack
  };

  if (typeof error.flatten === "function") {
    serialized.flatten = error.flatten();
  }

  if (Array.isArray(error.issues)) {
    serialized.issues = error.issues.map((issue) => ({
      code: issue.code,
      path: issue.path,
      message: issue.message,
      expected: issue.expected,
      received: issue.received
    }));
  }

  return serialized;
}

function getGeminiConfig() {
  const forceFallback = process.env.FORCE_FALLBACK?.trim().toLowerCase() === "true";
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  if (forceFallback) {
    console.info("Meeting Brain: FORCE_FALLBACK=true. Skipping Gemini and using mock mode.");
    return {
      isAvailable: false,
      model,
      reason: "force_fallback"
    };
  }

  if (!apiKey) {
    console.warn("Meeting Brain: GEMINI_API_KEY is not set. Falling back to mock mode.");
    return {
      isAvailable: false,
      model,
      reason: "missing_api_key"
    };
  }

  if (apiKey.length < 20) {
    console.warn("Meeting Brain: GEMINI_API_KEY is set but appears invalid. Falling back to mock mode.");
    return {
      isAvailable: false,
      model,
      reason: "invalid_api_key"
    };
  }

  return {
    apiKey,
    isAvailable: true,
    model,
    reason: null
  };
}

async function generateWithGemini(input) {
  const config = getGeminiConfig();
  if (!config.isAvailable) {
    return { report: buildFallbackReport(input), mode: "mock" };
  }

  console.info(`Meeting Brain: attempting Gemini generation with model "${config.model}".`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
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
      console.warn("Meeting Brain: Gemini request failed, returning fallback report.", errorText);
      return { report: buildFallbackReport(input), mode: "mock" };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.warn("Meeting Brain: Gemini returned an empty response, returning fallback report.");
      return { report: buildFallbackReport(input), mode: "mock" };
    }

    const parsed = normalizeGeneratedReport(input, JSON.parse(text));

    console.info("Meeting Brain: Gemini generation succeeded.");

    return { report: parsed, mode: "llm" };
  } catch (error) {
    console.warn("Meeting Brain: Gemini is unavailable, returning fallback report.", error);
    return { report: buildFallbackReport(input), mode: "mock" };
  }
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
    console.info(`Meeting Brain: report generation completed in "${result.mode}" mode.`);
    return json(200, { report: validated, mode: result.mode });
  } catch (error) {
    const payload = parsePayload(event.body);
    console.error("Meeting Brain: report generation failed.", serializeError(error));
    return json(400, { error: error.message || getCopy(payload.language).unableToGenerate });
  }
}
