export class ReportGenerationError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = "ReportGenerationError";
    this.code = code;
    this.cause = options.cause;
    this.details = options.details;
  }
}

export function isReportGenerationError(error) {
  return error instanceof ReportGenerationError;
}
