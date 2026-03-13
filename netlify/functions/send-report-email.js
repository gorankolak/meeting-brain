function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

const COPY = {
  hr: {
    actionItems: "Akcijske stavke",
    nextSteps: "Sljedeći koraci",
    methodNotAllowed: "Metoda nije dopuštena.",
    missingPayload: "Primatelj i izvještaj su obavezni.",
    unableToSend: "Slanje e-pošte nije uspjelo."
  },
  en: {
    actionItems: "Action Items",
    nextSteps: "Next Steps",
    methodNotAllowed: "Method not allowed.",
    missingPayload: "Recipient and report are required.",
    unableToSend: "Unable to send email."
  }
};

function getLanguage(language) {
  return language === "en" ? "en" : "hr";
}

function parsePayload(body) {
  try {
    return JSON.parse(body || "{}");
  } catch {
    return {};
  }
}

function renderHtml(report, language) {
  const copy = COPY[getLanguage(language)];

  return `
    <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.5">
      <h1>${report.meeting_title}</h1>
      <p>${report.summary}</p>
      <h2>${copy.actionItems}</h2>
      <ul>${report.action_items.map((item) => `<li>${item.task} - ${item.owner}</li>`).join("")}</ul>
      <h2>${copy.nextSteps}</h2>
      <ul>${report.next_steps.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
  `;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: COPY.hr.methodNotAllowed });
  }

  try {
    const { recipient, report, language } = parsePayload(event.body);
    const copy = COPY[getLanguage(language)];
    if (!recipient || !report?.meeting_title) {
      return json(400, { error: copy.missingPayload });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return json(200, {
        status: "mock",
        mode: "mock",
        timestamp: new Date().toISOString()
      });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Meeting Brain <reports@example.com>",
        to: [recipient],
        subject: report.meeting_title,
        html: renderHtml(report, language)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend request failed: ${errorText}`);
    }

    return json(200, {
      status: "sent",
      mode: "live",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const payload = parsePayload(event.body);
    return json(400, { error: error.message || COPY[getLanguage(payload.language)].unableToSend });
  }
}
