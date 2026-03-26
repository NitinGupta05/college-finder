import { API } from './api.js';
import Storage from './storage.js';
import { applyFilters } from './filter.js';
import Toast from './toast.js';
import { Compare } from './compare.js';
import Recent from './recent.js';
import { getRecommendations, renderRecommendations } from './recommend.js';

const PROTECTED_PAGES = new Set(['college.html', 'favorites.html', 'profile.html']);

const elements = {
  navbar: document.querySelector('.navbar'),
  navToggle: document.getElementById('nav-toggle'),
  navLinks: document.querySelector('.nav-links'),
  sidebar: document.getElementById('filters-sidebar'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  mobileFilterToggle: document.getElementById('mobile-filter-toggle'),
  themeToggle: document.getElementById('theme-toggle'),
  authButton: document.getElementById('auth-button'),
  userChip: document.getElementById('user-chip'),
  userChipName: document.getElementById('user-chip-name'),
  favCount: document.getElementById('fav-count'),

  collegesGrid: document.getElementById('colleges-grid'),
  searchInput: document.getElementById('search-input'),
  searchTrigger: document.getElementById('search-trigger'),
  searchSuggestions: document.getElementById('search-suggestions'),
  categorySelect: document.getElementById('category-select'),
  typeSelect: document.getElementById('type-select'),
  locationSelect: document.getElementById('location-select'),
  minRating: document.getElementById('min-rating'),
  ratingVal: document.getElementById('rating-val'),
  minFees: document.getElementById('min-fees'),
  maxFees: document.getElementById('max-fees'),
  sortSelect: document.getElementById('sort-select'),
  sortPills: document.querySelectorAll('.sort-pill'),
  loadMoreBtn: document.getElementById('load-more'),
  compareModal: document.getElementById('compare-modal'),
  compareTableBody: document.getElementById('compare-table-body'),
  recentSection: document.getElementById('recent-section'),
  recentContainer: document.getElementById('recent-container'),

  collegeDetailContainer: document.getElementById('college-detail-container'),
  favoritesGrid: document.getElementById('favorites-grid'),
  rankCategory: document.getElementById('rank-category'),
  placementRanking: document.getElementById('placement-ranking'),
  ratingRanking: document.getElementById('rating-ranking'),
  infrastructureRanking: document.getElementById('infrastructure-ranking'),
  profileName: document.getElementById('profile-name'),
  profileEmail: document.getElementById('profile-email'),
  profileMemberSince: document.getElementById('profile-member-since'),
  favCountStat: document.getElementById('fav-count-stat'),
  viewedCount: document.getElementById('viewed-count'),
  avgRating: document.getElementById('avg-rating'),
  favoritesList: document.getElementById('favorites-list'),
  recentlyViewedList: document.getElementById('recently-viewed-list')
};

let allColleges = [];
let currentColleges = [];
let visibleCount = 12;
let debouncedHandleFiltersChange;
const IMAGE_CACHE_KEY = 'collegeFinderImageCache';
const imageCache = loadImageCache();
let mobileOverlay = null;
let revealObserver = null;

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  ensureAuthModal();
  bindGlobalUI();
  loadTheme();
  syncAuthUI();
  updateFavCount();

  const page = getCurrentPage();
  if (guardProtectedRoute(page)) return;
  handleAuthPromptFromQuery();

  if (needsColleges(page)) {
    const loaded = await loadCollegesSafe(page);
    if (!loaded) return;
  }

  await initPage(page);
  setupScrollAnimations();
}

function getCurrentPage() {
  const file = window.location.pathname.split('/').pop();
  return file || 'index.html';
}

function needsColleges(page) {
  return ['index.html', 'college.html', 'favorites.html', 'rankings.html', 'profile.html'].includes(page);
}

function guardProtectedRoute(page) {
  if (!PROTECTED_PAGES.has(page) || Storage.isAuthenticated()) return false;
  if (page === 'college.html') return false;

  sessionStorage.setItem('postLoginRedirect', page);
  window.location.href = 'index.html?auth=required';
  return true;
}

function handleAuthPromptFromQuery() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('auth') !== 'required') return;
  openAuthModal('login');
  Toast.show('Please login to continue', 'info');
}

async function loadCollegesSafe(page) {
  const target = resolvePageTarget(page);
  if (target) showLoading(target, 'Loading colleges...');
  try {
    const colleges = await API.getColleges();
    if (!Array.isArray(colleges)) throw new Error('Invalid data format');
    allColleges = colleges.filter(Boolean);
    currentColleges = [...allColleges];
    return true;
  } catch (error) {
    if (target) showError(target, 'Failed to load colleges. Please refresh and try again.');
    console.error('College load failure:', error);
    return false;
  }
}

function resolvePageTarget(page) {
  if (page === 'index.html') return elements.collegesGrid;
  if (page === 'college.html') return elements.collegeDetailContainer;
  if (page === 'favorites.html') return elements.favoritesGrid;
  if (page === 'rankings.html') return elements.placementRanking;
  if (page === 'profile.html') return elements.favoritesList;
  return null;
}

async function initPage(page) {
  if (page === 'index.html') return initHome();
  if (page === 'college.html') return initCollegeDetails();
  if (page === 'favorites.html') return initFavorites();
  if (page === 'rankings.html') return initRankings();
  if (page === 'profile.html') return initProfile();
}

function bindGlobalUI() {
  window.addEventListener('scroll', () => {
    if (!elements.navbar) return;
    elements.navbar.classList.toggle('scrolled', window.scrollY > 8);
  });

  setupMobileOverlay();

  if (elements.navToggle && elements.navLinks) {
    elements.navToggle.addEventListener('click', () => {
      const willOpen = !elements.navLinks.classList.contains('open');
      if (willOpen) {
        openNavDrawer();
      } else {
        closeNavDrawer();
      }
    });
    elements.navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeNavDrawer();
      });
    });
  }

  if (elements.sidebarToggle && elements.sidebar) {
    elements.sidebarToggle.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        const willOpen = !elements.sidebar.classList.contains('open');
        if (willOpen) {
          closeNavDrawer();
          elements.sidebar.classList.add('open');
          showMobileOverlay('sidebar');
          document.body.classList.add('menu-open');
        } else {
          closeSidebar();
        }
      } else {
        elements.sidebar.classList.toggle('collapsed');
      }
    });
  }

  if (elements.mobileFilterToggle && elements.sidebar) {
    elements.mobileFilterToggle.addEventListener('click', () => {
      if (window.innerWidth > 1024) return;
      closeNavDrawer();
      elements.sidebar.classList.add('open');
      showMobileOverlay('sidebar');
      document.body.classList.add('menu-open');
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNavDrawer();
      closeSidebar();
      closeAuthModal();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeSidebar();
    if (window.innerWidth > 768) closeNavDrawer();
  });

  if (elements.themeToggle) elements.themeToggle.addEventListener('click', toggleTheme);

  if (elements.authButton) {
    elements.authButton.addEventListener('click', () => {
      if (Storage.isAuthenticated()) {
        Storage.logoutUser();
        syncAuthUI();
        Toast.show('Signed out', 'info');
        if (PROTECTED_PAGES.has(getCurrentPage())) {
          window.location.href = 'index.html';
        }
      } else {
        openAuthModal('login');
      }
    });
  }
}

function setupMobileOverlay() {
  if (mobileOverlay) return;
  mobileOverlay = document.createElement('div');
  mobileOverlay.className = 'mobile-overlay';
  document.body.appendChild(mobileOverlay);
  mobileOverlay.addEventListener('click', () => {
    closeNavDrawer();
    closeSidebar();
  });
}

function showMobileOverlay(source) {
  if (!mobileOverlay) return;
  mobileOverlay.classList.add('show');
  mobileOverlay.dataset.source = source;
}

function hideMobileOverlay(source) {
  if (!mobileOverlay) return;
  if (mobileOverlay.dataset.source && mobileOverlay.dataset.source !== source) return;
  mobileOverlay.classList.remove('show');
  delete mobileOverlay.dataset.source;
  document.body.classList.remove('menu-open');
}

function openNavDrawer() {
  if (!elements.navToggle || !elements.navLinks || window.innerWidth > 768) return;
  closeSidebar();
  elements.navToggle.classList.add('active');
  elements.navLinks.classList.add('open');
  showMobileOverlay('nav');
  document.body.classList.add('menu-open');
}

function closeNavDrawer() {
  if (!elements.navToggle || !elements.navLinks) return;
  elements.navToggle.classList.remove('active');
  elements.navLinks.classList.remove('open');
  hideMobileOverlay('nav');
}

function closeSidebar() {
  if (!elements.sidebar) return;
  elements.sidebar.classList.remove('open');
  hideMobileOverlay('sidebar');
}

function ensureAuthModal() {
  if (document.getElementById('auth-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'modal auth-modal';
  modal.innerHTML = `
    <div class="modal-content auth-modal-content">
      <button class="close-modal auth-close" aria-label="Close authentication modal">&times;</button>
      <div class="auth-tabs">
        <button id="login-tab" class="auth-tab active">Sign In</button>
        <button id="signup-tab" class="auth-tab">Sign Up</button>
      </div>

      <form id="login-form" class="auth-form">
        <h3>Welcome Back</h3>
        <input id="login-email" class="form-control" type="email" placeholder="Email" required />
        <input id="login-password" class="form-control" type="password" placeholder="Password" required />
        <button class="btn btn-primary auth-submit" type="submit">Login</button>
      </form>

      <form id="signup-form" class="auth-form hidden">
        <h3>Create Account</h3>
        <input id="signup-name" class="form-control" type="text" placeholder="Full Name" required />
        <input id="signup-email" class="form-control" type="email" placeholder="Email" required />
        <input id="signup-password" class="form-control" type="password" minlength="6" placeholder="Password (min 6 chars)" required />
        <button class="btn btn-primary auth-submit" type="submit">Register</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const closeBtn = modal.querySelector('.auth-close');

  const switchTab = (type) => {
    const loginActive = type === 'login';
    loginTab.classList.toggle('active', loginActive);
    signupTab.classList.toggle('active', !loginActive);
    loginForm.classList.toggle('hidden', !loginActive);
    signupForm.classList.toggle('hidden', loginActive);
  };

  loginTab.addEventListener('click', () => switchTab('login'));
  signupTab.addEventListener('click', () => switchTab('signup'));
  closeBtn.addEventListener('click', closeAuthModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAuthModal();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const result = await Storage.loginUser(email, password);
    if (!result.ok) return Toast.show(result.message, 'error');
    syncAuthUI();
    closeAuthModal();
    Toast.show('Login successful', 'success');

    const redirectTo = sessionStorage.getItem('postLoginRedirect');
    if (redirectTo) {
      sessionStorage.removeItem('postLoginRedirect');
      window.location.href = redirectTo;
      return;
    }

    if (getCurrentPage() === 'college.html') initCollegeDetails();
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('signup-name').value,
      email: document.getElementById('signup-email').value,
      password: document.getElementById('signup-password').value
    };

    if (!payload.name.trim() || !payload.email.trim() || payload.password.length < 6) {
      return Toast.show('Please provide valid registration details', 'error');
    }

    const result = await Storage.registerUser(payload);
    if (!result.ok) return Toast.show(result.message, 'error');

    await Storage.loginUser(payload.email, payload.password);
    syncAuthUI();
    closeAuthModal();
    Toast.show('Account created', 'success');
  });
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.add('show');
  document.getElementById('login-tab').classList.toggle('active', tab === 'login');
  document.getElementById('signup-tab').classList.toggle('active', tab === 'signup');
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('show');
}

function syncAuthUI() {
  const user = Storage.getCurrentUser();
  if (elements.authButton) elements.authButton.textContent = user ? 'Logout' : 'Login';
  if (elements.userChip && elements.userChipName) {
    if (user) {
      elements.userChip.classList.remove('hidden');
      elements.userChipName.textContent = user.name;
    } else {
      elements.userChip.classList.add('hidden');
    }
  }
}

function loadImageCache() {
  try {
    return JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveImageCache() {
  try {
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(imageCache));
  } catch {
    // Ignore storage write failures.
  }
}

function isPlaceholderImage(url) {
  return !url || url.includes('ui-avatars.com');
}

async function fetchWikiImageForCollege(college) {
  const titles = [
    college.name,
    `${college.name} ${college.location}`,
    college.name
      .replace(/\b(University|College|Institute|Faculty|Engineering|Medical|Law|Arts)\b/gi, '')
      .trim()
  ].filter(Boolean);

  for (const title of titles) {
    try {
      const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const response = await fetch(endpoint, { headers: { accept: 'application/json' } });
      if (!response.ok) continue;
      const data = await response.json();
      const image = data?.originalimage?.source || data?.thumbnail?.source;
      if (image) return image;
    } catch {
      // Continue with next candidate.
    }
  }
  return null;
}

function ensureCollegeImage(college, imageElement) {
  if (!college || !imageElement) return;
  if (!isPlaceholderImage(college.image)) return;

  const cached = imageCache[college.id];
  if (cached) {
    college.image = cached;
    imageElement.src = cached;
    return;
  }

  fetchWikiImageForCollege(college).then((resolved) => {
    if (!resolved) return;
    imageCache[college.id] = resolved;
    saveImageCache();
    college.image = resolved;
    imageElement.src = resolved;
  });
}

function initHome() {
  setupHomeListeners();
  updateFiltersUI();
  renderColleges();
  renderRecent();
}

function setupHomeListeners() {
  if (!elements.searchInput) return;
  debouncedHandleFiltersChange = debounce(handleFiltersChange, 260);

  elements.searchInput.addEventListener('input', (e) => {
    debouncedHandleFiltersChange();
    showSuggestions(e.target.value);
  });

  elements.categorySelect.addEventListener('change', handleFiltersChange);
  elements.typeSelect.addEventListener('change', handleFiltersChange);
  elements.locationSelect.addEventListener('change', handleFiltersChange);
  elements.minRating.addEventListener('input', (e) => {
    if (elements.ratingVal) elements.ratingVal.textContent = e.target.value;
    handleFiltersChange();
  });
  elements.minFees.addEventListener('input', handleFiltersChange);
  elements.maxFees.addEventListener('input', handleFiltersChange);
  if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', handleFiltersChange);
  }

  if (elements.sortPills?.length) {
    elements.sortPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const sortKey = pill.dataset.sort || 'rating';
        setSortValue(sortKey);
        handleFiltersChange();
      });
    });
  }

  if (elements.searchTrigger) {
    elements.searchTrigger.addEventListener('click', () => {
      elements.searchInput?.focus();
      handleFiltersChange();
      showSuggestions(elements.searchInput?.value || '');
    });
  }

  elements.searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleFiltersChange();
    showSuggestions(elements.searchInput.value);
  });

  setSortValue(getSortValue());
  if (elements.loadMoreBtn) elements.loadMoreBtn.addEventListener('click', loadMore);

  document
    .querySelectorAll('input[name="entrance-exam"], input[name="accreditation"], input[name="facilities"]')
    .forEach((cb) => cb.addEventListener('change', handleFiltersChange));

  const minPlacementSlider = document.getElementById('min-placement');
  if (minPlacementSlider) {
    minPlacementSlider.addEventListener('input', (e) => {
      const el = document.getElementById('placement-val');
      if (el) el.textContent = `${e.target.value}%`;
      handleFiltersChange();
    });
  }

  const minInfraSlider = document.getElementById('min-infrastructure');
  if (minInfraSlider) {
    minInfraSlider.addEventListener('input', (e) => {
      const el = document.getElementById('infrastructure-val');
      if (el) el.textContent = e.target.value;
      handleFiltersChange();
    });
  }

  const resetBtn = document.getElementById('reset-filters');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  document.addEventListener('click', (event) => {
    if (!elements.searchSuggestions) return;
    if (!event.target.closest('.search-wrapper')) {
      elements.searchSuggestions.style.display = 'none';
    }
  });

  const closeBtn = document.querySelector('.close-modal');
  if (closeBtn && elements.compareModal) {
    closeBtn.addEventListener('click', () => elements.compareModal.classList.remove('show'));
  }
}

function handleFiltersChange() {
  const filters = getFilters();
  currentColleges = applyFilters(allColleges, filters, getSortValue());
  visibleCount = 12;
  renderColleges();
}

function getFilters() {
  return {
    search: elements.searchInput?.value || '',
    category: elements.categorySelect?.value || '',
    type: elements.typeSelect?.value || '',
    location: elements.locationSelect?.value || '',
    minRating: parseFloat(elements.minRating?.value || '0') || 0,
    minFees: parseInt(elements.minFees?.value || '0', 10) || 0,
    maxFees: parseInt(elements.maxFees?.value || String(Infinity), 10) || Infinity,
    minPlacement: parseInt(document.getElementById('min-placement')?.value || '0', 10),
    minInfrastructure: parseFloat(document.getElementById('min-infrastructure')?.value || '0'),
    entranceExam: Array.from(document.querySelectorAll('input[name="entrance-exam"]:checked')).map((cb) => cb.value),
    accreditation: Array.from(document.querySelectorAll('input[name="accreditation"]:checked')).map((cb) => cb.value),
    facilities: Array.from(document.querySelectorAll('input[name="facilities"]:checked')).map((cb) => cb.value)
  };
}

function resetFilters() {
  if (!elements.searchInput) return;
  elements.searchInput.value = '';
  elements.categorySelect.value = '';
  elements.typeSelect.value = '';
  elements.locationSelect.value = '';
  elements.minRating.value = '0';
  if (elements.ratingVal) elements.ratingVal.textContent = '0';
  elements.minFees.value = '';
  elements.maxFees.value = '';
  setSortValue('rating');

  document
    .querySelectorAll('input[name="entrance-exam"]:checked, input[name="accreditation"]:checked, input[name="facilities"]:checked')
    .forEach((cb) => { cb.checked = false; });

  const p = document.getElementById('min-placement');
  const i = document.getElementById('min-infrastructure');
  if (p) p.value = '0';
  if (i) i.value = '0';
  const pVal = document.getElementById('placement-val');
  const iVal = document.getElementById('infrastructure-val');
  if (pVal) pVal.textContent = '0%';
  if (iVal) iVal.textContent = '0';

  handleFiltersChange();
}

function updateFiltersUI() {
  if (!elements.categorySelect || !elements.typeSelect || !elements.locationSelect) return;
  const categories = [...new Set(allColleges.map((c) => c.category))];
  const types = [...new Set(allColleges.map((c) => c.type))];
  const locations = [...new Set(allColleges.map((c) => c.location))];

  elements.categorySelect.innerHTML = '<option value="">All Categories</option>' +
    categories.map((c) => `<option value="${c}">${c}</option>`).join('');
  elements.typeSelect.innerHTML = '<option value="">All Types</option>' +
    types.map((t) => `<option value="${t}">${t}</option>`).join('');
  elements.locationSelect.innerHTML = '<option value="">All Locations</option>' +
    locations.map((l) => `<option value="${l}">${l}</option>`).join('');
}

function showSuggestions(query) {
  if (!elements.searchSuggestions) return;
  if (query.length < 2) {
    elements.searchSuggestions.style.display = 'none';
    return;
  }

  const matches = allColleges
    .filter((c) => c?.name?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  elements.searchSuggestions.innerHTML = '';
  matches.forEach((college) => {
    const item = document.createElement('div');
    item.textContent = college.name;
    item.addEventListener('click', () => {
      window.location.href = `college.html?id=${college.id}`;
    });
    elements.searchSuggestions.appendChild(item);
  });
  elements.searchSuggestions.style.display = matches.length ? 'block' : 'none';
}

function renderColleges() {
  if (!elements.collegesGrid) return;
  elements.collegesGrid.innerHTML = '';

  const toShow = currentColleges.slice(0, visibleCount);
  if (toShow.length === 0) {
    showError(elements.collegesGrid, 'No colleges found.');
    if (elements.loadMoreBtn) elements.loadMoreBtn.style.display = 'none';
    return;
  }

  toShow.forEach((college) => elements.collegesGrid.appendChild(createCollegeCard(college, true)));
  updateLoadMoreBtn();
  setupScrollAnimations();
}

function createCollegeCard(college, includeCompare) {
  const card = document.createElement('article');
  card.className = `college-card${college.isFeature ? ' featured-card' : ''}`;
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Open details for ${college.name}`);
  const isFav = Storage.isFavorite(college.id);
  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${college.image}" alt="${escapeHTML(college.name)}" class="card-image" loading="lazy">
      <span class="category-badge">${escapeHTML(college.category)}</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">${escapeHTML(college.name)}</h3>
      <div class="card-meta-row">
        <span><i class="fas fa-map-marker-alt"></i> ${escapeHTML(college.location)}</span>
        <span><i class="fas fa-star"></i> ${college.rating}</span>
      </div>
      <div class="fees-display"><strong>&#8377;${college.fees.toLocaleString()}</strong>/year</div>
      <div class="card-actions">
        <a href="college.html?id=${college.id}" class="btn btn-primary">View</a>
        <button class="btn btn-secondary ${isFav ? 'btn-danger' : ''}" data-action="favorite" onclick="toggleFavorite(${college.id}, this)">
          <i class="fas ${isFav ? 'fa-heart-broken' : 'fa-heart'}"></i>
        </button>
        ${includeCompare ? `<button class="btn btn-secondary" data-action="compare" onclick="addToCompare(${college.id})"><i class="fas fa-balance-scale"></i></button>` : ''}
      </div>
    </div>`;

  const detailUrl = `college.html?id=${college.id}`;
  card.addEventListener('click', (event) => {
    if (event.target.closest('.card-actions')) return;
    window.location.href = detailUrl;
  });
  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    window.location.href = detailUrl;
  });
  card.querySelectorAll('.card-actions a, .card-actions button').forEach((el) => {
    el.addEventListener('click', (event) => event.stopPropagation());
  });

  const imageElement = card.querySelector('.card-image');
  ensureCollegeImage(college, imageElement);
  return card;
}

function loadMore() {
  visibleCount += 8;
  renderColleges();
}

function updateLoadMoreBtn() {
  if (!elements.loadMoreBtn) return;
  elements.loadMoreBtn.style.display = currentColleges.length > visibleCount ? 'block' : 'none';
}

function renderRecent() {
  if (!elements.recentContainer || !elements.recentSection) return;
  const recent = Recent.getViewedColleges(allColleges);
  if (recent.length === 0) {
    elements.recentSection.classList.add('hidden');
    return;
  }
  elements.recentSection.classList.remove('hidden');
  elements.recentContainer.innerHTML = '';
  recent.forEach((college) => {
    const card = createCollegeCard(college, false);
    card.style.minWidth = 'min(260px, 84vw)';
    elements.recentContainer.appendChild(card);
  });
}

function initFavorites() {
  if (!elements.favoritesGrid) return;
  elements.favoritesGrid.innerHTML = '';
  const favIds = Storage.getFavorites();
  const colleges = allColleges.filter((c) => favIds.includes(c.id));
  if (!colleges.length) return showError(elements.favoritesGrid, 'No favorites yet.');
  colleges.forEach((c) => elements.favoritesGrid.appendChild(createCollegeCard(c, false)));
}

async function initCollegeDetails() {
  if (!elements.collegeDetailContainer) return;
  showLoading(elements.collegeDetailContainer, 'Loading college details...');

  const id = Number(new URLSearchParams(window.location.search).get('id'));
  if (!id) return showError(elements.collegeDetailContainer, 'Invalid college link.');

  let college;
  try {
    college = await API.getCollegeById(id);
  } catch (error) {
    console.error('College details fetch failure:', error);
    return showError(elements.collegeDetailContainer, 'Unable to load details right now.');
  }

  if (!college || !college.name) return showError(elements.collegeDetailContainer, 'College not found.');

  if (!Storage.isAuthenticated()) {
    elements.collegeDetailContainer.innerHTML = `
      <section class="locked-card">
        <h2>Login Required</h2>
        <p>You can browse colleges, but detailed profiles require authentication.</p>
        <button id="open-auth-cta" class="btn btn-primary">Sign In to Continue</button>
      </section>`;
    document.getElementById('open-auth-cta')?.addEventListener('click', () => openAuthModal('login'));
    openAuthModal('login');
    return;
  }

  Recent.addViewed(college.id);
  const bcCategory = document.getElementById('bc-category');
  const bcName = document.getElementById('bc-name');
  if (bcCategory) bcCategory.textContent = college.category;
  if (bcName) bcName.textContent = college.name;

  const isFav = Storage.isFavorite(college.id);
  const courses = getCourseHighlights(college);
  const facilities = Array.isArray(college.facilities) ? college.facilities.join(', ') : 'N/A';
  const applyUrl = getCollegeApplyUrl(college);
  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  elements.collegeDetailContainer.innerHTML = `
    <div class="college-hero">
      <img src="${college.image}" alt="${escapeHTML(college.name)}">
      <div class="details-info">
        <h1>${escapeHTML(college.name)}</h1>
        <p><i class="fas fa-map-marker-alt"></i> ${escapeHTML(college.location)}</p>
        <p class="price">&#8377;${college.fees.toLocaleString()}/year</p>
        <div class="card-actions">
          <a class="btn btn-primary apply-now-btn" href="${applyUrl || '#'}" target="_blank" rel="noopener noreferrer" data-has-link="${Boolean(applyUrl)}">
            Apply Now
          </a>
          <button class="btn btn-secondary ${isFav ? 'btn-danger' : ''}" onclick="toggleFavorite(${college.id}, this)">
            ${isFav ? 'Remove Favorite' : 'Add to Favorites'}
          </button>
        </div>
      </div>
    </div>
    <div class="stats-box">
      <div class="stat-card"><i class="fas fa-briefcase"></i><div><h4>${college.placement}%</h4><p>Placement</p></div></div>
      <div class="stat-card"><i class="fas fa-star"></i><div><h4>${college.rating}</h4><p>Rating</p></div></div>
      <div class="stat-card"><i class="fas fa-building"></i><div><h4>${college.infrastructure}</h4><p>Infrastructure</p></div></div>
    </div>
    <div class="details-body">
      <h3>About</h3>
      <p>${buildCollegeDescription(college)}</p>
      <h3>Courses</h3>
      <ul class="details-list">
        ${courses.map((course) => `<li>${course}</li>`).join('')}
      </ul>
      <h3>Details</h3>
      <ul class="details-list">
        <li><strong>Type:</strong> ${college.type}</li>
        <li><strong>Accreditation:</strong> ${college.accreditation || 'N/A'}</li>
        <li><strong>Entrance Exam:</strong> ${college.entranceExam || 'N/A'}</li>
        <li><strong>Facilities:</strong> ${facilities}</li>
      </ul>
    </div>
  `;
  const applyBtn = elements.collegeDetailContainer.querySelector('.apply-now-btn');
  if (applyBtn && applyBtn.dataset.hasLink !== 'true') {
    applyBtn.addEventListener('click', (event) => {
      event.preventDefault();
      Toast.show('Official application link is unavailable for this college.', 'info');
    });
  }
  const heroImage = elements.collegeDetailContainer.querySelector('.college-hero img');
  ensureCollegeImage(college, heroImage);
  setupScrollAnimations();

  const recContainer = document.querySelector('#recommendations-container');
  if (recContainer) showLoading(recContainer, 'Loading recommendations...');
  try {
    const recs = await getRecommendations(college.id);
    await Promise.all(
      (recs || []).map(async (item) => {
        if (!item || !isPlaceholderImage(item.image)) return;
        const cached = imageCache[item.id];
        if (cached) {
          item.image = cached;
          return;
        }
        const resolved = await fetchWikiImageForCollege(item);
        if (resolved) {
          imageCache[item.id] = resolved;
          item.image = resolved;
        }
      })
    );
    saveImageCache();
    renderRecommendations(recs || [], '#recommendations-container', 'Similar Colleges');
  } catch (error) {
    console.error('Recommendation failure:', error);
    if (recContainer) showError(recContainer, 'Recommendations unavailable.');
  }
}

function initRankings() {
  if (!elements.rankCategory || !elements.placementRanking || !elements.ratingRanking || !elements.infrastructureRanking) return;

  const render = () => {
    const selected = elements.rankCategory.value;
    const filtered = selected ? allColleges.filter((c) => c.category === selected) : allColleges;
    elements.placementRanking.innerHTML = buildRankRows(filtered, 'placement', '%');
    elements.ratingRanking.innerHTML = buildRankRows(filtered, 'rating', '');
    elements.infrastructureRanking.innerHTML = buildRankRows(filtered, 'infrastructure', '');
  };

  elements.rankCategory.addEventListener('change', render);
  render();
}

function buildRankRows(list, key, suffix) {
  return [...list]
    .filter((item) => item && typeof item[key] === 'number')
    .sort((a, b) => b[key] - a[key])
    .slice(0, 5)
    .map((college, index) => `
      <div class="rank-row">
        <span>#${index + 1} ${college.name}</span>
        <strong>${college[key]}${suffix}</strong>
      </div>`)
    .join('');
}

function initProfile() {
  if (!elements.favoritesList || !elements.recentlyViewedList) return;

  renderProfileData();
}

function renderProfileData() {
  const user = Storage.getCurrentUser();
  const favIds = Storage.getFavorites();
  const viewedIds = Recent.getRecentlyViewed();
  const favColleges = favIds.map((id) => allColleges.find((c) => c.id === id)).filter(Boolean);
  const viewedColleges = viewedIds.map((id) => allColleges.find((c) => c.id === id)).filter(Boolean);

  if (elements.profileName) elements.profileName.textContent = user?.name || 'N/A';
  if (elements.profileEmail) elements.profileEmail.textContent = user?.email || 'N/A';
  if (elements.profileMemberSince) {
    const since = Number(user?.id);
    elements.profileMemberSince.textContent = Number.isFinite(since) && since > 0
      ? new Date(since).toLocaleDateString()
      : 'N/A';
  }

  if (elements.favCountStat) elements.favCountStat.textContent = String(favIds.length);
  if (elements.viewedCount) elements.viewedCount.textContent = String(viewedIds.length);
  if (elements.avgRating) {
    elements.avgRating.textContent = favColleges.length
      ? (favColleges.reduce((sum, c) => sum + c.rating, 0) / favColleges.length).toFixed(1)
      : 'N/A';
  }

  elements.favoritesList.innerHTML = favColleges.length
    ? favColleges.map((c) => `<div class="profile-row"><span>${c.name}</span><a class="btn btn-primary" href="college.html?id=${c.id}">View</a></div>`).join('')
    : '<div class="empty-state">No favorites yet.</div>';

  elements.recentlyViewedList.innerHTML = viewedColleges.length
    ? viewedColleges.map((c) => `<div class="profile-row"><span>${c.name}</span><a class="btn btn-primary" href="college.html?id=${c.id}">View</a></div>`).join('')
    : '<div class="empty-state">No recently viewed colleges.</div>';
}

function toggleFavorite(id, btn) {
  if (!Storage.isAuthenticated()) {
    Toast.show('Login required to manage favorites', 'info');
    openAuthModal('login');
    return;
  }

  if (Storage.isFavorite(id)) Storage.removeFavorite(id);
  else Storage.addFavorite(id);
  updateFavCount();

  if (btn) {
    const isFav = Storage.isFavorite(id);
    btn.classList.toggle('btn-danger', isFav);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = `fas ${isFav ? 'fa-heart-broken' : 'fa-heart'}`;
    } else {
      btn.textContent = isFav ? 'Remove Favorite' : 'Add to Favorites';
    }
  }

  if (elements.favoritesGrid) initFavorites();
}

function getCourseHighlights(college) {
  const byCategory = {
    Engineering: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Data Science'],
    Medical: ['MBBS', 'Nursing', 'Pharmacy', 'Allied Health', 'Clinical Research'],
    Law: ['BA LLB', 'LLB', 'Corporate Law', 'Criminal Law', 'Constitutional Law'],
    Arts: ['Economics', 'Political Science', 'English', 'Psychology', 'Sociology']
  };
  const seed = byCategory[college.category] || ['General Studies', 'Applied Research', 'Professional Programs'];
  const courseCount = Math.max(3, Math.min(seed.length, Number(college.programs) || 3));
  return seed.slice(0, courseCount);
}

function buildCollegeDescription(college) {
  const avgPackage = Number(college.avgPackage || 0);
  const packageLabel = avgPackage > 0 ? `Average package is around \u20b9${avgPackage.toLocaleString()} per year.` : '';
  return `${college.name} is a ${college.type.toLowerCase()} ${college.category.toLowerCase()} institution in ${college.location}, established in ${college.established}. It offers ${college.programs || 'multiple'} programs with a ${college.placement}% placement rate and a ${college.rating}/5 rating. ${packageLabel}`.trim();
}

function addToCompare(id) {
  const success = Compare.add(id, allColleges);
  if (!success) return Toast.show('Compare limit reached or already added', 'info');
  if (!elements.compareModal || !elements.compareTableBody) {
    return Toast.show('Compare is available only on browse page', 'info');
  }
  Compare.renderTable(elements.compareTableBody);
  elements.compareModal.classList.add('show');
}

function getSortValue() {
  return elements.sortSelect?.value || 'rating';
}

function setSortValue(value) {
  if (elements.sortSelect) elements.sortSelect.value = value;
  if (!elements.sortPills?.length) return;
  elements.sortPills.forEach((pill) => {
    const active = pill.dataset.sort === value;
    pill.classList.toggle('active', active);
    pill.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function setupScrollAnimations() {
  const targets = document.querySelectorAll('.college-card, .section, .stats-box, .details-body, .ranking-section, .profile-panel, .empty-state');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('in-view'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries, ref) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          ref.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );
  }

  targets.forEach((target, index) => {
    if (target.classList.contains('in-view')) return;
    target.classList.add('reveal');
    target.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
    revealObserver.observe(target);
  });
}

function getCollegeApplyUrl(college) {
  if (!college) return null;
  if (college.website) return college.website;

  const knownSites = {
    'IIT Delhi': 'https://home.iitd.ac.in/',
    'IIT Bombay': 'https://www.iitb.ac.in/',
    'IIT Madras': 'https://www.iitm.ac.in/',
    'AIIMS Delhi': 'https://www.aiims.edu/',
    'NLSIU Bangalore': 'https://www.nls.ac.in/',
    'Delhi University - Delhi College of Arts': 'https://www.du.ac.in/'
  };
  return knownSites[college.name] || null;
}

function updateFavCount() {
  if (elements.favCount) elements.favCount.textContent = String(Storage.getFavorites().length);
}

function toggleTheme() {
  const next = Storage.getTheme() === 'dark' ? 'light' : 'dark';
  Storage.setTheme(next);
  loadTheme();
}

function loadTheme() {
  const theme = Storage.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  if (elements.themeToggle) {
    elements.themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

function showLoading(target, message = 'Loading...') {
  if (!target) return;
  target.innerHTML = `<div class="empty-state">${message}</div>`;
}

function showError(target, message = 'Something went wrong.') {
  if (!target) return;
  target.innerHTML = `<div class="empty-state">${message}</div>`;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

window.toggleFavorite = toggleFavorite;
window.addToCompare = addToCompare;
