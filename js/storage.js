// LocalStorage utilities for favorites and theme

const Storage = {
  getFavorites() {
    return JSON.parse(localStorage.getItem('collegeFavorites')) || [];
  },

  addFavorite(id) {
    const favorites = this.getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem('collegeFavorites', JSON.stringify(favorites));
      return true;
    }
    return false;
  },

  removeFavorite(id) {
    let favorites = this.getFavorites();
    favorites = favorites.filter(favId => favId !== id);
    localStorage.setItem('collegeFavorites', JSON.stringify(favorites));
    return true;
  },

  isFavorite(id) {
    return this.getFavorites().includes(id);
  },

  clearFavorites() {
    localStorage.removeItem('collegeFavorites');
  },

  getTheme() {
    return localStorage.getItem('theme') || 'light';
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // Delegates to localStorage direct access if needed, but we rely on Recent module for logic
  // Keeping this for potential extension or cleanup
  clearAll() {
    localStorage.clear();
  }
};

export default Storage;
