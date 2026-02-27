export type IntervalType = 'prep' | 'work' | 'rest' | 'longRest';

export interface Interval {
  id: string;
  type: IntervalType;
  duration: number; // in seconds
  name: string;
}

export interface WorkoutDefinition {
  id: string;
  title: string;
  description: string;
  color: string;      // Tailwind bg color class
  iconName: string;   // Maps to a Lucide icon
  prepTime: number;   // Initial prep before starting (seconds)
  sets: number;       // Number of total sets
  repsPerSet: number; // Reps within a set (e.g. 6 reps for Repeaters, 1 rep for Max Hangs)
  workTime: number;   // Duration of the active rep (seconds)
  restTime: number;   // Rest between reps (seconds)
  longRestTime: number; // Rest between sets (seconds)
  imageUrl: string;   // Path to the high-res thumbnail/hero image
}

// Hardcoded Library of Professional Climbing Workouts
export const WORKOUT_LIBRARY: WorkoutDefinition[] = [
  {
    id: "max-hangs",
    title: "Max Hangs",
    description: "Build ultimate finger strength. 10 second maximum effort hang, followed by a long deep recovery rest of 3 minutes. 5 total sets.",
    color: "bg-emerald-500",
    iconName: "Dumbbell",
    prepTime: 10,
    sets: 5,
    repsPerSet: 1,
    workTime: 10,
    restTime: 0, // No short rest, since only 1 rep
    longRestTime: 180, // 3 mins
    imageUrl: "/assets/max_hangs.webp",
  },
  {
    id: "repeaters-7-3",
    title: "Repeaters (7s/3s)",
    description: "Classic power endurance training. Hang for 7 seconds, rest for 3 seconds. 6 reps per set. 3 mins rest between 6 total sets.",
    color: "bg-rose-500",
    iconName: "Repeat",
    prepTime: 10,
    sets: 6,
    repsPerSet: 6,
    workTime: 7,
    restTime: 3,
    longRestTime: 180, // 3 mins
    imageUrl: "/assets/repeaters.webp",
  },
  {
    id: "4x4-bouldering",
    title: "4x4 Endurance",
    description: "Climb 4 boulder problems back-to-back without resting (approx 4 mins of work), then rest 4 minutes. Repeat 4 times total.",
    color: "bg-indigo-500",
    iconName: "Mountain",
    prepTime: 15,
    sets: 4,
    repsPerSet: 1,
    workTime: 240, // 4 minutes of climbing
    restTime: 0,
    longRestTime: 240, // 4 mins rest
    imageUrl: "/assets/4x4_endurance.webp",
  },
  {
    id: "arc-training",
    title: "ARC Training",
    description: "Aerobic Restoration and Capillarity. 20 minutes of continuous, low-intensity climbing to build a massive endurance base. 3 sets.",
    color: "bg-cyan-500",
    iconName: "Activity",
    prepTime: 15,
    sets: 3,
    repsPerSet: 1,
    workTime: 1200, // 20 mins
    restTime: 0,
    longRestTime: 300, // 5 mins rest between huge blocks
    imageUrl: "/assets/arc_training.webp",
  },
  {
    id: "core-planks",
    title: "Climber's Core Tabata",
    description: "20 seconds of maximum core effort (Plank/Hollow Body), 10 seconds rest. 8 reps. 3 sets total.",
    color: "bg-amber-500",
    iconName: "Flame",
    prepTime: 10,
    sets: 3,
    repsPerSet: 8,
    workTime: 20,
    restTime: 10,
    longRestTime: 120, // 2 mins
    imageUrl: "/assets/core_tabata.webp",
  }
];

/**
 * Utility function to expand a WorkoutDefinition into a flat array of Intervals
 * that the active timer engine can iterate through sequentially.
 */
export function generateIntervalSequence(workout: WorkoutDefinition): Interval[] {
  const sequence: Interval[] = [];
  let index = 0;

  // 1. Initial Prep
  sequence.push({
    id: `prep-${index++}`,
    type: 'prep',
    duration: workout.prepTime,
    name: 'Get Ready'
  });

  // 2. Loop through Sets
  for (let s = 1; s <= workout.sets; s++) {
    
    // 3. Loop through Reps in the Set
    for (let r = 1; r <= workout.repsPerSet; r++) {
      
      // Work Interval
      sequence.push({
        id: `work-s${s}-r${r}-${index++}`,
        type: 'work',
        duration: workout.workTime,
        name: workout.repsPerSet > 1 ? `Set ${s} - Rep ${r}` : `Set ${s} - Work`
      });

      // Short Rest Interval (only if not the last rep of the set)
      if (r < workout.repsPerSet) {
        sequence.push({
          id: `rest-s${s}-r${r}-${index++}`,
          type: 'rest',
          duration: workout.restTime,
          name: 'Short Rest'
        });
      }
    }

    // Long Rest Interval (only if not the absolute last set)
    if (s < workout.sets) {
      sequence.push({
        id: `longrest-s${s}-${index++}`,
        type: 'longRest',
        duration: workout.longRestTime,
        name: 'Recover'
      });
    }
  }

  return sequence;
}
