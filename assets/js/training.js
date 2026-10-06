/**
 * Training module: read-only workout log from Supabase.
 *
 * Reads sessions and their exercise sets (joined with exercises and workouts)
 * using the public anon key + Row Level Security (SELECT-only policy).
 * The anon key is public by design; write access must stay disabled via RLS.
 */
const Training = (() => {
  // --- Supabase config (public anon key — safe to expose with RLS enabled) ---
  const SUPABASE_URL = 'https://pffckihaqogqzmkqjccs.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_kk2v4bYVtwoBzzMTRQJSlA_K6C25TiP';

  let client = null;

  function getClient() {
    if (client) return client;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Supabase SDK not loaded');
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
  }

  // --- Data loading ---
  // Fetch sessions with workout name and nested sets + exercise name.
  async function fetchSessions() {
    const sb = getClient();
    const { data, error } = await sb
      .from('sessions')
      .select(`
        id,
        date,
        notes,
        workouts ( name ),
        exercise_sets (
          set_number,
          reps,
          weight,
          exercises ( name, muscle_group )
        )
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // --- Formatting helpers ---
  function formatWeight(w) {
    if (w === null || w === undefined) return 'BW'; // bodyweight
    return `${Number(w).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}<span class="unit-kg"> kg</span>`;
  }

  // Combined "reps × peso" cell (e.g. "8×90 kg", or "10×BW" for bodyweight).
  function formatSet(s) {
    return `${s.reps}×${formatWeight(s.weight)}`;
  }

  // --- Flatten sessions into one row per (session, exercise) ---
  // Each row: { date, exercise, sets: Map<set_number, set> }.
  function buildRows(sessions) {
    const rows = [];
    for (const session of sessions) {
      const byExercise = new Map();
      for (const s of session.exercise_sets || []) {
        const name = s.exercises ? s.exercises.name : '(desconocido)';
        if (!byExercise.has(name)) byExercise.set(name, new Map());
        byExercise.get(name).set(s.set_number, s);
      }
      for (const [exercise, sets] of byExercise) {
        rows.push({ date: session.date, exercise, sets });
      }
    }
    return rows;
  }

  // --- Rendering ---
  function render(container, allRows, initialExercise) {
    let sortDir = 'desc';       // date sort direction
    let filter = null;          // null = all; else { type: 'exercise'|'date', value }
    let progressChart = null;   // Chart.js instance for exercise progress
    let chartEnabled = window.innerWidth > 900; // auto-on on desktop, off on mobile

    container.innerHTML = `
      <div class="training-filter-bar" id="trainingFilterBar" style="display:none">
        <span id="trainingFilterText"></span>
        <button type="button" id="trainingClearFilter" class="training-clear">× quitar</button>
        <label class="training-chart-toggle" id="trainingChartToggle" style="display:none">
          <input type="checkbox" id="trainingChartCheck" ${chartEnabled ? 'checked' : ''}>
          chart
        </label>
      </div>
      <div class="training-progress" id="trainingProgress" style="display:none">
        <canvas id="trainingProgressChart"></canvas>
      </div>
      <table class="flights-table training-table">
        <thead></thead>
        <tbody></tbody>
      </table>`;

    const thead = container.querySelector('thead');
    const tbody = container.querySelector('tbody');
    const filterBar = container.querySelector('#trainingFilterBar');
    const filterText = container.querySelector('#trainingFilterText');
    const progressEl = container.querySelector('#trainingProgress');
    const chartToggleLabel = container.querySelector('#trainingChartToggle');
    const chartCheck = container.querySelector('#trainingChartCheck');

    chartCheck.addEventListener('change', () => {
      chartEnabled = chartCheck.checked;
      if (filter && filter.type === 'exercise') {
        if (chartEnabled) {
          renderProgressChart(filter.value);
        } else {
          progressEl.style.display = 'none';
          if (progressChart) { progressChart.destroy(); progressChart = null; }
        }
      }
    });
    const progressCanvas = container.querySelector('#trainingProgressChart');

    // Build progress chart for the currently filtered exercise.
    function renderProgressChart(exerciseName) {
      // Gather all rows for this exercise, sorted by date ascending.
      const exerciseRows = allRows
        .filter(r => r.exercise === exerciseName)
        .slice()
        .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

      // Compute mean weight per session (ignore BW sets where weight is null).
      const points = exerciseRows.map(r => {
        const weights = [...r.sets.values()]
          .map(s => s.weight)
          .filter(w => w !== null && w !== undefined);
        const avg = weights.length
          ? weights.reduce((sum, w) => sum + Number(w), 0) / weights.length
          : null;
        return { date: r.date, avg };
      }).filter(p => p.avg !== null);

      if (points.length < 2) {
        progressEl.style.display = 'none';
        if (progressChart) { progressChart.destroy(); progressChart = null; }
        return;
      }

      progressEl.style.display = 'block';
      if (progressChart) progressChart.destroy();

      progressChart = new Chart(progressCanvas, {
        type: 'line',
        data: {
          labels: points.map(p => p.date),
          datasets: [{
            data: points.map(p => p.avg),
            borderColor: '#333',
            backgroundColor: 'rgba(51,51,51,0.08)',
            borderWidth: 1.5,
            pointRadius: 3,
            pointBackgroundColor: '#333',
            tension: 0.3,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `${exerciseName} — avg weight per session (kg)`,
              font: { family: 'Montserrat, sans-serif', size: 11, weight: '700' },
              color: '#333',
              padding: { bottom: 10 }
            },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.parsed.y.toFixed(1)} kg`
              }
            }
          },
          scales: {
            x: {
              ticks: { font: { size: 10 }, maxRotation: 45 },
              grid: { display: false }
            },
            y: {
              ticks: { font: { size: 10 } },
              grid: { color: '#eee' }
            }
          }
        }
      });
    }

    // Toggle a filter: clicking the active one clears it.
    function setFilter(type, value) {
      if (filter && filter.type === type && filter.value === value) {
        filter = null;
      } else {
        filter = { type, value };
      }
      // Show progress chart only when filtering by exercise and chart is enabled.
      if (filter && filter.type === 'exercise') {
        chartToggleLabel.style.display = '';
        if (chartEnabled) {
          renderProgressChart(filter.value);
        }
      } else {
        chartToggleLabel.style.display = 'none';
        progressEl.style.display = 'none';
        if (progressChart) { progressChart.destroy(); progressChart = null; }
      }
      renderTable();
    }

    function updateFilterBar() {
      if (filter) {
        const label = filter.type === 'date' ? 'Date' : 'Exercise';
        filterText.innerHTML = `${label}: <strong>${filter.value}</strong>`;
        filterBar.style.display = 'block';
      } else {
        filterBar.style.display = 'none';
      }
    }

    function renderTable() {
      const filtered = filter
        ? allRows.filter(r => r[filter.type] === filter.value)
        : allRows;

      const sorted = filtered.slice().sort((a, b) => {
        if (a.date < b.date) return sortDir === 'asc' ? -1 : 1;
        if (a.date > b.date) return sortDir === 'asc' ? 1 : -1;
        return a.exercise.localeCompare(b.exercise, 'es');
      });

      // Dynamic "Set N" columns based on the visible rows' max set count.
      let maxSets = 0;
      for (const r of sorted) {
        if (r.sets.size > maxSets) maxSets = r.sets.size;
      }

      const serieHeaders = [];
      for (let n = 1; n <= maxSets; n++) {
        serieHeaders.push(`<th>Set ${n}</th>`);
      }
      const arrow = sortDir === 'asc' ? '▲' : '▼';
      thead.innerHTML = `
        <tr>
          <th id="trainingDateHeader" class="training-sortable">Date <span class="sort-arrow">${arrow}</span></th>
          <th>Exercise</th>
          ${serieHeaders.join('')}
        </tr>`;

      if (!sorted.length) {
        tbody.innerHTML = `<tr><td colspan="${2 + maxSets}" class="training-empty">No results.</td></tr>`;
      } else {
        tbody.innerHTML = sorted.map((r, i) => {
          const cells = [];
          for (let n = 1; n <= maxSets; n++) {
            const s = r.sets.get(n);
            cells.push(s
              ? `<td>${formatSet(s)}</td>`
              : '<td class="training-empty">–</td>');
          }
          // Mark the first row of each date group (except the very first) to
          // draw a visual separator between sessions.
          const isNewSession = i > 0 && sorted[i - 1].date !== r.date;
          const rowClass = isNewSession ? ' class="training-session-start"' : '';
          return `
            <tr${rowClass}>
              <td class="training-date clickable" data-date="${r.date}">${r.date}</td>
              <td class="training-exercise clickable" data-exercise="${r.exercise}">${r.exercise}</td>
              ${cells.join('')}
            </tr>`;
        }).join('');
      }

      // Re-bind the (re-rendered) date header to toggle sort direction.
      thead.querySelector('#trainingDateHeader').addEventListener('click', () => {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        renderTable();
      });

      // Click a date cell → filter by that session's date (click again clears).
      tbody.querySelectorAll('td.training-date.clickable').forEach(td => {
        td.addEventListener('click', () => setFilter('date', td.dataset.date));
      });

      // Click an exercise name → filter by it (click again clears).
      tbody.querySelectorAll('td.training-exercise.clickable').forEach(td => {
        td.addEventListener('click', () => setFilter('exercise', td.dataset.exercise));
      });

      updateFilterBar();
    }

    container.querySelector('#trainingClearFilter').addEventListener('click', () => {
      filter = null;
      chartToggleLabel.style.display = 'none';
      progressEl.style.display = 'none';
      if (progressChart) { progressChart.destroy(); progressChart = null; }
      renderTable();
    });

    // Apply an initial exercise filter when navigated to from the Plan page.
    if (initialExercise && allRows.some(r => r.exercise === initialExercise)) {
      setFilter('exercise', initialExercise);
    } else {
      renderTable();
    }
  }
  async function init(container, initialExercise) {
    container.innerHTML = '<p>Cargando entrenos…</p>';
    try {
      const sessions = await fetchSessions();
      const rows = buildRows(sessions);
      if (!rows.length) {
        container.innerHTML = '<p>No hay sesiones registradas todavía.</p>';
        return;
      }
      render(container, rows, initialExercise);
    } catch (err) {
      console.error('[Training] load failed:', err);
      container.innerHTML = `<p class="training-error">No se pudieron cargar los entrenos: ${err.message}</p>`;
    }
  }

  // --- Plan: fetch workout templates with sets_plan ---
  async function fetchPlan() {
    const sb = getClient();
    const { data, error } = await sb
      .from('workout_exercises')
      .select(`
        position,
        sets_plan,
        workouts ( id, name ),
        exercises ( name, muscle_group )
      `)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  function renderPlan(container, rows) {
    // Group by workout, sorted by workout id ascending
    const workouts = new Map();
    const sorted = rows.slice().sort((a, b) => (a.workouts?.id ?? 0) - (b.workouts?.id ?? 0));
    for (const row of sorted) {
      const wName = row.workouts?.name || '—';
      const wId   = row.workouts?.id;
      if (!workouts.has(wId)) workouts.set(wId, { name: wName, exercises: [] });
      workouts.get(wId).exercises.push({
        name:      row.exercises?.name || '—',
        muscle:    row.exercises?.muscle_group || '',
        sets_plan: row.sets_plan || '',
        position:  row.position,
      });
    }

    const cards = [...workouts.values()].map(w => {
      const rows = w.exercises.map(ex => `
        <tr>
          <td class="plan-exercise"><a href="#/training/${encodeURIComponent(ex.name)}" class="plan-exercise-link">${ex.name}</a>${ex.muscle ? `<span class="plan-muscle">${ex.muscle}</span>` : ''}</td>
          <td class="plan-sets">${ex.sets_plan || '—'}</td>
        </tr>`).join('');
      return `
        <div class="plan-card">
          <h2 class="plan-workout-name">${w.name}</h2>
          <table class="plan-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }).join('');

    container.innerHTML = cards || '<p>No hay entrenamientos planificados.</p>';
  }

  async function initPlan(container) {
    container.innerHTML = '<p>Cargando plan…</p>';
    try {
      const rows = await fetchPlan();
      renderPlan(container, rows);
    } catch (err) {
      console.error('[Training] plan load failed:', err);
      container.innerHTML = `<p class="training-error">No se pudo cargar el plan: ${err.message}</p>`;
    }
  }

  return { init, initPlan };
})();
