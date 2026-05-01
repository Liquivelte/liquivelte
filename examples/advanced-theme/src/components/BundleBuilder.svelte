<script>
  import { addToCart, openCartDrawer } from '$stores/cart';
  
  export let products = [];
  let selectedProducts = new Set();
  
  function toggleProduct(productId) {
    if (selectedProducts.has(productId)) {
      selectedProducts.delete(productId);
    } else {
      selectedProducts.add(productId);
    }
    selectedProducts = new Set(selectedProducts);
  }
  
  function isSelected(productId) {
    return selectedProducts.has(productId);
  }
  
  async function handleAddBundle() {
    const selected = products.filter(p => selectedProducts.has(p.id));
    for (const product of selected) {
      const variantId = product.variants?.[0]?.id || product.id;
      await addToCart(variantId, 1);
    }
    openCartDrawer();
  }
  
  $: bundlePrice = products
    .filter(p => selectedProducts.has(p.id))
    .reduce((sum, p) => sum + (p.price || 0), 0);
</script>

<div class="bundle-builder">
  <div class="bundle-builder__grid grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each products as product}
      <div 
        class="bundle-builder__product {isSelected(product.id) ? 'bundle-builder__product--selected' : ''}"
        class:bundle-builder__product--selected={isSelected(product.id)}
      >
        <div class="bundle-builder__checkbox">
          <input 
            type="checkbox" 
            checked={isSelected(product.id)}
            on:change={() => toggleProduct(product.id)}
            id="bundle-product-{product.id}"
          />
          <label for="bundle-product-{product.id}" class="sr-only">Select {product.title}</label>
        </div>
        
        <div class="bundle-builder__product-content">
          {#if product.featured_image}
            <img 
              src={product.featured_image.src || product.featured_image}
              alt={product.title}
              class="bundle-builder__image w-full h-48 object-cover rounded"
            />
          {/if}
          
          <h3 class="bundle-builder__product-title font-semibold mt-2">{product.title}</h3>
          <p class="bundle-builder__product-price text-gray-600">${(product.price / 100).toFixed(2)}</p>
        </div>
      </div>
    {/each}
  </div>
  
  <div class="bundle-builder__footer mt-8 flex items-center justify-between">
    <div class="bundle-builder__total">
      <span class="bundle-builder__total-label font-semibold">Bundle Total:</span>
      <span class="bundle-builder__total-price font-bold text-xl ml-2">${(bundlePrice / 100).toFixed(2)}</span>
    </div>
    
    <button 
      type="button" 
      class="bundle-builder__add-btn px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
      on:click={handleAddBundle}
      disabled={selectedProducts.size === 0}
    >
      Add Bundle to Cart ({selectedProducts.size})
    </button>
  </div>
</div>

<style>
  .bundle-builder__product {
    border: 2px solid #e5e5e5;
    border-radius: 0.5rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .bundle-builder__product--selected {
    border-color: #0ea5e9;
    background: #f0f9ff;
  }
  
  .bundle-builder__checkbox {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .bundle-builder__product {
    position: relative;
  }
</style>
