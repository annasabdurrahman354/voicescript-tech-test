import { create } from "zustand";
import type { Reporter } from "../types";
import { reporterService, type CreateReporterInput } from "../services/reporterService";

interface ReporterState {
    reporters: Reporter[];
    selectedReporterId: string | null;
    loading: boolean;
    error: string;

    // Filters
    searchQuery: string;
    availableFilter: boolean;
    sortBy: "" | "name" | "city" | "ratePerMinute";

    setFilters: (filters: {
        searchQuery?: string;
        availableFilter?: boolean;
        sortBy?: "" | "name" | "city" | "ratePerMinute";
    }) => Promise<void>;

    loadReporters: () => Promise<void>;
    setSelectedReporterId: (id: string | null) => void;
    createReporter: (input: CreateReporterInput) => Promise<Reporter | null>;
}

async function fetchReportersWithFilters(get: () => ReporterState) {
    const { searchQuery, availableFilter, sortBy } = get();
    return reporterService.listReporters({
        available: availableFilter ? true : undefined,
        search: searchQuery || undefined,
        sortBy: sortBy || undefined,
    });
}

async function refreshReporters(set: (partial: Partial<ReporterState>) => void, get: () => ReporterState) {
    try {
        const reporters = await fetchReportersWithFilters(get);
        set({ reporters });
    } catch (err: any) {
        set({ error: err.message || "Failed to load reporters." });
    }
}

export const useReporterStore = create<ReporterState>((set, get) => ({
    reporters: [],
    selectedReporterId: null,
    loading: true,
    error: "",

    searchQuery: "",
    availableFilter: true,
    sortBy: "",

    setFilters: async (filters) => {
        set(filters);
        await refreshReporters(set, get);
    },

    loadReporters: async () => {
        try {
            const reporters = await fetchReportersWithFilters(get);
            set({ reporters, error: "" });
        } catch (err: any) {
            set({ error: err.message || "Failed to load reporters." });
        } finally {
            set({ loading: false });
        }
    },

    setSelectedReporterId: (selectedReporterId) => {
        set({ selectedReporterId });
    },

    createReporter: async (input) => {
        try {
            const reporter = await reporterService.createReporter(input);
            await refreshReporters(set, get);
            return reporter;
        } catch {
            return null;
        }
    },
}));
