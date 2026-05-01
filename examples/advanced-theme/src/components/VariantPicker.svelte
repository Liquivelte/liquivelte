<script>
  export let product = null;
  export let variant = null;
  
  let selectedOptions = {};
  
  // Initialize selected options from current variant
  $: if (variant) {
    selectedOptions = { ...variant.selected_options };
  }
  
  // Find variant based on selected options
  function findVariant() {
    if (!product || !product.variants) return null;
    
    return product.variants.find(v => {
      return v.option1 === selectedOptions.option1 &&
             v.option2 === selectedOptions.option2 &&
             v.option3 === selectedOptions.option3;
    });
  }
  
  function handleOptionChange(optionName, value) {
    selectedOptions = { ...selectedOptions, [optionName]: value };
    const newVariant = findVariant();
    if (newVariant) {
      variant = newVariant;
    }
  }
</script>

<div class="variant-picker">
  {#if product && product.options}
    {#each product.options as option}
      <div class="variant-picker__option">
        <label class="variant-picker__label">{option.name}</label>
        <div class="variant-picker__values">
          {#each option.values as value}
            <button
              type="button"
              class="variant-picker__value"
              class:variant-picker__value--selected={selectedOptions[`option${option.position}`] === value}
              on:click={() => handleOptionChange(`option${option.position}`, value)}
              aria-label={`Select ${value}`}
            >
              {value}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .variant-picker {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .variant-picker__label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    display: block;
  }
  
  .variant-picker__values {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .variant-picker__value {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e5e5;
    background: white;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }
  
  .variant-picker__value:hover {
    border-color: #0ea5e9;
  }
  
  .variant-picker__value--selected {
    border-color: #0ea5e9;
    background: #0ea5e9;
    color: white;
  }
  
  .variant-picker__value:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
