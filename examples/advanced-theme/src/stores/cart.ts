/**
 * Cart Store
 * Manages cart state with Shopify AJAX API integration.
 * Uses nanostores for reactive state management.
 */

import { map, atom } from 'nanostores';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, type CartResponse, type CartItem } from '../utils/shopifyAjax';

// Cart state
export const cartState = map<CartResponse>({
  items: [],
  item_count: 0,
  total_price: 0,
  subtotal_price: 0,
});

// Loading state
export const cartLoading = atom(false);

// Error state
export const cartError = atom<string | null>(null);

// Cart drawer open state
export const cartDrawerOpen = atom(false);

/**
 * Initialize cart by fetching from Shopify
 */
export async function initializeCart() {
  if (typeof window === 'undefined') return;

  cartLoading.set(true);
  cartError.set(null);

  try {
    const cart = await getCart();
    cartState.set(cart);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    cartError.set(error instanceof Error ? error.message : 'Failed to fetch cart');
  } finally {
    cartLoading.set(false);
  }
}

/**
 * Add item to cart
 */
export async function addItem(variantId: string, quantity: number = 1, properties?: Record<string, string>) {
  if (typeof window === 'undefined') return;

  cartLoading.set(true);
  cartError.set(null);

  try {
    const cart = await addToCart(variantId, quantity, properties);
    cartState.set(cart);
    cartDrawerOpen.set(true);
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    cartError.set(error instanceof Error ? error.message : 'Failed to add item to cart');
  } finally {
    cartLoading.set(false);
  }
}

/**
 * Update cart item quantity
 */
export async function updateItem(line: number, quantity: number) {
  if (typeof window === 'undefined') return;

  cartLoading.set(true);
  cartError.set(null);

  try {
    const cart = await updateCartItem(line, quantity);
    cartState.set(cart);
  } catch (error) {
    console.error('Failed to update cart item:', error);
    cartError.set(error instanceof Error ? error.message : 'Failed to update cart item');
  } finally {
    cartLoading.set(false);
  }
}

/**
 * Remove item from cart
 */
export async function removeItem(line: number) {
  if (typeof window === 'undefined') return;

  cartLoading.set(true);
  cartError.set(null);

  try {
    const cart = await removeCartItem(line);
    cartState.set(cart);
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    cartError.set(error instanceof Error ? error.message : 'Failed to remove cart item');
  } finally {
    cartLoading.set(false);
  }
}

/**
 * Clear cart
 */
export async function clearCartState() {
  if (typeof window === 'undefined') return;

  cartLoading.set(true);
  cartError.set(null);

  try {
    const cart = await clearCart();
    cartState.set(cart);
  } catch (error) {
    console.error('Failed to clear cart:', error);
    cartError.set(error instanceof Error ? error.message : 'Failed to clear cart');
  } finally {
    cartLoading.set(false);
  }
}

/**
 * Toggle cart drawer
 */
export function toggleCartDrawer() {
  cartDrawerOpen.set(!cartDrawerOpen.get());
}

/**
 * Open cart drawer
 */
export function openCartDrawer() {
  cartDrawerOpen.set(true);
}

/**
 * Close cart drawer
 */
export function closeCartDrawer() {
  cartDrawerOpen.set(false);
}
