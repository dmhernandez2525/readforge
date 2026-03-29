import { describe, it, expect } from 'vitest';
import { splitSentences } from './sentence-splitter';

describe('splitSentences', () => {
  it('returns empty array for empty/whitespace input', () => {
    expect(splitSentences('')).toEqual([]);
    expect(splitSentences('   ')).toEqual([]);
    expect(splitSentences('\n\n')).toEqual([]);
  });

  it('splits on periods', () => {
    const result = splitSentences('Hello world. Goodbye world.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Hello world.');
    expect(result[1].text).toBe('Goodbye world.');
  });

  it('splits on exclamation marks', () => {
    const result = splitSentences('Wow! That is amazing!');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Wow!');
    expect(result[1].text).toBe('That is amazing!');
  });

  it('splits on question marks', () => {
    const result = splitSentences('How are you? I am fine.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('How are you?');
    expect(result[1].text).toBe('I am fine.');
  });

  it('handles multiple punctuation marks', () => {
    const result = splitSentences('Really?! Yes... Maybe.');
    expect(result).toHaveLength(3);
    expect(result[0].text).toBe('Really?!');
    expect(result[1].text).toBe('Yes...');
    expect(result[2].text).toBe('Maybe.');
  });

  it('does not split on abbreviations', () => {
    const result = splitSentences('Dr. Smith went to the store. He bought milk.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Dr. Smith went to the store.');
  });

  it('does not split on Mr. and Mrs.', () => {
    const result = splitSentences('Mr. and Mrs. Jones arrived.');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Mr. and Mrs. Jones arrived.');
  });

  it('does not split on common abbreviations', () => {
    const result = splitSentences('The company Inc. was founded in Jan. of last year.');
    expect(result).toHaveLength(1);
  });

  it('does not split on decimals', () => {
    const result = splitSentences('The price is 3.14 dollars. That is cheap.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toContain('3.14');
  });

  it('does not split on initials', () => {
    const result = splitSentences('J. K. Rowling wrote Harry Potter.');
    expect(result).toHaveLength(1);
  });

  it('handles text without sentence endings', () => {
    const result = splitSentences('Just some text without an ending');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Just some text without an ending');
  });

  it('handles single sentence', () => {
    const result = splitSentences('One sentence.');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('One sentence.');
  });

  it('tracks correct offsets', () => {
    const text = 'First. Second.';
    const result = splitSentences(text);
    expect(result[0].startOffset).toBe(0);
    expect(result[0].endOffset).toBe(6);
  });

  it('splits on double newlines (paragraph breaks)', () => {
    const result = splitSentences('Paragraph one\n\nParagraph two');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Paragraph one');
    expect(result[1].text).toBe('Paragraph two');
  });

  it('handles closing quotes after punctuation', () => {
    const result = splitSentences('She said "hello." Then left.');
    expect(result).toHaveLength(2);
  });

  it('does not split when period is followed by lowercase', () => {
    const result = splitSentences('Visit example.com for details.');
    expect(result).toHaveLength(1);
  });

  it('handles ellipsis character', () => {
    const result = splitSentences('Wait\u2026 Okay fine.');
    expect(result).toHaveLength(2);
  });

  // CJK support
  it('splits on CJK full stop', () => {
    const result = splitSentences('\u4eca\u65e5\u306f\u3044\u3044\u5929\u6c17\u3067\u3059\u3002\u660e\u65e5\u3082\u3044\u3044\u3067\u3059\u3002');
    expect(result).toHaveLength(2);
    expect(result[0].text).toContain('\u3002');
    expect(result[1].text).toContain('\u3002');
  });

  it('splits on CJK question mark', () => {
    const result = splitSentences('\u5143\u6c17\u3067\u3059\u304b\uff1f\u306f\u3044\u3002');
    expect(result).toHaveLength(2);
  });

  it('splits on CJK exclamation mark', () => {
    const result = splitSentences('\u3059\u3054\u3044\uff01\u672c\u5f53\u306b\u3002');
    expect(result).toHaveLength(2);
  });

  // Unicode and emoji
  it('handles accented characters', () => {
    const result = splitSentences('Caf\u00e9 is great. Muy bueno.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Caf\u00e9 is great.');
  });

  it('handles emoji in sentences', () => {
    const result = splitSentences('Great job! \ud83d\ude0a Thanks.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Great job!');
    expect(result[1].text).toContain('Thanks.');
  });

  // Edge cases
  it('handles leading whitespace', () => {
    const result = splitSentences('   Hello world.');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Hello world.');
    expect(result[0].startOffset).toBe(3);
  });

  it('handles very long text', () => {
    const long = 'This is a sentence. '.repeat(500);
    const result = splitSentences(long);
    expect(result).toHaveLength(500);
  });

  it('handles mixed punctuation !?', () => {
    const result = splitSentences('No way!? Yes way.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('No way!?');
  });

  it('handles sentence ending with closing paren', () => {
    const result = splitSentences('He left (finally). She stayed.');
    expect(result).toHaveLength(2);
  });
});

