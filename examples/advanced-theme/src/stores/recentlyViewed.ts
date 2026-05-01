/**
 * Recently Viewed Store
 * Manages recently viewed products with localStorage persistence.
 * Uses nanostores for reactive state management.
 */

import { map } from 'nanostores';

interface RecentlyViewItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  handle: string;
  price: string;
  featured_image: string;
  viewed_at: string;
}

const STORAGE_KEY = 'liquivelte_recently_viewed';
const MAX_RECENTLY_VIEWED = 10;

// Recently viewed state
export const recentlyViewedItems = map<RecentlyViewItem[]>([]);

/**
 * Load recently viewed from localStorage
 */
export function loadRecentlyViewed() {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      recentlyViewedItems.set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Failed to load recently viewed:', error);
  }
}

/**
 * Save recently viewed to localStorage
 */
function saveRecentlyViewed(items: RecentlyViewItem[]) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save recently viewed:', error);
  }
}

/**
 * Add item to recently viewed
 */
export function addToRecentlyViewed(item: RecentlyViewItem) {
  const current = recentlyViewedItems.get();
  
  // Remove if already exists (to move to front)
  const filtered = current.filter((i) => i.variant_id !== item.variant_id);
  
  // Add new item to front
  const newItem = {
    ...item,
    viewed_at: new Date().toISOString(),
  };
  
  const updated = [newItem, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
  recentlyViewedItems.set(updated);
  saveRecentlyViewed(updated);
}

/**
 * Clear recently viewed
 */
export function clearRecentlyViewed() {
  recentlyViewedItems.set([]);
  saveRecentlyViewed([]);
}

/**
 * Get recently viewed count
 */
export function getRecentlyViewedCount(): number {
  return recentlyViewedItems.get().length;
}

/**
 * Initialize recently viewed (load from localStorage on mount)
 */
export function initializeRecentlyViewed() {
  if (typeof window !== 'undefined') {
    loadRecentlyViewed();
  }
}
