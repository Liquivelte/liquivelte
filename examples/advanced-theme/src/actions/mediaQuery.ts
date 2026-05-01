/**
 * Media Query Action
 * Svelte action for MediaQueryList API.
 * Triggers a callback when media query match status changes.
 */

export interface MediaQueryOptions {
  query: string;
  callback: (matches: boolean) => void;
}

export function mediaQuery(node: HTMLElement, { query, callback }: MediaQueryOptions) {
  if (typeof window === 'undefined') {
    return { destroy: () => {} };
  }

  const mediaQueryList = window.matchMedia(query);
  
  // Initial check
  callback(mediaQueryList.matches);

  // Event listener for changes
  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  // Use modern API if available, fallback to addListener
  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener('change', handler);
  } else {
    // Fallback for older browsers
    mediaQueryList.addListener(handler);
  }

  return {
    destroy() {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(handler);
      }
    },
  };
}
