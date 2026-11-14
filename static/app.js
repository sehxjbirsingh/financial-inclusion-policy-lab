/**
 * Global Financial Inclusion Policy Lab - Comprehensive Real-Time SPA
 * Real-time econometric simulation, multi-dashboard routing, Plotly analytics, and data matrix.
 */

// Global State
const state = {
  currentYear: '2024',
  theme: localStorage.getItem('theme') || 'dark',
  currentPage: 'page-citizen',
  audienceMode: 'citizen', // 'citizen' or 'analyst'
  citizenCountry: 'India',
  countriesData: [],
  filteredCountries: [],
  matrixPage: 1,
  matrixPageSize: 15,
  matrixSortKey: 'account_pct',
  matrixSortAsc: false,
  selectedCountry: 'India',
  simCountry: 'Nigeria',
  clusterResult: null,
};

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initClock();
  initNavigation();
  initAudienceMode();
  initCitizenHub();
  initLiveTicker();
  initGlobalEvents();

  // Load initial page data
  loadCitizenHub();
  preloadCountryList();
});

// ================= 1. THEME & UTILITIES =================
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
      family: 'DM Sans, sans-serif',
      size: 11,
      color: isDark ? '#9cb3ad' : '#4a635d'
    },
    gridcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    zerolinecolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
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
  const duration = 800;
  const steps = 24;
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

// ================= 2. NAVIGATION & ROUTING =================
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPageId = item.getAttribute('data-page');
      switchPage(targetPageId);
    });
  });

  // Mobile menu button
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Hash change support
  window.addEventListener('hashchange', handleHashChange);
  if (window.location.hash) {
    handleHashChange();
  }
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  const hashMap = {
    'citizen-hub': 'page-citizen',
    'overview': 'page-overview',
    'country-lab': 'page-country',
    'explorer': 'page-explorer',
    'simulator': 'page-simulator',
    'clustering': 'page-cluster',
    'trends': 'page-trends',
    'gaps': 'page-gaps',
    'quality': 'page-quality'
  };
  if (hashMap[hash]) {
    switchPage(hashMap[hash]);
  }
}

function switchPage(pageId) {
  state.currentPage = pageId;

  // Toggle pages
  document.querySelectorAll('.dashboard-page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Toggle sidebar active item
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

  // Close mobile sidebar if open
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.remove('open');

  // Lazy load page-specific datasets
  onPageActivated(pageId);
}

function onPageActivated(pageId) {
  if (pageId === 'page-citizen') {
    loadCitizenHub();
  } else if (pageId === 'page-overview') {
    loadOverviewData(state.currentYear);
  } else if (pageId === 'page-country') {
    loadCountryDetail(state.selectedCountry);
  } else if (pageId === 'page-explorer') {
    loadExplorerMatrix(state.currentYear);
  } else if (pageId === 'page-simulator') {
    runPolicySimulation();
  } else if (pageId === 'page-cluster') {
    initClusterPage();
  } else if (pageId === 'page-trends') {
    loadTrendsData();
  } else if (pageId === 'page-gaps') {
    loadPolicyGapsData();
  } else if (pageId === 'page-quality') {
    loadDataQualityData();
  }
}

function initGlobalEvents() {
  const yearSelect = document.getElementById('global-year-select');
  if (yearSelect) {
    yearSelect.addEventListener('change', (e) => {
      state.currentYear = e.target.value;
      onPageActivated(state.currentPage);
    });
  }

  const syncBtn = document.getElementById('refresh-data-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      syncBtn.textContent = '↻ Syncing...';
      onPageActivated(state.currentPage);
      setTimeout(() => { syncBtn.textContent = '↻ Sync Live'; }, 800);
    });
  }
}

function initLiveTicker() {
  const tickerEl = document.getElementById('live-ticker-text');
  async function updateTicker() {
    try {
      const res = await fetch('/api/live-feed');
      if (!res.ok) return;
      const data = await res.json();
      if (data.feed && data.feed.length > 0) {
        const item = data.feed[0];
        tickerEl.innerHTML = `<strong>[${esc(item.region)}]</strong> ${esc(item.text)} <span style="color:var(--accent-emerald)">(${esc(item.delta)})</span>`;
      }
    } catch (e) {
      console.warn('Live ticker polling notice:', e);
    }
  }
  updateTicker();
  setInterval(updateTicker, 12000);
}

function redrawCurrentCharts() {
  onPageActivated(state.currentPage);
}


// ================= 2.5 CITIZEN HUB & AUDIENCE MODE =================
function initAudienceMode() {
  const citizenBtn = document.getElementById('mode-citizen-btn');
  const analystBtn = document.getElementById('mode-analyst-btn');

  if (citizenBtn && analystBtn) {
    citizenBtn.addEventListener('click', () => {
      state.audienceMode = 'citizen';
      citizenBtn.classList.add('active');
      analystBtn.classList.remove('active');
      switchPage('page-citizen');
    });

    analystBtn.addEventListener('click', () => {
      state.audienceMode = 'analyst';
      analystBtn.classList.add('active');
      citizenBtn.classList.remove('active');
      switchPage('page-overview');
    });
  }
}

function initCitizenHub() {
  // Tab switching inside Citizen Hub
  const tabBtns = document.querySelectorAll('.citizen-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.citizen-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Country select in barriers tab
  const barrierSelect = document.getElementById('barrier-country-select');
  if (barrierSelect) {
    barrierSelect.addEventListener('change', (e) => {
      state.citizenCountry = e.target.value;
      loadCitizenBarriers(state.citizenCountry);
    });
  }

  // Quiz form
  initResilienceQuiz();

  // Remittance calculator
  initRemittanceCalculator();
}

async function loadCitizenHub() {
  await loadCitizenBarriers(state.citizenCountry);
}

async function loadCitizenBarriers(country) {
  const container = document.getElementById('barriers-cards-container');
  if (!container) return;

  try {
    const res = await fetch(`/api/citizen/barriers?country=${encodeURIComponent(country)}`);
    if (!res.ok) throw new Error('Failed to load barriers');
    const data = await res.json();

    container.innerHTML = data.barriers.map(b => `
      <div class="barrier-card">
        <div class="barrier-card-header">
          <div class="barrier-title-group">
            <span class="barrier-icon">${b.icon}</span>
            <h3>${esc(b.title)}</h3>
          </div>
          <span class="barrier-rate-badge">${b.rate}% report this</span>
        </div>
        <p class="barrier-question">"${esc(b.question)}"</p>
        <div class="solution-box">
          <span class="solution-label">💡 WHAT YOU CAN DO (CITIZEN FIX):</span>
          <p>${esc(b.citizen_solution)}</p>
        </div>
        <div class="policy-solution-box">
          <span class="policy-label">🏛️ WHAT POLICYMAKERS MUST FIX:</span>
          <p>${esc(b.policy_fix)}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading barriers:', err);
    container.innerHTML = `<div class="status-msg">Could not load barriers for ${esc(country)}. Please select another country.</div>`;
  }
}

function initResilienceQuiz() {
  const form = document.getElementById('resilience-quiz-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      account_type: fd.get('account_type'),
      emergency_funds: fd.get('emergency_funds'),
      savings_method: fd.get('savings_method'),
      borrowing_source: fd.get('borrowing_source')
    };

    try {
      const res = await fetch('/api/citizen/resilience-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Quiz evaluation failed');
      const result = await res.json();

      // Update quiz output UI
      animateNumber('quiz-score-val', result.score);
      const badge = document.getElementById('quiz-badge-pill');
      if (badge) {
        badge.className = `badge ${result.badge}`;
        badge.textContent = result.status;
      }
      document.getElementById('quiz-status-title').textContent = `${result.status} Resilience Buffer`;
      document.getElementById('quiz-summary-text').textContent = result.summary;
      document.getElementById('quiz-comparison-text').textContent = result.global_comparison;

      // Render 3 action steps
      const actionsList = document.getElementById('quiz-actions-list');
      if (actionsList) {
        actionsList.innerHTML = result.actions.map(a => `
          <div class="action-step-item">
            <div class="step-num-badge">${a.step}</div>
            <div class="step-text">
              <strong>${esc(a.title)}</strong>
              <p>${esc(a.desc)}</p>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error('Quiz submit error:', err);
    }
  });

  // Auto-run once with default values
  form.dispatchEvent(new Event('submit'));
}

function initRemittanceCalculator() {
  const corridorSelect = document.getElementById('remit-corridor-select');
  const amountInput = document.getElementById('remit-amount-input');
  const pills = document.querySelectorAll('.amount-pill');
  const calcBtn = document.getElementById('calculate-remittance-btn');

  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      if (amountInput) {
        amountInput.value = p.getAttribute('data-amount');
        calculateRemittance();
      }
    });
  });

  if (calcBtn) calcBtn.addEventListener('click', calculateRemittance);
  if (corridorSelect) corridorSelect.addEventListener('change', calculateRemittance);
  if (amountInput) amountInput.addEventListener('change', calculateRemittance);

  async function calculateRemittance() {
    const corridor = corridorSelect?.value || 'us_mx';
    const amount = parseFloat(amountInput?.value || 200);

    try {
      const res = await fetch(`/api/citizen/remittance?corridor=${encodeURIComponent(corridor)}&amount=${amount}`);
      if (!res.ok) throw new Error('Remittance calculation failed');
      const data = await res.json();

      document.getElementById('remit-corridor-title').textContent = data.corridor;
      document.getElementById('remit-legacy-fee').textContent = `$${data.legacy_fee.toFixed(2)}`;
      document.getElementById('remit-legacy-pct').textContent = `${data.legacy_pct}% average wire fee`;
      document.getElementById('remit-digital-fee').textContent = `$${data.digital_fee.toFixed(2)}`;
      document.getElementById('remit-digital-pct').textContent = `${data.digital_pct}% mobile wallet fee`;
      document.getElementById('remit-annual-saved').textContent = `$${data.annual_savings.toFixed(2)} / year`;
      document.getElementById('remit-impact-text').textContent = data.impact_text;
    } catch (err) {
      console.error('Remittance calc error:', err);
    }
  }

  // Initial calculation
  calculateRemittance();
}


// ================= 3. PAGE 1: GLOBAL OVERVIEW =================
async function loadOverviewData(year) {
  try {
    const res = await fetch(`/api/overview?year=${year}`);
    if (!res.ok) throw new Error('Overview data fetch failed');
    const data = await res.json();

    // Populate KPIs
    animateNumber('kpi-account-val', data.avg_account_ownership);
    animateNumber('kpi-mobile-val', data.avg_mobile_money);
    animateNumber('kpi-resilience-val', data.avg_emergency_resilience);
    animateNumber('kpi-saved-val', data.avg_saved);

    // Regional bar chart
    renderRegionalBarChart(data.regional_summary);

    // Income tiers bar chart
    renderIncomeTiersChart(data.income_summary);

    // Top 5 and Bottom 5 tables
    renderLeaderTables(data.top5, data.bottom5);
  } catch (err) {
    console.error('Error loading overview:', err);
  }
}

function renderRegionalBarChart(regionalDict) {
  const theme = getPlotlyTheme();
  const regions = Object.keys(regionalDict || {});
  const values = Object.values(regionalDict || {});

  const trace = {
    x: values,
    y: regions,
    type: 'bar',
    orientation: 'h',
    marker: {
      color: '#10b981',
      opacity: 0.85
    },
    text: values.map(v => v.toFixed(1) + '%'),
    textposition: 'auto',
    hoverinfo: 'y+x'
  };

  const layout = {
    margin: { l: 200, r: 40, t: 10, b: 35 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    xaxis: {
      title: 'Account Penetration (%)',
      range: [0, 100],
      gridcolor: theme.gridcolor,
      zerolinecolor: theme.zerolinecolor
    },
    yaxis: {
      automargin: true,
      gridcolor: theme.gridcolor
    }
  };

  Plotly.newPlot('chart-regional-bars', [trace], layout, { responsive: true, displayModeBar: false });
}

function renderIncomeTiersChart(incomeDict) {
  const theme = getPlotlyTheme();
  const tiers = Object.keys(incomeDict || {});
  const values = Object.values(incomeDict || {});

  const trace = {
    x: tiers,
    y: values,
    type: 'bar',
    marker: {
      color: ['#f43f5e', '#f59e0b', '#06b6d4', '#10b981'],
      opacity: 0.85
    },
    text: values.map(v => v.toFixed(1) + '%'),
    textposition: 'auto'
  };

  const layout = {
    margin: { l: 40, r: 20, t: 10, b: 60 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    yaxis: {
      title: 'Account %',
      range: [0, 100],
      gridcolor: theme.gridcolor,
      zerolinecolor: theme.zerolinecolor
    },
    xaxis: {
      tickangle: -20,
      gridcolor: theme.gridcolor
    }
  };

  Plotly.newPlot('chart-income-tiers', [trace], layout, { responsive: true, displayModeBar: false });
}

function renderLeaderTables(top5, bottom5) {
  const topBody = document.getElementById('top5-table-body');
  if (topBody && top5) {
    topBody.innerHTML = top5.map(row => `
      <tr>
        <td><strong>${esc(row.country)}</strong></td>
        <td><small class="cell-null">${esc(row.region || '—')}</small></td>
        <td><span class="cell-high">${row.value.toFixed(1)}%</span></td>
      </tr>
    `).join('');
  }

  const bottomBody = document.getElementById('bottom5-table-body');
  if (bottomBody && bottom5) {
    bottomBody.innerHTML = bottom5.map(row => `
      <tr>
        <td><strong>${esc(row.country)}</strong></td>
        <td><small class="cell-null">${esc(row.region || '—')}</small></td>
        <td><span class="cell-low">${row.value.toFixed(1)}%</span></td>
      </tr>
    `).join('');
  }
}


// ================= 4. PAGE 2: COUNTRY INTELLIGENCE LAB =================
async function preloadCountryList() {
  try {
    const res = await fetch('/api/countries?year=2024');
    if (!res.ok) return;
    const countries = await res.json();
    state.countriesData = countries;

    // Populate country selector in Country Lab and Simulator
    const selectLab = document.getElementById('country-select');
    const selectSim = document.getElementById('sim-target-country');

    const countryOptions = countries.map(c => `<option value="${esc(c.country)}">${esc(c.country)}</option>`).join('');

    if (selectLab) {
      selectLab.innerHTML = countryOptions;
      selectLab.value = state.selectedCountry;
      selectLab.addEventListener('change', (e) => {
        state.selectedCountry = e.target.value;
        loadCountryDetail(state.selectedCountry);
      });
    }

    if (selectSim) {
      selectSim.innerHTML = countryOptions;
      selectSim.value = state.simCountry;
      selectSim.addEventListener('change', (e) => {
        state.simCountry = e.target.value;
        runPolicySimulation();
      });
    }
  } catch (err) {
    console.error('Error preloading country list:', err);
  }
}

async function loadCountryDetail(countryName) {
  try {
    const res = await fetch(`/api/country/${encodeURIComponent(countryName)}`);
    if (!res.ok) throw new Error('Country details not found');
    const data = await res.json();

    // Update banner
    document.getElementById('country-profile-name').textContent = data.country;
    document.getElementById('country-profile-region').textContent = data.region || 'World Bank Region';
    document.getElementById('country-profile-income').textContent = data.income_group || 'Income Tier';

    const latest = data.latest || {};
    document.getElementById('country-stat-account').textContent = fmtPct(latest.account);
    document.getElementById('country-stat-mobile').textContent = fmtPct(latest.mobile);
    document.getElementById('country-stat-fi').textContent = fmtPct(latest.fiaccount);
    document.getElementById('country-stat-resil').textContent = fmtPct(latest.emergency);

    // Multi-year trajectory chart
    renderCountryHistoryChart(data.history || []);

    // Demographic gaps
    const demo = data.demographics || {};
    const genderGap = demo.gender_gap !== null ? demo.gender_gap : 0;
    const incomeGap = demo.income_gap !== null ? demo.income_gap : 0;

    document.getElementById('gender-gap-val').textContent = demo.gender_gap !== null ? `${demo.gender_gap > 0 ? '+' : ''}${demo.gender_gap}%` : 'N/A';
    document.getElementById('gap-men-sub').textContent = `Men: ${fmtPct(demo.men_account)}`;
    document.getElementById('gap-women-sub').textContent = `Women: ${fmtPct(demo.women_account)}`;

    document.getElementById('income-gap-val').textContent = demo.income_gap !== null ? `${demo.income_gap > 0 ? '+' : ''}${demo.income_gap}%` : 'N/A';
    document.getElementById('gap-rich-sub').textContent = `Richest 60%: ${fmtPct(demo.richest_account)}`;
    document.getElementById('gap-poor-sub').textContent = `Poorest 40%: ${fmtPct(demo.poorest_account)}`;

    // Peer benchmarks chart
    renderCountryPeersChart(data.country, latest.account, data.peers || []);
  } catch (err) {
    console.error('Error loading country detail:', err);
  }
}

function renderCountryHistoryChart(history) {
  const theme = getPlotlyTheme();
  const years = history.map(h => h.year);
  const accountVals = history.map(h => h.account);
  const mobileVals = history.map(h => h.mobile);
  const fiVals = history.map(h => h.fiaccount);

  const traces = [
    {
      x: years,
      y: accountVals,
      name: 'Overall Account %',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#10b981', width: 3 },
      marker: { size: 7 }
    },
    {
      x: years,
      y: mobileVals,
      name: 'Mobile Money %',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#06b6d4', width: 2, dash: 'dot' },
      marker: { size: 6 }
    },
    {
      x: years,
      y: fiVals,
      name: 'Bank Account %',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f59e0b', width: 2 },
      marker: { size: 6 }
    }
  ];

  const layout = {
    margin: { l: 45, r: 20, t: 20, b: 40 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    xaxis: { title: 'Survey Wave', gridcolor: theme.gridcolor },
    yaxis: { title: 'Adoption Rate (%)', range: [0, 100], gridcolor: theme.gridcolor, zerolinecolor: theme.zerolinecolor },
    legend: { orientation: 'h', y: 1.15 }
  };

  Plotly.newPlot('chart-country-history', traces, layout, { responsive: true, displayModeBar: false });
}

function renderCountryPeersChart(currentCountry, currentAccount, peers) {
  const theme = getPlotlyTheme();
  const names = [currentCountry, ...peers.map(p => p.country)];
  const values = [currentAccount || 0, ...peers.map(p => p.account)];
  const colors = ['#10b981', ...peers.map(() => '#6b857f')];

  const trace = {
    x: names,
    y: values,
    type: 'bar',
    marker: { color: colors, opacity: 0.85 },
    text: values.map(v => v.toFixed(1) + '%'),
    textposition: 'auto'
  };

  const layout = {
    margin: { l: 40, r: 20, t: 15, b: 60 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    yaxis: { title: 'Account %', range: [0, 100], gridcolor: theme.gridcolor },
    xaxis: { tickangle: -20, gridcolor: theme.gridcolor }
  };

  Plotly.newPlot('chart-country-peers', [trace], layout, { responsive: true, displayModeBar: false });
}


// ================= 5. PAGE 3: GLOBAL MATRIX & EXPLORER =================
async function loadExplorerMatrix(year) {
  try {
    const res = await fetch(`/api/countries?year=${year}`);
    if (!res.ok) throw new Error('Countries fetch error');
    const data = await res.json();
    state.countriesData = data;
    state.filteredCountries = [...data];

    // Populate region & income filters
    populateMatrixFilters(data);

    // Render scatter explorer
    renderScatterExplorer(data);

    // Apply sorting & render table
    applyMatrixTable();

    initMatrixControls();
  } catch (err) {
    console.error('Error loading explorer matrix:', err);
  }
}

function populateMatrixFilters(data) {
  const regionSelect = document.getElementById('matrix-region-filter');
  const incomeSelect = document.getElementById('matrix-income-filter');

  const regions = Array.from(new Set(data.map(d => d.region).filter(Boolean))).sort();
  const incomes = Array.from(new Set(data.map(d => d.income_group).filter(Boolean))).sort();

  if (regionSelect) {
    regionSelect.innerHTML = '<option value="">All Regions</option>' +
      regions.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('');
  }
  if (incomeSelect) {
    incomeSelect.innerHTML = '<option value="">All Income Groups</option>' +
      incomes.map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('');
  }
}

function renderScatterExplorer(data) {
  const theme = getPlotlyTheme();
  const validData = data.filter(d => d.mobile_pct !== null && d.fiaccount_pct !== null);

  const trace = {
    x: validData.map(d => d.mobile_pct),
    y: validData.map(d => d.fiaccount_pct),
    text: validData.map(d => `${d.country} (Account: ${d.account_pct || 0}%)`),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: validData.map(d => Math.max(6, (d.account_pct || 20) * 0.28)),
      color: validData.map(d => d.account_pct || 0),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: { title: 'Account %', thickness: 12 },
      opacity: 0.85
    }
  };

  const layout = {
    margin: { l: 50, r: 40, t: 20, b: 50 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    xaxis: { title: 'Mobile Money Penetration (%)', range: [0, 100], gridcolor: theme.gridcolor, zerolinecolor: theme.zerolinecolor },
    yaxis: { title: 'Traditional Financial Institution Account (%)', range: [0, 100], gridcolor: theme.gridcolor, zerolinecolor: theme.zerolinecolor }
  };

  Plotly.newPlot('chart-scatter-explorer', [trace], layout, { responsive: true, displayModeBar: false });
}

function initMatrixControls() {
  const searchInput = document.getElementById('matrix-search-input');
  const regionFilter = document.getElementById('matrix-region-filter');
  const incomeFilter = document.getElementById('matrix-income-filter');
  const prevBtn = document.getElementById('matrix-prev-btn');
  const nextBtn = document.getElementById('matrix-next-btn');
  const exportBtn = document.getElementById('export-matrix-csv');

  function filterData() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const reg = regionFilter?.value || '';
    const inc = incomeFilter?.value || '';

    state.filteredCountries = state.countriesData.filter(d => {
      const matchQ = !q || d.country.toLowerCase().includes(q) || (d.code && d.code.toLowerCase().includes(q));
      const matchReg = !reg || d.region === reg;
      const matchInc = !inc || d.income_group === inc;
      return matchQ && matchReg && matchInc;
    });

    state.matrixPage = 1;
    applyMatrixTable();
  }

  if (searchInput) searchInput.addEventListener('input', filterData);
  if (regionFilter) regionFilter.addEventListener('change', filterData);
  if (incomeFilter) incomeFilter.addEventListener('change', filterData);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.matrixPage > 1) {
        state.matrixPage--;
        applyMatrixTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const maxPages = Math.ceil(state.filteredCountries.length / state.matrixPageSize);
      if (state.matrixPage < maxPages) {
        state.matrixPage++;
        applyMatrixTable();
      }
    });
  }

  // Sortable headers
  document.querySelectorAll('#global-matrix-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (state.matrixSortKey === key) {
        state.matrixSortAsc = !state.matrixSortAsc;
      } else {
        state.matrixSortKey = key;
        state.matrixSortAsc = false;
      }
      applyMatrixTable();
    });
  });

  if (exportBtn) {
    exportBtn.addEventListener('click', exportMatrixToCSV);
  }
}

function applyMatrixTable() {
  // Sort
  state.filteredCountries.sort((a, b) => {
    let valA = a[state.matrixSortKey];
    let valB = b[state.matrixSortKey];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === 'string') {
      return state.matrixSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return state.matrixSortAsc ? valA - valB : valB - valA;
  });

  // Pagination
  const total = state.filteredCountries.length;
  const maxPages = Math.max(1, Math.ceil(total / state.matrixPageSize));
  const start = (state.matrixPage - 1) * state.matrixPageSize;
  const pageItems = state.filteredCountries.slice(start, start + state.matrixPageSize);

  // Update counters
  document.getElementById('matrix-shown-count').textContent = pageItems.length;
  document.getElementById('matrix-total-count').textContent = total;
  document.getElementById('matrix-page-info').textContent = `Page ${state.matrixPage} of ${maxPages}`;
  document.getElementById('matrix-prev-btn').disabled = state.matrixPage <= 1;
  document.getElementById('matrix-next-btn').disabled = state.matrixPage >= maxPages;

  // Render rows
  const tbody = document.getElementById('matrix-table-body');
  if (!tbody) return;

  function cellClass(val) {
    if (val === null || val === undefined) return 'cell-null';
    if (val >= 65) return 'cell-high';
    if (val >= 35) return 'cell-med';
    return 'cell-low';
  }

  tbody.innerHTML = pageItems.map(row => `
    <tr>
      <td><strong>${esc(row.country)}</strong> <small class="cell-null">${esc(row.code || '')}</small></td>
      <td><small>${esc(row.region || '—')}</small></td>
      <td><small>${esc(row.income_group || '—')}</small></td>
      <td class="${cellClass(row.account_pct)}">${fmtPct(row.account_pct)}</td>
      <td class="${cellClass(row.mobile_pct)}">${fmtPct(row.mobile_pct)}</td>
      <td class="${cellClass(row.fiaccount_pct)}">${fmtPct(row.fiaccount_pct)}</td>
      <td class="${cellClass(row.saved_pct)}">${fmtPct(row.saved_pct)}</td>
      <td class="${cellClass(row.borrowed_pct)}">${fmtPct(row.borrowed_pct)}</td>
      <td class="${cellClass(row.emergency_pct)}">${fmtPct(row.emergency_pct)}</td>
    </tr>
  `).join('');
}

function exportMatrixToCSV() {
  const headers = ['Country', 'Code', 'Region', 'Income Group', 'Account %', 'Mobile Money %', 'Bank Account %', 'Saved %', 'Borrowed %', 'Resilience %'];
  const rows = state.filteredCountries.map(d => [
    `"${d.country.replace(/"/g, '""')}"`,
    `"${d.code || ''}"`,
    `"${d.region || ''}"`,
    `"${d.income_group || ''}"`,
    d.account_pct ?? '',
    d.mobile_pct ?? '',
    d.fiaccount_pct ?? '',
    d.saved_pct ?? '',
    d.borrowed_pct ?? '',
    d.emergency_pct ?? ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GlobalFindex_Matrix_${state.currentYear}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


// ================= 6. PAGE 4: REAL-TIME POLICY SIMULATOR =================
function initSimulator() {
  const sliders = [
    { id: 'lever-mobile', valId: 'lever-mobile-val' },
    { id: 'lever-did', valId: 'lever-did-val' },
    { id: 'lever-gender', valId: 'lever-gender-val' },
    { id: 'lever-literacy', valId: 'lever-literacy-val' },
    { id: 'lever-ob', valId: 'lever-ob-val' }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const valEl = document.getElementById(s.valId);
    if (el && valEl) {
      el.addEventListener('input', () => {
        valEl.textContent = el.value + '%';
        runPolicySimulation();
      });
    }
  });

  const runBtn = document.getElementById('run-sim-btn');
  if (runBtn) {
    runBtn.addEventListener('click', runPolicySimulation);
  }

  const resetBtn = document.getElementById('reset-sim-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('lever-mobile').value = 30;
      document.getElementById('lever-did').value = 35;
      document.getElementById('lever-gender').value = 25;
      document.getElementById('lever-literacy').value = 20;
      document.getElementById('lever-ob').value = 20;
      sliders.forEach(s => {
        const input = document.getElementById(s.id);
        const valBadge = document.getElementById(s.valId);
        if (input && valBadge) valBadge.textContent = input.value + '%';
      });
      runPolicySimulation();
    });
  }
}

async function runPolicySimulation() {
  initSimulator();
  const country = document.getElementById('sim-target-country')?.value || state.simCountry;
  document.getElementById('sim-country-echo').textContent = country;

  const payload = {
    country: country,
    mobile_infrastructure: parseFloat(document.getElementById('lever-mobile')?.value || 30),
    digital_id: parseFloat(document.getElementById('lever-did')?.value || 35),
    gender_inclusion: parseFloat(document.getElementById('lever-gender')?.value || 25),
    financial_literacy: parseFloat(document.getElementById('lever-literacy')?.value || 20),
    open_banking: parseFloat(document.getElementById('lever-ob')?.value || 20)
  };

  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Simulation calculation error');
    const sim = await res.json();

    // Populate simulator banner
    document.getElementById('sim-index-projected').textContent = sim.projected.inclusion_index.toFixed(1);
    document.getElementById('sim-index-baseline').textContent = sim.baseline.inclusion_index.toFixed(1);
    document.getElementById('sim-index-uplift').textContent = `+${sim.projected.uplift.toFixed(1)}`;

    document.getElementById('sim-account-projected').textContent = `${sim.projected.account.toFixed(1)}%`;
    document.getElementById('sim-account-baseline').textContent = `${sim.baseline.account.toFixed(1)}%`;
    const accUplift = (sim.projected.account - sim.baseline.account).toFixed(1);
    document.getElementById('sim-account-uplift').textContent = `+${accUplift}%`;

    document.getElementById('sim-newly-included').textContent = `+${(sim.projected.newly_included_est / 1_000_000).toFixed(2)}M`;
    document.getElementById('sim-years-target').textContent = sim.projected.years_to_universal_access > 0 ? `${sim.projected.years_to_universal_access} yrs` : 'Reached Target';

    // Before vs After chart
    renderSimulationChart(sim);
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

function renderSimulationChart(sim) {
  const theme = getPlotlyTheme();
  const categories = ['Account Penetration (%)', 'Mobile Money (%)', 'Emergency Resilience (%)', 'Inclusion Index (0-100)'];
  const baseline = [sim.baseline.account, sim.baseline.mobile, sim.baseline.emergency_resilience, sim.baseline.inclusion_index];
  const projected = [sim.projected.account, sim.projected.mobile, sim.projected.emergency_resilience, sim.projected.inclusion_index];

  const traceBaseline = {
    x: categories,
    y: baseline,
    name: 'Current Baseline',
    type: 'bar',
    marker: { color: '#6b857f', opacity: 0.8 }
  };

  const traceProjected = {
    x: categories,
    y: projected,
    name: 'Projected with Reform Bundle',
    type: 'bar',
    marker: { color: '#10b981', opacity: 0.9 }
  };

  const layout = {
    barmode: 'group',
    margin: { l: 45, r: 20, t: 20, b: 60 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    yaxis: { title: 'Score / Percentage', range: [0, 100], gridcolor: theme.gridcolor },
    xaxis: { tickangle: -15, gridcolor: theme.gridcolor },
    legend: { orientation: 'h', y: 1.15 }
  };

  Plotly.newPlot('chart-sim-comparison', [traceBaseline, traceProjected], layout, { responsive: true, displayModeBar: false });
}


// ================= 7. PAGE 5: CLUSTER ANALYSIS & ARCHETYPES =================
function initClusterPage() {
  const kMin = document.getElementById('k-min');
  const kMax = document.getElementById('k-max');
  const selectedK = document.getElementById('selected-k');
  const form = document.getElementById('analysis-form');
  const quickRunBtn = document.getElementById('quick-run-btn');

  function updateKOptions() {
    const lo = Number(kMin?.value) || 2;
    const hi = Number(kMax?.value) || 6;
    const old = Number(selectedK?.value) || 3;
    if (!selectedK) return;
    selectedK.innerHTML = '';
    for (let k = lo; k <= hi; k++) {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = `k = ${k}`;
      selectedK.appendChild(opt);
    }
    selectedK.value = String(Math.min(Math.max(old, lo), hi));
  }

  if (kMin) kMin.addEventListener('change', updateKOptions);
  if (kMax) kMax.addEventListener('change', updateKOptions);
  updateKOptions();

  if (quickRunBtn) {
    quickRunBtn.addEventListener('click', () => {
      document.getElementById('dataset').value = '';
      document.getElementById('file-name').textContent = 'World Bank Global Findex 2025 (Built-in)';
      runClusterAnalysis();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runClusterAnalysis();
    });
  }

  // Pre-load default features from inspect endpoint if empty
  preloadClusterFeatures();
}

async function preloadClusterFeatures() {
  const container = document.getElementById('features');
  if (!container || container.children.length > 0) return;

  try {
    const fd = new FormData();
    fd.append('year', document.getElementById('year')?.value || '2024');
    const res = await fetch('/api/inspect', { method: 'POST', body: fd });
    if (!res.ok) return;
    const data = await res.json();
    if (data.features) {
      container.innerHTML = data.features.slice(0, 16).map(f => `
        <label>
          <input type="checkbox" name="features" value="${esc(f)}" checked>
          <span>${esc(f)}</span>
        </label>
      `).join('');
    }
  } catch (e) {
    console.warn('Preload features error:', e);
  }
}

async function runClusterAnalysis() {
  const form = document.getElementById('analysis-form');
  const statusEl = document.getElementById('status');
  if (!form || !statusEl) return;

  statusEl.textContent = 'Fitting Lloyd K-Means & calculating PCA projection...';
  const fd = new FormData(form);

  try {
    const res = await fetch('/api/analyze', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Clustering failed');

    statusEl.textContent = 'Optimization complete!';
    state.clusterResult = data;
    renderClusterResults(data);
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
  }
}

function renderClusterResults(d) {
  const theme = getPlotlyTheme();
  const colors = ['#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#8b5cf6', '#14b8a6', '#ea580c'];

  // 1. PCA Scatter Plot
  const clusters = Array.from(new Set(d.countries_data.map(x => x.cluster)));
  const pcaTraces = clusters.map(c => {
    const cData = d.countries_data.filter(x => x.cluster === c);
    return {
      x: cData.map(x => x.pc1),
      y: cData.map(x => x.pc2),
      text: cData.map(x => x.country),
      type: 'scatter',
      mode: 'markers',
      name: `Archetype ${c + 1}`,
      marker: {
        size: 9,
        color: colors[c % colors.length],
        opacity: 0.85,
        line: { width: 1, color: '#ffffff' }
      }
    };
  });

  const pcaLayout = {
    margin: { l: 45, r: 20, t: 20, b: 45 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    xaxis: { title: `Principal Component 1 (${(d.summary.explained_variance_pca[0] * 100).toFixed(1)}% var)`, gridcolor: theme.gridcolor, zerolinecolor: theme.zerolinecolor },
    yaxis: { title: `Principal Component 2 (${(d.summary.explained_variance_pca[1] * 100).toFixed(1)}% var)`, gridcolor: theme.gridcolor, zerolinecolor: theme.zerolinecolor },
    legend: { orientation: 'h', y: 1.12 }
  };

  Plotly.newPlot('chart-pca', pcaTraces, pcaLayout, { responsive: true, displayModeBar: false });

  // 2. WCSS Elbow & Silhouette Curve
  const ms = d.metrics;
  const metricsTraces = [
    {
      x: ms.map(x => x.k),
      y: ms.map(x => x.wcss),
      name: 'WCSS (Inertia)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#10b981', width: 2.5 },
      yaxis: 'y'
    },
    {
      x: ms.map(x => x.k),
      y: ms.map(x => x.silhouette_euclidean),
      name: 'Silhouette Coefficient',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f59e0b', width: 2 },
      yaxis: 'y2'
    }
  ];

  const metricsLayout = {
    margin: { l: 50, r: 50, t: 20, b: 45 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    xaxis: { title: 'Number of Clusters (k)', dtick: 1, gridcolor: theme.gridcolor },
    yaxis: { title: 'WCSS Inertia', gridcolor: theme.gridcolor },
    yaxis2: { title: 'Silhouette Score', overlaying: 'y', side: 'right', range: [-0.2, 1], gridcolor: 'transparent' },
    legend: { orientation: 'h', y: 1.15 }
  };

  Plotly.newPlot('chart-metrics', metricsTraces, metricsLayout, { responsive: true, displayModeBar: false });

  // 3. Profiles Grid
  const profilesContainer = document.getElementById('cluster-profiles-container');
  if (profilesContainer) {
    profilesContainer.innerHTML = d.profiles.map(p => `
      <div class="profile-card">
        <div class="profile-card-header">
          <span class="profile-name">Archetype ${p.cluster + 1}</span>
          <span class="badge badge-emerald">${p.countries} COUNTRIES</span>
        </div>
        <div class="profile-bars-list">
          ${p.features.slice(0, 5).map(f => {
            const z = Math.max(-2, Math.min(2, f.relative_z));
            const fillWidth = Math.abs(z) * 25;
            const fillLeft = z >= 0 ? 50 : 50 - fillWidth;
            return `
              <div class="profile-bar-row">
                <span title="${esc(f.name)}">${esc(f.name.length > 14 ? f.name.slice(0, 13) + '…' : f.name)}</span>
                <div class="profile-bar-track">
                  <div class="profile-bar-fill" style="left:${fillLeft}%; width:${fillWidth}%"></div>
                </div>
                <span>${z >= 0 ? '+' : ''}${z.toFixed(2)}σ</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  // 4. Assignments Table
  const tableWrap = document.getElementById('cluster-country-table-wrap');
  if (tableWrap) {
    tableWrap.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Economy</th>
            <th>Assigned Archetype</th>
            <th>PC1 Coordinate</th>
            <th>PC2 Coordinate</th>
          </tr>
        </thead>
        <tbody>
          ${d.countries_data.slice(0, 30).map(x => `
            <tr>
              <td><strong>${esc(x.country)}</strong></td>
              <td><span class="badge badge-neutral">Archetype ${x.cluster + 1}</span></td>
              <td>${x.pc1.toFixed(3)}</td>
              <td>${x.pc2.toFixed(3)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Download button
  const dlBtn = document.getElementById('download-cluster-csv');
  if (dlBtn) {
    dlBtn.onclick = () => {
      const csv = ['Country,Cluster,PC1,PC2', ...d.countries_data.map(x => `"${x.country.replace(/"/g, '""')}",${x.cluster + 1},${x.pc1},${x.pc2}`)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Findex_Clusters_k${d.summary.selected_k}_${d.summary.year}.csv`;
      a.click();
    };
  }
}


// ================= 8. PAGE 6: LONGITUDINAL TRENDS =================
async function loadTrendsData() {
  try {
    const res = await fetch('/api/trends');
    if (!res.ok) throw new Error('Trends fetch failed');
    const trends = await res.json();

    renderGlobalTrajectoryChart(trends);
    renderMobileSurgeChart(trends);
    renderSavingsDebtChart(trends);
  } catch (err) {
    console.error('Error loading trends:', err);
  }
}

function renderGlobalTrajectoryChart(trends) {
  const theme = getPlotlyTheme();
  const years = trends.map(t => t.year);

  const traces = [
    {
      x: years,
      y: trends.map(t => t.account_avg),
      name: 'Overall Account Ownership (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#10b981', width: 3.5 },
      marker: { size: 8 }
    },
    {
      x: years,
      y: trends.map(t => t.fiaccount_avg),
      name: 'Financial Institution Account (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#06b6d4', width: 2.5 },
      marker: { size: 6 }
    },
    {
      x: years,
      y: trends.map(t => t.mobile_avg),
      name: 'Mobile Money Account (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f59e0b', width: 2.5, dash: 'dot' },
      marker: { size: 6 }
    }
  ];

  const layout = {
    margin: { l: 50, r: 20, t: 20, b: 45 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    yaxis: { title: 'Global Mean (%)', range: [0, 100], gridcolor: theme.gridcolor, zerolinecolor: theme.zerolinecolor },
    xaxis: { title: 'Survey Round', gridcolor: theme.gridcolor },
    legend: { orientation: 'h', y: 1.12 }
  };

  Plotly.newPlot('chart-trends-account', traces, layout, { responsive: true, displayModeBar: false });
}

function renderMobileSurgeChart(trends) {
  const theme = getPlotlyTheme();
  const trace = {
    x: trends.map(t => t.year),
    y: trends.map(t => t.mobile_avg),
    type: 'bar',
    marker: { color: '#06b6d4', opacity: 0.85 },
    text: trends.map(t => (t.mobile_avg ? t.mobile_avg.toFixed(1) + '%' : '—')),
    textposition: 'auto'
  };

  const layout = {
    margin: { l: 45, r: 20, t: 15, b: 45 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    yaxis: { title: 'Mobile Account %', gridcolor: theme.gridcolor },
    xaxis: { gridcolor: theme.gridcolor }
  };

  Plotly.newPlot('chart-trends-mobile', [trace], layout, { responsive: true, displayModeBar: false });
}

function renderSavingsDebtChart(trends) {
  const theme = getPlotlyTheme();
  const traces = [
    {
      x: trends.map(t => t.year),
      y: trends.map(t => t.saved_avg),
      name: 'Saved Money (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#10b981', width: 2.5 }
    },
    {
      x: trends.map(t => t.year),
      y: trends.map(t => t.borrowed_avg),
      name: 'Borrowed Money (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f43f5e', width: 2.5 }
    }
  ];

  const layout = {
    margin: { l: 45, r: 20, t: 20, b: 45 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    yaxis: { title: 'Rate (%)', range: [0, 80], gridcolor: theme.gridcolor },
    xaxis: { gridcolor: theme.gridcolor },
    legend: { orientation: 'h', y: 1.15 }
  };

  Plotly.newPlot('chart-trends-savings-debt', traces, layout, { responsive: true, displayModeBar: false });
}


// ================= 9. PAGE 7: EQUITY & POLICY GAPS =================
async function loadPolicyGapsData() {
  try {
    const res = await fetch('/api/policy-gaps');
    if (!res.ok) throw new Error('Policy gaps fetch failed');
    const gaps = await res.json();

    // 1. Leapfroggers List
    const leapEl = document.getElementById('leapfroggers-list');
    if (leapEl && gaps.leapfroggers) {
      leapEl.innerHTML = gaps.leapfroggers.map(item => `
        <div class="gap-list-row">
          <span>${esc(item.country)}</span>
          <span class="gap-val-pill">Mobile +${item.gap.toFixed(1)}% vs Bank</span>
        </div>
      `).join('');
    }

    // 2. Exclusion Frontier List
    const exEl = document.getElementById('exclusion-frontier-list');
    if (exEl && gaps.exclusion_frontier) {
      exEl.innerHTML = gaps.exclusion_frontier.map(item => `
        <div class="gap-list-row">
          <span>${esc(item.country)}</span>
          <span class="badge badge-danger">${item.account_pct.toFixed(1)}%</span>
        </div>
      `).join('');
    }

    // 3. Informal Savers List
    const infEl = document.getElementById('informal-savers-list');
    if (infEl && gaps.informal_savers) {
      infEl.innerHTML = gaps.informal_savers.map(item => `
        <div class="gap-list-row">
          <span>${esc(item.country)}</span>
          <span class="badge badge-warning">Saved ${item.saved_pct.toFixed(1)}%</span>
        </div>
      `).join('');
    }

    // 4. Exclusion Frontier Bar Chart
    renderExclusionChart(gaps.exclusion_frontier || []);
  } catch (err) {
    console.error('Error loading policy gaps:', err);
  }
}

function renderExclusionChart(frontier) {
  const theme = getPlotlyTheme();
  const sorted = [...frontier].reverse();

  const trace = {
    x: sorted.map(d => d.account_pct),
    y: sorted.map(d => d.country),
    type: 'bar',
    orientation: 'h',
    marker: { color: '#f43f5e', opacity: 0.85 },
    text: sorted.map(d => d.account_pct.toFixed(1) + '%'),
    textposition: 'auto'
  };

  const layout = {
    margin: { l: 160, r: 40, t: 15, b: 40 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    xaxis: { title: 'Account Penetration (%)', range: [0, 50], gridcolor: theme.gridcolor },
    yaxis: { automargin: true, gridcolor: theme.gridcolor }
  };

  Plotly.newPlot('chart-gaps-bar', [trace], layout, { responsive: true, displayModeBar: false });
}


// ================= 10. PAGE 8: DATA QUALITY & GOVERNANCE =================
async function loadDataQualityData() {
  try {
    const res = await fetch('/api/data-quality');
    if (!res.ok) throw new Error('Data quality fetch failed');
    const dq = await res.json();

    document.getElementById('dq-total-indicators').textContent = dq.total_indicators;
    document.getElementById('dq-total-obs').textContent = Number(dq.total_observations).toLocaleString();

    // 1. Missingness horizontal bar chart
    renderMissingnessChart(dq.missing_by_indicator || []);

    // 2. Country coverage per wave
    renderCoverageChart(dq.country_coverage || []);
  } catch (err) {
    console.error('Error loading data quality:', err);
  }
}

function renderMissingnessChart(rates) {
  const theme = getPlotlyTheme();
  const sorted = [...rates].reverse();

  const trace = {
    x: sorted.map(r => r.missing_pct),
    y: sorted.map(r => r.indicator),
    type: 'bar',
    orientation: 'h',
    marker: { color: '#f59e0b', opacity: 0.85 },
    text: sorted.map(r => r.missing_pct.toFixed(1) + '%'),
    textposition: 'auto'
  };

  const layout = {
    margin: { l: 240, r: 30, t: 15, b: 40 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    xaxis: { title: 'Missingness (%)', range: [0, 100], gridcolor: theme.gridcolor },
    yaxis: { automargin: true, gridcolor: theme.gridcolor }
  };

  Plotly.newPlot('chart-quality-missing', [trace], layout, { responsive: true, displayModeBar: false });
}

function renderCoverageChart(coverage) {
  const theme = getPlotlyTheme();
  const trace = {
    x: coverage.map(c => c.year),
    y: coverage.map(c => c.countries),
    type: 'bar',
    marker: { color: '#10b981', opacity: 0.85 },
    text: coverage.map(c => c.countries + ' countries'),
    textposition: 'auto'
  };

  const layout = {
    margin: { l: 45, r: 20, t: 15, b: 40 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    yaxis: { title: 'Surveyed Economies', range: [0, 180], gridcolor: theme.gridcolor },
    xaxis: { gridcolor: theme.gridcolor }
  };

  Plotly.newPlot('chart-quality-coverage', [trace], layout, { responsive: true, displayModeBar: false });
}
