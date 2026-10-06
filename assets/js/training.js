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
    return `${Number(w).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
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
  function render(container, allRows) {
    let sortDir = 'desc';       // date sort direction
    let filter = null;          // null = all; else { type: 'exercise'|'date', value }

    container.innerHTML = `
      <div class="training-filter-bar" id="trainingFilterBar" style="display:none">
        <span id="trainingFilterText"></span>
        <button type="button" id="trainingClearFilter" class="training-clear">× quitar</button>
      </div>
      <table class="flights-table training-table">
        <thead></thead>
        <tbody></tbody>
      </table>`;

    const thead = container.querySelector('thead');
    const tbody = container.querySelector('tbody');
    const filterBar = container.querySelector('#trainingFilterBar');
    const filterText = container.querySelector('#trainingFilterText');

    // Toggle a filter: clicking the active one clears it.
    function setFilter(type, value) {
      if (filter && filter.type === type && filter.value === value) {
        filter = null;
      } else {
        filter = { type, value };
      }
      renderTable();
    }

    function updateFilterBar() {
      if (filter) {
        const label = filter.type === 'date' ? 'Fecha' : 'Ejercicio';
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

      // Dynamic "Serie N" columns based on the visible rows' max set count.
      let maxSets = 0;
      for (const r of sorted) {
        if (r.sets.size > maxSets) maxSets = r.sets.size;
      }

      const serieHeaders = [];
      for (let n = 1; n <= maxSets; n++) {
        serieHeaders.push(`<th>Serie ${n}</th>`);
      }
      const arrow = sortDir === 'asc' ? '▲' : '▼';
      thead.innerHTML = `
        <tr>
          <th id="trainingDateHeader" class="training-sortable">Fecha <span class="sort-arrow">${arrow}</span></th>
          <th>Ejercicio</th>
          ${serieHeaders.join('')}
        </tr>`;

      if (!sorted.length) {
        tbody.innerHTML = `<tr><td colspan="${2 + maxSets}" class="training-empty">Sin resultados.</td></tr>`;
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
      renderTable();
    });

    renderTable();
  }

  // Public entry point: load data and render into the given container.
  async function init(container) {
    container.innerHTML = '<p>Cargando entrenos…</p>';
    try {
      const sessions = await fetchSessions();
      const rows = buildRows(sessions);
      if (!rows.length) {
        container.innerHTML = '<p>No hay sesiones registradas todavía.</p>';
        return;
      }
      render(container, rows);
    } catch (err) {
      console.error('[Training] load failed:', err);
      container.innerHTML = `<p class="training-error">No se pudieron cargar los entrenos: ${err.message}</p>`;
    }
  }

  return { init };
})();
