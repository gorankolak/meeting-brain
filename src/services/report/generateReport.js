import { ZodError } from "zod";
import { meetingReportSchema } from "../../schemas/report.schema";
import { DEV_SIMULATE_AI } from "../../config/devFlags";
import { createMockReport } from "../../lib/mockReport";
import { simulateDelay } from "../../lib/simulateDelay";
import { ReportGenerationError } from "./errors";

const REPORT_REQUEST_TIMEOUT_MS = 20_000;
const REPORT_REQUEST_RETRIES = 2;
const REPORT_REQUEST_URL = "/api/generate-report";

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    throw new ReportGenerationError("INVALID_RESPONSE", "INVALID_RESPONSE", {
      cause: error
    });
  }
}

async function requestReport(payload, signal) {
  let response;

  try {
    response = await fetch(REPORT_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ReportGenerationError("TIMEOUT", "REPORT_TIMEOUT", { cause: error });
    }

    throw new ReportGenerationError("NETWORK", "REPORT_NETWORK_ERROR", { cause: error });
  }

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new ReportGenerationError("REQUEST_FAILED", data.error || "REPORT_GENERATION_FAILED", {
      details: data
    });
  }

  return data;
}

function validateReportSchema(report) {
  try {
    return meetingReportSchema.parse(report);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Meeting Brain report schema mismatch", error.flatten(), report);
      throw new ReportGenerationError("SCHEMA_INVALID", "REPORT_SCHEMA_INVALID", {
        cause: error,
        details: error.flatten()
      });
    }

    throw error;
  }
}

async function simulateReport(payload, onProgress) {
  onProgress?.({ currentStage: "queued", percent: 10 });
  await simulateDelay(1100);

  onProgress?.({ currentStage: "analyzing", percent: 34 });
  await simulateDelay(1400);

  onProgress?.({ currentStage: "decisions", percent: 52 });
  await simulateDelay(1300);

  onProgress?.({ currentStage: "actionItems", percent: 69 });
  await simulateDelay(1100);

  onProgress?.({ currentStage: "risks", percent: 83 });
  await simulateDelay(1100);

  onProgress?.({ currentStage: "validating", percent: 95 });
  await simulateDelay(650);

  const report = validateReportSchema(createMockReport(payload));

  return {
    mode: "mock",
    report,
    attempts: 1
  };
}

export async function generateReport(payload, options = {}) {
  const { onProgress } = options;

  if (DEV_SIMULATE_AI) {
    return simulateReport(payload, onProgress);
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= REPORT_REQUEST_RETRIES) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REPORT_REQUEST_TIMEOUT_MS);

    try {
      onProgress?.({
        currentStage: attempt === 0 ? "queued" : "analyzing",
        percent: attempt === 0 ? 18 : 34
      });
      const data = await requestReport(payload, controller.signal);
      onProgress?.({ currentStage: "validating", percent: 94 });

      return {
        ...data,
        report: validateReportSchema(data.report),
        attempts: attempt + 1
      };
    } catch (error) {
      lastError = error;
      const isRetriable = error instanceof ReportGenerationError && ["TIMEOUT", "NETWORK"].includes(error.code);
      if (!isRetriable || attempt === REPORT_REQUEST_RETRIES) {
        throw error;
      }
    } finally {
      window.clearTimeout(timeoutId);
    }

    attempt += 1;
  }

  throw lastError;
}
