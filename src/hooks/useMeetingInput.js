import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getDefaultExampleMeeting,
  getExampleMeetings,
  validateTranscript
} from "../lib/transcriptInput";
import { parseFileToText } from "../services/parseFile";

export function useMeetingInput() {
  const { t } = useTranslation(["common", "example"]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [sourceType, setSourceType] = useState("pasted_notes");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState("");
  const [activeExampleId, setActiveExampleId] = useState("");
  const [hasTouchedTranscript, setHasTouchedTranscript] = useState(false);

  const exampleMeetings = useMemo(() => getExampleMeetings(t), [t]);
  const transcriptError = validateTranscript(inputText);
  const showTranscriptError = hasTouchedTranscript && Boolean(transcriptError);

  function inferSourceType(file) {
    const lowerName = file.name.toLowerCase();
    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) return "pdf_upload";
    if (lowerName.endsWith(".docx")) return "docx_upload";
    if (lowerName.endsWith(".txt")) return "txt_upload";
    if (lowerName.endsWith(".md")) return "md_upload";
    return "pasted_notes";
  }

  function updateTranscript(value) {
    setInputText(value);
    setSourceType("pasted_notes");
    setFileName("");
    setFileSize(0);
    setActiveExampleId("");
    setError("");
  }

  async function handleFileUpload(file) {
    if (!file) return;

    try {
      const parsedText = await parseFileToText(file);
      setInputText(parsedText);
      setMeetingTitle(file.name.replace(/\.[^.]+$/, ""));
      setFileName(file.name);
      setFileSize(file.size);
      setSourceType(inferSourceType(file));
      setActiveExampleId("");
      setHasTouchedTranscript(true);
      setError("");
    } catch (fileError) {
      if (fileError.message === "FILE_TOO_LARGE") {
        setError(t("common:errors.fileTooLarge"));
        return;
      }

      if (fileError.message === "FILE_TYPE_UNSUPPORTED") {
        setError(t("common:errors.fileTypeUnsupported"));
        return;
      }

      setError(t("common:errors.fileReadFailed"));
    }
  }

  function loadExample(exampleId) {
    const requestedExample = exampleId
      ? exampleMeetings.find((meeting) => meeting.id === exampleId)
      : null;
    const activeExampleIndex = exampleMeetings.findIndex(
      (meeting) => meeting.id === activeExampleId
    );
    const nextExample =
      activeExampleIndex >= 0
        ? exampleMeetings[(activeExampleIndex + 1) % exampleMeetings.length]
        : getDefaultExampleMeeting(t);
    const example = requestedExample || nextExample;

    setMeetingTitle(example.title);
    setInputText(example.transcript);
    setFileName("");
    setFileSize(0);
    setSourceType("example");
    setActiveExampleId(example.id);
    setHasTouchedTranscript(true);
    setError("");
  }

  function markTranscriptTouched() {
    setHasTouchedTranscript(true);
  }

  function removeUploadedFile() {
    setFileName("");
    setFileSize(0);
    setSourceType("pasted_notes");
    setError("");
  }

  useEffect(() => {
    if (sourceType !== "example") {
      return;
    }

    const example =
      exampleMeetings.find((meeting) => meeting.id === activeExampleId) ||
      getDefaultExampleMeeting(t);
    setMeetingTitle(example.title);
    setInputText(example.transcript);
  }, [activeExampleId, exampleMeetings, sourceType, t]);

  return {
    meetingTitle,
    inputText,
    sourceType,
    fileName,
    fileSize,
    error,
    transcriptError: showTranscriptError ? t(`common:${transcriptError}`) : "",
    isTranscriptValid: !transcriptError,
    exampleMeetings,
    activeExampleId,
    setMeetingTitle,
    setInputText: updateTranscript,
    handleFileUpload,
    removeUploadedFile,
    loadExample,
    markTranscriptTouched
  };
}
