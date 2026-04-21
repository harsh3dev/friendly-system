import type { TaskLink } from '@/lib/types';

const ALLOWED_TAGS = new Set(['a', 'b', 'strong', 'em', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li']);
const BLOCK_TAGS = new Set(['p', 'ul', 'ol', 'li']);
const SAFE_PROTOCOLS = ['http:', 'https:'];

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeAnchor(node: HTMLAnchorElement) {
  const href = node.getAttribute('href') ?? '';
  const normalized = sanitizeTaskLinkUrl(href);
  if (!normalized) {
    node.replaceWith(...Array.from(node.childNodes));
    return;
  }

  node.setAttribute('href', normalized);
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');

  for (const attribute of Array.from(node.attributes)) {
    if (!['href', 'target', 'rel'].includes(attribute.name)) {
      node.removeAttribute(attribute.name);
    }
  }
}

function sanitizeNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) return;
  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tag)) {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
    return;
  }

  if (tag === 'a') {
    sanitizeAnchor(element as HTMLAnchorElement);
  } else {
    for (const attribute of Array.from(element.attributes)) {
      element.removeAttribute(attribute.name);
    }
  }

  for (const child of Array.from(element.childNodes)) {
    sanitizeNode(child);
  }
}

function normalizeBlockMarkup(container: HTMLElement) {
  const html = container.innerHTML
    .replace(/<div>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<p><br><\/p>/gi, '')
    .trim();

  container.innerHTML = html;
}

export function sanitizeTaskLinkUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!SAFE_PROTOCOLS.includes(url.protocol)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function normalizeTaskLinks(links: TaskLink[]) {
  return links
    .map((link) => ({
      id: link.id || crypto.randomUUID(),
      label: link.label.trim(),
      url: sanitizeTaskLinkUrl(link.url),
    }))
    .filter((link) => link.label && link.url);
}

export function plainTextToRichText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function sanitizeRichText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
    return plainTextToRichText(trimmed);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html');
  const container = doc.body.firstElementChild as HTMLElement | null;
  if (!container) return '';

  for (const child of Array.from(container.childNodes)) {
    sanitizeNode(child);
  }

  normalizeBlockMarkup(container);
  return container.innerHTML.trim();
}

export function richTextToPlainText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (typeof DOMParser === 'undefined') {
    return trimmed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html');
  const container = doc.body.firstElementChild as HTMLElement | null;
  if (!container) return '';

  const parts: string[] = [];
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? '');
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (BLOCK_TAGS.has(tag) && parts.length > 0) {
      parts.push('\n');
    }

    for (const child of Array.from(element.childNodes)) {
      visit(child);
    }

    if ((tag === 'br' || BLOCK_TAGS.has(tag)) && parts.at(-1) !== '\n') {
      parts.push('\n');
    }
  };

  for (const child of Array.from(container.childNodes)) {
    visit(child);
  }

  return parts
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();
}

export function truncateRichText(value: string, maxLength: number) {
  const sanitized = sanitizeRichText(value);
  if (!sanitized) return '';

  const plainText = richTextToPlainText(sanitized);
  if (plainText.length <= maxLength) return sanitized;

  if (typeof DOMParser === 'undefined') {
    return plainTextToRichText(plainText.slice(0, maxLength));
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${sanitized}</div>`, 'text/html');
  const container = doc.body.firstElementChild as HTMLElement | null;
  if (!container) return plainTextToRichText(plainText.slice(0, maxLength));

  let remaining = maxLength;

  const trimNode = (node: Node): boolean => {
    if (remaining <= 0) {
      node.parentNode?.removeChild(node);
      return true;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text.length <= remaining) {
        remaining -= text.length;
        return false;
      }

      node.textContent = text.slice(0, remaining);
      remaining = 0;
      return true;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return false;
    }

    const children = Array.from(node.childNodes);
    for (const child of children) {
      const reachedLimit = trimNode(child);
      if (reachedLimit) {
        let sibling = child.nextSibling;
        while (sibling) {
          const next = sibling.nextSibling;
          sibling.parentNode?.removeChild(sibling);
          sibling = next;
        }
        return true;
      }
    }

    return false;
  };

  for (const child of Array.from(container.childNodes)) {
    const reachedLimit = trimNode(child);
    if (reachedLimit) {
      let sibling = child.nextSibling;
      while (sibling) {
        const next = sibling.nextSibling;
        sibling.parentNode?.removeChild(sibling);
        sibling = next;
      }
      break;
    }
  }

  normalizeBlockMarkup(container);
  return sanitizeRichText(container.innerHTML.trim());
}
