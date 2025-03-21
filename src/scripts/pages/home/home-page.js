import Api from '../../data/api';

export default class HomePage {
  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to content</a>
      </div>
      <section id="main-content" class="home-page container">
        <h1>Cerita Terbaru</h1>
        
        <div id="auth-status" class="auth-status"></div>
        
        <div id="stories-container" class="stories-container">
          <div class="loading-indicator">Memuat cerita...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._checkAuthStatus();
    this._loadStories();
  }
  
  _checkAuthStatus() {
    const authStatusContainer = document.getElementById('auth-status');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      });
    }
  }
  
  async _loadStories() {
    const storiesContainer = document.getElementById('stories-container');
    
    try {
      const stories = await Api.getStories();
      
      if (stories.length === 0) {
        storiesContainer.innerHTML = `
          <div class="empty-state">
            <p>Belum ada cerita yang tersedia.</p>
            <p>Silakan <a href="#/login">login</a> dan tambahkan cerita baru.</p>
          </div>
        `;
        return;
      }
      
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
    } catch (error) {
      console.error('Error loading stories:', error);
      storiesContainer.innerHTML = `
        <div class="error-message">
          <p>Gagal memuat cerita: ${error.message}</p>
          <p>Silakan coba lagi nanti.</p>
        </div>
      `;
    }
  }
}