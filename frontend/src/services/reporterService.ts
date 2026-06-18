import { apiFetch } from "../lib/api";
import type { Reporter } from "../types";

export interface ListReportersFilters {
    available?: boolean;
    search?: string;
    sortBy?: string;
}

export interface CreateReporterInput {
    name: string;
    city: string;
    ratePerMinute: number;
}

export const reporterService = {
    async listReporters(filters: ListReportersFilters = {}): Promise<Reporter[]> {
        const params = new URLSearchParams();
        if (filters.available !== undefined) {
            params.append("available", String(filters.available));
        }
        if (filters.search && filters.search.trim()) {
            params.append("search", filters.search.trim());
        }
        if (filters.sortBy) {
            params.append("sortBy", filters.sortBy);
        }
        const queryStr = params.toString() ? `?${params.toString()}` : "";
        return apiFetch<Reporter[]>(`/reporters${queryStr}`);
    },

    async getReporter(id: string): Promise<Reporter> {
        return apiFetch<Reporter>(`/reporters/${id}`);
    },

    async createReporter(input: CreateReporterInput): Promise<Reporter> {
        return apiFetch<Reporter>("/reporters", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },
};
