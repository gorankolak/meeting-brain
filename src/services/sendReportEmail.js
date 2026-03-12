export async function sendReportEmail(payload) {
  const response = await fetch("/api/send-report-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Email send failed.");
  }

  return data;
}
