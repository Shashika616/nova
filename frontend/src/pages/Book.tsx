import React, { useState, useRef, useEffect } from "react";
import { streamKnowledge } from "../api/knowledge";
import { useTheme, type ThemeName } from "../context/ThemeContext";
import PageFlip from "../components/PageFlip";
import VoiceNarration from "../components/VoiceNarration";

type LevelType = "beginner" | "intermediate" | "expert";

interface Chapter {
  id: string;
  topic: string;
  title: string;
  content: string;
  sections: any[];
  suggestions: any[];
  resources?: any[];
  timestamp: number;
  readingProgress: number;
}

export default function Book() {
  const { theme, themeName, setTheme, themes } = useTheme();

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<LevelType>("beginner");

  const [structured, setStructured] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState("");

  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const pageFlipRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Detect dark mode from theme background ---
  const isDarkTheme = (() => {
    const bg = theme.colors.background;
    const hex = bg.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  })();

  // Blinking cursor (still used for skeleton)
  useEffect(() => {
    const t = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(t);
  }, []);

  // Scroll progress for structured view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const h = el.scrollHeight - el.clientHeight;
      const p = h > 0 ? (el.scrollTop / h) * 100 : 0;
      setReadingProgress(Math.min(p, 100));
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [structured]);

  /**
   * Robust JSON extraction
   */
  const extractJSON = (text: string) => {
    let cleaned = text.replace(/```json\s*|```\s*/g, "");
    const start = cleaned.indexOf("{");
    if (start === -1) return null;
    let braceCount = 0;
    let end = start;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === "{") braceCount++;
      else if (ch === "}") {
        braceCount--;
        if (braceCount === 0) {
          end = i;
          break;
        }
      }
    }
    if (braceCount !== 0) return null;
    const jsonStr = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  const generateSummary = () => {
    if (!content) return;
    const words = content.split(" ");
    const len = Math.min(Math.ceil(words.length * 0.18), 120);
    setSummary(words.slice(0, len).join(" ") + "...");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setIsStreaming(true);
    console.log("🔄 Streaming started"); // debug

    setStructured(null);
    setTitle("");
    setContent("");
    setSections([]);
    setSuggestions([]);
    setResources([]);
    setReadingProgress(0);
    setSummary("");
    setShowSummary(false);

    try {
      await pageFlipRef.current?.turnPage();

      const res = await streamKnowledge(
        topic,
        level,
        localStorage.getItem("token") || ""
      );
      if (!res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      const parsed = extractJSON(accumulated);

      if (parsed) {
        const newTitle = parsed.title || parsed.topic || topic;
        const newContent = parsed.content || "";
        const newSections = Array.isArray(parsed.sections) ? parsed.sections : [];
        const newSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
        const newResources = Array.isArray(parsed.resources) ? parsed.resources : [];

        setStructured(parsed);
        setTitle(newTitle);
        setContent(newContent);
        setSections(newSections);
        setSuggestions(newSuggestions);
        setResources(newResources);

        setChapters(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            topic,
            title: newTitle,
            content: newContent,
            sections: newSections,
            suggestions: newSuggestions,
            resources: newResources,
            timestamp: Date.now(),
            readingProgress: 0,
          },
        ]);
        setActiveChapter(chapters.length);
        generateSummary();
      } else {
        setStructured({ title: topic, content: accumulated });
        setTitle(topic);
        setContent(accumulated);
        setSections([]);
        setSuggestions([]);
        setResources([]);
        setChapters(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            topic,
            title: topic,
            content: accumulated,
            sections: [],
            suggestions: [],
            resources: [],
            timestamp: Date.now(),
            readingProgress: 0,
          },
        ]);
        setActiveChapter(chapters.length);
        generateSummary();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsStreaming(false);
      console.log("✅ Streaming ended");
    }
  };

  const openChapter = async (i: number) => {
    const ch = chapters[i];
    await pageFlipRef.current?.turnPage();
    setStructured({ title: ch.title, content: ch.content, sections: ch.sections, resources: ch.resources });
    setTitle(ch.title);
    setContent(ch.content);
    setSections(ch.sections || []);
    setSuggestions(ch.suggestions || []);
    setResources(ch.resources || []);
    setActiveChapter(i);
    setIsStreaming(false);
  };

  const renderSection = (section: any, index: number) => {
    if (typeof section === "string") {
      return (
        <div key={index} className="section-block border-b pb-4 mb-4">
          <h3 className="section-title text-lg font-bold mb-2">{section}</h3>
        </div>
      );
    }
    return (
      <div key={index} className="section-block border-b pb-4 mb-4">
        <h3 className="section-title text-lg font-bold mb-2">
          {section.title || section.name || "Section"}
        </h3>
        <div className="section-content text-neutral-700 text-sm leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
          {section.content || section.text || ""}
        </div>
      </div>
    );
  };

  // --- Skeleton Loader with high‑visibility pulsing placeholders ---
  const SkeletonLoader = () => {
    // Use distinct colors that contrast well with any background
    const mainBg = isDarkTheme ? "bg-gray-600" : "bg-gray-300";
    const lightBg = isDarkTheme ? "bg-gray-500" : "bg-gray-200";
    return (
      <div className="pb-10 space-y-8 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 border-4 border-t-transparent border-current rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-500">Generating content…</span>
        </div>
        <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
          <div className={`h-8 ${mainBg} rounded w-3/4 mb-2`} />
          <div className={`h-4 ${lightBg} rounded w-1/4`} />
        </div>
        <div>
          <div className={`h-6 ${mainBg} rounded w-1/3 mb-4`} />
          <div className="space-y-2">
            <div className={`h-4 ${lightBg} rounded w-full`} />
            <div className={`h-4 ${lightBg} rounded w-5/6`} />
            <div className={`h-4 ${lightBg} rounded w-4/5`} />
          </div>
        </div>
        <div>
          <div className={`h-6 ${mainBg} rounded w-1/2 mb-4`} />
          {[1, 2, 3].map(i => (
            <div key={i} className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
              <div className={`h-5 ${mainBg} rounded w-2/3 mb-2`} />
              <div className="space-y-2">
                <div className={`h-4 ${lightBg} rounded w-full`} />
                <div className={`h-4 ${lightBg} rounded w-5/6`} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className={`h-6 ${mainBg} rounded w-1/4 mb-4`} />
          <div className="space-y-2 pl-5">
            <div className={`h-4 ${lightBg} rounded w-1/2`} />
            <div className={`h-4 ${lightBg} rounded w-2/3`} />
          </div>
        </div>
        <div>
          <div className={`h-6 ${mainBg} rounded w-1/3 mb-4`} />
          <div className="flex flex-wrap gap-2">
            <div className={`h-8 ${lightBg} rounded-full w-20`} />
            <div className={`h-8 ${lightBg} rounded-full w-28`} />
            <div className={`h-8 ${lightBg} rounded-full w-24`} />
          </div>
        </div>
        <span
          className="inline-block w-0.5 h-4 bg-current ml-0.5"
          style={{ opacity: cursorVisible ? 1 : 0 }}
        />
      </div>
    );
  };

  return (
    <div className="screen-wrapper" style={{ background: theme.colors.background }}>
      <div className="book-container" style={{ backgroundColor: theme.colors.cover }}>

        {/* LEFT PAGE */}
        <section className="book-page book-page-left" style={{ background: theme.colors.surface }}>
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-5 overflow-y-auto">
              <div className="border-b pb-3">
                <h1 className="text-xl font-bold">📖 Manuscript Collector</h1>
                <p className="text-xs text-neutral-500">AI Knowledge System</p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-3">
                <input
                  className="book-input-field"
                  placeholder="Enter topic..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
                <select
                  className="book-input-field"
                  value={level}
                  onChange={e => setLevel(e.target.value as LevelType)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
                <button className="book-btn book-btn-active w-full" disabled={loading}>
                  {loading ? "Generating..." : "Generate"}
                </button>
              </form>

              <div>
                <p className="text-xs font-bold mb-2">Themes</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(themes).map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setTheme(name as ThemeName)}
                      className={`book-btn ${themeName === name ? "book-btn-active" : ""}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold mb-2">Chapters</p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {chapters.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => openChapter(i)}
                      className={`book-btn w-full flex justify-between ${
                        activeChapter === i ? "book-btn-active" : ""
                      }`}
                    >
                      <span className="truncate">{c.title || c.topic}</span>
                      <span>Vol {i + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="book-spine" />

        {/* RIGHT PAGE */}
        <section className="book-page book-page-right">
          <PageFlip ref={pageFlipRef}>
            <div ref={scrollRef} className="book-content-scroll">
              {isStreaming && <SkeletonLoader />}

              {!isStreaming && structured && (
                <article className="pb-10 space-y-8">
                  <header className="border-b pb-4">
                    <h2 className="text-2xl font-bold" style={{ fontFamily: theme.typography.headingFont }}>
                      {title || "Untitled"}
                    </h2>
                    {topic && topic !== title && (
                      <p className="text-xs text-neutral-400 mt-1">Topic: {topic}</p>
                    )}
                  </header>

                  {content && (
                    <div className="overview-block">
                      <h3 className="section-title text-xl font-bold mb-2">Overview</h3>
                      <div className="section-content content-body text-neutral-700 leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                        {content}
                      </div>
                    </div>
                  )}

                  {sections && sections.length > 0 && (
                    <div className="sections-container space-y-4">
                      <h3 className="section-title text-xl font-bold mb-2">Chapters & Sections</h3>
                      <div className="section-list">
                        {sections.map((section, idx) => renderSection(section, idx))}
                      </div>
                    </div>
                  )}

                  {resources && resources.length > 0 && (
                    <div className="resources-block border-t pt-4">
                      <h3 className="section-title text-lg font-bold mb-2">Verified References</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {resources.map((res: any, idx: number) => (
                          <li key={idx}>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm font-medium"
                            >
                              {res.label || "External Reference Link"}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions && suggestions.length > 0 && (
                    <div className="suggestions-block border-t pt-4">
                      <h3 className="section-title text-xl font-bold mb-2">Explore Further</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {suggestions.map((sug, idx) => {
                          const label = typeof sug === "string" ? sug : sug.title || sug.name || "Suggestion";
                          return (
                            <button
                              key={idx}
                              className="suggestion-chip px-3 py-1.5 text-xs rounded-full border border-neutral-300 hover:bg-neutral-100 transition-colors"
                              onClick={() => setTopic(label)}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!content && (!sections || sections.length === 0) && (
                    <p className="text-neutral-400 italic">No content available.</p>
                  )}
                </article>
              )}

              {!isStreaming && !structured && (
                <div className="h-full flex items-center justify-center opacity-40">
                  <p className="text-center">Start generating content…</p>
                </div>
              )}
            </div>
          </PageFlip>

          {!isStreaming && structured && (
            <div className="flex justify-between items-center text-[11px] border-t pt-2 mt-auto">
              <div className="flex-1 mr-3">
                <div className="h-1 bg-neutral-200 rounded">
                  <div
                    className="h-1 bg-black rounded transition-all duration-200"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>
              <button
                className="book-btn"
                onClick={() => {
                  if (!summary) generateSummary();
                  setShowSummary(v => !v);
                }}
              >
                Summary
              </button>
              <button
                className="book-btn ml-2"
                onClick={() => setNarrationEnabled(v => !v)}
              >
                {narrationEnabled ? "🔊" : "🔇"}
              </button>
            </div>
          )}
        </section>
      </div>

      {showSummary && summary && (
        <div className="fixed bottom-6 right-6 bg-white border shadow-xl p-4 max-w-xs rounded-lg">
          <p className="text-sm italic text-neutral-700">{summary}</p>
        </div>
      )}

      <VoiceNarration text={content} enabled={narrationEnabled} />
    </div>
  );
}