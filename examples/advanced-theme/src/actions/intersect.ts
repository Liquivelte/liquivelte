/**
 * Intersect Action
 * Svelte action for Intersection Observer API.
 * Triggers a callback when element enters/exits viewport.
 */

export interface IntersectOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  once?: boolean;
}

export interface IntersectCallback {
  (entry: IntersectionObserverEntry, observer: IntersectionObserver): void;
}

export function intersect(
  node: HTMLElement,
  callback: IntersectCallback,
  options: IntersectOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    once = false,
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry, observer);

        if (once && entry.isIntersecting) {
          observer.unobserve(node);
        }
      });
    },
    { threshold, root, rootMargin }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
