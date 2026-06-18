import { apiFetch } from "../lib/api";
import type { Editor } from "../types";

export interface ListEditorsFilters {
    available?: boolean;
    search?: string;
    sortBy?: string;
}

export interface CreateEditorInput {
    name: string;
    flatFee: number;
}

export const editorService = {
    async listEditors(filters: ListEditorsFilters = {}): Promise<Editor[]> {
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
        return apiFetch<Editor[]>(`/editors${queryStr}`);
    },

    async getEditor(id: string): Promise<Editor> {
        return apiFetch<Editor>(`/editors/${id}`);
    },

    async createEditor(input: CreateEditorInput): Promise<Editor> {
        return apiFetch<Editor>("/editors", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },
};
