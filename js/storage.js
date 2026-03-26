// LocalStorage utilities for favorites, auth, and theme

// Simple hash function for password storage (SHA-256 via SubtleCrypto)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback for environments without SubtleCrypto (e.g. file:// protocol)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return 'fb_' + Math.abs(hash).toString(16);
  }
}

const Storage = {
  getUsers() {
    return JSON.parse(localStorage.getItem('collegeFinderUsers')) || [];
  },

  async registerUser({ name, email, password }) {
    const users = this.getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { ok: false, message: 'Email already registered' };

    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    };
    users.push(newUser);
    localStorage.setItem('collegeFinderUsers', JSON.stringify(users));
    return { ok: true };
  },

  async loginUser(email, password) {
    const users = this.getUsers();
    const hashedPassword = await hashPassword(password);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword
    );
    if (!user) return { ok: false, message: 'Invalid email or password' };
    const token = btoa(`${user.id}:${user.email}:${Date.now()}`);
    localStorage.setItem('collegeFinderToken', token);
    localStorage.setItem(
      'collegeFinderSession',
      JSON.stringify({ id: user.id, name: user.name, email: user.email })
    );
    return { ok: true, token, user: { id: user.id, name: user.name, email: user.email } };
  },

  logoutUser() {
    localStorage.removeItem('collegeFinderSession');
    localStorage.removeItem('collegeFinderToken');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('collegeFinderSession') || 'null');
  },

  isAuthenticated() {
    const user = this.getCurrentUser();
    const token = this.getToken();
    if (!user || !token) return false;
    // Validate token format (base64 encoded "id:email:timestamp")
    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      if (parts.length < 3) return false;
      const tokenUserId = Number(parts[0]);
      if (tokenUserId !== user.id) return false;
      // Check token age (expire after 7 days)
      const tokenTime = Number(parts[parts.length - 1]);
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - tokenTime > maxAge) {
        this.logoutUser();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  getToken() {
    return localStorage.getItem('collegeFinderToken');
  },

  // Per-user favorites key
  _favKey() {
    const user = this.getCurrentUser();
    return user ? `collegeFavorites_${user.id}` : 'collegeFavorites_guest';
  },

  getFavorites() {
    return JSON.parse(localStorage.getItem(this._favKey())) || [];
  },

  addFavorite(id) {
    const favorites = this.getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem(this._favKey(), JSON.stringify(favorites));
      return true;
    }
    return false;
  },

  removeFavorite(id) {
    let favorites = this.getFavorites();
    favorites = favorites.filter(favId => favId !== id);
    localStorage.setItem(this._favKey(), JSON.stringify(favorites));
    return true;
  },

  isFavorite(id) {
    return this.getFavorites().includes(id);
  },

  clearFavorites() {
    localStorage.removeItem(this._favKey());
  },

  getTheme() {
    return localStorage.getItem('theme') || 'light';
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  clearAll() {
    localStorage.clear();
  }
};

export default Storage;
