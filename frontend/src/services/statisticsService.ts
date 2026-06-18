import { apiFetch } from "../lib/api";

export interface StatisticsData {
    jobs: {
        total: number;
        byStatus: {
            NEW: number;
            ASSIGNED: number;
            TRANSCRIBED: number;
            REVIEWED: number;
            COMPLETED: number;
        };
        byLocation: {
            PHYSICAL: number;
            REMOTE: number;
        };
    };
    reporters: {
        total: number;
        available: number;
        unavailable: number;
    };
    editors: {
        total: number;
        available: number;
        unavailable: number;
    };
    payouts: {
        reporter: number;
        editor: number;
        total: number;
    };
}

export const statisticsService = {
    async getStatistics(): Promise<StatisticsData> {
        return apiFetch<StatisticsData>("/statistics");
    },
};
