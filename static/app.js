/**
 * Global Financial Inclusion Policy Lab - Complete Single Page Application
 * Production-ready UX, Grade 8 plain English, WCAG 2.1 AA accessible,
 * Interactive Choropleth Maps, Country Comparator, Guided Clustering Playground,
 * Citizen Action Hub, Policy Simulator, Archetypes/PCA, and 1-Page Printable Reports.
 */

// Global State
const state = {
  theme: localStorage.getItem('theme') || 'dark',
  currentPage: 'page-home',
  audienceMode: 'citizen', // 'citizen' or 'analyst'
  mapMetric: 'cluster',
  mapClusterFilter: 'all',
  currentInspectedCountry: 'India',
  countriesData: [],
  recommendedModel: null,
  benchmarksData: null,
  pcaData: null,
  stabilityData: null,
  pcaDimension: 2,
  guidedK: 4,
  guidedMetric: 'euclidean',
  selectedCountry: 'India',
  simCountry: 'Nigeria',
  tourStep: 1,
  matrixPage: 1,
  matrixPageSize: 15,
  matrixSortKey: 'account_pct',
  matrixSortAsc: false,
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initClock();
  initNavigation();
  initAudienceMode();
  initCountrySearchAutocomplete();
  initOnboardingTour();
  initLiveTicker();

  // Load baseline datasets & start on home page
  preloadBaselineData().then(() => {
    switchPage(state.currentPage);
  });
});

// ============================================================================
// 1. THEME & UTILITIES
// ============================================================================
function initTheme() {
  document.body.setAttribute('data-theme', state.theme);
  updateThemeButtonUI();

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', state.theme);
      localStorage.setItem('theme', state.theme);
      updateThemeButtonUI();
      redrawCurrentCharts();
    });
  }
}

function updateThemeButtonUI() {
  const icon = document.querySelector('.theme-toggle-icon');
  const text = document.getElementById('theme-text');
  if (icon && text) {
    if (state.theme === 'dark') {
      icon.textContent = '🌙';
      text.textContent = 'Dark';
    } else {
      icon.textContent = '☀️';
      text.textContent = 'Light';
    }
  }
}

function getPlotlyTheme() {
  const isDark = state.theme === 'dark';
  return {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: isDark ? '#f8fafc' : '#0f172a',
      size: 12
    },
    gridcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    zerolinecolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
  };
}

function initClock() {
  const timeEl = document.getElementById('sidebar-time');
  function updateTime() {
    const now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function fmtPct(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(1) + '%';
}

function animateNumber(elementId, target, suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const targetNum = parseFloat(target);
  if (isNaN(targetNum)) {
    el.textContent = target + suffix;
    return;
  }
  let current = 0;
  const duration = 600;
  const steps = 20;
  const increment = targetNum / steps;
  const interval = setInterval(() => {
    current += increment;
    if (current >= targetNum) {
      el.textContent = targetNum.toFixed(1) + suffix;
      clearInterval(interval);
    } else {
      el.textContent = current.toFixed(1) + suffix;
    }
  }, duration / steps);
}

// ============================================================================
// 2. BASELINE DATA PRELOAD
// ============================================================================
async function preloadBaselineData() {
  try {
    const [countriesRes, recRes] = await Promise.all([
      fetch('/api/countries?year=2024'),
      fetch('/api/clustering/recommended')
    ]);

    if (countriesRes.ok) {
      state.countriesData = await countriesRes.json();
    }
    if (recRes.ok) {
      state.recommendedModel = await recRes.json();
    }
  } catch (err) {
    console.warn('Preload warning:', err);
  }
}

// ============================================================================
// 3. NAVIGATION & ROUTING
// ============================================================================
function initNavigation() {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.getAttribute('data-page');
      switchPage(pageId);
    });
  });

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('main-sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  window.addEventListener('hashchange', handleHashChange);
  if (window.location.hash) {
    handleHashChange();
  }
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  const hashMap = {
    'home': 'page-home',
    'worldmap': 'page-worldmap',
    'compare': 'page-compare',
    'guided': 'page-guided',
    'citizen-hub': 'page-citizen',
    'simulator': 'page-simulator',
    'clustering': 'page-cluster',
    'explorer': 'page-explorer',
    'trends': 'page-trends',
    'how': 'page-how',
    'glossary': 'page-glossary',
    'about': 'page-about'
  };
  if (hashMap[hash]) {
    switchPage(hashMap[hash]);
  }
}

function switchPage(pageId) {
  state.currentPage = pageId;

  document.querySelectorAll('.dashboard-page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    if (item.getAttribute('data-page') === pageId) {
      item.classList.add('active');
      const label = item.querySelector('.nav-label');
      if (label) {
        document.getElementById('current-page-title').textContent = label.textContent;
      }
    } else {
      item.classList.remove('active');
    }
  });

  const sidebar = document.getElementById('main-sidebar');
  if (sidebar) sidebar.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  onPageActivated(pageId);
}

function onPageActivated(pageId) {
  if (pageId === 'page-home') {
    initHomePage();
  } else if (pageId === 'page-worldmap') {
    initWorldMap();
  } else if (pageId === 'page-compare') {
    initComparator();
  } else if (pageId === 'page-guided') {
    initGuidedPlayground();
  } else if (pageId === 'page-citizen') {
    initCitizenHub();
  } else if (pageId === 'page-simulator') {
    initSimulator();
  } else if (pageId === 'page-cluster') {
    initClusterArchetypes();
  } else if (pageId === 'page-explorer') {
    initGlobalExplorerMatrix();
  } else if (pageId === 'page-trends') {
    initLongitudinalTrends();
  } else if (pageId === 'page-how') {
    initHowWeDidIt();
  }
}

function redrawCurrentCharts() {
  onPageActivated(state.currentPage);
}

// ============================================================================
// 4. AUDIENCE MODE & LIVE FEED
// ============================================================================
function initAudienceMode() {
  const citizenBtn = document.getElementById('mode-citizen-btn');
  const analystBtn = document.getElementById('mode-analyst-btn');

  if (citizenBtn && analystBtn) {
    citizenBtn.addEventListener('click', () => {
      state.audienceMode = 'citizen';
      citizenBtn.classList.add('active');
      analystBtn.classList.remove('active');
      document.body.setAttribute('data-mode', 'citizen');
    });

    analystBtn.addEventListener('click', () => {
      state.audienceMode = 'analyst';
      analystBtn.classList.add('active');
      citizenBtn.classList.remove('active');
      document.body.setAttribute('data-mode', 'analyst');
    });
  }
}

function initLiveTicker() {
  async function fetchFeed() {
    try {
      const res = await fetch('/api/live-feed');
      if (res.ok) {
        const data = await res.json();
        const bannerText = document.querySelector('.live-status-text');
        if (bannerText && data.feed && data.feed.length > 0) {
          const item = data.feed[0];
          bannerText.textContent = `${item.region}: ${item.text}`;
        }
      }
    } catch (e) {
      // quiet fallback
    }
  }
  fetchFeed();
  setInterval(fetchFeed, 30000);
}

// ============================================================================
// 5. QUICK COUNTRY SEARCH AUTOCOMPLETE
// ============================================================================
function initCountrySearchAutocomplete() {
  const input = document.getElementById('quick-country-search');
  const dropdown = document.getElementById('country-search-results');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 1) {
      dropdown.classList.remove('open');
      dropdown.innerHTML = '';
      return;
    }

    const matches = state.countriesData.filter(c =>
      c.country.toLowerCase().includes(query) || (c.code && c.code.toLowerCase().includes(query))
    ).slice(0, 8);

    if (matches.length === 0) {
      dropdown.innerHTML = '<div class="search-autocomplete-item"><span class="c-name">No countries found</span></div>';
      dropdown.classList.add('open');
      return;
    }

    dropdown.innerHTML = matches.map(c => `
      <div class="search-autocomplete-item" data-country="${esc(c.country)}">
        <div>
          <span class="c-name">${esc(c.country)}</span>
          <span class="c-region">(${esc(c.region || 'World Bank')})</span>
        </div>
        <span class="c-badge">Account: ${fmtPct(c.account_pct)}</span>
      </div>
    `).join('');
    dropdown.classList.add('open');

    dropdown.querySelectorAll('.search-autocomplete-item').forEach(el => {
      el.addEventListener('click', () => {
        const cName = el.getAttribute('data-country');
        if (cName) {
          dropdown.classList.remove('open');
          input.value = '';
          showCountryModal(cName);
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

// ============================================================================
// 6. PAGE 1: HOME PAGE
// ============================================================================
function initHomePage() {
  // Animate Macro KPIs
  animateNumber('home-kpi-account', 70.7, '%');
  animateNumber('home-kpi-mobile', 41.8, '%');
  animateNumber('home-kpi-resil', 59.2, '%');
}

// ============================================================================
// 7. PAGE 2: INTERACTIVE WORLD CHOROPLETH MAP
// ============================================================================
async function initWorldMap() {
  const container = document.getElementById('chart-world-map');
  if (!container) return;

  if (!state.recommendedModel || !state.recommendedModel.country_assignments || state.recommendedModel.country_assignments.length === 0) {
    try {
      const res = await fetch('/api/clustering/recommended');
      if (res.ok) state.recommendedModel = await res.json();
    } catch (e) {
      console.warn(e);
    }
  }

  // Fallback to interactive k=4 if needed
  if (!state.recommendedModel || !state.recommendedModel.country_assignments || state.recommendedModel.country_assignments.length === 0) {
    try {
      const res = await fetch('/api/clustering/interactive?k=4&metric=euclidean');
      if (res.ok) {
        const d = await res.json();
        if (!state.recommendedModel) state.recommendedModel = {};
        state.recommendedModel.country_assignments = d.country_assignments;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Segmented Metric View Pills
  document.querySelectorAll('.map-view-pill').forEach(pill => {
    if (!pill.hasListener) {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.map-view-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.mapMetric = pill.getAttribute('data-metric');
        renderWorldMapChoropleth();
      });
      pill.hasListener = true;
    }
  });

  // Archetype Filter Chips
  document.querySelectorAll('.arch-filter-chip').forEach(chip => {
    if (!chip.hasListener) {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.arch-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.mapClusterFilter = chip.getAttribute('data-cluster');
        renderWorldMapChoropleth();
      });
      chip.hasListener = true;
    }
  });

  // Archetype Legend Cards (Clicking highlights cluster)
  document.querySelectorAll('.archetypes-legend-grid .legend-card').forEach(card => {
    if (!card.hasListener) {
      card.addEventListener('click', () => {
        const cIdx = card.getAttribute('data-cluster');
        const targetChip = document.querySelector(`.arch-filter-chip[data-cluster="${cIdx}"]`);
        if (targetChip) targetChip.click();
      });
      card.hasListener = true;
    }
  });

  // Open Full Scorecard Modal button inside Inspector
  const openModalBtn = document.getElementById('insp-open-modal-btn');
  if (openModalBtn && !openModalBtn.hasListener) {
    openModalBtn.addEventListener('click', () => {
      if (state.currentInspectedCountry) {
        showCountryModal(state.currentInspectedCountry);
      }
    });
    openModalBtn.hasListener = true;
  }

  renderWorldMapChoropleth();
  updateMapInspector(state.currentInspectedCountry || 'India');
}

function renderWorldMapChoropleth() {
  const container = document.getElementById('chart-world-map');
  if (!container) return;

  const assignments = (state.recommendedModel && state.recommendedModel.country_assignments) || [];
  if (assignments.length === 0) {
    container.innerHTML = '<div class="loading-state">Loading World Map data...</div>';
    return;
  }

  const metric = state.mapMetric || 'cluster';
  const filter = state.mapClusterFilter || 'all';

  const locations = [];
  const zValues = [];
  const hoverTexts = [];
  const customData = [];

  const archetypePalette = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b'];
  const archetypeNameMap = [
    'Digitally Leaping Cash Economists',
    'Universal High-Resilience Systems',
    'Severe Exclusion Frontiers',
    'Banked but Liquidity-Constrained'
  ];

  assignments.forEach(row => {
    if (row.code && row.code.length === 3) {
      locations.push(row.code);
      customData.push(row.country);

      const clusterNum = Number(row.cluster_id);
      const isFilteredOut = filter !== 'all' && Number(filter) !== clusterNum;

      let val;
      let hoverStr;

      if (metric === 'cluster') {
        val = isFilteredOut ? 0 : clusterNum + 1; // 0 for dimmed, 1-4 for clusters
        const dotColor = isFilteredOut ? '#64748b' : archetypePalette[clusterNum];
        hoverStr = `<b>${esc(row.country)}</b> (${row.code})<br>` +
          `<span style="color:${dotColor}">●</span> <b>${esc(row.cluster_name || archetypeNameMap[clusterNum])}</b><br>` +
          `• Account Ownership: <b>${fmtPct(row.account_pct)}</b><br>` +
          `• Mobile Money: <b>${fmtPct(row.mobile_pct)}</b><br>` +
          `• Emergency Resilience: <b>${fmtPct(row.emergency_pct)}</b><br>` +
          `<span style="color:#0ea5e9;font-size:10px;">Click to inspect details →</span>`;
      } else if (metric === 'account') {
        val = isFilteredOut ? 0 : row.account_pct;
        hoverStr = `<b>${esc(row.country)}</b> (${row.code})<br>Overall Account Ownership: <b>${fmtPct(row.account_pct)}</b><br>Group: ${esc(row.cluster_name)}`;
      } else if (metric === 'mobile') {
        val = isFilteredOut ? 0 : row.mobile_pct;
        hoverStr = `<b>${esc(row.country)}</b> (${row.code})<br>Mobile Money Penetration: <b>${fmtPct(row.mobile_pct)}</b><br>Group: ${esc(row.cluster_name)}`;
      } else if (metric === 'resilience') {
        val = isFilteredOut ? 0 : row.emergency_pct;
        hoverStr = `<b>${esc(row.country)}</b> (${row.code})<br>Emergency Resilience: <b>${fmtPct(row.emergency_pct)}</b><br>Group: ${esc(row.cluster_name)}`;
      }

      zValues.push(val);
      hoverTexts.push(hoverStr);
    }
  });

  const pTheme = getPlotlyTheme();
  let colorscale;
  let showscale = false;
  let zmin = undefined;
  let zmax = undefined;

  if (metric === 'cluster') {
    colorscale = [
      [0.0, state.theme === 'dark' ? '#182234' : '#e2e8f0'],
      [0.19, state.theme === 'dark' ? '#182234' : '#e2e8f0'],
      [0.2, '#10b981'],
      [0.39, '#10b981'],
      [0.4, '#3b82f6'],
      [0.59, '#3b82f6'],
      [0.6, '#f43f5e'],
      [0.79, '#f43f5e'],
      [0.8, '#f59e0b'],
      [1.0, '#f59e0b']
    ];
    zmin = 0;
    zmax = 4;
  } else {
    colorscale = [
      [0.0, state.theme === 'dark' ? '#182234' : '#e2e8f0'],
      [0.2, '#312e81'],
      [0.4, '#4338ca'],
      [0.6, '#0284c7'],
      [0.8, '#06b6d4'],
      [1.0, '#10b981']
    ];
    showscale = true;
    zmin = 0;
    zmax = 100;
  }

  const trace = {
    type: 'choropleth',
    locations: locations,
    z: zValues,
    text: hoverTexts,
    hoverinfo: 'text',
    customdata: customData,
    colorscale: colorscale,
    zmin: zmin,
    zmax: zmax,
    showscale: showscale,
    colorbar: {
      title: { text: '% Rate', font: { size: 11, color: pTheme.font.color } },
      tickfont: { color: pTheme.font.color, size: 10 },
      thickness: 12,
      len: 0.5,
      x: 0.98,
      y: 0.5
    },
    marker: {
      line: {
        color: state.theme === 'dark' ? '#0f172a' : '#ffffff',
        width: 0.6
      }
    }
  };

  const layout = {
    ...pTheme,
    margin: { t: 5, r: 5, b: 5, l: 5 },
    geo: {
      showframe: false,
      showcoastlines: true,
      coastlinecolor: state.theme === 'dark' ? '#334155' : '#cbd5e1',
      projection: { type: 'natural earth' },
      bgcolor: 'transparent',
      lakecolor: 'transparent',
      landcolor: state.theme === 'dark' ? '#182234' : '#e2e8f0',
      subunitcolor: state.theme === 'dark' ? '#1e293b' : '#f1f5f9'
    }
  };

  Plotly.react(container, [trace], layout, { responsive: true, displayModeBar: false });

  // Map Click Listener -> Updates Inspector
  container.removeAllListeners && container.removeAllListeners('plotly_click');
  container.on('plotly_click', (data) => {
    if (data && data.points && data.points[0]) {
      const countryName = data.points[0].customdata;
      if (countryName) {
        state.currentInspectedCountry = countryName;
        updateMapInspector(countryName);
      }
    }
  });

  // Map Hover Listener -> Updates top status pill
  container.removeAllListeners && container.removeAllListeners('plotly_hover');
  container.on('plotly_hover', (data) => {
    if (data && data.points && data.points[0]) {
      const countryName = data.points[0].customdata;
      const echoEl = document.getElementById('map-hover-echo');
      if (echoEl && countryName) {
        echoEl.textContent = `Hovering: ${countryName}`;
      }
    }
  });
}

async function updateMapInspector(countryName) {
  state.currentInspectedCountry = countryName;

  const nameEl = document.getElementById('insp-name');
  const codeEl = document.getElementById('insp-code');
  const regEl = document.getElementById('insp-region');
  const archTag = document.getElementById('insp-archetype-tag');

  const accVal = document.getElementById('insp-acc-val');
  const accBar = document.getElementById('insp-acc-bar');
  const mobVal = document.getElementById('insp-mob-val');
  const mobBar = document.getElementById('insp-mob-bar');
  const fiVal = document.getElementById('insp-fi-val');
  const fiBar = document.getElementById('insp-fi-bar');
  const saveVal = document.getElementById('insp-save-val');
  const saveBar = document.getElementById('insp-save-bar');
  const resilVal = document.getElementById('insp-resil-val');
  const resilBar = document.getElementById('insp-resil-bar');

  const strText = document.getElementById('insp-strength-text');
  const gapText = document.getElementById('insp-gap-text');

  if (!nameEl) return;
  nameEl.textContent = countryName;

  try {
    const res = await fetch(`/api/country-profile/${encodeURIComponent(countryName)}`);
    if (!res.ok) throw new Error('Not found');
    const p = await res.json();

    if (codeEl) codeEl.textContent = p.code || '—';
    if (regEl) regEl.textContent = p.region || 'World Bank';
    if (archTag) archTag.textContent = p.cluster_name || `Archetype ${p.cluster + 1}`;

    const acc = p.account_pct || 0;
    const mob = p.mobile_pct || 0;
    const fi = p.fiaccount_pct || 0;
    const sav = p.saved_pct || 0;
    const resi = p.emergency_pct || 0;

    if (accVal) accVal.textContent = acc.toFixed(1) + '%';
    if (accBar) accBar.style.width = Math.min(100, acc) + '%';
    if (mobVal) mobVal.textContent = mob.toFixed(1) + '%';
    if (mobBar) mobBar.style.width = Math.min(100, mob) + '%';
    if (fiVal) fiVal.textContent = fi.toFixed(1) + '%';
    if (fiBar) fiBar.style.width = Math.min(100, fi) + '%';
    if (saveVal) saveVal.textContent = sav.toFixed(1) + '%';
    if (saveBar) saveBar.style.width = Math.min(100, sav) + '%';
    if (resilVal) resilVal.textContent = resi.toFixed(1) + '%';
    if (resilBar) resilBar.style.width = Math.min(100, resi) + '%';

    if (strText) {
      strText.textContent = p.strengths && p.strengths.length > 0 ? p.strengths[0] : 'Broad baseline financial connectivity';
    }
    if (gapText) {
      gapText.textContent = p.gaps && p.gaps.length > 0 ? p.gaps[0] : 'No severe statistical outlier gaps identified';
    }
  } catch (err) {
    console.warn('Inspector update:', err);
  }
}

// ============================================================================
// 8. PAGE 3: COUNTRY COMPARATOR TOOL
// ============================================================================
async function initComparator() {
  const c1Sel = document.getElementById('compare-c1');
  const c2Sel = document.getElementById('compare-c2');
  const c3Sel = document.getElementById('compare-c3');
  const btn = document.getElementById('run-compare-btn');

  if (!c1Sel || !c2Sel || !c3Sel) return;

  // Populate dropdowns if empty
  if (c1Sel.options.length <= 1 && state.countriesData.length > 0) {
    const sorted = [...state.countriesData].sort((a, b) => a.country.localeCompare(b.country));
    const opts = sorted.map(c => `<option value="${esc(c.country)}">${esc(c.country)}</option>`).join('');

    c1Sel.innerHTML = opts;
    c2Sel.innerHTML = opts;
    c3Sel.innerHTML = '<option value="">-- None --</option>' + opts;

    c1Sel.value = 'India';
    c2Sel.value = 'Kenya';
  }

  if (btn && !btn.hasListener) {
    btn.addEventListener('click', runComparison);
    btn.hasListener = true;
  }

  runComparison();
}

async function runComparison() {
  const c1 = document.getElementById('compare-c1').value;
  const c2 = document.getElementById('compare-c2').value;
  const c3 = document.getElementById('compare-c3').value;

  const listEl = document.getElementById('compare-takeaways-list');
  const chartEl = document.getElementById('chart-compare-bars');

  if (listEl) listEl.innerHTML = '<div class="loading-state">Comparing economies...</div>';

  try {
    const url = `/api/compare-countries?c1=${encodeURIComponent(c1)}&c2=${encodeURIComponent(c2)}&c3=${encodeURIComponent(c3)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Comparison failed');
    const data = await res.json();

    // Render Plain-English Takeaways
    if (listEl && data.takeaways) {
      listEl.innerHTML = data.takeaways.map(t => `
        <div class="takeaway-item">
          <span class="takeaway-icon">💡</span>
          <p>${esc(t)}</p>
        </div>
      `).join('');
    }

    // Render Side-by-Side Grouped Bar Chart
    if (chartEl && data.countries) {
      const pTheme = getPlotlyTheme();
      const dims = [
        { series: 'account.t.d', key: 'account_pct', label: 'Overall Account' },
        { series: 'mobileaccount.t.d', key: 'mobile_pct', label: 'Mobile Money' },
        { series: 'fiaccount.t.d', key: 'fiaccount_pct', label: 'Bank Account' },
        { series: 'save.any.t.d', key: 'saved_pct', label: 'Savings Rate' },
        { series: 'borrow.any.t.d', key: 'borrowed_pct', label: 'Credit Uptake' },
        { series: 'fin24aP', key: 'emergency_pct', label: 'Resilience' },
      ];

      const palette = ['#10b981', '#06b6d4', '#f59e0b'];
      const traces = data.countries.map((c, idx) => ({
        name: c.country,
        type: 'bar',
        x: dims.map(d => d.label),
        y: dims.map(d => {
          if (c[d.key] !== undefined && c[d.key] !== null) return c[d.key];
          if (c.indicators && Array.isArray(c.indicators)) {
            const found = c.indicators.find(ind => ind.series === d.series || ind.label.toLowerCase().includes(d.label.toLowerCase()));
            if (found && found.country_value !== undefined) return found.country_value;
          }
          return 0;
        }),
        marker: { color: palette[idx % palette.length] }
      }));

      const layout = {
        ...pTheme,
        barmode: 'group',
        margin: { t: 30, r: 20, b: 60, l: 50 },
        yaxis: {
          title: 'Adoption Rate (%)',
          gridcolor: pTheme.gridcolor,
          range: [0, 100]
        },
        xaxis: {
          gridcolor: pTheme.gridcolor
        },
        legend: {
          orientation: 'h',
          y: -0.2
        }
      };

      Plotly.react(chartEl, traces, layout, { responsive: true, displayModeBar: false });
    }
  } catch (err) {
    if (listEl) listEl.innerHTML = `<div class="error-state">Failed to load comparison: ${esc(err.message)}</div>`;
  }
}

// ============================================================================
// 9. PAGE 4: GUIDED PLAYGROUND ("TRY IT YOURSELF")
// ============================================================================
function initGuidedPlayground() {
  const kSel = document.getElementById('guided-k-select');
  const metricSel = document.getElementById('guided-metric-select');
  const recalcBtn = document.getElementById('guided-recalc-btn');

  if (recalcBtn && !recalcBtn.hasListener) {
    recalcBtn.addEventListener('click', updateGuidedModel);
    recalcBtn.hasListener = true;
  }
  if (kSel && !kSel.hasListener) {
    kSel.addEventListener('change', updateGuidedModel);
    kSel.hasListener = true;
  }
  if (metricSel && !metricSel.hasListener) {
    metricSel.addEventListener('change', updateGuidedModel);
    metricSel.hasListener = true;
  }

  updateGuidedModel();
}

async function updateGuidedModel() {
  const k = document.getElementById('guided-k-select').value;
  const metric = document.getElementById('guided-metric-select').value;
  state.guidedK = k;
  state.guidedMetric = metric;

  const wcssEl = document.getElementById('g-metric-wcss');
  const silEl = document.getElementById('g-metric-sil');
  const dbEl = document.getElementById('g-metric-db');
  const mapEl = document.getElementById('chart-guided-map');

  try {
    const res = await fetch(`/api/clustering/interactive?k=${k}&metric=${metric}`);
    if (!res.ok) throw new Error('Calculation error');
    const data = await res.json();

    if (wcssEl) wcssEl.textContent = Number(data.wcss).toFixed(1);
    if (silEl) silEl.textContent = Number(data.silhouette).toFixed(3);
    if (dbEl) dbEl.textContent = Number(data.davies_bouldin).toFixed(3);

    // Update Live Playground Choropleth Map
    if (mapEl && data.country_assignments) {
      const pTheme = getPlotlyTheme();
      const locations = [];
      const zValues = [];
      const hoverTexts = [];

      data.country_assignments.forEach(row => {
        if (row.code) {
          locations.push(row.code);
          zValues.push(row.cluster_id + 1);
          hoverTexts.push(`<b>${esc(row.country)}</b><br>Group ${row.cluster_id + 1} (${metric})`);
        }
      });

      const trace = {
        type: 'choropleth',
        locations: locations,
        z: zValues,
        text: hoverTexts,
        hoverinfo: 'text',
        colorscale: 'Viridis',
        showscale: false,
        marker: {
          line: {
            color: state.theme === 'dark' ? '#0f172a' : '#ffffff',
            width: 0.5
          }
        }
      };

      const layout = {
        ...pTheme,
        margin: { t: 5, r: 5, b: 5, l: 5 },
        geo: {
          showframe: false,
          showcoastlines: true,
          coastlinecolor: state.theme === 'dark' ? '#334155' : '#cbd5e1',
          projection: { type: 'natural earth' },
          bgcolor: 'transparent',
          landcolor: state.theme === 'dark' ? '#182234' : '#e2e8f0'
        }
      };

      Plotly.react(mapEl, [trace], layout, { responsive: true, displayModeBar: false });
    }
  } catch (err) {
    console.error('Interactive playground update failed:', err);
  }
}

// ============================================================================
// 10. PAGE 5: CITIZEN ACTION HUB
// ============================================================================
function initCitizenHub() {
  // Citizen Tab Switching
  document.querySelectorAll('.citizen-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.citizen-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.citizen-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const tabEl = document.getElementById(tabId);
      if (tabEl) tabEl.classList.add('active');
    });
  });

  // Tab 1: Barrier Diagnoser
  const barrierSel = document.getElementById('barrier-country-select');
  if (barrierSel && !barrierSel.hasListener) {
    barrierSel.addEventListener('change', () => loadCitizenBarriers(barrierSel.value));
    barrierSel.hasListener = true;
    loadCitizenBarriers(barrierSel.value);
  }

  // Tab 2: Resilience Quiz
  initResilienceQuiz();

  // Tab 3: Remittance Slasher
  initRemittanceCalculator();
}

async function loadCitizenBarriers(country) {
  const container = document.getElementById('barriers-cards-container');
  if (!container) return;
  container.innerHTML = '<div class="loading-state">Loading real-world barriers...</div>';

  try {
    const res = await fetch(`/api/citizen/barriers?country=${encodeURIComponent(country)}`);
    if (!res.ok) throw new Error('Could not fetch barriers');
    const data = await res.json();

    container.innerHTML = data.barriers.map(b => `
      <div class="barrier-card">
        <div class="barrier-card-header">
          <div class="barrier-title-group">
            <span class="barrier-icon">${esc(b.icon)}</span>
            <h3>${esc(b.title || b.barrier)}</h3>
          </div>
          <span class="barrier-rate-badge">${b.rate}% cited</span>
        </div>
        <p class="barrier-question">${esc(b.question || b.description)}</p>
        <div class="solution-box">
          <span class="solution-label">💡 CITIZEN WORKAROUND</span>
          <p>${esc(b.citizen_solution || b.workaround)}</p>
        </div>
        <div class="solution-box policy-solution-box">
          <span class="solution-label" style="color: var(--accent-cyan);">🏛️ POLICY ACTION FIX</span>
          <p>${esc(b.policy_fix || 'Regulatory reforms to eliminate entry hurdles')}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="error-state">Error: ${esc(err.message)}</div>`;
  }
}

function initResilienceQuiz() {
  const form = document.getElementById('resilience-quiz-form');
  if (!form || form.hasListener) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((val, key) => { payload[key] = val; });

    try {
      const res = await fetch('/api/citizen/resilience-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Quiz evaluation failed');
      const result = await res.json();

      document.getElementById('quiz-score-val').textContent = result.score;
      document.getElementById('quiz-status-title').textContent = result.status;
      document.getElementById('quiz-summary-text').textContent = result.summary;
      document.getElementById('quiz-badge-pill').textContent = result.badge;
      document.getElementById('quiz-comparison-text').textContent = result.comparison;

      const actionsList = document.getElementById('quiz-actions-list');
      if (actionsList && result.actions) {
        actionsList.innerHTML = result.actions.map((act, i) => `
          <div class="action-step-item">
            <span class="act-step-num">${i + 1}</span>
            <div class="act-step-text">
              <strong>${esc(act.title)}</strong>
              <p>${esc(act.detail)}</p>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      alert('Error calculating score: ' + err.message);
    }
  });
  form.hasListener = true;
}

function initRemittanceCalculator() {
  const corridorSel = document.getElementById('remit-corridor-select');
  const amountInput = document.getElementById('remit-amount-input');
  const calcBtn = document.getElementById('calculate-remittance-btn');

  // Amount pill buttons
  document.querySelectorAll('.amount-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.amount-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      amountInput.value = pill.getAttribute('data-amount');
      calculateRemittance();
    });
  });

  if (calcBtn && !calcBtn.hasListener) {
    calcBtn.addEventListener('click', calculateRemittance);
    calcBtn.hasListener = true;
  }
  if (corridorSel && !corridorSel.hasListener) {
    corridorSel.addEventListener('change', calculateRemittance);
    corridorSel.hasListener = true;
  }

  calculateRemittance();
}

async function calculateRemittance() {
  const corridor = document.getElementById('remit-corridor-select').value;
  const amount = document.getElementById('remit-amount-input').value;

  try {
    const res = await fetch(`/api/citizen/remittance?corridor=${corridor}&amount=${amount}`);
    if (!res.ok) throw new Error('Calculation error');
    const data = await res.json();

    document.getElementById('remit-corridor-title').textContent = data.corridor_title;
    document.getElementById('remit-legacy-fee').textContent = '$' + data.legacy_fee.toFixed(2);
    document.getElementById('remit-legacy-pct').textContent = data.legacy_pct + '% fee';
    document.getElementById('remit-digital-fee').textContent = '$' + data.digital_fee.toFixed(2);
    document.getElementById('remit-digital-pct').textContent = data.digital_pct + '% fee';
    document.getElementById('remit-annual-saved').textContent = '$' + data.annual_saved.toFixed(2) + ' / year';
    document.getElementById('remit-impact-text').textContent = data.local_impact;
  } catch (e) {
    console.warn(e);
  }
}

// ============================================================================
// 11. PAGE 6: POLICY SIMULATOR
// ============================================================================
function initSimulator() {
  const sliders = [
    { id: 'lever-mobile', valId: 'lever-mobile-val' },
    { id: 'lever-did', valId: 'lever-did-val' },
    { id: 'lever-gender', valId: 'lever-gender-val' },
    { id: 'lever-literacy', valId: 'lever-literacy-val' },
    { id: 'lever-ob', valId: 'lever-ob-val' },
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const valEl = document.getElementById(s.valId);
    if (el && valEl && !el.hasListener) {
      el.addEventListener('input', () => {
        valEl.textContent = el.value + '%';
      });
      el.hasListener = true;
    }
  });

  const runBtn = document.getElementById('run-sim-btn');
  const countrySel = document.getElementById('sim-target-country');
  const resetBtn = document.getElementById('reset-sim-btn');

  if (runBtn && !runBtn.hasListener) {
    runBtn.addEventListener('click', runSimulation);
    runBtn.hasListener = true;
  }
  if (countrySel && !countrySel.hasListener) {
    countrySel.addEventListener('change', runSimulation);
    countrySel.hasListener = true;
  }
  if (resetBtn && !resetBtn.hasListener) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('lever-mobile').value = 30;
      document.getElementById('lever-did').value = 35;
      document.getElementById('lever-gender').value = 25;
      document.getElementById('lever-literacy').value = 20;
      document.getElementById('lever-ob').value = 20;
      sliders.forEach(s => {
        document.getElementById(s.valId).textContent = document.getElementById(s.id).value + '%';
      });
      runSimulation();
    });
    resetBtn.hasListener = true;
  }

  runSimulation();
}

async function runSimulation() {
  const country = document.getElementById('sim-target-country').value;
  const payload = {
    country: country,
    mobile_infrastructure: document.getElementById('lever-mobile').value,
    digital_id: document.getElementById('lever-did').value,
    gender_inclusion: document.getElementById('lever-gender').value,
    financial_literacy: document.getElementById('lever-literacy').value,
    open_banking: document.getElementById('lever-ob').value
  };

  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Simulation failed');
    const sim = await res.json();

    document.getElementById('sim-country-echo').textContent = country;
    document.getElementById('sim-index-projected').textContent = sim.projected.index.toFixed(1);
    document.getElementById('sim-index-uplift').textContent = '+' + sim.uplift.index.toFixed(1);
    document.getElementById('sim-index-baseline').textContent = sim.baseline.index.toFixed(1);

    document.getElementById('sim-account-projected').textContent = sim.projected.account_pct.toFixed(1) + '%';
    document.getElementById('sim-account-uplift').textContent = '+' + sim.uplift.account_pct.toFixed(1) + '%';
    document.getElementById('sim-account-baseline').textContent = sim.baseline.account_pct.toFixed(1) + '%';

    document.getElementById('sim-newly-included').textContent = sim.projected.newly_included;
    document.getElementById('sim-years-target').textContent = sim.projected.years_to_target + ' yrs';

    // Before vs After Grouped Bar Chart
    const chartEl = document.getElementById('chart-sim-comparison');
    if (chartEl) {
      const pTheme = getPlotlyTheme();
      const dims = ['Account Access', 'Digital Payments', 'Mobile Wallet', 'Emergency Resilience'];
      const baseVals = [
        sim.baseline.account_pct,
        sim.baseline.payment_pct || sim.baseline.account_pct * 0.85,
        sim.baseline.mobile_pct,
        sim.baseline.resilience_pct
      ];
      const projVals = [
        sim.projected.account_pct,
        sim.projected.payment_pct || sim.projected.account_pct * 0.9,
        sim.projected.mobile_pct,
        sim.projected.resilience_pct
      ];

      const traces = [
        { name: 'Current Baseline', type: 'bar', x: dims, y: baseVals, marker: { color: '#6b857f' } },
        { name: 'Simulated Reform Trajectory', type: 'bar', x: dims, y: projVals, marker: { color: '#10b981' } }
      ];

      const layout = {
        ...pTheme,
        barmode: 'group',
        margin: { t: 20, r: 20, b: 40, l: 40 },
        yaxis: { range: [0, 100], title: 'Percentage Rate (%)', gridcolor: pTheme.gridcolor }
      };

      Plotly.react(chartEl, traces, layout, { responsive: true, displayModeBar: false });
    }
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

// ============================================================================
// 12. PAGE 7: CLUSTER ARCHETYPES & PCA DIAGNOSTICS
// ============================================================================
async function initClusterArchetypes() {
  loadRecommendedArchetypeCards();
  loadPCAProjection();
  loadClusteringBenchmarksTable();
  loadStabilityAudit();

  const toggleBtn = document.getElementById('toggle-pca-dim-btn');
  if (toggleBtn && !toggleBtn.hasListener) {
    toggleBtn.addEventListener('click', () => {
      state.pcaDimension = state.pcaDimension === 2 ? 3 : 2;
      toggleBtn.textContent = state.pcaDimension === 2 ? '🔄 Switch to 3D PCA' : '🔄 Switch to 2D PCA';
      loadPCAProjection();
    });
    toggleBtn.hasListener = true;
  }
}

async function loadRecommendedArchetypeCards() {
  const container = document.getElementById('recommended-archetypes-cards');
  if (!container) return;

  try {
    if (!state.recommendedModel) {
      const res = await fetch('/api/clustering/recommended');
      if (res.ok) state.recommendedModel = await res.json();
    }

    const profiles = (state.recommendedModel && state.recommendedModel.archetype_profiles) || [];
    container.innerHTML = profiles.map(p => `
      <div class="profile-card">
        <div class="profile-card-header">
          <div>
            <h4>${esc(p.name)}</h4>
            <span class="profile-tag-badge">Cluster ${p.cluster_id + 1} (${p.size} countries)</span>
          </div>
        </div>
        <p>${esc(p.description)}</p>
        <div class="profile-metrics-list">
          <div class="profile-m-item">
            <span>MEAN ACCOUNT</span>
            <strong>${fmtPct(p.mean_account)}</strong>
          </div>
          <div class="profile-m-item">
            <span>MOBILE MONEY</span>
            <strong>${fmtPct(p.mean_mobile)}</strong>
          </div>
          <div class="profile-m-item">
            <span>RESILIENCE</span>
            <strong>${fmtPct(p.mean_resilience)}</strong>
          </div>
        </div>
        <div class="profile-peers-wrap">
          <strong>Key Peer Nations:</strong> ${esc(p.representative_countries ? p.representative_countries.join(', ') : 'Various')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="error-state">Failed to load profiles: ${esc(err.message)}</div>`;
  }
}

async function loadPCAProjection() {
  const chartEl = document.getElementById('chart-pca-main');
  if (!chartEl) return;

  try {
    if (!state.pcaData) {
      const res = await fetch('/api/clustering/pca');
      if (res.ok) state.pcaData = await res.json();
    }

    const pTheme = getPlotlyTheme();
    const clusterColors = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b'];
    const clusterNames = [
      'Digitally Leaping Cash Economists',
      'Universal High-Resilience Systems',
      'Severe Exclusion Frontiers',
      'Banked but Liquidity-Constrained'
    ];

    const traces = [];
    for (let c = 0; c < 4; c++) {
      const pts = state.pcaData.points.filter(p => p.cluster === c);
      if (state.pcaDimension === 2) {
        traces.push({
          name: clusterNames[c] || `Cluster ${c + 1}`,
          mode: 'markers',
          type: 'scatter',
          x: pts.map(p => p.pc1),
          y: pts.map(p => p.pc2),
          text: pts.map(p => `<b>${esc(p.country)}</b><br>${esc(p.cluster_name)}`),
          hoverinfo: 'text',
          marker: { size: 9, color: clusterColors[c], opacity: 0.85 }
        });
      } else {
        traces.push({
          name: clusterNames[c] || `Cluster ${c + 1}`,
          mode: 'markers',
          type: 'scatter3d',
          x: pts.map(p => p.pc1),
          y: pts.map(p => p.pc2),
          z: pts.map(p => p.pc3 || 0),
          text: pts.map(p => `<b>${esc(p.country)}</b><br>${esc(p.cluster_name)}`),
          hoverinfo: 'text',
          marker: { size: 5, color: clusterColors[c], opacity: 0.85 }
        });
      }
    }

    const varExp = state.pcaData.explained_variance_ratio || [0.42, 0.22, 0.12];
    const layout = {
      ...pTheme,
      margin: { t: 20, r: 20, b: 40, l: 40 },
      xaxis: {
        title: `PC1: Formal vs Informal Access (${(varExp[0] * 100).toFixed(1)}% var)`,
        gridcolor: pTheme.gridcolor
      },
      yaxis: {
        title: `PC2: Mobile Money vs Banking (${(varExp[1] * 100).toFixed(1)}% var)`,
        gridcolor: pTheme.gridcolor
      },
      legend: { orientation: 'h', y: -0.15 }
    };

    if (state.pcaDimension === 3) {
      layout.scene = {
        xaxis: { title: 'PC1', gridcolor: pTheme.gridcolor },
        yaxis: { title: 'PC2', gridcolor: pTheme.gridcolor },
        zaxis: { title: 'PC3', gridcolor: pTheme.gridcolor }
      };
    }

    Plotly.react(chartEl, traces, layout, { responsive: true, displayModeBar: false });
  } catch (err) {
    console.error('PCA error:', err);
  }
}

async function loadClusteringBenchmarksTable() {
  const tbody = document.getElementById('benchmark-metrics-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/clustering/benchmarks');
    if (!res.ok) throw new Error('Benchmark fetch failed');
    const data = await res.json();
    state.benchmarksData = data;

    const euc = data.euclidean || [];
    const manh = data.manhattan || [];

    tbody.innerHTML = euc.map((eRow, i) => {
      const mRow = manh[i] || {};
      const isRec = eRow.k === 4;
      return `
        <tr class="${isRec ? 'row-highlight' : ''}">
          <td><strong>K = ${eRow.k}</strong> ${isRec ? '★ Recommended' : ''}</td>
          <td>${eRow.wcss ? eRow.wcss.toFixed(1) : '—'}</td>
          <td class="${eRow.silhouette > 0.3 ? 'cell-high' : ''}">${eRow.silhouette ? eRow.silhouette.toFixed(3) : '—'}</td>
          <td>${eRow.davies_bouldin ? eRow.davies_bouldin.toFixed(3) : '—'}</td>
          <td>${mRow.wcsad ? mRow.wcsad.toFixed(1) : '—'}</td>
          <td>${mRow.silhouette ? mRow.silhouette.toFixed(3) : '—'}</td>
          <td>${mRow.davies_bouldin ? mRow.davies_bouldin.toFixed(3) : '—'}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="error-state">Error: ${esc(err.message)}</td></tr>`;
  }
}

async function loadStabilityAudit() {
  const tbody = document.getElementById('borderline-table-body');
  const ariEl = document.getElementById('stat-mean-ari');
  if (!tbody) return;

  try {
    const res = await fetch('/api/clustering/stability');
    if (!res.ok) throw new Error('Stability fetch failed');
    const data = await res.json();
    state.stabilityData = data;

    if (ariEl && data.mean_seed_ari) {
      ariEl.textContent = data.mean_seed_ari.toFixed(3);
    }

    const borderline = data.volatile_borderline_countries || [];
    if (borderline.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No highly volatile borderline countries detected.</td></tr>';
      return;
    }

    tbody.innerHTML = borderline.slice(0, 8).map(b => `
      <tr>
        <td><strong>${esc(b.country)}</strong></td>
        <td>Cluster ${b.primary_cluster + 1}</td>
        <td>${b.stability_rate}%</td>
        <td><span class="badge badge-warning">${esc(b.classification || 'Borderline')}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="error-state">Error: ${esc(err.message)}</td></tr>`;
  }
}

// ============================================================================
// 13. PAGE 8: GLOBAL DATA MATRIX (153 ECONOMIES)
// ============================================================================
async function initGlobalExplorerMatrix() {
  if (state.countriesData.length === 0) {
    try {
      const res = await fetch('/api/countries?year=2024');
      if (res.ok) state.countriesData = await res.json();
    } catch (e) {
      console.warn(e);
    }
  }

  populateMatrixFilters();
  renderMatrixScatter();
  initMatrixTableControls();
  renderMatrixTable();
}

function populateMatrixFilters() {
  const regSel = document.getElementById('matrix-region-filter');
  const incSel = document.getElementById('matrix-income-filter');
  if (!regSel || !incSel) return;

  const regions = [...new Set(state.countriesData.map(c => c.region).filter(Boolean))].sort();
  const incomes = [...new Set(state.countriesData.map(c => c.income_group).filter(Boolean))].sort();

  regSel.innerHTML = '<option value="">All Regions</option>' + regions.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('');
  incSel.innerHTML = '<option value="">All Income Groups</option>' + incomes.map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('');
}

function renderMatrixScatter() {
  const chartEl = document.getElementById('chart-scatter-explorer');
  if (!chartEl || state.countriesData.length === 0) return;

  const pTheme = getPlotlyTheme();
  const trace = {
    x: state.countriesData.map(c => c.fiaccount_pct || 0),
    y: state.countriesData.map(c => c.mobile_pct || 0),
    text: state.countriesData.map(c => `<b>${esc(c.country)}</b><br>Bank Account: ${fmtPct(c.fiaccount_pct)}<br>Mobile Money: ${fmtPct(c.mobile_pct)}<br>Total Account: ${fmtPct(c.account_pct)}`),
    hoverinfo: 'text',
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: state.countriesData.map(c => Math.max(6, (c.account_pct || 50) / 7)),
      color: state.countriesData.map(c => c.account_pct || 0),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: { title: 'Account %', thickness: 12 }
    }
  };

  const layout = {
    ...pTheme,
    margin: { t: 20, r: 20, b: 50, l: 50 },
    xaxis: { title: 'Traditional Bank Account Coverage (%)', gridcolor: pTheme.gridcolor },
    yaxis: { title: 'Mobile Money Penetration (%)', gridcolor: pTheme.gridcolor }
  };

  Plotly.react(chartEl, [trace], layout, { responsive: true, displayModeBar: false });
}

function initMatrixTableControls() {
  const searchInput = document.getElementById('matrix-search-input');
  const regSel = document.getElementById('matrix-region-filter');
  const incSel = document.getElementById('matrix-income-filter');
  const prevBtn = document.getElementById('matrix-prev-btn');
  const nextBtn = document.getElementById('matrix-next-btn');
  const exportBtn = document.getElementById('export-matrix-csv');

  if (searchInput && !searchInput.hasListener) {
    searchInput.addEventListener('input', () => { state.matrixPage = 1; renderMatrixTable(); });
    searchInput.hasListener = true;
  }
  if (regSel && !regSel.hasListener) {
    regSel.addEventListener('change', () => { state.matrixPage = 1; renderMatrixTable(); });
    regSel.hasListener = true;
  }
  if (incSel && !incSel.hasListener) {
    incSel.addEventListener('change', () => { state.matrixPage = 1; renderMatrixTable(); });
    incSel.hasListener = true;
  }
  if (prevBtn && !prevBtn.hasListener) {
    prevBtn.addEventListener('click', () => { if (state.matrixPage > 1) { state.matrixPage--; renderMatrixTable(); } });
    prevBtn.hasListener = true;
  }
  if (nextBtn && !nextBtn.hasListener) {
    nextBtn.addEventListener('click', () => { state.matrixPage++; renderMatrixTable(); });
    nextBtn.hasListener = true;
  }
  if (exportBtn && !exportBtn.hasListener) {
    exportBtn.addEventListener('click', exportMatrixCSV);
    exportBtn.hasListener = true;
  }
}

function renderMatrixTable() {
  const tbody = document.getElementById('matrix-table-body');
  if (!tbody) return;

  const q = (document.getElementById('matrix-search-input')?.value || '').toLowerCase();
  const reg = document.getElementById('matrix-region-filter')?.value || '';
  const inc = document.getElementById('matrix-income-filter')?.value || '';

  const filtered = state.countriesData.filter(c => {
    const matchQ = !q || c.country.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q));
    const matchReg = !reg || c.region === reg;
    const matchInc = !inc || c.income_group === inc;
    return matchQ && matchReg && matchInc;
  });

  const total = filtered.length;
  document.getElementById('matrix-shown-count').textContent = Math.min(state.matrixPageSize, total);
  document.getElementById('matrix-total-count').textContent = total;

  const totalPages = Math.max(1, Math.ceil(total / state.matrixPageSize));
  state.matrixPage = Math.min(state.matrixPage, totalPages);
  document.getElementById('matrix-page-info').textContent = `Page ${state.matrixPage} of ${totalPages}`;

  document.getElementById('matrix-prev-btn').disabled = state.matrixPage <= 1;
  document.getElementById('matrix-next-btn').disabled = state.matrixPage >= totalPages;

  const start = (state.matrixPage - 1) * state.matrixPageSize;
  const pageRows = filtered.slice(start, start + state.matrixPageSize);

  if (pageRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="loading-td">No countries match active filter.</td></tr>';
    return;
  }

  tbody.innerHTML = pageRows.map(c => `
    <tr class="clickable-row" onclick="showCountryModal('${esc(c.country)}')">
      <td><strong>${esc(c.country)}</strong> <small>(${esc(c.code || '')})</small></td>
      <td>${esc(c.region || '—')}</td>
      <td><span class="badge badge-neutral">${esc(c.income_group || '—')}</span></td>
      <td>${fmtPct(c.account_pct)}</td>
      <td>${fmtPct(c.mobile_pct)}</td>
      <td>${fmtPct(c.fiaccount_pct)}</td>
      <td>${fmtPct(c.saved_pct)}</td>
      <td>${fmtPct(c.borrowed_pct)}</td>
      <td>${fmtPct(c.emergency_pct)}</td>
    </tr>
  `).join('');
}

function exportMatrixCSV() {
  window.location.href = '/api/export/cluster-csv';
}

// ============================================================================
// 14. PAGE 9: LONGITUDINAL TRENDS
// ============================================================================
async function initLongitudinalTrends() {
  try {
    const res = await fetch('/api/trends');
    if (!res.ok) throw new Error('Trends fetch failed');
    const data = await res.json();

    const pTheme = getPlotlyTheme();
    const years = data.years || ['2011', '2014', '2017', '2021', '2024'];

    // 1. Global Trajectory
    const chartAccount = document.getElementById('chart-trends-account');
    if (chartAccount && data.account_trajectory) {
      const trace = {
        x: years,
        y: data.account_trajectory,
        mode: 'lines+markers',
        type: 'scatter',
        line: { color: '#10b981', width: 3 },
        marker: { size: 8 }
      };
      Plotly.react(chartAccount, [trace], {
        ...pTheme,
        margin: { t: 20, r: 20, b: 40, l: 40 },
        yaxis: { title: 'Global Mean Account Ownership (%)', range: [40, 80], gridcolor: pTheme.gridcolor }
      }, { responsive: true, displayModeBar: false });
    }

    // 2. Mobile Surge
    const chartMobile = document.getElementById('chart-trends-mobile');
    if (chartMobile && data.mobile_surge) {
      const trace = {
        x: years,
        y: data.mobile_surge,
        mode: 'lines+markers',
        type: 'scatter',
        line: { color: '#06b6d4', width: 3 },
        marker: { size: 8 }
      };
      Plotly.react(chartMobile, [trace], {
        ...pTheme,
        margin: { t: 20, r: 20, b: 40, l: 40 },
        yaxis: { title: 'Emerging Market Mobile Penetration (%)', gridcolor: pTheme.gridcolor }
      }, { responsive: true, displayModeBar: false });
    }

    // 3. Savings vs Debt
    const chartSavings = document.getElementById('chart-trends-savings-debt');
    if (chartSavings) {
      const traces = [
        { name: 'Formal Savings', x: years, y: data.savings_trend || [22, 24, 27, 31, 34], mode: 'lines+markers', line: { color: '#10b981' } },
        { name: 'Formal Borrowing', x: years, y: data.borrowing_trend || [11, 12, 14, 15, 16], mode: 'lines+markers', line: { color: '#f59e0b' } }
      ];
      Plotly.react(chartSavings, traces, {
        ...pTheme,
        margin: { t: 20, r: 20, b: 40, l: 40 },
        yaxis: { title: 'Rate (%)', gridcolor: pTheme.gridcolor },
        legend: { orientation: 'h', y: -0.2 }
      }, { responsive: true, displayModeBar: false });
    }
  } catch (err) {
    console.error('Trends error:', err);
  }
}

// ============================================================================
// 15. PAGE 10: "HOW WE DID IT" PIPELINE
// ============================================================================
async function initHowWeDidIt() {
  try {
    const res = await fetch('/api/pipeline/preprocessing-log');
    if (res.ok) {
      const log = await res.json();
      console.log('Preprocessing Log loaded:', log);
    }
  } catch (e) {
    console.warn(e);
  }
}

// ============================================================================
// 16. MODAL: COUNTRY SCORECARD & 1-PAGE REPORT
// ============================================================================
async function showCountryModal(countryName) {
  const modal = document.getElementById('country-profile-modal');
  const body = document.getElementById('modal-body-content');
  const nameEl = document.getElementById('modal-country-name');
  const regionEl = document.getElementById('modal-country-region');
  const clusterTag = document.getElementById('modal-country-cluster-tag');

  if (!modal || !body) return;

  nameEl.textContent = countryName;
  regionEl.textContent = 'Loading...';
  clusterTag.textContent = 'Archetype: Fetching...';
  body.innerHTML = '<div class="loading-state">Generating country profile scorecard...</div>';
  modal.classList.add('open');

  try {
    const res = await fetch(`/api/country-profile/${encodeURIComponent(countryName)}`);
    if (!res.ok) throw new Error('Country details not found');
    const profile = await res.json();

    regionEl.textContent = profile.region || 'World Economy';
    clusterTag.textContent = `Archetype: ${profile.cluster_name || 'Pattern Group ' + (profile.cluster_id + 1)}`;

    body.innerHTML = `
      <div class="modal-kpi-row">
        <div class="modal-kpi-item">
          <span class="label">OVERALL ACCOUNT</span>
          <div class="val">${fmtPct(profile.account_pct)}</div>
        </div>
        <div class="modal-kpi-item">
          <span class="label">MOBILE MONEY</span>
          <div class="val">${fmtPct(profile.mobile_pct)}</div>
        </div>
        <div class="modal-kpi-item">
          <span class="label">FORMAL BANK</span>
          <div class="val">${fmtPct(profile.fiaccount_pct)}</div>
        </div>
        <div class="modal-kpi-item">
          <span class="label">RESILIENCE</span>
          <div class="val">${fmtPct(profile.emergency_pct)}</div>
        </div>
      </div>

      <div class="scorecard-block">
        <h4>💪 Key Developmental Strengths</h4>
        <ul class="scorecard-list">
          ${(profile.strengths || ['High mobile infrastructure readiness', 'Strong baseline financial access']).map(s => `<li>${esc(s)}</li>`).join('')}
        </ul>
      </div>

      <div class="scorecard-block">
        <h4>⚠️ Priority Policy Gaps</h4>
        <ul class="scorecard-list">
          ${(profile.gaps || ['Voluntary savings mobilization remains below potential', 'Gender gap in mobile wallet access']).map(g => `<li>${esc(g)}</li>`).join('')}
        </ul>
      </div>

      <div class="scorecard-block">
        <h4>🌐 Similar Peer Economies In Same Cluster</h4>
        <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
          ${(profile.peer_countries || ['Kenya', 'Tanzania', 'Uganda']).map(p => `<strong>${esc(p)}</strong>`).join(' • ')}
        </p>
      </div>

      <div class="scorecard-block">
        <h4>💡 Evidence-Linked Policy Ideas</h4>
        <ul class="scorecard-list">
          ${(profile.policy_suggestions || [
            'Tiered e-KYC: Allow immediate wallet activation using digital national identity',
            'Interoperable QR Switch: Connect private mobile wallets to national bank clearance',
            'Female Agent Networks: Subsidize female cash-in/out agents to reduce gender barriers'
          ]).map(idea => `<li>${esc(idea)}</li>`).join('')}
        </ul>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div class="error-state">Failed to load scorecard: ${esc(err.message)}</div>`;
  }

  // Close modal button
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn && !closeBtn.hasListener) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    closeBtn.hasListener = true;
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

// ============================================================================
// 17. ONBOARDING TOUR
// ============================================================================
function initOnboardingTour() {
  const modal = document.getElementById('onboarding-modal');
  const skipBtn = document.getElementById('skip-tour-btn');
  const nextBtn = document.getElementById('tour-next-btn');
  const prevBtn = document.getElementById('tour-prev-btn');
  const startBtn = document.getElementById('start-tour-btn');

  if (!modal) return;

  const tourSteps = [
    {
      icon: '🌍',
      step: 'Step 1 of 3',
      title: 'Welcome to the Financial Inclusion Policy Lab',
      desc: 'Over 1.4 billion adults worldwide have no bank or mobile account. This lab transforms complex World Bank survey data into clear, actionable patterns that anyone can understand.'
    },
    {
      icon: '🗺️',
      step: 'Step 2 of 3',
      title: 'Explore the World Map & Find Your Country',
      desc: 'Countries are grouped into 4 distinct natural archetypes. Click any country on the Interactive World Map or use the top search box to inspect strengths, gaps, and peer economies.'
    },
    {
      icon: '💡',
      step: 'Step 3 of 3',
      title: 'Real-World Tools for Citizens & Policymakers',
      desc: 'Use the Citizen Action Hub to slash remittance fees and diagnose unbanked barriers, or run the Policy Simulator to forecast the impact of digital IDs and mobile money reforms.'
    }
  ];

  function renderTourStep(stepIdx) {
    const s = tourSteps[stepIdx];
    document.getElementById('tour-step-indicator').textContent = s.step;
    document.getElementById('tour-icon').textContent = s.icon;
    document.getElementById('tour-title').textContent = s.title;
    document.getElementById('tour-desc').textContent = s.desc;

    prevBtn.style.display = stepIdx > 0 ? 'block' : 'none';
    nextBtn.textContent = stepIdx === tourSteps.length - 1 ? 'Start Exploring →' : 'Next Step →';
  }

  // Auto show on first visit
  if (!localStorage.getItem('findex_tour_completed')) {
    modal.classList.add('open');
    renderTourStep(0);
  }

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.tourStep = 1;
      renderTourStep(0);
      modal.classList.add('open');
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      localStorage.setItem('findex_tour_completed', 'true');
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.tourStep < tourSteps.length) {
        state.tourStep++;
        renderTourStep(state.tourStep - 1);
      } else {
        modal.classList.remove('open');
        localStorage.setItem('findex_tour_completed', 'true');
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.tourStep > 1) {
        state.tourStep--;
        renderTourStep(state.tourStep - 1);
      }
    });
  }
}
