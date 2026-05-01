import { atom, map } from 'nanostores';

// Theme settings store
export const themeSettings = map({
  colorPrimary: '#0ea5e9',
  colorSecondary: '#ffffff',
  fontBody: 'Inter',
  fontHeading: 'Inter',
  borderRadius: '0.5rem',
  spacing: 'medium',
});

// Cart store
export const cart = map({
  items: [],
  subtotal: 0,
  itemCount: 0,
});

// User store
export const user = atom(null);

// Search store
export const search = map({
  query: '',
  results: [],
  isOpen: false,
});

// Wishlist store
export const wishlist = map({
  items: [],
});

// Helper functions
export const addToCart = (product: any, quantity = 1) => {
  const currentCart = cart.get();
  const existingItem = currentCart.items.find((item: any) => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    currentCart.items.push({ ...product, quantity });
  }
  
  currentCart.itemCount = currentCart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  currentCart.subtotal = currentCart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  
  cart.set(currentCart);
};

export const removeFromCart = (productId: string) => {
  const currentCart = cart.get();
  currentCart.items = currentCart.items.filter((item: any) => item.id !== productId);
  currentCart.itemCount = currentCart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  currentCart.subtotal = currentCart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  cart.set(currentCart);
};

export const toggleWishlist = (product: any) => {
  const currentWishlist = wishlist.get();
  const exists = currentWishlist.items.find((item: any) => item.id === product.id);
  
  if (exists) {
    currentWishlist.items = currentWishlist.items.filter((item: any) => item.id !== product.id);
  } else {
    currentWishlist.items.push(product);
  }
  
  wishlist.set(currentWishlist);
};
