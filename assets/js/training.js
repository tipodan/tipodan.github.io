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

      // Compute two metrics per session (ignoring BW sets where weight is null):
      //  - Volumen total movido = Σ (reps × peso)
      //  - Peso medio por repetición = volumen total / Σ reps
      const points = exerciseRows.map(r => {
        let volume = 0;      // Σ reps × peso
        let totalReps = 0;   // Σ reps (solo series con peso)
        for (const s of r.sets.values()) {
          if (s.weight === null || s.weight === undefined) continue; // ignora BW
          const reps = Number(s.reps) || 0;
          volume += reps * Number(s.weight);
          totalReps += reps;
        }
        const avgPerRep = totalReps > 0 ? volume / totalReps : null;
        return { date: r.date, volume, avgPerRep };
      }).filter(p => p.avgPerRep !== null);

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
          datasets: [
            {
              label: 'Total volume (kg)',
              data: points.map(p => p.volume),
              yAxisID: 'yVolume',
              borderColor: '#2980b9',
              backgroundColor: 'rgba(41,128,185,0.08)',
              borderWidth: 1.5,
              pointRadius: 3,
              pointBackgroundColor: '#2980b9',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Avg weight/rep (kg)',
              data: points.map(p => p.avgPerRep),
              yAxisID: 'yAvg',
              borderColor: '#e67e22',
              backgroundColor: 'rgba(230,126,34,0.08)',
              borderWidth: 1.5,
              pointRadius: 3,
              pointBackgroundColor: '#e67e22',
              tension: 0.3,
              fill: false,
            }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: true,
              labels: { font: { family: 'Montserrat, sans-serif', size: 10 }, color: '#333' }
            },
            title: {
              display: true,
              text: `${exerciseName} — total volume and avg weight/rep`,
              font: { family: 'Montserrat, sans-serif', size: 11, weight: '700' },
              color: '#333',
              padding: { bottom: 10 }
            },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const v = ctx.parsed.y;
                  return ctx.dataset.yAxisID === 'yVolume'
                    ? `Total volume: ${v.toLocaleString('en-US', { maximumFractionDigits: 0 })} kg`
                    : `Avg weight/rep: ${v.toFixed(1)} kg`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { font: { size: 10 }, maxRotation: 45 },
              grid: { display: false }
            },
            yVolume: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Volume (kg)', font: { size: 10 }, color: '#2980b9' },
              ticks: { font: { size: 10 } },
              grid: { color: '#eee' }
            },
            yAvg: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Avg weight/rep (kg)', font: { size: 10 }, color: '#e67e22' },
              ticks: { font: { size: 10 } },
              grid: { drawOnChartArea: false }
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

  // ===========================================================================
  //  Session registration (write path)
  //  Flow: pick workout + date → create session (INSERT) → fill a 6-set grid
  //  per exercise → "Guardar sesión" upserts the filled sets → "Cerrar sesión"
  //  upserts and closes the panel. Requires anon INSERT/UPDATE policies on
  //  `sessions` and `exercise_sets`.
  // ===========================================================================

  const SETS_PER_EXERCISE = 3;

  // Fetch the workout templates (id + name) for the workout selector.
  async function fetchWorkouts() {
    const sb = getClient();
    const { data, error } = await sb
      .from('workouts')
      .select('id, name')
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // Fetch the exercises that make up a given workout, ordered by position.
  async function fetchWorkoutExercises(workoutId) {
    const sb = getClient();
    const { data, error } = await sb
      .from('workout_exercises')
      .select(`
        position,
        exercises ( id, name, muscle_group )
      `)
      .eq('workout_id', workoutId)
      .order('position', { ascending: true });
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.exercises ? row.exercises.id : null,
      name: row.exercises ? row.exercises.name : '(desconocido)',
      muscle: row.exercises ? row.exercises.muscle_group : '',
    }));
  }

  // Insert a new session and return the created row (needs its id for sets).
  async function createSession(workoutId, date) {
    const sb = getClient();
    const { data, error } = await sb
      .from('sessions')
      .insert({ workout_id: workoutId, date })
      .select('id, date')
      .single();
    if (error) throw error;
    return data;
  }

  // Upsert the filled sets for a session. Only sets with a reps value are
  // persisted; empty weight means bodyweight (NULL). Relies on the
  // UNIQUE(session_id, exercise_id, set_number) constraint for merge.
  async function saveSets(sessionId, rows) {
    const payload = [];
    for (const row of rows) {
      for (let n = 1; n <= SETS_PER_EXERCISE; n++) {
        const cell = row.sets[n];
        if (!cell || cell.reps === '' || cell.reps === null || cell.reps === undefined) {
          continue; // skip sets without reps
        }
        payload.push({
          session_id: sessionId,
          exercise_id: row.exerciseId,
          set_number: n,
          reps: Number(cell.reps),
          weight: cell.weight === '' || cell.weight === null || cell.weight === undefined
            ? null
            : Number(cell.weight),
        });
      }
    }
    if (!payload.length) return 0;

    const sb = getClient();
    const { error } = await sb
      .from('exercise_sets')
      .upsert(payload, { onConflict: 'session_id,exercise_id,set_number' });
    if (error) throw error;
    return payload.length;
  }

  // Mark a session as closed by stamping finished_at. Requires anon UPDATE on
  // `sessions` and the finished_at TIMESTAMPTZ column.
  async function finishSession(sessionId) {
    const sb = getClient();
    const { error } = await sb
      .from('sessions')
      .update({ finished_at: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw error;
  }

  // Find the most recent not-yet-closed session (finished_at IS NULL), if any,
  // together with its already-saved sets. Returns null when none is open.
  async function fetchOpenSession() {
    const sb = getClient();
    const { data, error } = await sb
      .from('sessions')
      .select(`
        id,
        date,
        workout_id,
        workouts ( name ),
        exercise_sets ( exercise_id, set_number, reps, weight )
      `)
      .is('finished_at', null)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .limit(1);
    if (error) throw error;
    return (data && data.length) ? data[0] : null;
  }

  // --- Register panel rendering ---
  // When `openSession` is provided, the panel resumes that session: it skips
  // the workout/date setup and preloads the exercises + already-saved sets.
  function renderRegister(container, workouts, onClose, openSession) {
    let sessionId = null;      // set once the session is created / resumed
    let exercises = [];        // [{ id, name, muscle }]
    // Preloaded sets for a resumed session: Map<exerciseId, Map<setNumber,{reps,weight}>>
    let prefillSets = new Map();

    const workoutOptions = workouts
      .map(w => `<option value="${w.id}">${w.name}</option>`)
      .join('');
    const today = new Date().toISOString().slice(0, 10);

    const resumeInfo = openSession
      ? `<div class="register-resume">Reanudando sesión del
           <strong>${openSession.date}</strong>
           ${openSession.workouts && openSession.workouts.name ? `— ${openSession.workouts.name}` : ''}</div>`
      : '';

    container.innerHTML = `
      <div class="register-panel">
        ${resumeInfo}
        <div class="register-setup" id="registerSetup"${openSession ? ' style="display:none"' : ''}>
          <label class="register-field">
            Entreno
            <select id="registerWorkout">${workoutOptions}</select>
          </label>
          <label class="register-field">
            Fecha
            <input type="date" id="registerDate" value="${today}">
          </label>
          <button type="button" id="registerCreate" class="register-btn">Guardar</button>
          <button type="button" id="registerCancel" class="register-btn register-btn-secondary">Cancelar</button>
          <span class="training-error" id="registerSetupError"></span>
        </div>
        <div class="register-sets" id="registerSets" style="display:none"></div>
      </div>`;

    const setupEl = container.querySelector('#registerSetup');
    const setsEl = container.querySelector('#registerSets');
    const setupError = container.querySelector('#registerSetupError');

    container.querySelector('#registerCancel')
      .addEventListener('click', () => onClose());

    container.querySelector('#registerCreate').addEventListener('click', async () => {
      setupError.textContent = '';
      const workoutId = Number(container.querySelector('#registerWorkout').value);
      const date = container.querySelector('#registerDate').value;
      if (!workoutId || !date) {
        setupError.textContent = 'Elige entreno y fecha.';
        return;
      }
      const createBtn = container.querySelector('#registerCreate');
      createBtn.disabled = true;
      try {
        const [session, exs] = await Promise.all([
          createSession(workoutId, date),
          fetchWorkoutExercises(workoutId),
        ]);
        sessionId = session.id;
        exercises = exs;
        setupEl.style.display = 'none';
        renderSetsGrid();
      } catch (err) {
        console.error('[Training] create session failed:', err);
        setupError.textContent = `No se pudo crear la sesión: ${err.message}`;
        createBtn.disabled = false;
      }
    });

    // Resume an open session: load its exercises and preload saved sets.
    async function resume(session) {
      sessionId = session.id;
      prefillSets = new Map();
      for (const s of session.exercise_sets || []) {
        if (!prefillSets.has(s.exercise_id)) prefillSets.set(s.exercise_id, new Map());
        prefillSets.get(s.exercise_id).set(s.set_number, { reps: s.reps, weight: s.weight });
      }
      setsEl.innerHTML = '<p>Cargando sesión…</p>';
      setsEl.style.display = 'block';
      try {
        exercises = await fetchWorkoutExercises(session.workout_id);
        renderSetsGrid();
      } catch (err) {
        console.error('[Training] resume session failed:', err);
        setsEl.innerHTML = `<p class="training-error">No se pudo reanudar la sesión: ${err.message}</p>`;
      }
    }

    // Build the per-exercise grid of 6 (reps, weight) inputs.
    function renderSetsGrid() {
      const headerCols = [];
      for (let n = 1; n <= SETS_PER_EXERCISE; n++) {
        headerCols.push(`<th colspan="2">Serie ${n}</th>`);
      }
      const subCols = [];
      for (let n = 1; n <= SETS_PER_EXERCISE; n++) {
        subCols.push('<th>reps</th><th>kg</th>');
      }

      const bodyRows = exercises.map(ex => {
        const saved = prefillSets.get(ex.id);
        const cells = [];
        for (let n = 1; n <= SETS_PER_EXERCISE; n++) {
          const cell = saved ? saved.get(n) : null;
          const repsVal = cell && cell.reps != null ? cell.reps : '';
          const weightVal = cell && cell.weight != null ? cell.weight : '';
          cells.push(`
            <td class="register-cell-reps"><input type="number" min="0" step="1" class="register-reps"
                       data-exercise="${ex.id}" data-set="${n}" value="${repsVal}" placeholder="reps"></td>
            <td class="register-cell-weight"><input type="number" min="0" step="0.25" class="register-weight"
                       data-exercise="${ex.id}" data-set="${n}" value="${weightVal}" placeholder="kg"></td>`);
        }
        return `
          <tr>
            <td class="register-exercise">${ex.name}${ex.muscle ? `<span class="plan-muscle">${ex.muscle}</span>` : ''}</td>
            ${cells.join('')}
          </tr>`;
      }).join('');

      setsEl.style.display = 'block';
      setsEl.innerHTML = `
        <div class="register-sets-scroll">
          <table class="flights-table register-table">
            <thead>
              <tr><th rowspan="2" class="register-exercise-head">Ejercicio</th>${headerCols.join('')}</tr>
              <tr>${subCols.join('')}</tr>
            </thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
        <div class="register-actions">
          <button type="button" id="registerSave" class="register-btn">Guardar sesión</button>
          <button type="button" id="registerFinish" class="register-btn register-btn-secondary">Cerrar sesión</button>
          <span class="register-status" id="registerStatus"></span>
        </div>`;

      setsEl.querySelector('#registerSave')
        .addEventListener('click', () => persist(false));
      setsEl.querySelector('#registerFinish')
        .addEventListener('click', () => persist(true));
    }

    // Collect the grid values into rows and upsert them.
    async function persist(close) {
      const statusEl = setsEl.querySelector('#registerStatus');
      statusEl.className = 'register-status';
      statusEl.textContent = 'Guardando…';

      const byExercise = new Map();
      for (const ex of exercises) {
        byExercise.set(ex.id, { exerciseId: ex.id, sets: {} });
      }
      setsEl.querySelectorAll('.register-reps').forEach(input => {
        const exId = Number(input.dataset.exercise);
        const n = Number(input.dataset.set);
        if (!byExercise.has(exId)) return;
        byExercise.get(exId).sets[n] = byExercise.get(exId).sets[n] || {};
        byExercise.get(exId).sets[n].reps = input.value.trim();
      });
      setsEl.querySelectorAll('.register-weight').forEach(input => {
        const exId = Number(input.dataset.exercise);
        const n = Number(input.dataset.set);
        if (!byExercise.has(exId)) return;
        byExercise.get(exId).sets[n] = byExercise.get(exId).sets[n] || {};
        byExercise.get(exId).sets[n].weight = input.value.trim();
      });

      try {
        const saved = await saveSets(sessionId, [...byExercise.values()]);
        if (close) {
          await finishSession(sessionId);
          onClose();
          return;
        }
        statusEl.textContent = `Guardado (${saved} series).`;
      } catch (err) {
        console.error('[Training] save sets failed:', err);
        statusEl.className = 'register-status training-error';
        statusEl.textContent = `No se pudo guardar: ${err.message}`;
      }
    }

    // If resuming an open session, skip setup and load it immediately.
    if (openSession) {
      resume(openSession);
    }
  }

  async function initRegister(container, onClose, openSession) {
    container.innerHTML = '<p>Cargando entrenos…</p>';
    try {
      const workouts = await fetchWorkouts();
      if (!workouts.length) {
        container.innerHTML = '<p>No hay entrenos disponibles.</p>';
        return;
      }
      renderRegister(container, workouts, onClose, openSession);
    } catch (err) {
      console.error('[Training] register init failed:', err);
      container.innerHTML = `<p class="training-error">No se pudo abrir el registro: ${err.message}</p>`;
    }
  }

  return { init, initPlan, initRegister, fetchOpenSession };
})();
