export const MIN_TRANSCRIPT_LENGTH = 20;
export const MAX_TRANSCRIPT_LENGTH = 20000;
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export const SUPPORTED_UPLOAD_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

export function getFileExtension(fileName = "") {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);
  return match ? match[0] : "";
}

export function isSupportedUploadType(file) {
  return SUPPORTED_UPLOAD_EXTENSIONS.includes(getFileExtension(file.name));
}

export function validateTranscript(text) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return "errors.transcriptRequired";
  }

  if (normalizedText.length < MIN_TRANSCRIPT_LENGTH) {
    return "errors.transcriptTooShort";
  }

  if (normalizedText.length > MAX_TRANSCRIPT_LENGTH) {
    return "errors.transcriptTooLong";
  }

  return null;
}

export function validateUploadFile(file) {
  if (!file) {
    return null;
  }

  if (!isSupportedUploadType(file)) {
    return "FILE_TYPE_UNSUPPORTED";
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return "FILE_TOO_LARGE";
  }

  return null;
}

export function getExampleMeetings(t) {
  return [
    {
      id: "productDevSprintReview",
      title: t("example:meetings.productDevSprintReview.title"),
      transcript: t("example:meetings.productDevSprintReview.transcript")
    },
    {
      id: "infrastructureRolloutCheckpoint",
      title: t("example:meetings.infrastructureRolloutCheckpoint.title"),
      transcript: t("example:meetings.infrastructureRolloutCheckpoint.transcript")
    },
    {
      id: "vendorCoordinationReview",
      title: t("example:meetings.vendorCoordinationReview.title"),
      transcript: t("example:meetings.vendorCoordinationReview.transcript")
    },
    {
      id: "customerEscalationTriage",
      title: t("example:meetings.customerEscalationTriage.title"),
      transcript: t("example:meetings.customerEscalationTriage.transcript")
    },
    {
      id: "marketingLaunchReadiness",
      title: t("example:meetings.marketingLaunchReadiness.title"),
      transcript: t("example:meetings.marketingLaunchReadiness.transcript")
    },
    {
      id: "financePlanningSync",
      title: t("example:meetings.financePlanningSync.title"),
      transcript: t("example:meetings.financePlanningSync.transcript")
    }
  ];
}

export function getDefaultExampleMeeting(t) {
  return getExampleMeetings(t)[0];
}
