export default class AddStoryPresenter {
    #view;
    #model;
  
    constructor(model, view) {
      this.#model = model;
      this.#view = view;
    }
  
    setSelectedPosition(position) {
      this.#view.updateLocationInfo(position);
      this.#view.updateSubmitButtonState();
    }
  
    async submitStory(name, description, photoBlob, position) {
      try {
        const formData = new FormData();
        formData.append('description', `${name}\n\n${description}`);
        formData.append('photo', photoBlob, 'photo.jpg');
        
        if (position) {
          formData.append('lat', position.lat);
          formData.append('lon', position.lng);
        }
        
        const response = await this.#model.addStory(formData);
        this.#view.showSuccessMessage();
        
        await this.#view.redirectAfterDelay(2000, '#/');
      } catch (error) {
        this.#view.showErrorMessage(error);
      }
    }
  }