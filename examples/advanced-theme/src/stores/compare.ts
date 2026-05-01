/**
 * Compare Store
 * Manages product comparison state with localStorage persistence.
 * Uses nanostores for reactive state management.
 */

import { map, atom } from 'nanostores';

interface CompareItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  handle: string;
  price: string;
  featured_image: string;
  added_at: string;
}

const STORAGE_KEY = 'liquivelte_compare';
const MAX_COMPARE_ITEMS = 4;

// Compare state
export const compareItems = map<CompareItem[]>([]);

/**
 * Load compare items from localStorage
 */
export function loadCompare() {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      compareItems.set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Failed to load compare items:', error);
  }
}

/**
 * Save compare items to localStorage
 */
function saveCompare(items: CompareItem[]) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save compare items:', error);
  }
}

/**
 * Add item to compare
 */
export function addToCompare(item: CompareItem) {
  const current = compareItems.get();
  
  // Check if item already exists
  const exists = current.find((i) => i.variant_id === item.variant_id);
  
  if (!exists) {
    // Check if we've reached the max
    if (current.length >= MAX_COMPARE_ITEMS) {
      // Remove oldest item
      current.shift();
    }
    
    const newItem = {
      ...item,
      added_at: new Date().toISOString(),
    };
    compareItems.set([...current, newItem]);
    saveCompare([...current, newItem]);
  }
}

/**
 * Remove item from compare
 */
export function removeFromCompare(variantId: string) {
  const current = compareItems.get();
  const filtered = current.filter((i) => i.variant_id !== variantId);
  compareItems.set(filtered);
  saveCompare(filtered);
}

/**
 * Toggle item in compare
 */
export function toggleCompare(item: CompareItem) {
  const current = compareItems.get();
  const exists = current.find((i) => i.variant_id === item.variant_id);
  
  if (exists) {
    removeFromCompare(item.variant_id);
  } else {
    addToCompare(item);
  }
}

/**
 * Check if item is in compare
 */
export function isInCompare(variantId: string): boolean {
  const current = compareItems.get();
  return current.some((i) => i.variant_id === variantId);
}

/**
 * Clear compare
 */
export function clearCompare() {
  compareItems.set([]);
  saveCompare([]);
}

/**
 * Get compare count
 */
export function getCompareCount(): number {
  return compareItems.get().length;
}

/**
 * Initialize compare (load from localStorage on mount)
 */
export function initializeCompare() {
  if (typeof window !== 'undefined') {
    loadCompare();
  }
}
