import { Readability } from '@mozilla/readability';

export interface ExtractedContent {
  title: string;
  content: string;
  byline: string | null;
  siteName: string | null;
  source: 'article' | 'selection' | 'full-page';
}

export function extractFromSelection(): ExtractedContent | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;

  const text = selection.toString().trim();
  if (!text) return null;

  return {
    title: document.title,
    content: text,
    byline: null,
    siteName: null,
    source: 'selection',
  };
}

export function extractArticle(): ExtractedContent | null {
  const documentClone = document.cloneNode(true) as Document;

  const reader = new Readability(documentClone, {
    charThreshold: 100,
  });

  const article = reader.parse();
  if (!article || !article.textContent?.trim()) return null;

  return {
    title: article.title,
    content: article.textContent,
    byline: article.byline,
    siteName: article.siteName,
    source: 'article',
  };
}

export function extractFullPage(): ExtractedContent {
  const body = document.body;
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      const tag = parent.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'svg', 'path'].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }

      const style = window.getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return NodeFilter.FILTER_REJECT;
      }

      const text = node.textContent?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const texts: string[] = [];
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent?.trim();
    if (text) texts.push(text);
  }

  return {
    title: document.title,
    content: texts.join('\n'),
    byline: null,
    siteName: null,
    source: 'full-page',
  };
}

