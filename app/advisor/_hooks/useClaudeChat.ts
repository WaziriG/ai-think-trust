"use client";

import { useState, useCallback, useRef } from "react";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "sivraj";
  timestamp: Date;
}

interface UseClaudeChatOptions {
  onMessage: (message: Message) => void;
  onUpdateMessage: (id: string, content: string) => void;
  onError: (error: string) => void;
}

export function useClaudeChat({
  onMessage,
  onUpdateMessage,
  onError,
}: UseClaudeChatOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
      let idx = 0;
      setIsSpeaking(true);

      const next = () => {
        if (idx >= sentences.length) {
          setIsSpeaking(false);
          resolve();
          return;
        }
        const utt = new SpeechSynthesisUtterance(sentences[idx++].trim());
        utt.rate = 0.92;
        utt.pitch = 1.0;
        utt.onend = next;
        utt.onerror = next;
        window.speechSynthesis.speak(utt);
      };

      next();
    });
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        content: userText,
        sender: "user",
        timestamp: new Date(),
      };
      onMessage(userMsg);
      historyRef.current.push({ role: "user", content: userText });

      const assistantId = crypto.randomUUID();
      onMessage({
        id: assistantId,
        content: "",
        sender: "sivraj",
        timestamp: new Date(),
      });

      setIsProcessing(true);
      let fullText = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyRef.current }),
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;

            try {
              const parsed = JSON.parse(payload) as { text?: string; error?: string };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                fullText += parsed.text;
                onUpdateMessage(assistantId, fullText);
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to reach SIVRAJ");
      } finally {
        setIsProcessing(false);
      }

      if (fullText) {
        historyRef.current.push({ role: "assistant", content: fullText });
        await speak(fullText);
      }
    },
    [onMessage, onUpdateMessage, onError, speak]
  );

  return { isProcessing, isSpeaking, sendMessage };
}
