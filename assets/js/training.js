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

  // --- Rendering ---
  function formatWeight(w) {
    if (w === null || w === undefined) return 'BW'; // bodyweight
    return `${Number(w).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
  }

  // Group a session's sets by exercise, preserving set order.
  function groupSetsByExercise(sets) {
    const map = new Map();
    for (const s of sets) {
      const name = s.exercises ? s.exercises.name : '(desconocido)';
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(s);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.set_number - b.set_number);
    }
    return map;
  }

  function renderSession(session) {
    const workoutName = session.workouts ? session.workouts.name : 'Workout';
    const byExercise = groupSetsByExercise(session.exercise_sets || []);

    // Max number of sets across exercises → number of "Serie N" column groups.
    let maxSets = 0;
    for (const sets of byExercise.values()) {
      if (sets.length > maxSets) maxSets = sets.length;
    }

    // Header: top row with "Ejercicio" + one "Serie N" spanning 2 cols each;
    // second row with "Reps" / "Peso" under each serie.
    const serieTopHeaders = [];
    const serieSubHeaders = [];
    for (let n = 1; n <= maxSets; n++) {
      serieTopHeaders.push(`<th colspan="2" class="training-serie-group">Serie ${n}</th>`);
      serieSubHeaders.push('<th>Reps</th><th>Peso</th>');
    }

    // One row per exercise; fill set cells in order, blanks for missing sets.
    const rows = [];
    for (const [exercise, sets] of byExercise) {
      const byNumber = new Map(sets.map(s => [s.set_number, s]));
      const cells = [];
      for (let n = 1; n <= maxSets; n++) {
        const s = byNumber.get(n);
        if (s) {
          cells.push(`<td>${s.reps}</td><td>${formatWeight(s.weight)}</td>`);
        } else {
          cells.push('<td class="training-empty">–</td><td class="training-empty">–</td>');
        }
      }
      rows.push(`
        <tr>
          <td class="training-exercise">${exercise}</td>
          ${cells.join('')}
        </tr>`);
    }

    const notes = session.notes
      ? `<p class="training-notes">${session.notes}</p>`
      : '';

    return `
      <div class="training-session">
        <h2 class="training-session-title">${session.date} · ${workoutName}</h2>
        ${notes}
        <table class="flights-table training-table">
          <thead>
            <tr><th rowspan="2">Ejercicio</th>${serieTopHeaders.join('')}</tr>
            <tr>${serieSubHeaders.join('')}</tr>
          </thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>`;
  }

  // Public entry point: load data and render into the given container.
  async function init(container) {
    container.innerHTML = '<p>Cargando entrenos…</p>';
    try {
      const sessions = await fetchSessions();
      if (!sessions.length) {
        container.innerHTML = '<p>No hay sesiones registradas todavía.</p>';
        return;
      }
      container.innerHTML = sessions.map(renderSession).join('');
    } catch (err) {
      console.error('[Training] load failed:', err);
      container.innerHTML = `<p class="training-error">No se pudieron cargar los entrenos: ${err.message}</p>`;
    }
  }

  return { init };
})();
