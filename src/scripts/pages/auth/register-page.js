import Api from '../../data/api';
import { sleep } from '../../utils';

export default class RegisterPage {
  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to content</a>
      </div>
      <section id="main-content" class="register-page container">
        <h1>Daftar Akun</h1>
        
        <form id="register-form" class="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="6">
            <small>Minimal 8 karakter</small>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="register-button" class="btn-submit">
              Daftar
            </button>
          </div>
        </form>
        
        <div id="register-status" class="register-status" style="display:none;"></div>
        
        <div class="login-link">
          <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._initRegisterForm();
  }
  
  _initRegisterForm() {
    const form = document.getElementById('register-form');
    const registerStatus = document.getElementById('register-status');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const registerButton = document.getElementById('register-button');
      
      registerButton.disabled = true;
      registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      
      try {
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        
        const response = await Api.register(name, email, password);
        
        registerStatus.style.display = 'block';
        registerStatus.innerHTML = `
          <div class="success-message">
            <h3>Pendaftaran berhasil!</h3>
            <p>Silakan login dengan email dan password Anda. Mengalihkan ke halaman login...</p>
          </div>
        `;
        
        await sleep(2000);
        window.location.hash = '#/login';
      } catch (error) {
        registerStatus.style.display = 'block';
        registerStatus.innerHTML = `
          <div class="error-message">
            <h3>Pendaftaran gagal</h3>
            <p>${error.message || 'Silakan coba dengan email lain'}</p>
          </div>
        `;
        
        registerButton.disabled = false;
        registerButton.innerHTML = 'Daftar';
      }
    });
  }
}