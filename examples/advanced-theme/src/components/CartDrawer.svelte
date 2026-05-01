<script>
  import { cartState, cartDrawerOpen, closeCartDrawer, removeItem, updateItem } from '$stores/cart';
  
  $: cart = cartState.get();
  $: isOpen = cartDrawerOpen.get();
  
  function handleQuantityChange(line, newQuantity) {
    if (newQuantity < 1) {
      removeItem(line);
    } else {
      updateItem(line, newQuantity);
    }
  }
</script>

{#if isOpen}
  <button class="cart-drawer-overlay" on:click={closeCartDrawer} aria-label="Close cart"></button>
  <div class="cart-drawer">
    <div class="cart-drawer__header">
      <h2 class="cart-drawer__title">Shopping Cart</h2>
      <button type="button" class="cart-drawer__close" on:click={closeCartDrawer} aria-label="Close cart">
        ✕
      </button>
    </div>
    
    <div class="cart-drawer__content">
      {#if cart.items.length === 0}
        <p class="cart-drawer__empty">Your cart is empty</p>
      {:else}
        <div class="cart-drawer__items">
          {#each cart.items as item, index (item.id)}
            <div class="cart-drawer__item">
              <div class="cart-drawer__item-image">
                {#if item.featured_image}
                  <img src={item.featured_image} alt={item.title} />
                {/if}
              </div>
              
              <div class="cart-drawer__item-details">
                <h3 class="cart-drawer__item-title">{item.title}</h3>
                <p class="cart-drawer__item-price">${(item.price / 100).toFixed(2)}</p>
                
                <div class="cart-drawer__item-quantity">
                  <button 
                    type="button" 
                    on:click={() => handleQuantityChange(index + 1, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    type="button" 
                    on:click={() => handleQuantityChange(index + 1, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                type="button" 
                class="cart-drawer__item-remove"
                on:click={() => removeItem(index + 1)}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    
    {#if cart.items.length > 0}
      <div class="cart-drawer__footer">
        <div class="cart-drawer__subtotal">
          <span>Subtotal</span>
          <span>${(cart.subtotal_price / 100).toFixed(2)}</span>
        </div>
        <a href="/checkout" class="cart-drawer__checkout btn btn--primary">
          Checkout
        </a>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cart-drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }
  
  .cart-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    max-width: 400px;
    height: 100%;
    background: white;
    z-index: 101;
    display: flex;
    flex-direction: column;
  }
  
  .cart-drawer__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .cart-drawer__close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .cart-drawer__content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  
  .cart-drawer__empty {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .cart-drawer__item {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .cart-drawer__item-image img {
    width: 80px;
    height: 80px;
    object-fit: cover;
  }
  
  .cart-drawer__item-details {
    flex: 1;
  }
  
  .cart-drawer__item-quantity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .cart-drawer__item-quantity button {
    width: 28px;
    height: 28px;
    border: 1px solid #e5e5e5;
    background: white;
    cursor: pointer;
  }
  
  .cart-drawer__item-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
  }
  
  .cart-drawer__footer {
    padding: 1rem;
    border-top: 1px solid #e5e5e5;
  }
  
  .cart-drawer__subtotal {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-weight: bold;
  }
</style>
