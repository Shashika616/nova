// utils/parseKnowledgeContent.ts
//
// The backend streams the model's raw markdown-ish text (see
// KnowledgeRepository.save_page: title / content / sections / suggestions).
// The stream endpoint itself only sends the plain "content" text token by
// token, so the frontend needs to turn that single blob back into the
// same shape the repository expects, instead of dumping it verbatim.

export interface KnowledgeSection {
  heading: string;
  body: string;
}

export interface ParsedKnowledge {
  sections: KnowledgeSection[];
  suggestions: string[];
}

const HEADING_RE = /^(#{1,3})\s+(.*)$/;
const SUGGESTIONS_HEADING_RE = /^(explore next|related topics|suggested topics|see also)\s*:?$/i;

/**
 * Splits raw markdown-style text into headed sections. Falls back to a
 * single "Overview" section when the model didn't produce any headings
 * (e.g. mid-stream, before enough content has arrived).
 */
export function parseKnowledgeContent(raw: string): ParsedKnowledge {
  const lines = raw.split("\n");

  const sections: KnowledgeSection[] = [];
  const suggestions: string[] = [];

  let currentHeading: string | null = null;
  let currentBody: string[] = [];
  let inSuggestionsBlock = false;

  const flushSection = () => {
    const body = currentBody.join("\n").trim();
    if (currentHeading || body) {
      sections.push({ heading: currentHeading ?? "Overview", body });
    }
    currentBody = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(HEADING_RE);

    if (headingMatch) {
      const text = headingMatch[2].trim();
      if (SUGGESTIONS_HEADING_RE.test(text)) {
        inSuggestionsBlock = true;
        flushSection();
        currentHeading = null;
        continue;
      }
      inSuggestionsBlock = false;
      flushSection();
      currentHeading = text;
      continue;
    }

    if (inSuggestionsBlock) {
      const bullet = line.replace(/^[\s\-*•\d.)]+/, "").trim();
      if (bullet) suggestions.push(bullet);
      continue;
    }

    currentBody.push(line);
  }
  flushSection();

  return { sections, suggestions: suggestions.slice(0, 6) };
}