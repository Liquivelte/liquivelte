<script>
  import { onMount, onDestroy } from 'svelte';
  import EmblaCarousel from 'embla-carousel-svelte';
  import Autoplay from 'embla-carousel-autoplay';
  import ClassNames from 'embla-carousel-class-names';
  
  export let products = [];
  export let slidesPerView = { base: 1, sm: 2, md: 3, lg: 4 };
  export let loop = true;
  export let autoplay = false;
  export let autoplayDelay = 3000;
  
  let emblaApi;
  let autoplayPlugin;
  
  onMount(() => {
    const plugins = [ClassNames()];
    
    if (autoplay) {
      autoplayPlugin = Autoplay({ delay: autoplayDelay, stopOnInteraction: false });
      plugins.push(autoplayPlugin);
    }
    
    emblaApi = EmblaCarousel(emblaNode, {
      loop,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    }, plugins);
  });
  
  onDestroy(() => {
    if (emblaApi) emblaApi.destroy();
  });
</script>

<div class="product-carousel" bind:this={emblaNode}>
  <div class="product-carousel__container">
    <div class="product-carousel__slide">
      {#each products as product}
        <slot product={product} />
      {/each}
    </div>
  </div>
  
  <!-- Navigation buttons (optional, can be added via slot) -->
</div>

<style>
  .product-carousel {
    overflow: hidden;
  }
  
  .product-carousel__container {
    display: flex;
  }
  
  .product-carousel__slide {
    flex: 0 0 calc(100% / var(--slides-per-view, 4));
    min-width: 0;
  }
</style>
