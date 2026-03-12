import { meetingReportSchema } from "../schemas/report.schema";

export async function generateReport(payload) {
  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Report generation failed.");
  }

  return {
    ...data,
    report: meetingReportSchema.parse(data.report)
  };
}
