import { create } from "zustand";
import type { Job, Reporter } from "../types";
import { jobsService, type CreateJobInput } from "../services/jobsService";

interface JobState {
    jobs: Job[];
    selectedJobId: string | null;
    loading: boolean;
    error: string;

    // Filters state
    searchQuery: string;
    statusFilter: "ALL" | Job["status"];
    locationFilter: "ALL" | Job["locationType"];
    sortBy: "" | "caseName" | "durationMin" | "city";

    setFilters: (filters: {
        searchQuery?: string;
        statusFilter?: "ALL" | Job["status"];
        locationFilter?: "ALL" | Job["locationType"];
        sortBy?: "" | "caseName" | "durationMin" | "city";
    }) => Promise<void>;

    loadJobs: () => Promise<void>;
    setSelectedJobId: (id: string | null) => void;
    createJob: (input: CreateJobInput) => Promise<Job | null>;
    
    // Mutations
    assignReporter: (jobId: string, reporterId?: string) => Promise<Job>;
    assignEditor: (jobId: string, editorId: string) => Promise<Job>;
    finishTranscription: (jobId: string) => Promise<Job>;
    finishJob: (jobId: string) => Promise<Job>;
    getSuggestedReporter: (id: string) => Promise<Reporter | null>;
}

async function fetchJobsWithFilters(get: () => JobState) {
    const { searchQuery, statusFilter, locationFilter, sortBy } = get();
    return jobsService.listJobs({
        status: statusFilter,
        locationType: locationFilter,
        search: searchQuery,
        sortBy,
    });
}

async function refreshJobs(set: (partial: Partial<JobState>) => void, get: () => JobState) {
    try {
        const jobs = await fetchJobsWithFilters(get);
        set({ jobs });
    } catch (err: any) {
        set({ error: err.message || "Failed to load jobs." });
    }
}

export const useJobStore = create<JobState>((set, get) => ({
    jobs: [],
    selectedJobId: null,
    loading: true,
    error: "",

    searchQuery: "",
    statusFilter: "ALL",
    locationFilter: "ALL",
    sortBy: "",

    setFilters: async (filters) => {
        set(filters);
        await refreshJobs(set, get);
    },

    loadJobs: async () => {
        try {
            const jobs = await fetchJobsWithFilters(get);
            set({ jobs, error: "" });
        } catch (err: any) {
            set({ error: err.message || "Failed to load jobs." });
        } finally {
            set({ loading: false });
        }
    },

    setSelectedJobId: (selectedJobId) => {
        set({ selectedJobId });
    },

    createJob: async (input) => {
        try {
            const job = await jobsService.createJob(input);
            await refreshJobs(set, get);
            return job;
        } catch {
            return null;
        }
    },

    assignReporter: async (jobId, reporterId) => {
        const job = await jobsService.assignReporter(jobId, reporterId);
        await refreshJobs(set, get);
        return job;
    },

    assignEditor: async (jobId, editorId) => {
        const job = await jobsService.assignEditor(jobId, editorId);
        await refreshJobs(set, get);
        return job;
    },

    finishTranscription: async (jobId) => {
        const job = await jobsService.finishTranscription(jobId);
        await refreshJobs(set, get);
        return job;
    },

    finishJob: async (jobId) => {
        const job = await jobsService.finishJob(jobId);
        await refreshJobs(set, get);
        return job;
    },

    getSuggestedReporter: async (jobId) => {
        return jobsService.getSuggestedReporter(jobId);
    },
}));
