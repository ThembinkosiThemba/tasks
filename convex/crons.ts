import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for overdue tasks every minute
crons.interval(
  "check overdue tasks",
  { minutes: 1 },
  internal.thresholds.checkAndNotify,
);

export default crons;
