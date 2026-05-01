/**
 * Wishlist Store
 * Manages wishlist state with localStorage persistence.
 * Uses nanostores for reactive state management.
 */

import { map, atom } from 'nanostores';

interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  handle: string;
  price: string;
  featured_image: string;
  added_at: string;
}

const STORAGE_KEY = 'liquivelte_wishlist';

// Wishlist state
export const wishlistItems = map<WishlistItem[]>([]);

// Loading state
export const wishlistLoading = atom(false);

/**
 * Load wishlist from localStorage
 */
export function loadWishlist() {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      wishlistItems.set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Failed to load wishlist:', error);
  }
}

/**
 * Save wishlist to localStorage
 */
function saveWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save wishlist:', error);
  }
}

/**
 * Add item to wishlist
 */
export function addToWishlist(item: WishlistItem) {
  const current = wishlistItems.get();
  
  // Check if item already exists
  const exists = current.find((i) => i.variant_id === item.variant_id);
  
  if (!exists) {
    const newItem = {
      ...item,
      added_at: new Date().toISOString(),
    };
    wishlistItems.set([...current, newItem]);
    saveWishlist([...current, newItem]);
  }
}

/**
 * Remove item from wishlist
 */
export function removeFromWishlist(variantId: string) {
  const current = wishlistItems.get();
  const filtered = current.filter((i) => i.variant_id !== variantId);
  wishlistItems.set(filtered);
  saveWishlist(filtered);
}

/**
 * Toggle item in wishlist
 */
export function toggleWishlist(item: WishlistItem) {
  const current = wishlistItems.get();
  const exists = current.find((i) => i.variant_id === item.variant_id);
  
  if (exists) {
    removeFromWishlist(item.variant_id);
  } else {
    addToWishlist(item);
  }
}

/**
 * Check if item is in wishlist
 */
export function isInWishlist(variantId: string): boolean {
  const current = wishlistItems.get();
  return current.some((i) => i.variant_id === variantId);
}

/**
 * Clear wishlist
 */
export function clearWishlist() {
  wishlistItems.set([]);
  saveWishlist([]);
}

/**
 * Initialize wishlist (load from localStorage on mount)
 */
export function initializeWishlist() {
  if (typeof window !== 'undefined') {
    loadWishlist();
  }
}
