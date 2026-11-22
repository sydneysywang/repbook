import type { Exercise, MuscleGroup } from "./types";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Glutes",
  "Core",
];

const LIBRARY: Record<MuscleGroup, string[]> = {
  Chest: [
    "Bench Press (Barbell)",
    "Bench Press (Dumbbell)",
    "Incline Bench Press (Barbell)",
    "Incline Bench Press (Dumbbell)",
    "Chest Press Machine",
    "Chest Fly (Cable)",
    "Push-up",
  ],
  Back: [
    "Deadlift (Barbell)",
    "Bent-over Row (Barbell)",
    "Row (Dumbbell)",
    "Seated Cable Row",
    "Lat Pulldown",
    "Pull-up",
    "Assisted Pull-up Machine",
  ],
  Shoulders: [
    "Overhead Press (Barbell)",
    "Shoulder Press (Dumbbell)",
    "Shoulder Press Machine",
    "Lateral Raise (Dumbbell)",
    "Face Pull (Cable)",
  ],
  Arms: [
    "Bicep Curl (Barbell)",
    "Bicep Curl (Dumbbell)",
    "Hammer Curl (Dumbbell)",
    "Tricep Pushdown (Cable)",
    "Overhead Tricep Extension (Dumbbell)",
    "Dip",
  ],
  Legs: [
    "Squat (Barbell)",
    "Goblet Squat (Dumbbell)",
    "Leg Press Machine",
    "Romanian Deadlift (Barbell)",
    "Romanian Deadlift (Dumbbell)",
    "Leg Extension Machine",
    "Leg Curl Machine",
    "Walking Lunge (Dumbbell)",
    "Calf Raise Machine",
  ],
  Glutes: [
    "Hip Thrust (Barbell)",
    "Hip Thrust Machine",
    "Glute Bridge",
    "Hip Abduction Machine",
    "Cable Kickback",
  ],
  Core: ["Plank", "Hanging Leg Raise", "Cable Crunch"],
};

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Built-in exercises live in code (never in storage) with stable ids. */
export const BUILT_IN_EXERCISES: Exercise[] = MUSCLE_GROUPS.flatMap((group) =>
  LIBRARY[group].map((name) => ({
    id: `builtin:${slug(name)}`,
    name,
    muscleGroup: group,
    builtIn: true,
  })),
);
