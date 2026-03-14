import { useEffect, useState } from "react";

const MESSAGE_INTERVAL_MS = 1500;

export function useGenerationProgress(isGenerating, messages) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating || !messages.length) {
      setMessageIndex(0);
      return undefined;
    }

    setMessageIndex(0);

    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, MESSAGE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isGenerating, messages]);

  return messages[messageIndex] || "";
}
