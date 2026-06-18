import { create } from "zustand";
import { statisticsService, type StatisticsData } from "../services/statisticsService";

interface StatisticsState {
    statistics: StatisticsData | null;
    loading: boolean;
    error: string;
    loadStatistics: () => Promise<void>;
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
    statistics: null,
    loading: false,
    error: "",

    loadStatistics: async () => {
        set({ loading: true, error: "" });
        try {
            const data = await statisticsService.getStatistics();
            set({ statistics: data });
        } catch (err: any) {
            set({ error: err.message || "Failed to load statistics." });
        } finally {
            set({ loading: false });
        }
    },
}));
