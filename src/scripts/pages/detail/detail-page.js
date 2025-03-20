import { parseActivePathname, showFormattedDate } from '../../utils';
import CONFIG from '../../config';
import Api from '../../data/api';

export default class DetailPage {
  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to content</a>
      </div>
      <section id="main-content" class="story-detail container">
        <div id="story-container" class="story-detail-container">
          <p class="loading-text">Memuat cerita...</p>
        </div>
      </section>
      <div id="map-container" class="map-container">
        <div id="map" class="map"></div>
      </div>
    `;
  }

  async afterRender() {
    const storyContainer = document.querySelector('#story-container');
    const { id } = parseActivePathname();
    
    if (!id) {
      storyContainer.innerHTML = '<p class="error-message">ID cerita tidak ditemukan</p>';
      return;
    }
    
    try {
      const story = await Api.getStoryDetail(id);
      
      storyContainer.innerHTML = `
        <div class="story-detail-header">
          <h1 class="story-title" view-transition-name="story-title-${story.id}">${story.name}</h1>
          <p class="story-date">${showFormattedDate(story.createdAt, CONFIG.DEFAULT_LANGUAGE)}</p>
        </div>
        <div class="story-detail-image" view-transition-name="story-${story.id}">
          <img src="${CONFIG.BASE_IMAGE_URL}${story.photoUrl}" alt="Foto cerita ${story.name}">
        </div>
        <div class="story-detail-content">
          <p class="story-description">${story.description}</p>
        </div>
        <div class="back-button-container">
          <a href="#/" class="btn-back">&larr; Kembali ke daftar cerita</a>
        </div>
      `;
      
      if (story.lat && story.lon) {
        this._initMap(story);
      } else {
        document.querySelector('#map-container').style.display = 'none';
      }
    } catch (error) {
      storyContainer.innerHTML = '<p class="error-message">Gagal memuat cerita</p>';
      console.error(error);
    }
  }
  
  _initMap(story) {
    // Load MapTiler script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.js';
    document.head.appendChild(script);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.css';
    document.head.appendChild(link);
    
    script.onload = () => {
      const map = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/streets/style.json?key=${CONFIG.MAP_TILER_KEY}`,
        center: [story.lon, story.lat],
        zoom: 15
      });
      
      // Add navigation control
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      // Add marker
      const marker = new maplibregl.Marker()
        .setLngLat([story.lon, story.lat])
        .addTo(map);
      
      // Add popup
      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`<h3>${story.name}</h3><p>Lokasi cerita</p>`);
      
      marker.setPopup(popup);
    };
  }
}