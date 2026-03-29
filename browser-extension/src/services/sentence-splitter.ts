/**
 * Splits text into sentences suitable for TTS processing.
 * Handles abbreviations, decimals, and other edge cases.
 */

const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'ave', 'blvd',
  'dept', 'est', 'fig', 'govt', 'inc', 'ltd', 'corp', 'vs', 'etc',
  'approx', 'appt', 'apt', 'dept', 'drs', 'gen', 'hon', 'sgt',
  'vol', 'rev', 'no', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul',
  'aug', 'sep', 'oct', 'nov', 'dec',
]);

export interface Sentence {
  text: string;
  startOffset: number;
  endOffset: number;
}

function isAbbreviation(word: string): boolean {
  return ABBREVIATIONS.has(word.toLowerCase().replace(/\.$/, ''));
}

function isDecimalOrNumber(before: string, after: string): boolean {
  return /\d$/.test(before) && /^\d/.test(after);
}

function isInitials(before: string): boolean {
  return /\b[A-Z]$/.test(before);
}

export function splitSentences(text: string): Sentence[] {
  if (!text || !text.trim()) return [];

  const sentences: Sentence[] = [];
  let current = '';
  let startOffset = 0;
  const chars = [...text];

  // Skip leading whitespace for first sentence
  let i = 0;
  while (i < chars.length && /\s/.test(chars[i])) {
    i++;
    startOffset = i;
  }

  for (; i < chars.length; i++) {
    const char = chars[i];
    current += char;

    // CJK sentence-ending punctuation (always split, no abbreviation logic)
    if (char === '\u3002' || char === '\uff01' || char === '\uff1f') {
      const trimmed = current.trim();
      if (trimmed) {
        sentences.push({
          text: trimmed,
          startOffset,
          endOffset: startOffset + current.trimEnd().length,
        });
      }
      current = '';
      while (i + 1 < chars.length && /\s/.test(chars[i + 1])) {
        i++;
      }
      startOffset = i + 1;
      continue;
    }

    if (char === '.' || char === '!' || char === '?' || char === '\u2026') {
      // Consume trailing punctuation (e.g., "..." or "?!")
      while (i + 1 < chars.length && /[.!?]/.test(chars[i + 1])) {
        i++;
        current += chars[i];
      }

      // Consume closing quotes/parens
      while (i + 1 < chars.length && /["'\u201D\u2019)]/.test(chars[i + 1])) {
        i++;
        current += chars[i];
      }

      const afterIdx = i + 1;
      const after = afterIdx < chars.length ? chars[afterIdx] : '';
      const beforePeriod = current.slice(0, -1).trim();
      const lastWord = beforePeriod.split(/\s+/).pop() || '';

      // Don't split on abbreviations
      if (char === '.' && isAbbreviation(lastWord)) continue;

      // Don't split on decimals (3.14)
      if (char === '.' && isDecimalOrNumber(beforePeriod, after)) continue;

      // Don't split on single-letter initials (J. K. Rowling)
      if (char === '.' && isInitials(beforePeriod)) continue;

      // Don't split if next char is lowercase (e.g., domain names)
      if (char === '.' && /^[a-z]/.test(after)) continue;

      // We have a sentence boundary
      const trimmed = current.trim();
      if (trimmed) {
        sentences.push({
          text: trimmed,
          startOffset,
          endOffset: startOffset + current.trimEnd().length,
        });
      }
      current = '';
      // Skip whitespace before next sentence
      while (i + 1 < chars.length && /\s/.test(chars[i + 1])) {
        i++;
      }
      startOffset = i + 1;
    } else if (char === '\n' && current.trim() && /\n/.test(chars[i + 1] || '')) {
      // Double newline = paragraph break = sentence boundary
      const trimmed = current.trim();
      if (trimmed) {
        sentences.push({
          text: trimmed,
          startOffset,
          endOffset: startOffset + current.trimEnd().length,
        });
      }
      current = '';
      while (i + 1 < chars.length && /\s/.test(chars[i + 1])) {
        i++;
      }
      startOffset = i + 1;
    }
  }

  // Push remaining text as final sentence
  const trimmed = current.trim();
  if (trimmed) {
    sentences.push({
      text: trimmed,
      startOffset,
      endOffset: startOffset + current.trimEnd().length,
    });
  }

  return sentences;
}

