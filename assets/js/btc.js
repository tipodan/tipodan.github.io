/**
 * BTC real-time chart using CoinGecko public API and Chart.js.
 * Supports EUR and USD currencies.
 */
const BTC = (() => {
  let chart = null;
  let refreshInterval = null;
  let currentCurrency = 'eur';
  let abortController = null;
  let debounceTimer = null;

  const API_URL = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart';

  async function fetchData(days = 7, signal) {
    const params = new URLSearchParams({
      vs_currency: currentCurrency,
      days: days
    });
    if (days > 1) params.set('interval', 'daily');

    const res = await fetch(`${API_URL}?${params}`, {
      headers: { 'Accept': 'application/json' },
      signal
    });

    if (res.status === 429) {
      throw new Error('Too many requests. Please wait a moment.');
    }
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  function formatDate(timestamp, days) {
    const d = new Date(timestamp);
    if (days <= 1) {
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currentCurrency.toUpperCase()
    }).format(value);
  }

  function getActiveDays() {
    const activeBtn = document.querySelector('.btc-period-btn.active');
    return activeBtn ? parseInt(activeBtn.dataset.days) : 7;
  }

  function requestChart(days) {
    // Cancel any in-flight request
    if (abortController) abortController.abort();

    // Debounce rapid clicks
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderChart(days);
    }, 300);
  }

  async function renderChart(days = 7) {
    const container = document.getElementById('btc-chart-container');
    const priceEl = document.getElementById('btc-price');
    const changeEl = document.getElementById('btc-change');

    if (!container) return;

    // Create new abort controller for this request
    abortController = new AbortController();
    const signal = abortController.signal;

    try {
      container.innerHTML = '<canvas id="btcCanvas"></canvas>';
      const data = await fetchData(days, signal);
      const prices = data.prices;

      if (!prices || prices.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
      }

      // Current price and change
      const current = prices[prices.length - 1][1];
      const first = prices[0][1];
      const change = ((current - first) / first) * 100;

      priceEl.textContent = formatCurrency(current);
      changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
      changeEl.className = `btc-change ${change >= 0 ? 'up' : 'down'}`;

      const labels = prices.map(p => formatDate(p[0], days));
      const values = prices.map(p => p[1]);

      const ctx = document.getElementById('btcCanvas').getContext('2d');

      if (chart) chart.destroy();

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, change >= 0 ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      const lineColor = change >= 0 ? '#27ae60' : '#e74c3c';
      const labelText = `BTC/${currentCurrency.toUpperCase()}`;

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: labelText,
            data: values,
            borderColor: lineColor,
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHitRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => formatCurrency(ctx.parsed.y)
              }
            }
          },
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 10,
                font: { family: 'Montserrat', size: 10 }
              },
              grid: { display: false }
            },
            y: {
              ticks: {
                callback: (v) => formatCurrency(v),
                font: { family: 'Montserrat', size: 10 }
              },
              grid: { color: '#f0f0f0' }
            }
          }
        }
      });
    } catch (err) {
      // Ignore aborted requests (user clicked something else)
      if (err.name === 'AbortError') return;
      container.innerHTML = `<p class="btc-error">Error: ${err.message}</p>`;
      console.error('BTC fetch error:', err);
    }
  }

  function init() {
    currentCurrency = 'eur';
    renderChart(7);

    // Period buttons
    document.querySelectorAll('.btc-period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btc-period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        requestChart(parseInt(btn.dataset.days));
      });
    });

    // Currency toggle buttons
    document.querySelectorAll('.btc-currency-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btc-currency-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCurrency = btn.dataset.currency;
        requestChart(getActiveDays());
      });
    });

    // Auto-refresh every 60 seconds
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
      renderChart(getActiveDays());
    }, 60000);
  }

  function destroy() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    clearTimeout(debounceTimer);
    if (chart) {
      chart.destroy();
      chart = null;
    }
  }

  return { init, destroy };
})();
