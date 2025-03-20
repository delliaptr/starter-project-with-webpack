import { showFormattedDate } from '../../utils';
import CONFIG from '../../config';
import Api from '../../data/api';

export default class HomePage {
  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to content</a>
      </div>
      <section class="hero container">
        <h1>Story Share</h1>
        <p>Berbagi ceritamu dari berbagai tempat di dunia</p>
        <a href="#/add" class="btn-primary">Tambah Cerita</a>
      </section>
      <section id="main-content" class="story-list container">
        <h2>Cerita Terbaru</h2>
        <div id="stories" class="stories-grid">
          <p class="loading-text">Memuat cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storiesContainer = document.querySelector('#stories');
    
    try {
      const stories = await Api.getStories();
      
      if (stories.length === 0) {
        storiesContainer.innerHTML = '<p class="empty-message">Tidak ada cerita tersedia</p>';
        return;
      }
      
      storiesContainer.innerHTML = '';
      
      stories.forEach((story) => {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story-item');
        storyElement.setAttribute('view-transition-name', `story-${story.id}`);
        storyElement.innerHTML = `
          <div class="story-image">
            <img src="${CONFIG.BASE_IMAGE_URL}${story.photoUrl}" alt="Foto cerita ${story.name}" loading="lazy">
          </div>
          <div class="story-content">
            <h3 class="story-title"><a href="#/detail/${story.id}">${story.name}</a></h3>
            <p class="story-date">${showFormattedDate(story.createdAt, CONFIG.DEFAULT_LANGUAGE)}</p>
            <p class="story-description">${story.description.length > 100 ? 
              story.description.substring(0, 100) + '...' : 
              story.description}</p>
          </div>
        `;
        
        storiesContainer.appendChild(storyElement);
      });
      
      this._initViewTransition();
    } catch (error) {
      storiesContainer.innerHTML = '<p class="error-message">Gagal memuat cerita</p>';
      console.error(error);
    }
  }

  _initViewTransition() {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) return;

    document.querySelectorAll('.story-item a').forEach((link) => {
      link.addEventListener('click', (event) => {
        // Let the browser handle navigation when View Transitions API is not supported
        if (!document.startViewTransition) return;
      });
    });
  }
}