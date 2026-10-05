# 🏋️ Workout Log — Diseño de base de datos

Diseño relacional para registrar entrenamientos de gimnasio. El modelo separa la **plantilla** (qué ejercicios componen un entreno) de la **ejecución real** (qué series, repeticiones y pesos se hicieron en cada sesión). Así, cada sesión del mismo entreno puede tener distinto número de series, reps y pesos.

## Modelo de entidades

- **`exercises`** — catálogo de ejercicios (solo el nombre y datos opcionales como el grupo muscular).
- **`workouts`** — entreno/rutina: una plantilla que agrupa varios ejercicios (p. ej. "Día de pierna", "Push A").
- **`workout_exercises`** — tabla puente N:M entre `workouts` y `exercises` (un entreno tiene varios ejercicios y un ejercicio puede estar en varios entrenos). Guarda el orden.
- **`sessions`** — una ejecución real de un entreno en una fecha concreta.
- **`exercise_sets`** — cada serie realizada dentro de una sesión para un ejercicio, con sus repeticiones y peso.

## Relaciones

```
exercise 1---N workout_exercise N---1 workout
workout  1---N session
session  1---N exercise_set N---1 exercise
```

La clave del diseño: **las series (`exercise_sets`) cuelgan de la sesión, no del entreno**. El entreno define *qué* ejercicios tocan (la plantilla), y la sesión registra *qué se hizo realmente* (series, reps, pesos).

## Esquema SQL (PostgreSQL)

```sql
-- Catálogo de ejercicios
CREATE TABLE exercises (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  muscle_group  TEXT,                        -- opcional: 'pecho', 'pierna', etc.
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Entreno / rutina (plantilla)
CREATE TABLE workouts (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Qué ejercicios componen cada entreno (N:M)
CREATE TABLE workout_exercises (
  id            SERIAL PRIMARY KEY,
  workout_id    INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id   INTEGER NOT NULL REFERENCES exercises(id),
  position      INTEGER,                     -- orden del ejercicio dentro del entreno
  UNIQUE(workout_id, exercise_id)
);

-- Sesión: ejecución real de un entreno en una fecha
CREATE TABLE sessions (
  id            SERIAL PRIMARY KEY,
  workout_id    INTEGER NOT NULL REFERENCES workouts(id),
  date          DATE NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Series realizadas en una sesión para un ejercicio concreto
CREATE TABLE exercise_sets (
  id            SERIAL PRIMARY KEY,
  session_id    INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id   INTEGER NOT NULL REFERENCES exercises(id),
  set_number    INTEGER NOT NULL,            -- 1ª, 2ª, 3ª serie...
  reps          INTEGER NOT NULL,
  weight        NUMERIC(6,2),                -- peso usado (kg); NULL = peso corporal
  UNIQUE(session_id, exercise_id, set_number)
);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_sessions_workout          ON sessions(workout_id);
CREATE INDEX idx_exercise_sets_session     ON exercise_sets(session_id);
```

## Inserción de datos

El orden de inserción es obligatorio por las claves foráneas:
`exercises` → `workouts` → `workout_exercises` → `sessions` → `exercise_sets`.
Usar subconsultas `(SELECT id FROM ... WHERE name = ...)` evita depender de los
IDs autogenerados y hace los INSERT reutilizables.

### 1. Catálogo de ejercicios (`exercises`)

```sql
INSERT INTO exercises (name, muscle_group) VALUES
  ('Sentadilla',        'pierna'),
  ('Prensa',            'pierna'),
  ('Press banca',       'pecho'),
  ('Press militar',     'hombro'),
  ('Dominadas',         'espalda'),
  ('Curl bíceps',       'brazo');
```

`name` es `UNIQUE`: no puedes repetir nombre. `muscle_group` es opcional.

### 2. Entrenos / plantillas (`workouts`)

```sql
INSERT INTO workouts (name, description) VALUES
  ('Día de pierna', 'Rutina enfocada en tren inferior'),
  ('Push A',        'Pecho, hombro y tríceps');
```

### 3. Ejercicios de cada entreno (`workout_exercises`)

Tabla puente N:M. Restricción `UNIQUE(workout_id, exercise_id)`: no repitas el
mismo ejercicio en el mismo entreno.

```sql
-- Día de pierna: sentadilla + prensa
INSERT INTO workout_exercises (workout_id, exercise_id, position) VALUES
  ((SELECT id FROM workouts  WHERE name = 'Día de pierna'),
   (SELECT id FROM exercises WHERE name = 'Sentadilla'), 1),
  ((SELECT id FROM workouts  WHERE name = 'Día de pierna'),
   (SELECT id FROM exercises WHERE name = 'Prensa'), 2);

-- Push A: press banca + press militar
INSERT INTO workout_exercises (workout_id, exercise_id, position) VALUES
  ((SELECT id FROM workouts  WHERE name = 'Push A'),
   (SELECT id FROM exercises WHERE name = 'Press banca'), 1),
  ((SELECT id FROM workouts  WHERE name = 'Push A'),
   (SELECT id FROM exercises WHERE name = 'Press militar'), 2);
```

### 4. Sesión real (`sessions`)

Una ejecución del entreno en una fecha concreta:

```sql
INSERT INTO sessions (workout_id, date, notes) VALUES
  ((SELECT id FROM workouts WHERE name = 'Día de pierna'),
   '2026-10-05', 'Buenas sensaciones, subí peso en sentadilla');
```

### 5. Series realizadas (`exercise_sets`)

Las series cuelgan de la **sesión**, no del entreno. `set_number` numera cada
serie (1, 2, 3...) y `UNIQUE(session_id, exercise_id, set_number)` evita
duplicados. `weight` admite decimales o `NULL` (peso corporal); `reps` es
`NOT NULL`.

```sql
-- 3 series de sentadilla en la sesión de hoy
INSERT INTO exercise_sets (session_id, exercise_id, set_number, reps, weight) VALUES
  ((SELECT id FROM sessions  WHERE date = '2026-10-05'
      AND workout_id = (SELECT id FROM workouts WHERE name = 'Día de pierna')),
   (SELECT id FROM exercises WHERE name = 'Sentadilla'), 1, 10, 80.00),
  ((SELECT id FROM sessions  WHERE date = '2026-10-05'
      AND workout_id = (SELECT id FROM workouts WHERE name = 'Día de pierna')),
   (SELECT id FROM exercises WHERE name = 'Sentadilla'), 2,  8, 90.00),
  ((SELECT id FROM sessions  WHERE date = '2026-10-05'
      AND workout_id = (SELECT id FROM workouts WHERE name = 'Día de pierna')),
   (SELECT id FROM exercises WHERE name = 'Sentadilla'), 3,  6, 95.00);
```

## Notas de diseño

- `exercise_sets` referencia a `exercises` directamente (no a `workout_exercises`), lo que permite registrar en una sesión un ejercicio improvisado que no estaba en la plantilla. Si se quiere forzar que solo se registren ejercicios del entreno, cambiar la FK a `workout_exercises(id)`.
- `set_number` distingue cada serie y el `UNIQUE(session_id, exercise_id, set_number)` evita duplicados.
- `weight NUMERIC(6,2)` admite decimales (p. ej. 22.50 kg) y `NULL` para ejercicios de peso corporal.
- Para portar a SQLite, usar `INTEGER PRIMARY KEY` en lugar de `SERIAL` y `REAL`/`TEXT` para peso/fecha.

## Ejemplo de consulta

Todas las series de una sesión con el nombre del ejercicio:

```sql
SELECT e.name, s.set_number, s.reps, s.weight
FROM exercise_sets s
JOIN exercises e ON e.id = s.exercise_id
WHERE s.session_id = $1
ORDER BY e.name, s.set_number;
```
