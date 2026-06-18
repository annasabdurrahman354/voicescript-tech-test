import type { Job } from "../types";

export const STATUS_FLOW = ["NEW", "ASSIGNED", "TRANSCRIBED", "REVIEWED", "COMPLETED"] as const;

export const STATUS_LABEL: Record<Job["status"], string> = {
    NEW: "New",
    ASSIGNED: "Assigned",
    TRANSCRIBED: "Transcribed",
    REVIEWED: "Reviewed",
    COMPLETED: "Completed",
};

export const ALLOWED_TRANSITIONS: Record<Job["status"], Job["status"][]> = {
    NEW: ["ASSIGNED"],
    ASSIGNED: ["TRANSCRIBED"],
    TRANSCRIBED: ["REVIEWED"],
    REVIEWED: ["COMPLETED"],
    COMPLETED: [],
};
