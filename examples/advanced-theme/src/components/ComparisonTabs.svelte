<script>
  let activeTab = 0;
  
  export let tabs = [];
</script>

<div class="comparison-tabs">
  <div class="comparison-tabs__nav flex border-b border-gray-200 mb-6">
    {#each tabs as tab, index}
      <button
        type="button"
        class="comparison-tabs__tab px-6 py-3 font-medium transition-colors"
        class:comparison-tabs__tab--active={activeTab === index}
        on:click={() => activeTab = index}
        aria-selected={activeTab === index}
        role="tab"
      >
        {tab.settings.title}
      </button>
    {/each}
  </div>
  
  <div class="comparison-tabs__content">
    {#each tabs as tab, index}
      {#if activeTab === index}
        <div class="comparison-tabs__panel" role="tabpanel">
          <h3 class="comparison-tabs__panel-title text-2xl font-semibold mb-4">{tab.settings.title}</h3>
          <div class="comparison-tabs__panel-body prose">
            {@html tab.settings.content}
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .comparison-tabs__tab {
    border-bottom: 2px solid transparent;
    color: #6b7280;
  }
  
  .comparison-tabs__tab:hover {
    color: #374151;
  }
  
  .comparison-tabs__tab--active {
    border-bottom-color: #0ea5e9;
    color: #0ea5e9;
  }
</style>
