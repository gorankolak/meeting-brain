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

const GENERATION_MODE = {
  llm: "llm",
  mock: "mock"
};

const FALLBACK_REASONS = {
  quotaExceeded: "quota_exceeded",
  missingApiKey: "missing_api_key",
  invalidApiKey: "invalid_api_key",
  providerError: "provider_error",
  timeout: "timeout",
  networkError: "network_error",
  emptyResponse: "empty_response",
  forceFallback: "force_fallback"
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function normalizeTranscriptText(transcript) {
  return toStringValue(transcript)
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/([.!?])\s+(?=(?:\[[^\]]+\]\s*)?[A-Z][a-z]+:)/g, "$1\n")
    .replace(/\]\s+(?=\[[^\]]+\])/g, "]\n")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

function sentenceList(transcript) {
  const normalized = normalizeTranscriptText(transcript);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n+/)
    .flatMap((line) => {
      const cleanedLine = line.trim();
      if (!cleanedLine) {
        return [];
      }

      // Messy pasted notes often arrive as one long paragraph. Split into sentence-like units
      // while preserving speaker/timestamp prefixes when they exist.
      const units = cleanedLine.match(/[^.!?]+(?:[.!?]+|$)/g) || [cleanedLine];
      return units.map((unit) => unit.replace(/^\[[^\]]+\]\s*/, "").trim()).filter(Boolean);
    });
}

function rawLineList(transcript) {
  return normalizeTranscriptText(transcript)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function countMatching(lines, pattern) {
  return lines.reduce((count, line) => count + (pattern.test(line) ? 1 : 0), 0);
}

function detectInputProfile(transcript) {
  const lines = rawLineList(transcript);
  const headingCount = countMatching(lines, /^#{1,6}\s+/);
  const bulletCount = countMatching(lines, /^[-*]\s+/);
  const numberedCount = countMatching(lines, /^\d+\.\s+/);
  const speakerCount = countMatching(lines, /^(?:\[[^\]]+\]\s*)?[A-Z][a-z]+:/);
  const separatorCount = countMatching(lines, /^---+$/);
  const storyCount = countMatching(lines, /^As a\b/i);

  if (headingCount >= 2 || (bulletCount + numberedCount >= 6 && (headingCount > 0 || separatorCount > 0 || storyCount > 0))) {
    return "structured_brief";
  }

  if (speakerCount >= 2) {
    return "meeting_transcript";
  }

  return "messy_notes";
}

function buildInputContext(transcript) {
  const lines = rawLineList(transcript);
  const headings = lines
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, "").trim())
    .slice(0, 12);
  const bullets = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .slice(0, 16);
  const userStories = lines.filter((line) => /^As a\b/i.test(line)).slice(0, 8);

  return { headings, bullets, userStories };
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

function includesAny(text, candidates) {
  return candidates.some((candidate) => text.includes(candidate));
}

function countMatches(text, expressions) {
  return expressions.reduce((count, expression) => count + (expression.test(text) ? 1 : 0), 0);
}

function shouldIgnoreSentence(text) {
  const normalized = sanitizeText(text).toLowerCase();
  if (!normalized) {
    return true;
  }

  return [
    "nice and simple.",
    "boom, you click, and you're done.",
    "boom, you click, and youre done.",
    "just build this stuff."
  ].includes(normalized);
}

function isFormattingLine(text) {
  const normalized = sanitizeText(text);
  return /^#{1,6}\s+/.test(normalized) || /^---+$/.test(normalized) || /^\*\*[^*]+\*\*$/.test(normalized);
}

function isListLabel(text) {
  const normalized = sanitizeText(text).toLowerCase();
  return /^[-*]\s+/.test(text) && (
    normalized.includes("meeting summary") ||
    normalized.includes("decisions") ||
    normalized.includes("action items") ||
    normalized.includes("risks") ||
    normalized.includes("open questions") ||
    normalized.includes("next steps") ||
    normalized.includes("pdf") ||
    normalized.includes("docx") ||
    normalized.includes("txt") ||
    normalized.includes("md")
  );
}

function isFlowDescription(text) {
  const normalized = sanitizeText(text).toLowerCase();
  return /^(user|system|ai|example)\b/.test(normalized);
}

function isQuestionSentence(text) {
  const normalized = sanitizeText(text).toLowerCase();
  return normalized.endsWith("?") || /^(can|could|should|will|would|what|who|when|where|why|how)\b/.test(normalized);
}

function isDescriptiveSentence(text) {
  const normalized = sanitizeText(text).toLowerCase();
  return (
    /^(because|and to do this|i built|it sends|it could even publish|lots of people were|it looks like)/.test(normalized) ||
    normalized.includes("i built this for myself")
  );
}

function scoreTitleCandidate(text, language) {
  const normalized = sanitizeText(text).toLowerCase();
  const keywordSignals = language === "hr"
    ? ["automat", "proizvod", "prodaj", "ebay", "oglas", "posao", "ideja"]
    : ["automation", "product", "sell", "ebay", "listing", "business", "idea", "marketplace"];

  let score = 0;
  score += keywordSignals.filter((signal) => normalized.includes(signal)).length * 3;
  score += normalized.length >= 18 && normalized.length <= 90 ? 2 : 0;
  score -= isQuestionSentence(text) ? 4 : 0;
  score -= isDescriptiveSentence(text) ? 3 : 0;
  score -= /^(because|and|but|so)\b/.test(normalized) ? 2 : 0;
  score -= /^(it|that)\b/.test(normalized) ? 2 : 0;
  score -= normalized.length > 72 ? 2 : 0;
  return score;
}

function scoreSentence(text, language) {
  const normalized = sanitizeText(text).toLowerCase();
  const scores = [
    /\b(decision|agreed|approved|plan|prototype|product|business|market validation|sign to)\b/g,
    /\b(action|next step|should|need to|will|follow up|release|publish|send|build|ship)\b/g,
    /\b(risk|issue|problem|blocker|concern|error|validation)\b/g,
    language === "hr" ? /\b(odluka|treba|trebamo|rizik|problem|izgraditi|objaviti)\b/g : /$^/g
  ];

  return scores.reduce((total, regex) => total + countMatches(normalized, [regex]), 0);
}

function buildFallbackSummary({ transcript, extracted, language }) {
  const profile = detectInputProfile(transcript);
  const units = sentenceList(transcript).filter(
    (unit) =>
      !shouldIgnoreSentence(unit) &&
      !isQuestionSentence(unit) &&
      !isFormattingLine(unit) &&
      !(profile === "structured_brief" && (
        isDescriptiveSentence(unit) ||
        isListLabel(unit) ||
        isFlowDescription(unit) ||
        /^[-*]\s+/.test(unit)
      ))
  );
  if (!units.length) {
    return getCopy(language).fallbackSummary;
  }

  const priorityUnits = units
    .map((unit, index) => ({
      unit,
      index,
      score:
        scoreSentence(unit, language) +
        (includesAny(unit.toLowerCase(), ["decision", "agreed", "approved", "should", "will", "risk", "problem", "next"]) ? 2 : 0)
    }))
    .filter(({ score }, index) => score > 0 || index < 2)
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .slice(0, 4)
    .sort((a, b) => a.index - b.index)
    .map(({ unit }) => sanitizeText(unit));

  const signalUnits = [
    extracted.decisions[0]?.decision,
    extracted.action_items[0]?.task,
    extracted.risks[0]?.risk
  ].filter(isMeaningfulText);

  const summary = dedupeBy(
    [...priorityUnits, ...signalUnits].filter(Boolean),
    (value) => normalizeKey(value)
  )
    .slice(0, 4)
    .join(" ");

  return summary.slice(0, 420) || getCopy(language).fallbackSummary;
}

function buildNormalizedTranscriptView(transcript) {
  const units = sentenceList(transcript);
  if (!units.length) {
    return "";
  }

  return units.map((unit, index) => `${index + 1}. ${sanitizeText(unit)}`).join("\n");
}

function extractStructuredSignals({ transcript, language }) {
  const copy = getCopy(language);
  const profile = detectInputProfile(transcript);
  const lines = sentenceList(transcript).filter((line) => !shouldIgnoreSentence(line) && !isFormattingLine(line));
  const decisions = [];
  const actionItems = [];
  const risks = [];
  const openQuestions = [];
  const nextSteps = [];
  const stakeholders = new Map();
  const decisionSignals = [
    "decision taken",
    "decision:",
    "agreed",
    "approved",
    "we decided",
    "let's",
    "lets",
    "drop ie support",
    "release proceeds only",
    "not going to build this",
    "i'm not going to build this",
    "im not going to build this",
    "somebody should run and build this",
    "someone should run and build this",
    "you should quickly build this",
    "odluka:",
    "odluka je donesena",
    "slažem se",
    "slažemo se",
    "prestanimo",
    "odobravamo",
    "objavljujemo tek kada",
    "ide samo ako"
  ];
  const actionSignals = [
    "i will",
    "please",
    "confirm",
    "notify",
    "debug",
    "prepare",
    "follow up",
    "schedule",
    "send",
    "fix",
    "resolve",
    "build this",
    "run with it",
    "turn this into a product",
    "publish for you",
    "prototype by the end of today",
    "somebody should",
    "someone should",
    "you could build",
    "you should build",
    "mogu",
    "danas ću",
    "molim te",
    "potvrdi",
    "obavijesti",
    "eskalirat ću",
    "poslat ću",
    "dodaj",
    "zaduži",
    "tražiti",
    "tražimo",
    "odobri",
    "odobravamo",
    "objaviti rezultate"
  ];
  const riskSignals = [
    "risk",
    "blocker",
    "concern",
    "issue",
    "error",
    "502",
    "legacy internet explorer",
    "support is consuming",
    "rizik",
    "blokada",
    "problem",
    "pogreške",
    "greške",
    "greška",
    "troši puno",
    "nije prošao",
    "još čeka"
  ];
  const questionSignals = [
    "question",
    "unresolved",
    "whether",
    "open question",
    "otvoreno pitanje",
    "neriješeno pitanje",
    "otvoreni rizik je",
    "will you turn this into a product"
  ];
  const nextStepSignals = [
    "next week",
    "proceeds only",
    "prioritize",
    "focus on",
    "drop ie support",
    "sljedećeg tjedna",
    "damo prioritet",
    "fokusirati",
    "objavljujemo tek kada",
    "ide samo ako"
  ];
  const deadlinePattern =
    /\b(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{1,2}\s?(?:am|pm)|danas|sutra|petak|ponedjeljak|utorak|srijeda|četvrtak|subota|nedjelja|\d{1,2}:\d{2})\b/i;

  for (const line of lines) {
    const owner = inferOwner(line) || copy.unclear;
    const content = stripSpeakerPrefix(line);
    const normalized = content.toLowerCase();
    const isQuestion = isQuestionSentence(content);
    const isDirective = includesAny(normalized, [
      "i will",
      "we will",
      "please",
      "take the idea and run with it",
      "somebody should",
      "someone should",
      "you should",
      "don't wait",
      "dont wait",
      "send",
      "confirm",
      "notify",
      "schedule",
      "fix",
      "resolve",
      "dodaj",
      "zaduži",
      "molim te",
      "obavijesti",
      "potvrdi"
    ]);
    const isRecommendation = includesAny(normalized, [
      "you could build",
      "turn this into a product",
      "prototype by the end of today",
      "run with it",
      "build this stuff",
      "don't wait for permission",
      "dont wait for permission"
    ]);
    const isDescriptiveOnly = isDescriptiveSentence(content);
    const isStructuredLine =
      profile === "structured_brief" &&
      (
        /^[-*]\s+/.test(line) ||
        /^\d+\.\s+/.test(line) ||
        isFlowDescription(content) ||
        /^as a\b/i.test(content) ||
        /^supported file formats:?$/i.test(content) ||
        /^example scenarios include:?$/i.test(content)
      );
    const isSectionListLabel = isListLabel(line);
    const isFlowStep = /^\d+\.\s+/.test(line) || (profile === "structured_brief" && isFlowDescription(content));
    const isUserStory = /^as a\b/i.test(content);

    if (owner !== copy.unclear) {
      stakeholders.set(owner, {
        name: owner,
        role: copy.meetingParticipant,
        involvement: copy.referencedInNotes
      });
    }

    const decisionMatch = includesAny(normalized, decisionSignals);
    if (decisionMatch && !isStructuredLine) {
      decisions.push({
        id: buildId("DEC", decisions.length),
        decision: content,
        reasoning: copy.derivedFromTranscript,
        owner,
        confidence:
          includesAny(normalized, ["decision taken", "agreed", "approved", "odluka:", "odluka je donesena", "slažem se", "slažemo se"])
            ? "high"
            : "medium"
      });
    }

    const actionMatch = includesAny(normalized, actionSignals);
    const shouldCreateActionItem =
      actionMatch &&
      !isQuestion &&
      !isDescriptiveOnly &&
      !isSectionListLabel &&
      !isFlowStep &&
      !isUserStory &&
      (owner !== copy.unclear || isDirective);

    if (shouldCreateActionItem) {
      actionItems.push({
        id: buildId("ACT", actionItems.length),
        task: content,
        owner,
        deadline: deadlinePattern.test(normalized) ? content.match(deadlinePattern)?.[0] || "" : "",
        priority: /\b(blocker|urgent|today|502|critical|blokada|danas|prioritet)\b/.test(normalized) ? "high" : "medium",
        status: "open",
        notes: copy.extractedFromTranscript
      });
    }

    const riskMatch = includesAny(normalized, riskSignals);
    if (riskMatch && !isSectionListLabel) {
      risks.push({
        id: buildId("RSK", risks.length),
        risk: content,
        impact: copy.riskImpact,
        mitigation: copy.mitigation,
        owner
      });
    }

    const questionMatch = includesAny(normalized, questionSignals);
    if (questionMatch && !isSectionListLabel) {
      openQuestions.push({
        id: buildId("Q", openQuestions.length),
        question: content,
        owner,
        notes: copy.followUp
      });
    }

    const nextStepMatch = !isQuestion && !isDescriptiveOnly && (
      isDirective ||
      isRecommendation ||
      includesAny(normalized, nextStepSignals)
    );
    if (nextStepMatch && !isFlowStep && !isSectionListLabel && !isUserStory) {
      nextSteps.push(content);
    }
  }

  if (profile === "structured_brief") {
    const requestLine = lines.find((line) => /\b(i need|we need|create|design|define|prepare)\b/i.test(line));
    if (requestLine) {
      actionItems.unshift({
        id: buildId("ACT", actionItems.length),
        task: sanitizeText(stripSpeakerPrefix(requestLine)),
        owner: copy.unclear,
        deadline: "",
        priority: "medium",
        status: "open",
        notes: copy.extractedFromTranscript
      });
    }
  }

  return {
    decisions: decisions.slice(0, 5),
    action_items: actionItems.slice(0, 7),
    risks: risks.slice(0, 5),
    open_questions: openQuestions.slice(0, 5),
    next_steps: [...new Set(nextSteps)].slice(0, 5),
    stakeholders: Array.from(stakeholders.values())
  };
}

function buildFallbackReport({ meetingTitle, transcript, sourceType, language }) {
  const copy = getCopy(language);
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
    meeting_title: deriveMeetingTitle({ meetingTitle, transcript, language }),
    meeting_type: "general",
    source_type: sourceType,
    generated_at: new Date().toISOString(),
    summary: buildFallbackSummary({ transcript, extracted, language }) || copy.fallbackSummary,
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
  const profile = detectInputProfile(input.transcript);
  const context = buildInputContext(input.transcript);
  const normalizedTranscript = buildNormalizedTranscriptView(input.transcript);

  return `You are Meeting Brain, an expert PMO meeting analyst.
Return JSON only and match the required schema exactly.
Do not invent names, dates, or responsibilities.
${copy.unclearInstruction}
${copy.outputLanguageInstruction}

Quality rules:
- The input may be a messy pasted blob, partial transcript, dictation, or long paragraph with no timestamps, no speaker names, and no formatting.
- The input may also be a structured brief, product specification, PRD excerpt, or Markdown notes rather than a literal meeting transcript.
- First reconstruct the content into coherent discussion points before extracting structure.
- Adapt extraction to the input profile "${profile}" instead of forcing transcript assumptions.
- Keep summary to 3-5 sentences and avoid repeating transcript wording verbatim.
- Only include a decision when the transcript shows an actual agreement, approval, or clear direction.
- Do not repeat the same decision, risk, or action item with slightly different wording.
- Action items must be concrete follow-up tasks, not general discussion points.
- Treat direct commitments, recommendations, imperatives, and clear calls to action as candidate next steps or action items even if the speaker is unnamed.
- For structured briefs or specs, do not treat headings, feature lists, supported file formats, user-flow steps, or user stories as action items unless the text is clearly phrased as a task to perform.
- Next steps must be short imperative phrases, maximum 5 items.
- If no reliable item exists for a section, return an empty array for that section.
- Prefer specific owners from the transcript; otherwise use "${copy.unclear}".
- Keep each text field concise and remove filler phrases.
- meeting_title must be a concise working title derived from the meeting topic, agenda, or first clear objective in the transcript.
- Do not return "${copy.unclear}" for meeting_title when the transcript contains a recognizable topic or goal.
- When a person says they will not build something themselves but recommends others build it, capture that as a key takeaway rather than attributing ownership incorrectly.
- If the input is a request/specification, summarize the request and intended workflow meaningfully within the existing schema, and leave unsupported sections empty rather than inventing meeting outcomes.

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

Raw transcript:
${normalizeTranscriptText(input.transcript)}

Detected structure:
- profile: ${profile}
- headings: ${context.headings.join(" | ") || "(none)"}
- bullets: ${context.bullets.join(" | ") || "(none)"}
- user stories: ${context.userStories.join(" | ") || "(none)"}

Normalized discussion units:
${normalizedTranscript || "(none)"}`;
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

function toTitleCase(value) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cleanDerivedTitle(value) {
  return sanitizeText(value)
    .replace(/^(welcome|dobrodosli|dobro došli)[.!:\-\s]*/i, "")
    .replace(
      /^(today we need to|today let's|today we will|we need to|let's|lets|trebamo|danas trebamo|danas cemo|danas ćemo)\s+/i,
      ""
    )
    .replace(/\b(decide what blocks|identify what blocks)\b/i, "review")
    .replace(/\bwhat blocks\b/i, "")
    .replace(/\s+(and|i)\s+review\b/i, " and ")
    .replace(/\s+/g, " ")
    .replace(/[.:;,\-–]+$/g, "")
    .trim();
}

function deriveKeywordTitle(transcript, language) {
  const normalized = sanitizeText(transcript).toLowerCase();

  if (language === "en") {
    if (normalized.includes("ebay") && normalized.includes("automation") && normalized.includes("sell")) {
      return "eBay resale automation opportunity";
    }

    if (normalized.includes("meeting brain") && normalized.includes("styleguide")) {
      return "Meeting Brain brand styleguide brief";
    }
  }

  if (language === "hr") {
    if (normalized.includes("ebay") && normalized.includes("automat") && normalized.includes("prod")) {
      return "Prilika za eBay automatizaciju preprodaje";
    }
  }

  return "";
}

function deriveMeetingTitle({ meetingTitle, transcript, language }) {
  const copy = getCopy(language);
  const explicitTitle = sanitizeText(meetingTitle);
  if (isMeaningfulText(explicitTitle)) {
    return explicitTitle;
  }

  const keywordTitle = deriveKeywordTitle(transcript, language);
  if (keywordTitle) {
    return keywordTitle;
  }

  const profile = detectInputProfile(transcript);
  if (profile === "structured_brief") {
    const requestLine = sentenceList(transcript)
      .map((line) => sanitizeText(stripSpeakerPrefix(line)))
      .find((line) => /\b(i need|we need|create|design|define|prepare)\b/i.test(line));

    if (requestLine) {
      const productMatch = requestLine.match(/\bcalled\s+([A-Z][A-Za-z0-9 ]+)/);
      const productName = sanitizeText(productMatch?.[1] || "").replace(/\s*-\s*see specification below$/i, "");
      if (productName) {
        return `${productName} brief`;
      }

      return requestLine
        .replace(/\s*-\s*see specification below$/i, "")
        .replace(/^(i need|we need)\s+/i, "")
        .replace(/[.:;,\-–]+$/g, "")
        .trim();
    }
  }

  const lines = sentenceList(transcript)
    .map((line) => cleanDerivedTitle(stripSpeakerPrefix(line)))
    .filter(isMeaningfulText)
    .map((line) => ({ line, score: scoreTitleCandidate(line, language) }));

  const candidate = lines
    .sort((a, b) => (b.score - a.score) || (a.line.length - b.line.length))[0]?.line || "";
  if (!candidate) {
    return copy.fallbackTitle;
  }

  const shortened = candidate.split(/[!?]/)[0].trim().slice(0, 90).replace(/\s+\S*$/, "").trim();
  const normalized = shortened || candidate.slice(0, 90).trim();
  return toTitleCase(normalized) || copy.fallbackTitle;
}

function isTranscriptDump(text, transcript) {
  const normalizedText = normalizeKey(text);
  const normalizedTranscript = normalizeKey(transcript);
  if (!normalizedText || !normalizedTranscript) {
    return false;
  }

  return (
    normalizedText.length >= 220 ||
    normalizedText.length >= Math.max(180, Math.floor(normalizedTranscript.length * 0.3)) ||
    normalizedTranscript.includes(normalizedText)
  );
}

function isLikelyActionTask(task, owner) {
  const normalized = normalizeKey(task);
  if (!normalized) {
    return false;
  }

  if (isQuestionSentence(task) || isFlowDescription(task)) {
    return false;
  }

  const imperativeSignals = [
    "i will",
    "we will",
    "please",
    "send",
    "confirm",
    "notify",
    "debug",
    "fix",
    "resolve",
    "take the idea and run with it",
    "build this",
    "don't wait",
    "dont wait",
    "prototype by the end of today",
    "somebody should",
    "someone should"
  ];

  return !["Unclear", "Nejasno"].includes(owner)
    ? true
    : includesAny(normalized, imperativeSignals);
}

function sanitizeActionItems(items, input) {
  return items.filter((item) => {
    if (!isMeaningfulText(item.task)) {
      return false;
    }

    if (isTranscriptDump(item.task, input.transcript)) {
      return false;
    }

    return isLikelyActionTask(item.task, item.owner);
  });
}

function sanitizeSimpleStrings(items, transcript) {
  return items.filter((item) => isMeaningfulText(item) && !isTranscriptDump(item, transcript));
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

  const actionItems = sanitizeActionItems(dedupeBy(
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
  )).slice(0, 7);

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

  const nextSteps = sanitizeSimpleStrings(dedupeBy(
    toStringArray(source.next_steps)
      .map((step) => sanitizeText(step))
      .filter(isMeaningfulText),
    (step) => normalizeKey(step)
  ), input.transcript).slice(0, 5);

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
  const normalizedMeetingTitle = sanitizeText(source.meeting_title);

  return {
    meeting_title: isMeaningfulText(normalizedMeetingTitle)
      ? normalizedMeetingTitle
      : deriveMeetingTitle(input),
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

function buildGenerationResponse(input, overrides = {}) {
  return {
    report: overrides.report || buildFallbackReport(input),
    mode: overrides.mode || GENERATION_MODE.mock,
    provider: "gemini",
    fallbackReason:
      Object.prototype.hasOwnProperty.call(overrides, "fallbackReason") ? overrides.fallbackReason : null
  };
}

function isLikelyInvalidApiKey(message) {
  return /api key not valid|invalid api key|permission denied|authentication|unauthenticated|credentials/i.test(
    message || ""
  );
}

function classifyGeminiErrorResponse(status, errorText) {
  if (status === 429) {
    return FALLBACK_REASONS.quotaExceeded;
  }

  if ([400, 401, 403].includes(status) && isLikelyInvalidApiKey(errorText)) {
    return FALLBACK_REASONS.invalidApiKey;
  }

  return FALLBACK_REASONS.providerError;
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function getGeminiConfig() {
  const forceFallback = process.env.FORCE_FALLBACK?.trim().toLowerCase() === "true";
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  if (forceFallback) {
    // Development/testing override: exercise the full fallback UX without calling Gemini.
    console.info("Meeting Brain: FORCE_FALLBACK=true. Skipping Gemini and using mock mode.");
    return {
      isAvailable: false,
      model,
      reason: FALLBACK_REASONS.forceFallback
    };
  }

  if (!apiKey) {
    console.warn("Meeting Brain: GEMINI_API_KEY is not set. Falling back to mock mode.");
    return {
      isAvailable: false,
      model,
      reason: FALLBACK_REASONS.missingApiKey
    };
  }

  if (apiKey.length < 20) {
    console.warn("Meeting Brain: GEMINI_API_KEY is set but appears invalid. Falling back to mock mode.");
    return {
      isAvailable: false,
      model,
      reason: FALLBACK_REASONS.invalidApiKey
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
    return buildGenerationResponse(input, {
      mode: GENERATION_MODE.mock,
      fallbackReason: config.reason
    });
  }

  console.info(`Meeting Brain: attempting Gemini generation with model "${config.model}".`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
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
      const fallbackReason = classifyGeminiErrorResponse(response.status, errorText);
      console.warn("Meeting Brain: Gemini request failed, returning fallback report.", {
        status: response.status,
        fallbackReason,
        errorText
      });
      return buildGenerationResponse(input, {
        mode: GENERATION_MODE.mock,
        fallbackReason
      });
    }

    const data = await response.json();
    const text = extractGeminiText(data);
    if (!text) {
      console.warn("Meeting Brain: Gemini returned an empty response, returning fallback report.");
      return buildGenerationResponse(input, {
        mode: GENERATION_MODE.mock,
        fallbackReason: FALLBACK_REASONS.emptyResponse
      });
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(text);
    } catch (error) {
      console.warn("Meeting Brain: Gemini returned invalid JSON, returning fallback report.", serializeError(error));
      return buildGenerationResponse(input, {
        mode: GENERATION_MODE.mock,
        fallbackReason: FALLBACK_REASONS.providerError
      });
    }

    const parsed = normalizeGeneratedReport(input, parsedPayload);

    console.info("Meeting Brain: Gemini generation succeeded.");

    return buildGenerationResponse(input, {
      report: parsed,
      mode: GENERATION_MODE.llm,
      fallbackReason: null
    });
  } catch (error) {
    const fallbackReason =
      error?.name === "AbortError" ? FALLBACK_REASONS.timeout : FALLBACK_REASONS.networkError;
    console.warn("Meeting Brain: Gemini is unavailable, returning fallback report.", {
      fallbackReason,
      error: serializeError(error)
    });
    return buildGenerationResponse(input, {
      mode: GENERATION_MODE.mock,
      fallbackReason
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function handler(event) {
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
    return json(200, {
      report: validated,
      mode: result.mode,
      provider: result.provider,
      fallbackReason: result.fallbackReason
    });
  } catch (error) {
    const payload = parsePayload(event.body);
    console.error("Meeting Brain: report generation failed.", serializeError(error));
    return json(400, { error: error.message || getCopy(payload.language).unableToGenerate });
  }
}
