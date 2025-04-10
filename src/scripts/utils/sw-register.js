export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.bundle.js');
        console.log('Service worker registered successfully with scope:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };