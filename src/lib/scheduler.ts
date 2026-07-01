export type ScheduleState = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
};

export type ReviewResult = ScheduleState & {
  dueAt: string;
};

export function sm2Review(current: ScheduleState, quality: number): ReviewResult {
  const boundedQuality = Math.max(0, Math.min(5, Math.round(quality)));

  let repetitions = current.repetitions;
  let intervalDays = current.intervalDays;
  let easeFactor = current.easeFactor;

  if (boundedQuality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;

    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - boundedQuality) * (0.08 + (5 - boundedQuality) * 0.02)),
  );

  const dueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    repetitions,
    intervalDays,
    easeFactor,
    dueAt,
  };
}
