import CONFIG from '../../config';
import Api from '../../data/api';
import { sleep } from '../../utils';

export default class AddStoryPage {
  #map = null;
  #marker = null;
  #selectedPosition = null;
  #cameraStream = null;

  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to content</a>
      </div>
      <section id="main-content" class="add-story container">
        <h1>Tambah Cerita Baru</h1>
        
        <form id="add-story-form" class="add-story-form">
          <div class="form-group">
            <label for="name">Judul Cerita</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" rows="5" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Foto Cerita</label>
            <div class="camera-container">
              <video id="camera-preview" class="camera-preview" autoplay></video>
              <canvas id="camera-canvas" class="camera-canvas" style="display:none;"></canvas>
              <div class="camera-controls">
                <button type="button" id="camera-button" class="btn-camera">
                  <i class="fas fa-camera"></i> Ambil Foto
                </button>
                <button type="button" id="retake-button" class="btn-retake" style="display:none;">
                  <i class="fas fa-redo"></i> Ambil Ulang
                </button>
              </div>
              <div id="camera-result" class="camera-result" style="display:none;">
                <img id="captured-image" alt="Foto yang diambil">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Lokasi</label>
            <div id="map-picker" class="map-picker"></div>
            <p class="map-help">Klik pada peta untuk menentukan lokasi cerita</p>
            <div id="location-info" class="location-info">
              <p>Belum ada lokasi yang dipilih</p>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="submit-button" class="btn-submit" disabled>
              Kirim Cerita
            </button>
            <a href="#/" class="btn-cancel">Batal</a>
          </div>
        </form>
        
        <div id="submission-status" class="submission-status" style="display:none;"></div>
      </section>
    `;
  }

  async afterRender() {
    this._initCamera();
    this._initMap();
    this._initFormSubmission();
  }
  
  async _initCamera() {
    const cameraPreview = document.getElementById('camera-preview');
    const cameraButton = document.getElementById('camera-button');
    const retakeButton = document.getElementById('retake-button');
    const cameraCanvas = document.getElementById('camera-canvas');
    const cameraResult = document.getElementById('camera-result');
    const capturedImage = document.getElementById('captured-image');
    
    try {
      this.#cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      cameraPreview.srcObject = this.#cameraStream;
      
      cameraButton.addEventListener('click', () => {
        cameraCanvas.width = cameraPreview.videoWidth;
        cameraCanvas.height = cameraPreview.videoHeight;
        
        const context = cameraCanvas.getContext('2d');
        context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        const imageDataUrl = cameraCanvas.toDataURL('image/jpeg');
        capturedImage.src = imageDataUrl;
        
        cameraResult.style.display = 'block';
        retakeButton.style.display = 'inline-block';
        cameraButton.style.display = 'none';
        cameraPreview.style.display = 'none';
        
        this._stopCameraStream();
        this._updateSubmitButtonState();
      });
      
      retakeButton.addEventListener('click', async () => {
        cameraResult.style.display = 'none';
        retakeButton.style.display = 'none';
        cameraButton.style.display = 'inline-block';
        cameraPreview.style.display = 'block';
        
        await this._initCamera();
        this._updateSubmitButtonState();
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      document.querySelector('.camera-container').innerHTML = `
        <p class="error-message">Tidak dapat mengakses kamera. Pastikan browser Anda mendukung dan memberikan izin.</p>
        <input type="file" id="photo-upload" accept="image/*">
        <label for="photo-upload" class="btn-upload">Upload Foto</label>
      `;
      
      document.getElementById('photo-upload').addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          
          reader.onload = (event) => {
            capturedImage.src = event.target.result;
            cameraResult.style.display = 'block';
            this._updateSubmitButtonState();
          };
          
          reader.readAsDataURL(file);
        }
      });
    }
  }
  
  _stopCameraStream() {
    if (this.#cameraStream) {
      this.#cameraStream.getTracks().forEach(track => track.stop());
      this.#cameraStream = null;
    }
  }
  
  _initMap() {
    const script = document.createElement('script');
    script.src = 'https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.js';
    document.head.appendChild(script);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.css';
    document.head.appendChild(link);
    
    script.onload = () => {
      // Initialize map with MapTiler
      this.#map = new maplibregl.Map({
        container: 'map-picker',
        style: `https://api.maptiler.com/maps/streets/style.json?key=${CONFIG.MAP_TILER_KEY}`,
        center: [107.6191, -6.9175], 
        zoom: 9
      });
      
      this.#map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      const layerControl = document.createElement('div');
      layerControl.className = 'layer-control';
      layerControl.innerHTML = `
        <select id="map-style">
          <option value="streets">Streets</option>
          <option value="outdoors">Outdoors</option>
          <option value="satellite">Satellite</option>
        </select>
      `;
      
      document.getElementById('map-picker').appendChild(layerControl);
      
      document.getElementById('map-style').addEventListener('change', (e) => {
        const style = e.target.value;
        this.#map.setStyle(`https://api.maptiler.com/maps/${style}/style.json?key=${CONFIG.MAP_TILER_KEY}`);
      });
      
      this.#map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        this.#selectedPosition = { lng, lat };
        
        if (this.#marker) {
          this.#marker.setLngLat([lng, lat]);
        } else {
          this.#marker = new maplibregl.Marker()
            .setLngLat([lng, lat])
            .addTo(this.#map);
        }
        
        document.getElementById('location-info').innerHTML = `
          <p><strong>Lokasi dipilih:</strong></p>
          <p>Latitude: ${lat.toFixed(6)}</p>
          <p>Longitude: ${lng.toFixed(6)}</p>
        `;
        
        this._updateSubmitButtonState();
      });
    };
  }
  
  _updateSubmitButtonState() {
    const submitButton = document.getElementById('submit-button');
    const capturedImage = document.getElementById('captured-image');
    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    
    const hasImage = capturedImage && capturedImage.src && capturedImage.src !== '';
    const hasLocation = !!this.#selectedPosition;
    const hasName = nameInput && nameInput.value.trim() !== '';
    const hasDescription = descriptionInput && descriptionInput.value.trim() !== '';
    
    submitButton.disabled = !(hasImage && hasLocation && hasName && hasDescription);
  }
  
  _initFormSubmission() {
    const form = document.getElementById('add-story-form');
    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    
    // Update submit button state on input changes
    nameInput.addEventListener('input', () => this._updateSubmitButtonState());
    descriptionInput.addEventListener('input', () => this._updateSubmitButtonState());
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const submissionStatus = document.getElementById('submission-status');
      const submitButton = document.getElementById('submit-button');
      
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
      
      try {
        const name = nameInput.value;
        const description = descriptionInput.value;
        const capturedImage = document.getElementById('captured-image');
        
        const imageResponse = await fetch(capturedImage.src);
        const imageBlob = await imageResponse.blob();
        
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', imageBlob, 'photo.jpg');
        
        if (this.#selectedPosition) {
          formData.append('lat', this.#selectedPosition.lat);
          formData.append('lon', this.#selectedPosition.lng);
        }
        
        const response = await Api.addStory(formData);
        
        submissionStatus.style.display = 'block';
        submissionStatus.innerHTML = `
          <div class="success-message">
            <h3>Cerita berhasil ditambahkan!</h3>
            <p>Mengalihkan ke halaman utama...</p>
          </div>
        `;

        await sleep(2000);
        window.location.hash = '#/';
      } catch (error) {
        console.error('Error submitting story:', error);
        
        try {
          const name = nameInput.value;
          const description = descriptionInput.value;
          const capturedImage = document.getElementById('captured-image');
          
          const imageResponse = await fetch(capturedImage.src);
          const imageBlob = await imageResponse.blob();
          
          const formData = new FormData();

          formData.append('description', `${name}\n\n${description}`);
          formData.append('photo', imageBlob, 'photo.jpg');
          
          if (this.#selectedPosition) {
            formData.append('lat', this.#selectedPosition.lat);
            formData.append('lon', this.#selectedPosition.lng);
          }
          
          // Send to API
          const response = await Api.addStory(formData);
          
          // Show success message
          submissionStatus.style.display = 'block';
          submissionStatus.innerHTML = `
            <div class="success-message">
              <h3>Cerita berhasil ditambahkan!</h3>
              <p>Mengalihkan ke halaman utama...</p>
            </div>
          `;
          
          // Redirect to home page after delay
          await sleep(2000);
          window.location.hash = '#/';
        } catch (secondError) {
          // Show error message for both attempts
          submissionStatus.style.display = 'block';
          submissionStatus.innerHTML = `
            <div class="error-message">
              <h3>Gagal menambahkan cerita</h3>
              <p>Error: ${error.message}</p>
              <p>Silakan coba lagi atau periksa dokumentasi API.</p>
            </div>
          `;
          
          // Reset button state
          submitButton.disabled = false;
          submitButton.innerHTML = 'Kirim Cerita';
        }
      }
    });
  }
  
  async _onUnmount() {
    this._stopCameraStream();
  }
}