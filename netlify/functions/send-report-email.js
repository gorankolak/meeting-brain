function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function renderHtml(report) {
  return `
    <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.5">
      <h1>${report.meeting_title}</h1>
      <p>${report.summary}</p>
      <h2>Action Items</h2>
      <ul>${report.action_items.map((item) => `<li>${item.task} - ${item.owner}</li>`).join("")}</ul>
      <h2>Next Steps</h2>
      <ul>${report.next_steps.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
  `;
}

export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    const { recipient, report } = JSON.parse(event.body || "{}");
    if (!recipient || !report?.meeting_title) {
      return json(400, { error: "Recipient and report are required." });
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
        html: renderHtml(report)
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
    return json(400, { error: error.message || "Unable to send email." });
  }
}
