// Smart Recommendations - API data-driven
import { API } from './api.js';

export async function getRecommendations(baseCollegeId, limit = 6) {
  const colleges = await API.getColleges();
  const baseCollege = colleges.find(c => c.id === Number(baseCollegeId));
  if (!baseCollege) {
    // Trending fallback
    return colleges
      .filter(c => c.rating > 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  const recs = colleges.filter(c => c.id !== baseCollegeId)
    .map(c => ({
      ...c,
      score: (
        (c.category === baseCollege.category ? 30 : 0) +
        (Math.abs(c.rating - baseCollege.rating) <= 0.5 ? 25 : 0) +
        (Math.abs(c.fees - baseCollege.fees) <= 50000 ? 20 : 0) +
        (c.type === baseCollege.type ? 15 : 0) +
        (Math.abs(c.rating - 4.5) * -5)
      )
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recs;
}

export function renderRecommendations(recommendations, containerSelector, title = 'Recommended Colleges') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  container.innerHTML = `
    <div class="section-header">
      <h3>${escapeHTML(title)} <i class="fas fa-star"></i></h3>
    </div>
    <div class="recommended-grid">
      ${recommendations.map(rec => `
        <div class="rec-card">
          <img src="${rec.image}" alt="${escapeHTML(rec.name)}" loading="lazy">
          <div class="rec-info">
            <h4>${escapeHTML(rec.name)}</h4>
            <div class="rec-meta">
              <span>${escapeHTML(rec.location)}</span>
              <span class="rating-small">⭐ ${rec.rating.toFixed(1)}</span>
            </div>
            <a href="college.html?id=${rec.id}" class="btn-rec">View Details</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

