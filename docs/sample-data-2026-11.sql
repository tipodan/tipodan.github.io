-- ============================================================================
-- Datos sintéticos — Noviembre 2026 (poblar Training con Sesión 2 y Sesión 3)
-- ----------------------------------------------------------------------------
-- Entrenos y ejercicios reales (nombres exactos de la BD).
--   Sesión 2: Peso muerto rumano con mancuernas, Press de hombros con mancuernas,
--             Prensa de piernas, Remo unilateral con polea,
--             Curl de bíceps con apoyo en banco
--   Sesión 3: Dominadas asistidas, Extensión de cuádriceps,
--             Press de pecho en máquina, Aductores en máquina,
--             Elevaciones laterales con mancuernas
--
-- Bloques:
--   1) workout_exercises  → plantilla (qué ejercicios lleva cada entreno)
--   2) sessions           → ejecuciones reales en noviembre
--   3) exercise_sets      → series realizadas (progresión semanal)
-- Al final, DELETE para deshacer exactamente estos datos.
-- Subconsultas por nombre/fecha para no depender de IDs autogenerados.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1) Plantilla de ejercicios por entreno (workout_exercises)
--    ON CONFLICT evita duplicar si ya existieran (UNIQUE(workout_id, exercise_id)).
-- ---------------------------------------------------------------------------

-- Sesión 2
INSERT INTO workout_exercises (workout_id, exercise_id, position) VALUES
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 1),
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   2),
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 3),
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         4),
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 5)
ON CONFLICT (workout_id, exercise_id) DO NOTHING;

-- Sesión 3
INSERT INTO workout_exercises (workout_id, exercise_id, position) VALUES
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 1),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             2),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           3),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                4),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 5)
ON CONFLICT (workout_id, exercise_id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 2) Sesiones (sessions) — 3 ejecuciones de cada entreno a lo largo de noviembre
-- ---------------------------------------------------------------------------
INSERT INTO sessions (workout_id, date, notes) VALUES
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), '2026-11-04', 'Buenas sensaciones'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), '2026-11-06', 'Espalda algo cargada'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), '2026-11-11', 'Subo peso en prensa'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), '2026-11-13', 'Progreso en dominadas'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), '2026-11-18', 'Semana fuerte'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), '2026-11-20', 'PR en press de pecho'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 2'), '2026-11-25', 'Cierre de mes'),
  ((SELECT id FROM workouts WHERE name = 'Sesión 3'), '2026-11-27', 'Descarga ligera');


-- ---------------------------------------------------------------------------
-- 3) Series (exercise_sets)
-- ---------------------------------------------------------------------------

-- === 2026-11-04 · Sesión 2 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 1, 12, 20.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 2, 10, 22.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 3, 10, 22.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   1, 12, 12.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   2, 10, 14.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 1, 12, 120.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 2, 10, 140.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         1, 12, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         2, 10, 27.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 1, 12, 10.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-04' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 2, 10, 12.00);

-- === 2026-11-06 · Sesión 3 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 1, 10, 30.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 2,  8, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             1, 15, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             2, 12, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           1, 12, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           2, 10, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                1, 15, 35.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                2, 15, 35.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 1, 15,  6.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-06' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 2, 12,  8.00);

-- === 2026-11-11 · Sesión 2 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 1, 12, 22.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 2, 10, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 3, 10, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   1, 12, 14.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   2, 10, 16.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 1, 12, 140.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 2, 10, 160.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         1, 12, 27.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         2, 10, 30.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 1, 12, 12.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-11' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 2, 10, 14.00);

-- === 2026-11-13 · Sesión 3 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 1, 10, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 2,  9, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             1, 15, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             2, 12, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           1, 12, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           2, 10, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                1, 15, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                2, 15, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 1, 15,  8.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-13' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 2, 12, 10.00);

-- === 2026-11-18 · Sesión 2 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 1, 10, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 2, 10, 27.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 3,  8, 30.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   1, 10, 16.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   2,  8, 18.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 1, 12, 160.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 2, 10, 180.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         1, 10, 30.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         2, 10, 32.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 1, 10, 14.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-18' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 2,  8, 16.00);

-- === 2026-11-20 · Sesión 3 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 1, 10, 20.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 2,  8, 20.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             1, 12, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             2, 12, 55.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           1, 10, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           2,  8, 55.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                1, 15, 45.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                2, 12, 50.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 1, 12, 10.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-20' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 2, 10, 12.00);

-- === 2026-11-25 · Sesión 2 ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 1, 12, 25.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Peso muerto rumano con mancuernas'), 2, 10, 27.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   1, 12, 16.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Press de hombros con mancuernas'),   2, 10, 16.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 1, 15, 150.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Prensa de piernas'),                 2, 12, 170.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         1, 12, 30.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Remo unilateral con polea'),         2, 10, 32.50),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 1, 12, 14.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-25' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')), (SELECT id FROM exercises WHERE name = 'Curl de bíceps con apoyo en banco'), 2, 10, 16.00);

-- === 2026-11-27 · Sesión 3 (descarga) ===
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions WHERE date = '2026-11-27' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Dominadas asistidas'),                 1, 12, 30.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-27' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Extensión de cuádriceps'),             1, 15, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-27' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Press de pecho en máquina'),           1, 12, 40.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-27' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Aductores en máquina'),                1, 15, 35.00),
  ((SELECT id FROM sessions WHERE date = '2026-11-27' AND workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')), (SELECT id FROM exercises WHERE name = 'Elevaciones laterales con mancuernas'), 1, 15,  6.00);


-- ============================================================================
-- DELETE — deshacer exactamente lo insertado arriba
-- ----------------------------------------------------------------------------
-- Orden inverso: exercise_sets → sessions → workout_exercises (por las FK).
-- Se restringe a las sesiones de noviembre 2026 de 'Sesión 2' y 'Sesión 3'.
-- ============================================================================

-- 1) Series de esas sesiones de noviembre
DELETE FROM exercise_sets
WHERE session_id IN (
  SELECT id FROM sessions
  WHERE date >= '2026-11-01' AND date <= '2026-11-30'
    AND workout_id IN (SELECT id FROM workouts WHERE name IN ('Sesión 2', 'Sesión 3'))
);

-- 2) Las sesiones de noviembre
DELETE FROM sessions
WHERE date >= '2026-11-01' AND date <= '2026-11-30'
  AND workout_id IN (SELECT id FROM workouts WHERE name IN ('Sesión 2', 'Sesión 3'));

-- 3) La plantilla de ejercicios añadida a Sesión 2 y Sesión 3
--    (Omitir este bloque si quieres conservar las plantillas.)
DELETE FROM workout_exercises
WHERE workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 2')
  AND exercise_id IN (SELECT id FROM exercises WHERE name IN (
    'Peso muerto rumano con mancuernas', 'Press de hombros con mancuernas',
    'Prensa de piernas', 'Remo unilateral con polea',
    'Curl de bíceps con apoyo en banco'));

DELETE FROM workout_exercises
WHERE workout_id = (SELECT id FROM workouts WHERE name = 'Sesión 3')
  AND exercise_id IN (SELECT id FROM exercises WHERE name IN (
    'Dominadas asistidas', 'Extensión de cuádriceps',
    'Press de pecho en máquina', 'Aductores en máquina',
    'Elevaciones laterales con mancuernas'));
