import Api from '../../data/api';
import { sleep } from '../../utils';

export default class LoginPage {
  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to content</a>
      </div>
      <section id="main-content" class="login-page container">
        <h1>Login</h1>
        
        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="login-button" class="btn-submit">
              Masuk
            </button>
          </div>
        </form>
        
        <div id="login-status" class="login-status" style="display:none;"></div>
        
        <div class="register-link">
          <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._initLoginForm();
  }
  
  _initLoginForm() {
    const form = document.getElementById('login-form');
    const loginStatus = document.getElementById('login-status');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const loginButton = document.getElementById('login-button');
      
      loginButton.disabled = true;
      loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      
      try {
        const email = emailInput.value;
        const password = passwordInput.value;
        
        const userData = await Api.login(email, password);
        
        loginStatus.style.display = 'block';
        loginStatus.innerHTML = `
          <div class="success-message">
            <h3>Login berhasil!</h3>
            <p>Selamat datang, ${userData.name}. Mengalihkan ke halaman utama...</p>
          </div>
        `;
        
        await sleep(2000);
        window.location.hash = '#/';
      } catch (error) {
        loginStatus.style.display = 'block';
        loginStatus.innerHTML = `
          <div class="error-message">
            <h3>Login gagal</h3>
            <p>${error.message || 'Silakan periksa email dan password Anda'}</p>
          </div>
        `;
        
        loginButton.disabled = false;
        loginButton.innerHTML = 'Masuk';
      }
    });
  }
}