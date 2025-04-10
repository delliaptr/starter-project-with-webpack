import Api from '../../data/api';
import HomePresenter from './home-presenter';

export default class HomePage {
  #presenter;
  
  async render() {
    return `
      <section id="page-content" class="home-page container">
        <h1>Cerita Terbaru</h1>
        
        <div id="auth-status" class="auth-status"></div>
        
        <div id="stories-container" class="stories-container">
          <div class="loading-indicator">Memuat cerita...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter(Api, this);
    
    await this.#presenter.checkAuthStatus();
    await this.#presenter.loadStories();
  }
  
  renderAuthStatus(token, user) {
    const authStatusContainer = document.getElementById('auth-status');
    
    if (!token) {
      authStatusContainer.innerHTML = `
        <div class="auth-message">
          <p>Anda belum login. <a href="#/login">Login disini</a> untuk melihat atau membuat cerita.</p>
        </div>
      `;
    } else if (user) {
      authStatusContainer.innerHTML = `
        <div class="user-info">
          <p>Selamat datang, ${user.name}</p>
          <a href="#/add" class="btn-add">
            <i class="fas fa-plus"></i> Tambah Cerita Baru
          </a>
          <button id="logout-button" class="btn-logout">Logout</button>
        </div>
      `;
      
      document.getElementById('logout-button').addEventListener('click', () => {
        this.#presenter.handleLogout();
      });
    }
  }
  
  renderStories(stories) {
    const storiesContainer = document.getElementById('stories-container');
    
    let storiesHTML = '<div class="story-list">';
    
    stories.forEach((story) => {
      storiesHTML += `
        <div class="story-card">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-image">
          <div class="story-content">
            <h2 class="story-title">${story.name}</h2>
            <p class="story-info">
              <span class="story-author">Oleh: ${story.name}</span>
              <span class="story-date">Tanggal: ${new Date(story.createdAt).toLocaleDateString('id-ID')}</span>
            </p>
            <p class="story-description">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
            <a href="#/detail/${story.id}" class="btn-detail">Baca Selengkapnya</a>
          </div>
        </div>
      `;
    });
    
    storiesHTML += '</div>';
    storiesContainer.innerHTML = storiesHTML;
  }
  
  showError(error) {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = `
      <div class="error-message">
        <p>Gagal memuat cerita: ${error.message}</p>
        <p>Silakan coba lagi nanti.</p>
      </div>
    `;
  }
}