/**
 * Search Store
 * Manages search state with Shopify /search/suggest.json API.
 * Uses nanostores for reactive state management.
 */

import { map, atom } from 'nanostores';
import { searchSuggest, type SearchSuggestResponse } from '../utils/shopifyAjax';

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  price: string;
  featured_image: {
    url: string;
    alt: string;
  };
}

// Search state
export const searchQuery = atom('');

export const searchResults = map<SearchResult[]>([]);

export const searchLoading = atom(false);

export const searchError = atom<string | null>(null);

export const searchOpen = atom(false);

/**
 * Perform search with debouncing
 */
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export function performSearch(query: string) {
  searchQuery.set(query);

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!query || query.length < 2) {
    searchResults.set([]);
    searchOpen.set(false);
    return;
  }

  searchTimeout = setTimeout(async () => {
    if (typeof window === 'undefined') return;

    searchLoading.set(true);
    searchError.set(null);

    try {
      const response = await searchSuggest(query);
      const products = response.resources.results.products;
      searchResults.set(products);
      searchOpen.set(true);
    } catch (error) {
      console.error('Search failed:', error);
      searchError.set(error instanceof Error ? error.message : 'Search failed');
      searchResults.set([]);
    } finally {
      searchLoading.set(false);
    }
  }, 300);
}

/**
 * Clear search
 */
export function clearSearch() {
  searchQuery.set('');
  searchResults.set([]);
  searchOpen.set(false);
  searchError.set(null);
}

/**
 * Toggle search dropdown
 */
export function toggleSearch() {
  searchOpen.set(!searchOpen.get());
}

/**
 * Open search dropdown
 */
export function openSearch() {
  searchOpen.set(true);
}

/**
 * Close search dropdown
 */
export function closeSearch() {
  searchOpen.set(false);
}
