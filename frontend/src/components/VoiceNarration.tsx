// components/VoiceNarration.tsx
import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

interface VoiceNarrationProps {
  text: string;
  enabled: boolean;
  rate?: number;
}

export default function VoiceNarration({ 
  text, 
  enabled, 
  rate = 0.9 
}: VoiceNarrationProps) {
  const { theme } = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        const englishVoice = availableVoices.find((v) =>
          v.lang.includes("en")
        );
        setSelectedVoice(englishVoice?.voiceURI || availableVoices[0].voiceURI);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, [selectedVoice]);

  useEffect(() => {
    if (!enabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [enabled]);

  const speak = () => {
    if (!text || !enabled) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.voice = voices.find((v) => v.voiceURI === selectedVoice) || null;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-6 right-6 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 overflow-hidden"
      style={{
        background: `${theme.colors.surface}ee`,
        border: `1px solid ${theme.colors.border}`,
        maxWidth: isExpanded ? "340px" : "56px",
        boxShadow: `0 20px 60px ${theme.colors.shadow}`,
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-200"
        style={{ color: theme.colors.text }}
      >
        <span className="text-xl">📖</span>
        {isExpanded && (
          <span className="text-sm font-medium">
            {isSpeaking ? "Reading..." : "Voice Narration"}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-slideInUp">
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            disabled={isSpeaking}
            className="w-full px-3 py-2 text-sm rounded-xl border-2 bg-transparent transition-all duration-200 focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.text,
              background: theme.colors.input,
            }}
          >
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={speak}
              disabled={isSpeaking || !text}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: isSpeaking ? theme.colors.muted : theme.colors.primary,
                color: "#fff",
              }}
            >
              ▶ Play
            </button>

            <button
              onClick={pause}
              disabled={!isSpeaking}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: isSpeaking ? theme.colors.secondary : theme.colors.muted,
                color: "#fff",
              }}
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>

            <button
              onClick={stop}
              disabled={!isSpeaking && !isPaused}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: theme.colors.error,
                color: "#fff",
              }}
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}