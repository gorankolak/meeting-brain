import { getFileExtension, validateUploadFile } from "../lib/transcriptInput";

async function parsePdf(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }

  return pages.join("\n\n");
}

async function parseDocx(file) {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function parseFileToText(file) {
  const validationError = validateUploadFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = getFileExtension(file.name);

  if (file.type === "application/pdf" || extension === ".pdf") {
    return parsePdf(file);
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === ".docx"
  ) {
    return parseDocx(file);
  }

  if (extension === ".txt" || extension === ".md") {
    return file.text();
  }

  return file.text();
}
