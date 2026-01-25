# SDD-002: Chrome Extension

**Feature:** Chrome Browser Extension with Local TTS
**Phase:** 1B
**Priority:** P0
**Status:** Draft

---

## Overview

Build a Chrome extension using WXT framework that provides text-to-speech functionality for web pages, PDFs, and Google Docs with 100% local processing using kokoro-js.

## Goals

1. Extract readable text from any web page using Readability.js
2. Support PDF reading via PDF.js
3. Integrate with Google Docs content
4. Provide floating player UI with text highlighting
5. Process all TTS locally using WebGPU/WASM

## Technical Specification

### Extension Architecture

```
browser-extension/
├── src/
│   ├── entrypoints/
│   │   ├── background.ts          # Service worker
│   │   ├── content.ts             # Content script (all pages)
│   │   ├── content-pdf.ts         # PDF-specific content script
│   │   ├── content-gdocs.ts       # Google Docs content script
│   │   └── popup/                 # Extension popup
│   │       ├── App.tsx
│   │       └── main.tsx
│   ├── components/
│   │   ├── FloatingPlayer/
│   │   │   ├── index.tsx
│   │   │   ├── Controls.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── VoiceSelector.tsx
│   │   │   └── SpeedSlider.tsx
│   │   └── Highlighter/
│   │       └── index.ts
│   ├── services/
│   │   ├── tts-engine.ts          # TTS core wrapper
│   │   ├── text-extractor.ts      # Page content extraction
│   │   ├── pdf-reader.ts          # PDF.js integration
│   │   ├── gdocs-reader.ts        # Google Docs integration
│   │   └── storage.ts             # Settings persistence
│   ├── utils/
│   │   ├── sentence-splitter.ts
│   │   └── dom-helpers.ts
│   └── styles/
│       └── floating-player.css
├── public/
│   ├── icons/
│   └── models/                    # Bundled ONNX models
├── wxt.config.ts
└── package.json
```

### WXT Configuration

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@anthropic-ai/wxt-react'],
  manifest: {
    name: 'ReadForge',
    description: '100% local text-to-speech for web pages, PDFs, and documents',
    version: '1.0.0',
    permissions: [
      'activeTab',
      'storage',
      'contextMenus',
      'offscreen'  // For audio playback
    ],
    host_permissions: [
      '<all_urls>'
    ],
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content.js'],
        css: ['content.css']
      },
      {
        matches: ['*://*.google.com/document/*'],
        js: ['content-gdocs.js']
      }
    ],
    web_accessible_resources: [
      {
        resources: ['models/*', 'floating-player.html'],
        matches: ['<all_urls>']
      }
    ],
    commands: {
      'toggle-play': {
        suggested_key: { default: 'Alt+Shift+P' },
        description: 'Play/Pause reading'
      },
      'read-selection': {
        suggested_key: { default: 'Alt+Shift+R' },
        description: 'Read selected text'
      }
    }
  }
});
```

### Content Script - Text Extraction

```typescript
// src/services/text-extractor.ts
import { Readability } from '@anthropic-ai/readability';

interface ExtractedContent {
  title: string;
  textContent: string;
  paragraphs: Paragraph[];
  source: 'article' | 'selection' | 'full-page';
}

interface Paragraph {
  text: string;
  element: Element | null;
  startOffset: number;
  endOffset: number;
}

export class TextExtractor {
  /**
   * Extract readable content from current page
   */
  extractArticle(): ExtractedContent {
    // Clone document for Readability (it modifies the DOM)
    const documentClone = document.cloneNode(true) as Document;

    const reader = new Readability(documentClone, {
      charThreshold: 100,
      keepClasses: true
    });

    const article = reader.parse();

    if (!article) {
      return this.extractFullPage();
    }

    return {
      title: article.title,
      textContent: article.textContent,
      paragraphs: this.extractParagraphs(article.content),
      source: 'article'
    };
  }

  /**
   * Extract selected text
   */
  extractSelection(): ExtractedContent | null {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      return null;
    }

    const text = selection.toString().trim();

    if (!text) {
      return null;
    }

    return {
      title: 'Selection',
      textContent: text,
      paragraphs: [{
        text,
        element: selection.anchorNode?.parentElement ?? null,
        startOffset: 0,
        endOffset: text.length
      }],
      source: 'selection'
    };
  }

  /**
   * Fallback: extract all visible text
   */
  private extractFullPage(): ExtractedContent {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          // Skip hidden elements
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip script, style, etc.
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'svg'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const paragraphs: Paragraph[] = [];
    let fullText = '';
    let node: Text | null;

    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        paragraphs.push({
          text,
          element: node.parentElement,
          startOffset: fullText.length,
          endOffset: fullText.length + text.length
        });
        fullText += text + ' ';
      }
    }

    return {
      title: document.title,
      textContent: fullText.trim(),
      paragraphs,
      source: 'full-page'
    };
  }

  private extractParagraphs(htmlContent: string): Paragraph[] {
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    const paragraphs: Paragraph[] = [];
    let offset = 0;

    const blocks = temp.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');

    blocks.forEach((block) => {
      const text = block.textContent?.trim();
      if (text) {
        paragraphs.push({
          text,
          element: null, // Will be matched to real DOM later
          startOffset: offset,
          endOffset: offset + text.length
        });
        offset += text.length + 1;
      }
    });

    return paragraphs;
  }
}
```

### PDF Reader Integration

```typescript
// src/services/pdf-reader.ts
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.js');

interface PDFContent {
  title: string;
  pages: PDFPage[];
  totalPages: number;
}

interface PDFPage {
  pageNumber: number;
  text: string;
  textItems: TextItem[];
}

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export class PDFReader {
  private pdf: pdfjsLib.PDFDocumentProxy | null = null;

  async loadFromUrl(url: string): Promise<PDFContent> {
    this.pdf = await pdfjsLib.getDocument(url).promise;

    const pages: PDFPage[] = [];

    for (let i = 1; i <= this.pdf.numPages; i++) {
      const page = await this.extractPage(i);
      pages.push(page);
    }

    // Try to get title from metadata
    const metadata = await this.pdf.getMetadata();
    const title = (metadata.info as any)?.Title || 'PDF Document';

    return {
      title,
      pages,
      totalPages: this.pdf.numPages
    };
  }

  async loadFromBlob(blob: Blob): Promise<PDFContent> {
    const arrayBuffer = await blob.arrayBuffer();
    this.pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Same extraction logic as loadFromUrl
    const pages: PDFPage[] = [];

    for (let i = 1; i <= this.pdf.numPages; i++) {
      const page = await this.extractPage(i);
      pages.push(page);
    }

    return {
      title: 'PDF Document',
      pages,
      totalPages: this.pdf.numPages
    };
  }

  private async extractPage(pageNumber: number): Promise<PDFPage> {
    const page = await this.pdf!.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const textItems: TextItem[] = [];
    let fullText = '';

    for (const item of textContent.items) {
      if ('str' in item) {
        const transform = item.transform;

        textItems.push({
          text: item.str,
          x: transform[4],
          y: transform[5],
          width: item.width,
          height: item.height,
          pageNumber
        });

        fullText += item.str;

        // Add space if there's a gap
        if (item.hasEOL) {
          fullText += '\n';
        } else {
          fullText += ' ';
        }
      }
    }

    return {
      pageNumber,
      text: fullText.trim(),
      textItems
    };
  }

  dispose(): void {
    this.pdf?.destroy();
    this.pdf = null;
  }
}
```

### Google Docs Integration

```typescript
// src/services/gdocs-reader.ts

interface GDocsContent {
  title: string;
  textContent: string;
  paragraphs: GDocsParagraph[];
}

interface GDocsParagraph {
  text: string;
  elementId: string;
  startOffset: number;
  endOffset: number;
}

export class GDocsReader {
  /**
   * Extract content from Google Docs
   * Google Docs uses a custom rendering system with SVG text
   */
  extract(): GDocsContent {
    // Get document title
    const titleElement = document.querySelector('.docs-title-input');
    const title = titleElement?.textContent?.trim() || 'Google Doc';

    // Google Docs renders text in .kix-lineview elements
    const lineViews = document.querySelectorAll('.kix-lineview');

    const paragraphs: GDocsParagraph[] = [];
    let fullText = '';
    let offset = 0;

    lineViews.forEach((line, index) => {
      // Each line contains .kix-wordhtmlgenerator-word-node elements
      const words = line.querySelectorAll('.kix-wordhtmlgenerator-word-node');
      let lineText = '';

      words.forEach((word) => {
        lineText += word.textContent;
      });

      lineText = lineText.trim();

      if (lineText) {
        paragraphs.push({
          text: lineText,
          elementId: `line-${index}`,
          startOffset: offset,
          endOffset: offset + lineText.length
        });

        fullText += lineText + '\n';
        offset += lineText.length + 1;
      }
    });

    return {
      title,
      textContent: fullText.trim(),
      paragraphs
    };
  }

  /**
   * Highlight a specific paragraph in Google Docs
   */
  highlightParagraph(elementId: string): void {
    // Remove previous highlights
    document.querySelectorAll('.readforge-highlight').forEach((el) => {
      el.classList.remove('readforge-highlight');
    });

    const index = parseInt(elementId.replace('line-', ''), 10);
    const lineViews = document.querySelectorAll('.kix-lineview');

    if (lineViews[index]) {
      lineViews[index].classList.add('readforge-highlight');
      lineViews[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
```

### Floating Player Component

```tsx
// src/components/FloatingPlayer/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { VoiceSelector } from './VoiceSelector';
import { SpeedSlider } from './SpeedSlider';
import { useTTSEngine } from '../../hooks/useTTSEngine';
import { useHighlighter } from '../../hooks/useHighlighter';
import styles from './FloatingPlayer.module.css';

interface FloatingPlayerProps {
  content: ExtractedContent;
  onClose: () => void;
}

export const FloatingPlayer: React.FC<FloatingPlayerProps> = ({
  content,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState('af_heart');
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isMinimized, setIsMinimized] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const { engine, isLoading } = useTTSEngine();
  const highlighter = useHighlighter(content.paragraphs);

  // Play/pause handler
  const togglePlay = async () => {
    if (isPlaying) {
      engine?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await playFromSentence(currentSentence);
    }
  };

  // Play from specific sentence
  const playFromSentence = async (startIndex: number) => {
    if (!engine) return;

    const sentences = new SentenceSplitter().split(content.textContent);

    for (let i = startIndex; i < sentences.length; i++) {
      if (!isPlaying) break;

      setCurrentSentence(i);
      highlighter.highlight(sentences[i].startOffset, sentences[i].endOffset);

      await engine.speak(sentences[i].text, { speed, voice });
    }

    setIsPlaying(false);
    highlighter.clear();
  };

  // Handle speed change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    engine?.setSpeed(newSpeed);
  };

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent) => {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleDrag = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  if (isMinimized) {
    return (
      <div
        className={styles.minimized}
        style={{ left: position.x, top: position.y }}
        onClick={() => setIsMinimized(false)}
      >
        <button
          className={styles.playButton}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    );
  }

  return (
    <div
      className={styles.player}
      style={{ left: position.x, top: position.y }}
      ref={dragRef}
    >
      {/* Header - Draggable */}
      <div
        className={styles.header}
        onMouseDown={handleDragStart}
      >
        <span className={styles.title}>{content.title}</span>
        <div className={styles.headerButtons}>
          <button onClick={() => setIsMinimized(true)}>−</button>
          <button onClick={onClose}>×</button>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        current={currentSentence}
        total={new SentenceSplitter().split(content.textContent).length}
        onSeek={async (index) => {
          setCurrentSentence(index);
          if (isPlaying) {
            await playFromSentence(index);
          }
        }}
      />

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        isLoading={isLoading}
        onPlayPause={togglePlay}
        onSkipBack={() => setCurrentSentence(Math.max(0, currentSentence - 1))}
        onSkipForward={() => setCurrentSentence(currentSentence + 1)}
      />

      {/* Voice and speed */}
      <div className={styles.settings}>
        <VoiceSelector
          value={voice}
          onChange={setVoice}
          voices={engine?.getVoices() ?? []}
        />
        <SpeedSlider
          value={speed}
          onChange={handleSpeedChange}
        />
      </div>
    </div>
  );
};
```

### Text Highlighter

```typescript
// src/components/Highlighter/index.ts

export class TextHighlighter {
  private highlightElements: HTMLElement[] = [];
  private styleElement: HTMLStyleElement;

  constructor() {
    // Inject highlight styles
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      .readforge-highlight {
        background-color: rgba(255, 213, 79, 0.4) !important;
        border-radius: 2px;
        transition: background-color 0.15s ease;
      }
      .readforge-highlight-active {
        background-color: rgba(255, 193, 7, 0.6) !important;
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  /**
   * Highlight text between offsets
   */
  highlight(startOffset: number, endOffset: number): void {
    this.clear();

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentOffset = 0;
    let node: Text | null;

    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent || '';
      const nodeStart = currentOffset;
      const nodeEnd = currentOffset + text.length;

      // Check if this node overlaps with our highlight range
      if (nodeEnd > startOffset && nodeStart < endOffset) {
        const highlightStart = Math.max(0, startOffset - nodeStart);
        const highlightEnd = Math.min(text.length, endOffset - nodeStart);

        this.highlightTextNode(node, highlightStart, highlightEnd);
      }

      currentOffset = nodeEnd;

      // Stop if we've passed the end
      if (nodeStart > endOffset) break;
    }

    // Scroll first highlight into view
    if (this.highlightElements.length > 0) {
      this.highlightElements[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  private highlightTextNode(
    node: Text,
    startOffset: number,
    endOffset: number
  ): void {
    const range = document.createRange();
    range.setStart(node, startOffset);
    range.setEnd(node, endOffset);

    const span = document.createElement('span');
    span.className = 'readforge-highlight readforge-highlight-active';

    try {
      range.surroundContents(span);
      this.highlightElements.push(span);
    } catch (e) {
      // Range crosses element boundaries, use more complex approach
      this.highlightComplexRange(range);
    }
  }

  private highlightComplexRange(range: Range): void {
    // For ranges that cross element boundaries
    const rects = range.getClientRects();

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      const overlay = document.createElement('div');
      overlay.className = 'readforge-highlight-overlay';
      overlay.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        background-color: rgba(255, 213, 79, 0.4);
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(overlay);
      this.highlightElements.push(overlay);
    }
  }

  /**
   * Clear all highlights
   */
  clear(): void {
    this.highlightElements.forEach((el) => {
      if (el.classList.contains('readforge-highlight-overlay')) {
        el.remove();
      } else {
        // Unwrap span highlights
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        el.remove();
      }
    });
    this.highlightElements = [];
  }

  dispose(): void {
    this.clear();
    this.styleElement.remove();
  }
}
```

### Background Service Worker

```typescript
// src/entrypoints/background.ts
import { browser } from 'wxt/browser';

// Context menu setup
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'readforge-read-selection',
    title: 'Read with ReadForge',
    contexts: ['selection']
  });

  browser.contextMenus.create({
    id: 'readforge-read-page',
    title: 'Read this page',
    contexts: ['page']
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'readforge-read-selection') {
    browser.tabs.sendMessage(tab.id, {
      action: 'read-selection'
    });
  } else if (info.menuItemId === 'readforge-read-page') {
    browser.tabs.sendMessage(tab.id, {
      action: 'read-page'
    });
  }
});

// Handle keyboard shortcuts
browser.commands.onCommand.addListener((command, tab) => {
  if (!tab?.id) return;

  switch (command) {
    case 'toggle-play':
      browser.tabs.sendMessage(tab.id, { action: 'toggle-play' });
      break;
    case 'read-selection':
      browser.tabs.sendMessage(tab.id, { action: 'read-selection' });
      break;
  }
});

// Handle messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get-voices') {
    // Return available voices
    sendResponse(getVoices());
    return true;
  }

  if (message.action === 'tts-status') {
    // Update badge to show playing status
    const badgeText = message.isPlaying ? '▶' : '';
    browser.action.setBadgeText({
      text: badgeText,
      tabId: sender.tab?.id
    });
    return true;
  }
});

function getVoices() {
  return [
    { id: 'af_heart', name: 'Heart', language: 'en', gender: 'female' },
    { id: 'af_bella', name: 'Bella', language: 'en', gender: 'female' },
    { id: 'af_nicole', name: 'Nicole', language: 'en', gender: 'female' },
    { id: 'am_adam', name: 'Adam', language: 'en', gender: 'male' },
    { id: 'am_michael', name: 'Michael', language: 'en', gender: 'male' },
    { id: 'bf_emma', name: 'Emma (British)', language: 'en-GB', gender: 'female' },
    { id: 'bm_george', name: 'George (British)', language: 'en-GB', gender: 'male' },
  ];
}
```

## Acceptance Criteria

### Functional
- [ ] Text extraction works on major news sites (NYT, Medium, Wikipedia)
- [ ] PDF reading works for text-based PDFs
- [ ] Google Docs content extracts correctly
- [ ] Floating player appears and is draggable
- [ ] Text highlighting syncs with audio
- [ ] Speed control works (0.5x - 4x)
- [ ] Voice selection works
- [ ] Context menu "Read with ReadForge" works
- [ ] Keyboard shortcuts work (Alt+Shift+P, Alt+Shift+R)

### Performance
- [ ] Extension loads in < 2 seconds
- [ ] TTS starts within 1 second of play
- [ ] Memory usage < 300MB during playback
- [ ] No visible jank during highlighting

### Compatibility
- [ ] Chrome 120+
- [ ] Edge 120+
- [ ] Works with common ad blockers
- [ ] Works on most Cloudflare-protected sites

## Test Plan

### Manual Testing Checklist
- [ ] Wikipedia article extraction
- [ ] Medium article extraction
- [ ] News sites (NYT, WaPo, BBC)
- [ ] PDF file (drag and drop)
- [ ] Google Docs document
- [ ] Gmail email body
- [ ] Selected text only
- [ ] Full page fallback

### Automated Tests
```typescript
describe('TextExtractor', () => {
  it('extracts article content', () => {
    document.body.innerHTML = `
      <article>
        <h1>Test Article</h1>
        <p>First paragraph.</p>
        <p>Second paragraph.</p>
      </article>
    `;

    const extractor = new TextExtractor();
    const content = extractor.extractArticle();

    expect(content.title).toBe('Test Article');
    expect(content.paragraphs.length).toBe(2);
  });
});
```

## Dependencies

- wxt: ^0.18.0
- @anthropic-ai/readability: ^0.5.0
- pdfjs-dist: ^4.0.0
- kokoro-js: ^1.0.0
- react: ^18.2.0

---

**Author:** ReadForge Team
**Created:** January 25, 2026
**Last Updated:** January 25, 2026
