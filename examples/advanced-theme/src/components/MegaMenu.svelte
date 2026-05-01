<script>
  let isOpen = false;
  let hoveredItem = null;
  
  function toggleMenu() {
    isOpen = !isOpen;
  }
  
  function handleMouseEnter(item) {
    hoveredItem = item;
  }
  
  function handleMouseLeave() {
    hoveredItem = null;
  }
</script>

<nav class="mega-menu">
  <ul class="mega-menu__list">
    <li class="mega-menu__item">
      <button 
        type="button"
        class="mega-menu__link"
        on:click={toggleMenu}
        aria-expanded={isOpen}
      >
        Shop
        <span class="mega-menu__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {#if isOpen}
        <div class="mega-menu__dropdown">
          <div class="mega-menu__content">
            <div class="mega-menu__column">
              <h3 class="mega-menu__heading">Categories</h3>
              <ul class="mega-menu__sublist">
                <li><a href="/collections/all" class="mega-menu__sublink">All Products</a></li>
                <li><a href="/collections/new" class="mega-menu__sublink">New Arrivals</a></li>
                <li><a href="/collections/bestsellers" class="mega-menu__sublink">Best Sellers</a></li>
              </ul>
            </div>
            
            <div class="mega-menu__column">
              <h3 class="mega-menu__heading">Collections</h3>
              <ul class="mega-menu__sublist">
                <li><a href="/collections/summer" class="mega-menu__sublink">Summer</a></li>
                <li><a href="/collections/winter" class="mega-menu__sublink">Winter</a></li>
                <li><a href="/collections/sale" class="mega-menu__sublink">Sale</a></li>
              </ul>
            </div>
            
            <div class="mega-menu__column">
              <h3 class="mega-menu__heading">Featured</h3>
              <a href="/products/featured" class="mega-menu__featured">
                <img src="/placeholder.jpg" alt="Featured product" class="mega-menu__image" />
                <p class="mega-menu__caption">Featured Product</p>
              </a>
            </div>
          </div>
        </div>
      {/if}
    </li>
    
    <li class="mega-menu__item">
      <a href="/pages/about" class="mega-menu__link">About</a>
    </li>
    
    <li class="mega-menu__item">
      <a href="/pages/contact" class="mega-menu__link">Contact</a>
    </li>
    
    <li class="mega-menu__item">
      <a href="/pages/blog" class="mega-menu__link">Blog</a>
    </li>
  </ul>
</nav>

<style>
  .mega-menu {
    position: relative;
  }
  
  .mega-menu__list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 2rem;
  }
  
  .mega-menu__item {
    position: relative;
  }
  
  .mega-menu__link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    font-size: 1rem;
    color: #374151;
    cursor: pointer;
    padding: 0.5rem 0;
  }
  
  .mega-menu__arrow {
    font-size: 0.75rem;
  }
  
  .mega-menu__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    z-index: 100;
  }
  
  .mega-menu__content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .mega-menu__heading {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #111827;
  }
  
  .mega-menu__sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .mega-menu__sublink {
    display: block;
    padding: 0.5rem 0;
    color: #6b7280;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .mega-menu__sublink:hover {
    color: #0ea5e9;
  }
  
  .mega-menu__featured {
    display: block;
    text-decoration: none;
  }
  
  .mega-menu__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 0.5rem;
  }
  
  .mega-menu__caption {
    margin-top: 0.5rem;
    font-weight: 500;
    color: #111827;
  }
</style>
