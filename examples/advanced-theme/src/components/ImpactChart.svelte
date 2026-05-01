<script>
  import { onMount } from 'svelte';
  
  export let metrics = [];
  
  let animatedValues = [];
  
  onMount(() => {
    // Animate values from 0 to target
    animatedValues = metrics.map(() => 0);
    
    const duration = 2000;
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      animatedValues = metrics.map((metric, i) => {
        const target = parseFloat(metric.settings.value) || 0;
        return Math.round(target * easeProgress);
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  });
</script>

<div class="impact-chart grid grid-cols-1 md:grid-cols-3 gap-6">
  {#each metrics as metric, i}
    <div class="impact-chart__metric text-center p-6 bg-gray-50 rounded-lg">
      <div class="impact-chart__value text-4xl font-bold text-primary-600 mb-2">
        {animatedValues[i] || 0}
      </div>
      <div class="impact-chart__label text-gray-600">
        {metric.settings.label}
      </div>
    </div>
  {/each}
</div>
