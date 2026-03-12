import { useState } from "react";
import { exampleMeetings } from "../lib/exampleMeetings";
import { parseFileToText } from "../services/parseFile";

export function useMeetingInput() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [sourceType, setSourceType] = useState("pasted_notes");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  function inferSourceType(file) {
    const lowerName = file.name.toLowerCase();
    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) return "pdf_upload";
    if (lowerName.endsWith(".doc")) return "doc_upload";
    if (lowerName.endsWith(".docx")) return "docx_upload";
    if (lowerName.endsWith(".txt")) return "txt_upload";
    if (lowerName.endsWith(".md")) return "md_upload";
    return "pasted_notes";
  }

  async function handleFileUpload(file) {
    if (!file) return;

    try {
      const parsedText = await parseFileToText(file);
      setInputText(parsedText);
      setMeetingTitle(file.name.replace(/\.[^.]+$/, ""));
      setFileName(file.name);
      setSourceType(inferSourceType(file));
      setError("");
    } catch (fileError) {
      setError(fileError.message || "Unable to read the uploaded file.");
    }
  }

  function loadExample() {
    const example = exampleMeetings[0];
    setMeetingTitle(example.title);
    setInputText(example.transcript);
    setFileName("");
    setSourceType("example");
    setError("");
  }

  return {
    meetingTitle,
    inputText,
    sourceType,
    fileName,
    error,
    setMeetingTitle,
    setInputText,
    handleFileUpload,
    loadExample
  };
}
