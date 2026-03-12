import { useState } from "react";
import { generateReport } from "../services/generateReport";

export function useGenerateReport() {
  const [status, setStatus] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState(null);

  async function generate(data) {
    setStatus("loading");
    setError("");

    try {
      const response = await generateReport(data);
      setReport(response.report);
      setMeta({
        mode: response.mode === "mock" ? "Fallback" : "LLM",
        generatedAt: new Date(response.report.generated_at).toLocaleString()
      });
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(requestError.message || "Report generation failed.");
    }
  }

  return {
    status,
    report,
    error,
    meta,
    generateReport: generate
  };
}
