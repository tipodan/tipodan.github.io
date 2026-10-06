-- ============================================================================
-- Datos sintéticos — Diciembre 2026 · Sesión 1
-- ----------------------------------------------------------------------------
-- Ejercicios reales de 'Sesión 1' (consultados en la BD, por position):
--   1. Press de banca con barra
--   2. Sentadilla con mancuerna en pecho
--   3. Remo con agarre ancho en polea
--   4. Curl isquios sentado
--   5. Tríceps unilateral en polea
--
-- La plantilla (workout_exercises) ya existe, así que solo se insertan
-- sessions + exercise_sets. 4 sesiones en diciembre con progresión semanal.
-- Subconsultas por nombre/fecha para no depender de IDs autogenerados.
-- Al final, DELETE para deshacer exactamente estos datos.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1) Sesiones (sessions)
-- ---------------------------------------------------------------------------
INSERT INTO sessions (workout_id, date, notes) VALUES
  ((SELECT id FROM workouts WHERE name = 'Sesión 1'), '2026-12-02', 'Arranque de mes'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 1'), '2026-12-09', 'Subo peso en banca'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 1'), '2026-12-16', 'Buen día de fuerza'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 1'), '2026-12-23', 'Descarga pre-fiestas');


-- ---------------------------------------------------------------------------
-- 2) Series (exercise_sets)
-- ---------------------------------------------------------------------------

-- === 2026-12-02 · Sesión 1 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         1, 10, 60.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         2,  8, 65.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         3,  6, 70.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Sentadilla con mancuerna en pecho'), 1, 12, 22.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Sentadilla con mancuerna en pecho'), 2, 10, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Remo con agarre ancho en polea'),   1, 12, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Remo con agarre ancho en polea'),   2, 10, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Curl isquios sentado'),             1, 12, 35.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Curl isquios sentado'),             2, 12, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Tríceps unilateral en polea'),      1, 15, 12.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-02' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Tríceps unilateral en polea'),      2, 12, 14.00);

-- === 2026-12-09 · Sesión 1 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         1, 10, 62.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         2,  8, 67.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         3,  6, 72.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Sentadilla con mancuerna en pecho'), 1, 12, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Sentadilla con mancuerna en pecho'), 2, 10, 27.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Remo con agarre ancho en polea'),   1, 12, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Remo con agarre ancho en polea'),   2, 10, 55.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Curl isquios sentado'),             1, 12, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Curl isquios sentado'),             2, 10, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Tríceps unilateral en polea'),      1, 15, 14.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-09' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Tríceps unilateral en polea'),      2, 12, 16.00);

-- === 2026-12-16 · Sesión 1 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         1,  8, 72.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         2,  6, 77.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         3,  4, 80.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Sentadilla con mancuerna en pecho'), 1, 10, 27.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Sentadilla con mancuerna en pecho'), 2, 10, 30.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Remo con agarre ancho en polea'),   1, 10, 55.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Remo con agarre ancho en polea'),   2, 10, 57.50),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Curl isquios sentado'),             1, 12, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Curl isquios sentado'),             2, 10, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Tríceps unilateral en polea'),      1, 12, 16.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-16' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Tríceps unilateral en polea'),      2, 10, 18.00);

-- === 2026-12-23 · Sesión 1 (descarga) ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-12-23' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Press de banca con barra'),         1, 12, 55.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-23' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Sentadilla con mancuerna en pecho'), 1, 15, 20.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-23' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Remo con agarre ancho en polea'),   1, 15, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-23' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Curl isquios sentado'),             1, 15, 35.00),
  ((SELECT id FROM sessions WHERE date = '2026-12-23' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')), (SELECT id FROM exercises WHERE name = 'Tríceps unilateral en polea'),      1, 15, 12.00);


-- ============================================================================
-- DELETE — deshacer exactamente lo insertado arriba (diciembre 2026, Sesión 1)
-- ----------------------------------------------------------------------------
-- Orden inverso por las FK: exercise_sets → sessions.
-- La plantilla (workout_exercises) de Sesión 1 ya existía, NO se toca.
-- ============================================================================

DELETE FROM exercise_sets
WHERE session_id IN (
  SELECT id FROM sessions
  WHERE date >= '2026-12-01' AND date <= '2026-12-31'
    AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1')
);

DELETE FROM sessions
WHERE date >= '2026-12-01' AND date <= '2026-12-31'
  AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 1');
