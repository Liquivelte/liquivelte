<script>
  import { performSearch, searchResults, searchOpen, closeSearch } from '$stores/search';
  
  let query = '';
  let inputElement;
  
  function handleInput(event) {
    query = event.target.value;
    performSearch(query);
  }
  
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  }
  
  function handleClickOutside(event) {
    if (inputElement && !inputElement.contains(event.target)) {
      closeSearch();
    }
  }
</script>

<div class="predictive-search" use:clickOutside={handleClickOutside}>
  <input
    type="text"
    bind:this={inputElement}
    bind:value={query}
    on:input={handleInput}
    on:keydown={handleKeydown}
    placeholder="Search products..."
    class="predictive-search__input px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
    aria-label="Search products"
  />
  
  {#if searchOpen && query.length >= 2}
    <div class="predictive-search__results absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
      {#if $searchResults.length > 0}
        <ul class="predictive-search__list">
          {#each $searchResults as result}
            <li class="predictive-search__item">
              <a 
                href={`/products/${result.handle}`} 
                class="predictive-search__link flex items-center gap-4 p-3 hover:bg-gray-50"
              >
                {#if result.featured_image?.url}
                  <img 
                    src={result.featured_image.url} 
                    alt={result.title}
                    class="predictive-search__image w-12 h-12 object-cover rounded"
                  />
                {/if}
                <div class="predictive-search__details">
                  <p class="predictive-search__title font-medium">{result.title}</p>
                  <p class="predictive-search__price text-sm text-gray-600">{result.price}</p>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="predictive-search__empty p-4 text-gray-500 text-center">No results found</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .predictive-search {
    position: relative;
  }
</style>
