export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Glutes"
  | "Core";

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  builtIn: boolean;
  /** Soft delete: hidden from pickers, but past workouts still show the name. */
  deleted?: boolean;
};

/** A user-made variant of one exercise, usually a specific machine. */
export type Variation = {
  id: string;
  exerciseId: string;
  name: string;
  deleted?: boolean;
};

/** null means "not entered yet". Weight is in kg; 0 means bodyweight. */
export type SetEntry = {
  id: string;
  reps: number | null;
  weight: number | null;
  /** Ticked off during the active workout. Only ticked sets are saved on finish. */
  done?: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  variationId: string | null;
  sets: SetEntry[];
};

export type Workout = {
  id: string;
  /** ISO timestamps. */
  startedAt: string;
  finishedAt: string;
  templateId: string | null;
  exercises: WorkoutExercise[];
};

/** Templates list exercises only; the variation is picked during the workout. */
export type TemplateExercise = {
  id: string;
  exerciseId: string;
  sets: SetEntry[];
};

export type Template = {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveWorkout = {
  startedAt: string;
  templateId: string | null;
  exercises: WorkoutExercise[];
};

export type AppData = {
  version: 1;
  customExercises: Exercise[];
  variations: Variation[];
  workouts: Workout[];
  templates: Template[];
  activeWorkout: ActiveWorkout | null;
};
