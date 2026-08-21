/**
 * Flights module: All flights table, By year table, Airlines chart.
 */
const Flights = (() => {

  function logoPath(airline, site) {
    const file = site.airlineLogos[airline];
    return file ? `./assets/images/airlines/${file}` : '';
  }

  // === All flights table ===
  function initAllTable(flights, site) {
    let currentSort = { col: 'date', dir: 'asc' };
    let currentFilter = null;

    function getDateValue(f) {
      return f.date || `${f.year}-01-01`;
    }

    function getSortValue(f, col) {
      switch (col) {
        case 'route': return f.route;
        case 'from': return f.from;
        case 'to': return f.to;
        case 'date': return getDateValue(f);
        case 'airline': return f.airline;
        default: return '';
      }
    }

    function applyFilter(data) {
      if (!currentFilter) return data;
      return data.filter(f => {
        switch (currentFilter.type) {
          case 'airline': return f.airline === currentFilter.value;
          case 'year': return String(f.year) === currentFilter.value;
          case 'route': return f.route === currentFilter.value;
          case 'airport': return f.fromCode === currentFilter.value || f.toCode === currentFilter.value;
          default: return true;
        }
      });
    }

    function updateFilterBar() {
      const bar = document.getElementById('filterBar');
      const text = document.getElementById('filterText');
      if (currentFilter) {
        const labels = { airline: 'Airline', year: 'Year', route: 'Route', airport: 'Airport' };
        text.textContent = `${labels[currentFilter.type]}: ${currentFilter.value}`;
        bar.style.display = 'block';
      } else {
        bar.style.display = 'none';
      }
    }

    function renderTable() {
      const filtered = applyFilter(flights);
      const sorted = filtered.slice().sort((a, b) => {
        const va = getSortValue(a, currentSort.col).toString().toLowerCase();
        const vb = getSortValue(b, currentSort.col).toString().toLowerCase();
        if (va < vb) return currentSort.dir === 'asc' ? -1 : 1;
        if (va > vb) return currentSort.dir === 'asc' ? 1 : -1;
        return 0;
      });

      const tbody = document.querySelector('#flightsTable tbody');
      tbody.innerHTML = '';
      for (const f of sorted) {
        const date = f.date || f.year;
        const logo = logoPath(f.airline, site);
        const logoImg = logo ? `<img style="width:16px;height:16px;object-fit:contain;display:inline-block;vertical-align:middle;margin-right:6px" src="${logo}" alt="">` : '';
        const tr = document.createElement('tr');
        tr.innerHTML =
          `<td class="clickable col-route" data-filter-type="route" data-filter-value="${f.route}">${f.route}</td>` +
          `<td class="clickable" data-filter-type="airport" data-filter-value="${f.fromCode}">${f.from} (${f.fromCode})</td>` +
          `<td class="clickable" data-filter-type="airport" data-filter-value="${f.toCode}">${f.to} (${f.toCode})</td>` +
          `<td class="clickable" data-filter-type="year" data-filter-value="${f.year}">${date}</td>` +
          `<td class="clickable" data-filter-type="airline" data-filter-value="${f.airline}">${logoImg}<span style="vertical-align:middle">${f.airline}</span></td>`;
        tbody.appendChild(tr);
      }

      // Click handlers
      tbody.querySelectorAll('td.clickable').forEach(td => {
        td.addEventListener('click', () => {
          const type = td.dataset.filterType;
          const value = td.dataset.filterValue;
          if (currentFilter && currentFilter.type === type && currentFilter.value === value) {
            currentFilter = null;
          } else {
            currentFilter = { type, value };
          }
          updateFilterBar();
          renderTable();
        });
      });

      updateFilterBar();
    }

    function updateArrows() {
      document.querySelectorAll('#flightsTable th').forEach(th => {
        const arrow = th.querySelector('.sort-arrow');
        const col = th.dataset.col;
        arrow.textContent = col === currentSort.col ? (currentSort.dir === 'asc' ? '▲' : '▼') : '';
      });
    }

    // Header sort
    document.querySelectorAll('#flightsTable th').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (currentSort.col === col) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.col = col;
          currentSort.dir = 'asc';
        }
        renderTable();
        updateArrows();
      });
    });

    document.getElementById('clearFilter').addEventListener('click', () => {
      currentFilter = null;
      updateFilterBar();
      renderTable();
    });

    renderTable();
    updateArrows();
  }

  // === By year table ===
  function initByYearTable(flights, site) {
    const total = flights.length;
    const flightsByYear = {};
    flights.forEach(f => {
      if (!flightsByYear[f.year]) flightsByYear[f.year] = [];
      flightsByYear[f.year].push(f);
    });

    const yearData = Object.keys(flightsByYear).map(y => ({
      year: parseInt(y),
      flights: flightsByYear[y].length,
      pct: parseFloat(((flightsByYear[y].length / total) * 100).toFixed(1))
    }));

    let currentSort = { col: 'year', dir: 'asc' };
    const expandedYears = {};

    function sortData(col, dir) {
      return yearData.slice().sort((a, b) => {
        if (a[col] < b[col]) return dir === 'asc' ? -1 : 1;
        if (a[col] > b[col]) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    function renderTable(data) {
      const tbody = document.querySelector('#yearTable tbody');
      tbody.innerHTML = '';
      for (const row of data) {
        const tr = document.createElement('tr');
        tr.className = 'year-row';
        tr.dataset.year = row.year;
        tr.innerHTML = `<td>${row.year}</td><td>${row.flights}</td><td>${row.pct.toFixed(1)}%</td>`;
        tbody.appendChild(tr);

        if (expandedYears[row.year]) {
          for (const f of flightsByYear[row.year]) {
            const detail = document.createElement('tr');
            detail.className = 'detail-row';
            const date = f.date || '';
            const logo = logoPath(f.airline, site);
            const logoImg = logo ? `<img class="detail-logo" src="${logo}" alt="">` : '';
            detail.innerHTML =
              `<td>${f.route} — ${f.from} → ${f.to}${date ? ` (${date})` : ''}</td>` +
              `<td colspan="2" style="text-align:left">${logoImg}<span style="vertical-align:middle">${f.airline}</span></td>`;
            tbody.appendChild(detail);
          }
        }
      }

      // Total row
      const totalRow = document.createElement('tr');
      totalRow.className = 'total-row';
      totalRow.innerHTML = `<td>Total</td><td>${total}</td><td>100%</td>`;
      tbody.appendChild(totalRow);

      // Click to expand
      tbody.querySelectorAll('.year-row').forEach(row => {
        row.querySelector('td:first-child').addEventListener('click', () => {
          const y = parseInt(row.dataset.year);
          expandedYears[y] = !expandedYears[y];
          renderTable(sortData(currentSort.col, currentSort.dir));
        });
      });
    }

    function updateArrows() {
      document.querySelectorAll('#yearTable th').forEach(th => {
        const arrow = th.querySelector('.sort-arrow');
        const col = th.dataset.col;
        arrow.textContent = col === currentSort.col ? (currentSort.dir === 'asc' ? '▲' : '▼') : '';
      });
    }

    document.querySelectorAll('#yearTable th').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (currentSort.col === col) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.col = col;
          currentSort.dir = 'asc';
        }
        renderTable(sortData(currentSort.col, currentSort.dir));
        updateArrows();
      });
    });

    renderTable(sortData('year', 'asc'));
    updateArrows();
  }

  // === Airlines chart ===
  function initAirlinesChart(flights, site) {
    const total = flights.length;
    const counts = {};
    flights.forEach(f => { counts[f.airline] = (counts[f.airline] || 0) + 1; });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(e => e[0]);
    const data = sorted.map(e => e[1]);
    const maxCount = data[0];

    // Top 3
    const medals = ['🥇', '🥈', '🥉'];
    const top3El = document.getElementById('top3');
    const order = [1, 0, 2]; // 2nd, 1st, 3rd
    for (const idx of order) {
      if (idx >= sorted.length) continue;
      const name = labels[idx];
      const count = data[idx];
      const pct = ((count / total) * 100).toFixed(1);
      const logo = logoPath(name, site);
      const div = document.createElement('div');
      div.className = 'top3-item' + (idx === 0 ? ' first' : '');
      div.innerHTML =
        `<span class="medal">${medals[idx]}</span>` +
        (logo ? `<img class="top3-logo" src="${logo}" alt="">` : '') +
        `<span class="top3-name">${name}</span>` +
        `<span class="top3-count">${count} flights (${pct}%)</span>`;
      top3El.appendChild(div);
    }

    // Bar chart
    const barChart = document.getElementById('barChart');
    labels.forEach((name, i) => {
      const count = data[i];
      const pct = ((count / total) * 100).toFixed(1);
      const widthPct = ((count / maxCount) * 100).toFixed(1);
      const color = site.airlineColors[name] || '#999';
      const logo = logoPath(name, site);
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML =
        (logo ? `<img class="bar-logo" src="${logo}" alt="">` : '<span class="bar-logo"></span>') +
        `<span class="bar-name">${name}</span>` +
        `<div class="bar-track"><div class="bar-fill" style="width:${widthPct}%;background-color:${color}"></div></div>` +
        `<span class="bar-value">${count} (${pct}%)</span>`;
      barChart.appendChild(row);
    });

    // Waffle chart (icon grid)
    const waffleEl = document.getElementById('waffleChart');
    labels.forEach((name) => {
      const count = counts[name];
      const logo = logoPath(name, site);
      for (let i = 0; i < count; i++) {
        const cell = document.createElement('span');
        cell.className = 'waffle-cell';
        cell.title = name;
        if (logo) {
          cell.innerHTML = `<img src="${logo}" alt="${name}">`;
        } else {
          cell.textContent = '✈';
        }
        waffleEl.appendChild(cell);
      }
    });
  }

  return { initAllTable, initByYearTable, initAirlinesChart };
})();
