<script>
  import { onMount } from 'svelte';
  
  export let media = [];
  export let featuredMedia = null;
  let selectedMedia = featuredMedia;
  let thumbnails = [];
  
  onMount(() => {
    selectedMedia = featuredMedia || (media.length > 0 ? media[0] : null);
    thumbnails = media;
  });
  
  function selectMedia(mediaItem) {
    selectedMedia = mediaItem;
  }
</script>

<div class="media-gallery">
  {#if selectedMedia}
    <div class="media-gallery__main">
      {#if selectedMedia.media_type === 'video'}
        <video 
          src={selectedMedia.sources?.[0]?.url} 
          controls
          class="media-gallery__video"
          poster={selectedMedia.preview_image?.src}
        ></video>
      {:else if selectedMedia.media_type === 'model'}
        <model-viewer 
          src={selectedMedia.sources?.[0]?.url}
          class="media-gallery__model"
        ></model-viewer>
      {:else}
        <img 
          src={selectedMedia.src || selectedMedia.url}
          alt={selectedMedia.alt}
          class="media-gallery__image"
        />
      {/if}
    </div>
  {/if}
  
  {#if thumbnails.length > 1}
    <div class="media-gallery__thumbnails">
      {#each thumbnails as thumbnail (thumbnail.id)}
        <button
          type="button"
          class="media-gallery__thumbnail"
          class:media-gallery__thumbnail--active={selectedMedia?.id === thumbnail.id}
          on:click={() => selectMedia(thumbnail)}
          aria-label={`View ${thumbnail.alt || 'media'}`}
        >
          {#if thumbnail.media_type === 'video'}
            <div class="media-gallery__thumbnail-video">
              ▶
            </div>
          {:else if thumbnail.media_type === 'model'}
            <div class="media-gallery__thumbnail-model">
              🎯
            </div>
          {:else}
            <img 
              src={thumbnail.src || thumbnail.url} 
              alt={thumbnail.alt}
              loading="lazy"
            />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .media-gallery {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .media-gallery__main {
    aspect-ratio: 1;
    background: #f5f5f5;
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .media-gallery__image,
  .media-gallery__video,
  .media-gallery__model {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .media-gallery__thumbnails {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .media-gallery__thumbnail {
    flex: 0 0 80px;
    aspect-ratio: 1;
    border: 2px solid transparent;
    border-radius: 0.25rem;
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    background: white;
  }
  
  .media-gallery__thumbnail--active {
    border-color: #0ea5e9;
  }
  
  .media-gallery__thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .media-gallery__thumbnail-video,
  .media-gallery__thumbnail-model {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    font-size: 1.5rem;
  }
</style>
