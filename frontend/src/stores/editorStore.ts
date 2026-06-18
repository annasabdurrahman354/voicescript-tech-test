import { create } from "zustand";
import type { Editor } from "../types";
import { editorService, type CreateEditorInput } from "../services/editorService";

interface EditorState {
    editors: Editor[];
    selectedEditorId: string | null;
    loading: boolean;
    error: string;

    // Filters
    searchQuery: string;
    availableFilter: boolean;
    sortBy: "" | "name" | "flatfee";

    setFilters: (filters: {
        searchQuery?: string;
        availableFilter?: boolean;
        sortBy?: "" | "name" | "flatfee";
    }) => Promise<void>;

    loadEditors: () => Promise<void>;
    setSelectedEditorId: (id: string | null) => void;
    createEditor: (input: CreateEditorInput) => Promise<Editor | null>;
}

async function fetchEditorsWithFilters(get: () => EditorState) {
    const { searchQuery, availableFilter, sortBy } = get();
    return editorService.listEditors({
        available: availableFilter ? true : undefined,
        search: searchQuery || undefined,
        sortBy: sortBy || undefined,
    });
}

async function refreshEditors(set: (partial: Partial<EditorState>) => void, get: () => EditorState) {
    try {
        const editors = await fetchEditorsWithFilters(get);
        set({ editors });
    } catch (err: any) {
        set({ error: err.message || "Failed to load editors." });
    }
}

export const useEditorStore = create<EditorState>((set, get) => ({
    editors: [],
    selectedEditorId: null,
    loading: true,
    error: "",

    searchQuery: "",
    availableFilter: true,
    sortBy: "",

    setFilters: async (filters) => {
        set(filters);
        await refreshEditors(set, get);
    },

    loadEditors: async () => {
        try {
            const editors = await fetchEditorsWithFilters(get);
            set({ editors, error: "" });
        } catch (err: any) {
            set({ error: err.message || "Failed to load editors." });
        } finally {
            set({ loading: false });
        }
    },

    setSelectedEditorId: (selectedEditorId) => {
        set({ selectedEditorId });
    },

    createEditor: async (input) => {
        try {
            const editor = await editorService.createEditor(input);
            await refreshEditors(set, get);
            return editor;
        } catch {
            return null;
        }
    },
}));
