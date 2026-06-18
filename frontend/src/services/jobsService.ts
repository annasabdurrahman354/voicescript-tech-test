import { apiFetch } from "../lib/api";
import type { Job, Reporter } from "../types";

export interface ListJobsFilters {
    status?: string;
    locationType?: string;
    search?: string;
    sortBy?: string;
}

export interface CreateJobInput {
    caseName: string;
    durationMin: number;
    locationType: "PHYSICAL" | "REMOTE";
    city?: string | null;
}

export const jobsService = {
    async listJobs(filters: ListJobsFilters = {}): Promise<Job[]> {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== "ALL") {
            params.append("status", filters.status);
        }
        if (filters.locationType && filters.locationType !== "ALL") {
            params.append("locationType", filters.locationType);
        }
        if (filters.search && filters.search.trim()) {
            params.append("search", filters.search.trim());
        }
        if (filters.sortBy) {
            params.append("sortBy", filters.sortBy);
        }
        const queryStr = params.toString() ? `?${params.toString()}` : "";
        return apiFetch<Job[]>(`/jobs${queryStr}`);
    },

    async getJob(id: string): Promise<Job> {
        return apiFetch<Job>(`/jobs/${id}`);
    },

    async createJob(input: CreateJobInput): Promise<Job> {
        return apiFetch<Job>("/jobs", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async getSuggestedReporter(id: string): Promise<Reporter | null> {
        return apiFetch<Reporter | null>(`/jobs/${id}/suggested-reporter`);
    },

    async assignReporter(id: string, reporterId?: string): Promise<Job> {
        return apiFetch<Job>(`/jobs/${id}/assign-reporter`, {
            method: "POST",
            body: reporterId ? JSON.stringify({ reporterId }) : undefined,
        });
    },

    async finishTranscription(id: string): Promise<Job> {
        return apiFetch<Job>(`/jobs/${id}/finish-transcription`, {
            method: "POST",
        });
    },

    async assignEditor(id: string, editorId: string): Promise<Job> {
        return apiFetch<Job>(`/jobs/${id}/assign-editor`, {
            method: "POST",
            body: JSON.stringify({ editorId }),
        });
    },

    async finishJob(id: string): Promise<Job> {
        return apiFetch<Job>(`/jobs/${id}/finish-job`, {
            method: "POST",
        });
    },
};
