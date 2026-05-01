/**
 * Shopify AJAX Utility
 * Helper functions for making requests to Shopify AJAX APIs.
 * All functions are browser-only and guarded with typeof window checks.
 */

declare global {
  interface Window {
    Shopify: {
      routes: {
        root: string;
      };
    };
  }
}

export interface CartResponse {
  items: CartItem[];
  item_count: number;
  total_price: number;
  subtotal_price: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: number;
  line_price: number;
  properties?: Record<string, string>;
  variant?: {
    id: string;
    title: string;
    price: number;
    available: boolean;
  };
}

export interface SearchSuggestResponse {
  resources: {
    results: {
      products: {
        id: string;
        title: string;
        handle: string;
        price: string;
        featured_image: {
          url: string;
          alt: string;
        };
      }[];
    };
  };
}

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Make a POST request to Shopify AJAX API
 */
async function shopifyPost<T>(endpoint: string, data: Record<string, any>): Promise<T> {
  if (!isBrowser) {
    throw new Error('Shopify AJAX APIs are only available in the browser');
  }

  const response = await fetch(window.Shopify.routes.root + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make a GET request to Shopify AJAX API
 */
async function shopifyGet<T>(endpoint: string): Promise<T> {
  if (!isBrowser) {
    throw new Error('Shopify AJAX APIs are only available in the browser');
  }

  const response = await fetch(window.Shopify.routes.root + endpoint);

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get cart data
 */
export async function getCart(): Promise<CartResponse> {
  return shopifyGet<CartResponse>('cart.js');
}

/**
 * Add item to cart
 */
export async function addToCart(
  variantId: string,
  quantity: number = 1,
  properties?: Record<string, string>
): Promise<CartResponse> {
  return shopifyPost<CartResponse>('cart/add.js', {
    items: [
      {
        id: variantId,
        quantity,
        properties,
      },
    ],
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  line: number,
  quantity: number
): Promise<CartResponse> {
  return shopifyPost<CartResponse>('cart/change.js', {
    line,
    quantity,
  });
}

/**
 * Remove cart item
 */
export async function removeCartItem(line: number): Promise<CartResponse> {
  return shopifyPost<CartResponse>('cart/change.js', {
    line,
    quantity: 0,
  });
}

/**
 * Update cart item attributes
 */
export async function updateCartAttributes(
  attributes: Record<string, string>
): Promise<CartResponse> {
  return shopifyPost<CartResponse>('cart/update.js', {
    attributes,
  });
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<CartResponse> {
  return shopifyPost<CartResponse>('cart/clear.js', {});
}

/**
 * Search suggestions
 */
export async function searchSuggest(query: string): Promise<SearchSuggestResponse> {
  if (!isBrowser) {
    throw new Error('Shopify AJAX APIs are only available in the browser');
  }

  const response = await fetch(
    `${window.Shopify.routes.root}search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product`
  );

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  return response.json();
}
