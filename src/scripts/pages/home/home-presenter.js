export default class HomePresenter {
    #view;
    #model;
  
    constructor(model, view) {
      this.#model = model;
      this.#view = view;
    }
  
    async checkAuthStatus() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      
      this.#view.renderAuthStatus(token, user);
    }
    
    async loadStories() {
      try {
        const stories = await this.#model.getStories();
        this.#view.renderStories(stories);
      } catch (error) {
        this.#view.showError(error);
      }
    }
    
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
}