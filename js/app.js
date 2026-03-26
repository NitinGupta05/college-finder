import { colleges } from './data.js';
import Storage from './storage.js';
import { applyFilters } from './filter.js';
import Toast from './toast.js';
import { Compare } from './compare.js';
import Recent from './recent.js';
import { getRecommendations, renderRecommendations } from './recommend.js';

// DOM elements
const elements = {
  collegesGrid: document.getElementById('colleges-grid'),
  searchInput: document.getElementById('search-input'),
  searchSuggestions: document.getElementById('search-suggestions'),
  categorySelect: document.getElementById('category-select'),
  typeSelect: document.getElementById('type-select'),
  locationSelect: document.getElementById('location-select'),
  minRating: document.getElementById('min-rating'),
  ratingVal: document.getElementById('rating-val'),
  minFees: document.getElementById('min-fees'),
  maxFees: document.getElementById('max-fees'),
  sortSelect: document.getElementById('sort-select'),
  loadMoreBtn: document.getElementById('load-more'),
  themeToggle: document.getElementById('theme-toggle'),
  compareModal: document.getElementById('compare-modal'),
  compareTableBody: document.getElementById('compare-table-body'),
  favCount: document.getElementById('fav-count'),
  recentSection: document.getElementById('recent-section'),
  recentContainer: document.getElementById('recent-container'),
  collegeDetailContainer: document.getElementById('college-detail-container'),
  favoritesGrid: document.getElementById('favorites-grid')
};

// State
let currentColleges = colleges;
let visibleCount = 12;

// Init
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  setupEventListeners();
  loadTheme();
  updateFavCount();

  // Router Logic
  if (elements.collegesGrid) {
    initHome();
  } else if (elements.collegeDetailContainer) {
    initCollegeDetails();
  } else if (elements.favoritesGrid) {
    initFavorites();
  }
}

function initHome() {
  updateFiltersUI();
  renderColleges();
  renderRecent();
}

function initFavorites() {
  const favIds = Storage.getFavorites();
  currentColleges = colleges.filter(c => favIds.includes(c.id));
  
  if (currentColleges.length === 0) {
    elements.favoritesGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
        <h3>No favorites yet! ❤️</h3>
        <p>Go back and explore colleges to add them here.</p>
        <a href="index.html" class="btn btn-primary">Browse Colleges</a>
      </div>`;
  } else {
    currentColleges.forEach(c => {
      elements.favoritesGrid.appendChild(createCollegeCard(c));
    });
  }
}

function initCollegeDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const college = colleges.find(c => c.id === id);

  if (!college) {
    elements.collegeDetailContainer.innerHTML = '<h1>College not found</h1><a href="index.html" class="btn btn-primary">Go Home</a>';
    return;
  }

  Recent.addViewed(id);
  
  // Update Breadcrumbs
  const bcCategory = document.getElementById('bc-category');
  const bcName = document.getElementById('bc-name');
  if (bcCategory) bcCategory.textContent = college.category;
  if (bcName) bcName.textContent = college.name;

  const isFav = Storage.isFavorite(college.id);

  elements.collegeDetailContainer.innerHTML = `
    <div class="college-hero">
      <img src="${college.image}" alt="${college.name}">
      <div class="details-info">
        <h1>${college.name}</h1>
        <div class="card-meta">
          <span class="category-badge" style="position:static">${college.category}</span>
          <span class="type-badge">${college.type}</span>
        </div>
        <p class="mt-4"><i class="fas fa-map-marker-alt"></i> ${college.location}</p>
        <p class="mt-4" style="font-size: 1.5rem; font-weight: bold;">₹${college.fees.toLocaleString()}/yr</p>
        <div class="rating mt-4" style="font-size: 1.2rem; color: #f1c40f;">
          ${'⭐'.repeat(Math.round(college.rating))} (${college.rating})
        </div>
        <div class="card-actions mt-4">
          <button class="btn btn-secondary ${isFav ? 'btn-danger' : ''}" onclick="toggleFavorite(${college.id}, this)">
            ${isFav ? 'Remove Favorite' : 'Add to Favorites'}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-box">
      <div class="stat-card">
        <i class="fas fa-briefcase"></i>
        <div>
          <h4>${college.placement}%</h4>
          <p>Placement Rate</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-money-bill"></i>
        <div>
          <h4>₹${(college.avgPackage / 100000).toFixed(1)}L</h4>
          <p>Avg. Package</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-star"></i>
        <div>
          <h4>${college.reviews}</h4>
          <p>${college.reviewCount} Reviews</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-book"></i>
        <div>
          <h4>${college.programs}</h4>
          <p>Programs</p>
        </div>
      </div>
    </div>

    <div class="details-body">
      <h3>About</h3>
      <p>A premier institution located in ${college.location}, offering top-tier education in ${college.category}. Established in ${college.established}, this college is among the leading institutes in the country with consistent placements and excellent infrastructure.</p>

      <div class="accreditation-section">
        <h3><i class="fas fa-certificate"></i> Accreditation & Standards</h3>
        <p><strong>Accreditation:</strong> ${college.accreditation}</p>
        <p><strong>Established:</strong> ${college.established}</p>
        <p><strong>Infrastructure Rating:</strong> ${college.infrastructure}/5 ⭐</p>
      </div>

      <div class="programs-section">
        <h3><i class="fas fa-graduation-cap"></i> Programs Offered</h3>
        <div class="programs-list">
          ${[...Array(college.programs)].map((_, i) => {
            const programs = {
              'Engineering': ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT', 'BioTech', 'Aero'],
              'Medical': ['MBBS', 'MD', 'MS', 'DNB', 'DM', 'MCh', 'Diploma', 'PhD'],
              'Law': ['BA LLB', 'LLM', 'LLB Hons', 'Legal Service', 'Patent Law', 'Corporate Law', 'Criminal Law', 'Constitutional Law'],
              'Arts': ['BA Political Science', 'BA Economics', 'BA Psychology', 'BA Sociology', 'BA History', 'BA English', 'BA Philosophy', 'BA Geography']
            };
            const programsList = programs[college.category] || [];
            return `<div style="padding: 8px 12px; background: rgba(166,77,121,0.1); border-radius: 6px; font-size: 0.85rem; border-left: 3px solid var(--accent);">${programsList[i] || 'Program ' + (i + 1)}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="facilities-section">
        <h3><i class="fas fa-building"></i> Facilities</h3>
        <div class="facilities-grid">
          ${college.facilities.map(f => `
            <div class="facility-badge">
              <i class="fas fa-${f === 'Hostel' ? 'bed' : f === 'Lab' ? 'flask' : f === 'Library' ? 'book' : f === 'Sports' ? 'running' : f === 'WiFi' ? 'wifi' : 'utensils'}"></i>
              ${f}
            </div>
          `).join('')}
        </div>
      </div>

      <h3>Location</h3>
      <iframe
        width="100%"
        height="300"
        style="border:0; border-radius: 12px; margin-top: 10px;"
        loading="lazy"
        src="https://maps.google.com/maps?q=${encodeURIComponent(college.name + ' ' + college.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed">
      </iframe>
    </div>
  `;

  const recs = getRecommendations(id);
  renderRecommendations(recs, '#recommendations-container', 'Similar Colleges');
}

function setupEventListeners() {
  // Home page listeners
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      debounce(handleFiltersChange, 300)(e);
      showSuggestions(e.target.value);
    });
    elements.categorySelect.addEventListener('change', handleFiltersChange);
    elements.typeSelect.addEventListener('change', handleFiltersChange);
    elements.locationSelect.addEventListener('change', handleFiltersChange);
    elements.minRating.addEventListener('input', (e) => {
      if(elements.ratingVal) elements.ratingVal.textContent = e.target.value;
      handleFiltersChange();
    });
    elements.minFees.addEventListener('input', handleFiltersChange);
    elements.maxFees.addEventListener('input', handleFiltersChange);
    elements.sortSelect.addEventListener('change', handleFiltersChange);
    elements.loadMoreBtn.addEventListener('click', loadMore);

    // New filter listeners for placement
    const minPlacementSlider = document.getElementById('min-placement');
    if (minPlacementSlider) {
      minPlacementSlider.addEventListener('input', (e) => {
        const placementVal = document.getElementById('placement-val');
        if (placementVal) placementVal.textContent = e.target.value + '%';
        handleFiltersChange();
      });
    }

    // Infrastructure rating slider
    const minInfrastructureSlider = document.getElementById('min-infrastructure');
    if (minInfrastructureSlider) {
      minInfrastructureSlider.addEventListener('input', (e) => {
        const infrastructureVal = document.getElementById('infrastructure-val');
        if (infrastructureVal) infrastructureVal.textContent = e.target.value;
        handleFiltersChange();
      });
    }

    // Entrance exam checkboxes
    const entranceExamCheckboxes = document.querySelectorAll('input[name="entrance-exam"]');
    entranceExamCheckboxes.forEach(cb => cb.addEventListener('change', handleFiltersChange));

    // Accreditation checkboxes
    const accreditationCheckboxes = document.querySelectorAll('input[name="accreditation"]');
    accreditationCheckboxes.forEach(cb => cb.addEventListener('change', handleFiltersChange));

    // Facilities checkboxes
    const facilitiesCheckboxes = document.querySelectorAll('input[name="facilities"]');
    facilitiesCheckboxes.forEach(cb => cb.addEventListener('change', handleFiltersChange));
    
    if (document.getElementById('reset-filters')) {
      document.getElementById('reset-filters').addEventListener('click', resetFilters);
    }
    
    // Suggestions click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper') && elements.searchSuggestions) {
        elements.searchSuggestions.style.display = 'none';
      }
    });
  }

  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // Modal close
  const closeBtn = document.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      elements.compareModal.classList.remove('show');
    });
  }
}

function handleFiltersChange() {
  const filters = getFilters();
  const sortBy = elements.sortSelect.value;
  
  currentColleges = applyFilters(colleges, filters, sortBy);
  visibleCount = 12;
  renderColleges();
}

function resetFilters() {
  if (elements.searchInput) elements.searchInput.value = '';
  if (elements.categorySelect) elements.categorySelect.value = '';
  if (elements.typeSelect) elements.typeSelect.value = '';
  if (elements.locationSelect) elements.locationSelect.value = '';
  if (elements.minRating) {
    elements.minRating.value = '0';
    if (elements.ratingVal) elements.ratingVal.textContent = '0';
  }
  if (elements.minFees) elements.minFees.value = '';
  if (elements.maxFees) elements.maxFees.value = '';
  if (elements.sortSelect) elements.sortSelect.value = 'rating';

  // Reset new filters
  const entranceExamCheckboxes = document.querySelectorAll('input[name="entrance-exam"]:checked');
  entranceExamCheckboxes.forEach(cb => cb.checked = false);

  const accreditationCheckboxes = document.querySelectorAll('input[name="accreditation"]:checked');
  accreditationCheckboxes.forEach(cb => cb.checked = false);

  const facilitiesCheckboxes = document.querySelectorAll('input[name="facilities"]:checked');
  facilitiesCheckboxes.forEach(cb => cb.checked = false);

  const placementSlider = document.getElementById('min-placement');
  if (placementSlider) {
    placementSlider.value = '0';
    const placementVal = document.getElementById('placement-val');
    if (placementVal) placementVal.textContent = '0%';
  }

  const infrastructureSlider = document.getElementById('min-infrastructure');
  if (infrastructureSlider) {
    infrastructureSlider.value = '0';
    const infrastructureVal = document.getElementById('infrastructure-val');
    if (infrastructureVal) infrastructureVal.textContent = '0';
  }

  handleFiltersChange();
  Toast.show('Filters reset', 'info');
}

function getFilters() {
  // Get entrance exams from checkboxes
  const entranceExamCheckboxes = document.querySelectorAll('input[name="entrance-exam"]:checked');
  const entranceExams = Array.from(entranceExamCheckboxes).map(cb => cb.value);

  // Get accreditations from checkboxes
  const accreditationCheckboxes = document.querySelectorAll('input[name="accreditation"]:checked');
  const accreditations = Array.from(accreditationCheckboxes).map(cb => cb.value);

  // Get facilities from checkboxes
  const facilitiesCheckboxes = document.querySelectorAll('input[name="facilities"]:checked');
  const facilities = Array.from(facilitiesCheckboxes).map(cb => cb.value);

  return {
    search: elements.searchInput ? elements.searchInput.value : '',
    category: elements.categorySelect ? elements.categorySelect.value : '',
    type: elements.typeSelect ? elements.typeSelect.value : '',
    location: elements.locationSelect ? elements.locationSelect.value : '',
    minRating: elements.minRating ? parseFloat(elements.minRating.value) || 0 : 0,
    minFees: elements.minFees ? parseInt(elements.minFees.value) || 0 : 0,
    maxFees: elements.maxFees ? parseInt(elements.maxFees.value) || Infinity : Infinity,
    minPlacement: document.getElementById('min-placement') ? parseInt(document.getElementById('min-placement').value) || 0 : 0,
    minInfrastructure: document.getElementById('min-infrastructure') ? parseFloat(document.getElementById('min-infrastructure').value) || 0 : 0,
    entranceExam: entranceExams,
    accreditation: accreditations,
    facilities: facilities
  };
}

function showSuggestions(val) {
  if (!elements.searchSuggestions) return;
  if (val.length < 2) {
    elements.searchSuggestions.style.display = 'none';
    return;
  }
  const matches = colleges.filter(c => c.name.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
  elements.searchSuggestions.innerHTML = matches.map(c => 
    `<div onclick="window.location.href='college.html?id=${c.id}'">${c.name} <span style="font-size:0.8em; color:#888">(${c.location})</span></div>`
  ).join('');
  elements.searchSuggestions.style.display = matches.length ? 'block' : 'none';
}

function renderColleges() {
  if (!elements.collegesGrid) return;
  elements.collegesGrid.innerHTML = '';
  
  const toShow = currentColleges.slice(0, visibleCount);
  
  if (toShow.length === 0) {
    elements.collegesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;"><h3>No colleges found</h3></div>';
    elements.loadMoreBtn.style.display = 'none';
    return;
  }

  toShow.forEach(college => {
    elements.collegesGrid.appendChild(createCollegeCard(college));
  });
  
  updateLoadMoreBtn();
}

function createCollegeCard(college) {
  const card = document.createElement('div');
  card.className = 'college-card' + (college.isFeature ? ' featured-card' : '');

  const isFav = Storage.isFavorite(college.id);
  const placementColor = college.placement >= 90 ? '#22c55e' : college.placement >= 70 ? '#eab308' : '#ef4444';

  // Build badges HTML
  let badgesHTML = '<div class="card-badges">';
  if (college.isFeature) badgesHTML += '<span class="badge badge-featured">★ Featured</span>';
  if (college.isTrending) badgesHTML += '<span class="badge badge-trending">📈 Trending</span>';
  badgesHTML += `<span class="badge badge-placement" style="background-color: ${placementColor}; color: white;">${college.placement}% Placed</span>`;
  badgesHTML += '</div>';

  card.innerHTML = `
    ${badgesHTML}
    <img src="${college.image}" alt="${college.name}" class="card-image" loading="lazy">
    <span class="category-badge">${college.category}</span>
    <div class="card-content">
      <h3 class="card-title">${college.name}</h3>
      <div class="card-stats">
        <div class="stat"><i class="fas fa-star"></i> <span>${college.rating}</span></div>
        <div class="stat"><i class="fas fa-briefcase"></i> <span>${college.placement}%</span></div>
        <div class="stat"><i class="fas fa-building"></i> <span>${college.infrastructure}</span></div>
      </div>
      <div class="card-meta">
        <span><i class="fas fa-map-marker-alt"></i> ${college.location}</span>
      </div>
      <div class="fees-display">
        <strong>₹${college.fees.toLocaleString()}</strong>/yr
      </div>
      <div class="card-actions">
        <a href="college.html?id=${college.id}" class="btn btn-primary">
          View
        </a>
        <button class="btn btn-secondary ${isFav ? 'btn-danger' : ''}" onclick="toggleFavorite(${college.id}, this)">
          <i class="fas ${isFav ? 'fa-heart-broken' : 'fa-heart'}"></i>
        </button>
        <button class="btn btn-secondary" onclick="addToCompare(${college.id})">
          <i class="fas fa-balance-scale"></i>
        </button>
      </div>
    </div>
  `;
  return card;
}

function loadMore() {
  visibleCount += 8;
  renderColleges();
}

function updateLoadMoreBtn() {
  if (currentColleges.length > visibleCount) {
    elements.loadMoreBtn.style.display = 'block';
  } else {
    elements.loadMoreBtn.style.display = 'none';
  }
}

function toggleFavorite(id, btn) {
  if (Storage.isFavorite(id)) {
    Storage.removeFavorite(id);
    Toast.show('Removed from favorites', 'info');
  } else {
    Storage.addFavorite(id);
    Toast.show('Added to favorites', 'success');
  }
  updateFavCount();
  
  // UX Update
  if (btn) {
    const isFav = Storage.isFavorite(id);
    btn.classList.toggle('btn-danger', isFav);
    const icon = btn.querySelector('i');
    if(icon) icon.className = `fas ${isFav ? 'fa-heart-broken' : 'fa-heart'}`;
  }
  
  // If on favorites page, refresh
  if (elements.favoritesGrid) initFavorites();
}

function updateFavCount() {
  if (elements.favCount) {
    elements.favCount.textContent = Storage.getFavorites().length;
  }
}

function renderRecent() {
  if (!elements.recentContainer) return;
  const recent = Recent.getViewedColleges(colleges);
  if (recent.length === 0) {
    elements.recentSection.classList.add('hidden');
    return;
  }
  elements.recentSection.classList.remove('hidden');
  elements.recentContainer.innerHTML = '';
  recent.forEach(c => {
    const card = createCollegeCard(c);
    card.style.minWidth = '260px';
    elements.recentContainer.appendChild(card);
  });
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Theme
function toggleTheme() {
  const current = Storage.getTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  Storage.setTheme(newTheme);
  loadTheme();
}

function loadTheme() {
  const theme = Storage.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  if (elements.themeToggle) {
    elements.themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

// Update filters dropdowns
function updateFiltersUI() {
  if (!elements.categorySelect) return;

  // Categories
  const categories = [...new Set(colleges.map(c => c.category))];
  elements.categorySelect.innerHTML = '<option value="">All Categories</option>' + 
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

  // Types
  const types = [...new Set(colleges.map(c => c.type))];
  elements.typeSelect.innerHTML = '<option value="">All Types</option>' + 
    types.map(t => `<option value="${t}">${t}</option>`).join('');

  // Locations
  const locations = [...new Set(colleges.map(c => c.location))];
  elements.locationSelect.innerHTML = '<option value="">All Locations</option>' + 
    locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
}

// Global functions for onclick (HTML onclick limited)
window.toggleFavorite = toggleFavorite;
window.addToCompare = addToCompare;

// Compare feature stub (modal table)
function addToCompare(id) {
  const success = Compare.add(id, colleges);
  if (success) {
    Compare.renderTable(elements.compareTableBody);
    elements.compareModal.classList.add('show');
    Toast.show('Added to compare', 'success');
  } else {
    // Check why failed
    const list = Compare.getSelected();
    if (list.find(c => c.id === id)) Toast.show('Already in comparison', 'info');
    else if (list.length >= 3) Toast.show('Maximum 3 colleges allowed', 'error');
  }
}
