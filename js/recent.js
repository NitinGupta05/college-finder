// Recently Viewed Colleges

const Recent = {
  getRecentlyViewed() {
    return JSON.parse(localStorage.getItem('recentlyViewed')) || [];
  },

  addViewed(id) {
    let viewed = this.getRecentlyViewed();
    // Remove if exists
    viewed = viewed.filter(vid => vid !== id);
    // Add to front
    viewed.unshift(id);
    // Limit 8
    viewed = viewed.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  },

  getViewedColleges(colleges) {
    const viewedIds = this.getRecentlyViewed();
    return colleges.filter(c => viewedIds.includes(c.id));
  },

  clear() {
    localStorage.removeItem('recentlyViewed');
  }
};

export default Recent;
