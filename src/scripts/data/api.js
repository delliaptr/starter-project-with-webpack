import CONFIG from '../config';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
};

class Api {
  static async getStories() {
    const response = await fetch(ENDPOINTS.STORIES);
    const responseJson = await response.json();
    return responseJson.data.stories;
  }

  static async getStoryDetail(id) {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id));
    const responseJson = await response.json();
    return responseJson.data.story;
  }

  static async addStory(formData) {
    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      body: formData,
    });
    const responseJson = await response.json();
    return responseJson;
  }

  static async getStoriesWithLocation() {
    const response = await fetch(`${ENDPOINTS.STORIES}?location=1`);
    const responseJson = await response.json();
    return responseJson.data.stories;
  }
}

export default Api;