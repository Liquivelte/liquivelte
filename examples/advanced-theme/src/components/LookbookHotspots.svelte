<script>
  let activeHotspot = null;
  
  export let image = null;
  export let hotspots = [];
  
  function handleHotspotClick(hotspot) {
    activeHotspot = activeHotspot === hotspot ? null : hotspot;
  }
  
  function closePopover() {
    activeHotspot = null;
  }
</script>

<div class="lookbook-hotspots">
  <div class="lookbook-hotspots__image-container relative">
    {#if image}
      <img 
        src={image.src || image} 
        alt="Lookbook" 
        class="lookbook-hotspots__image w-full"
      />
    {/if}
    
    {#each hotspots as hotspot}
      <button
        type="button"
        class="lookbook-hotspots__pin absolute w-8 h-8 rounded-full bg-white border-2 border-primary-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        style="left: {hotspot.x_position}%; top: {hotspot.y_position}%"
        on:click={() => handleHotspotClick(hotspot)}
        aria-label="View product"
      >
        <span class="text-primary-600 font-bold">+</span>
      </button>
      
      {#if activeHotspot === hotspot}
        <div 
          class="lookbook-hotspots__popover absolute bg-white p-4 rounded-lg shadow-xl border border-gray-200"
          style="left: {hotspot.x_position}%; top: {hotspot.y_position}%"
          on:click|stopPropagation
        >
          <button 
            type="button"
            class="lookbook-hotspots__close absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            on:click={closePopover}
            aria-label="Close"
          >
            ✕
          </button>
          
          {#if hotspot.product}
            <a href={`/products/${hotspot.product.handle}`} class="lookbook-hotspots__product-link">
              {#if hotspot.product.featured_image}
                <img 
                  src={hotspot.product.featured_image.src || hotspot.product.featured_image}
                  alt={hotspot.product.title}
                  class="lookbook-hotspots__product-image w-24 h-24 object-cover rounded mb-2"
                />
              {/if}
              <p class="lookbook-hotspots__product-title font-semibold">{hotspot.product.title}</p>
              <p class="lookbook-hotspots__product-price text-gray-600">${(hotspot.product.price / 100).toFixed(2)}</p>
            </a>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .lookbook-hotspots__image-container {
    position: relative;
  }
  
  .lookbook-hotspots__pin {
    transform: translate(-50%, -50%);
  }
  
  .lookbook-hotspots__popover {
    transform: translate(-50%, -100%);
    margin-top: -1rem;
    min-width: 200px;
    z-index: 10;
  }
</style>
