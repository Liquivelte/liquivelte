<script>
  let sliderPosition = 50;
  let isDragging = false;
  let container;
  
  export let beforeImage = null;
  export let afterImage = null;
  export let labelBefore = 'Before';
  export let labelAfter = 'After';
  
  function handleDrag(event) {
    if (!isDragging) return;
    
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    sliderPosition = percentage;
  }
  
  function startDrag() {
    isDragging = true;
  }
  
  function stopDrag() {
    isDragging = false;
  }
  
  function handleTouchStart(event) {
    startDrag();
    handleDrag(event.touches[0]);
  }
  
  function handleTouchMove(event) {
    if (!isDragging) return;
    handleDrag(event.touches[0]);
  }
</script>

<svelte:window on:mouseup={stopDrag} on:touchend={stopDrag} />

<div class="before-after-slider" bind:this={container} on:mousemove={handleDrag} on:touchmove={handleTouchMove}>
  <div class="before-after-slider__container relative overflow-hidden rounded-lg">
    <!-- After image (background) -->
    {#if afterImage}
      <img 
        src={afterImage.src || afterImage} 
        alt={labelAfter}
        class="before-after-slider__after-image w-full h-auto"
      />
    {/if}
    
    <!-- Before image (foreground with clip) -->
    <div 
      class="before-after-slider__before-container absolute inset-0 overflow-hidden"
      style="width: {sliderPosition}%"
    >
      {#if beforeImage}
        <img 
          src={beforeImage.src || beforeImage} 
          alt={labelBefore}
          class="before-after-slider__before-image w-full h-auto"
        />
      {/if}
    </div>
    
    <!-- Slider handle -->
    <button
      type="button"
      class="before-after-slider__handle absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
      style="left: {sliderPosition}%"
      on:mousedown={startDrag}
      on:touchstart={handleTouchStart}
      aria-label="Drag to compare"
    >
      <div class="before-after-slider__handle-button absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>
    </button>
    
    <!-- Labels -->
    <div class="before-after-slider__label-before absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
      {labelBefore}
    </div>
    <div class="before-after-slider__label-after absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
      {labelAfter}
    </div>
  </div>
</div>

<style>
  .before-after-slider__container {
    aspect-ratio: 16 / 9;
  }
  
  .before-after-slider__after-image,
  .before-after-slider__before-image {
    object-fit: cover;
    aspect-ratio: 16 / 9;
  }
  
  .before-after-slider__handle {
    transform: translateX(-50%);
  }
</style>
