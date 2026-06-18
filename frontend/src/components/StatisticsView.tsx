import { useEffect } from "react";
import {
    Briefcase,
    Users,
    UserCheck,
    RefreshCw,
    Globe,
    MapPin,
    BarChart3,
    Coins,
    Menu,
} from "lucide-react";
import { useStatisticsStore } from "../stores/statisticsStore";
import { STATUS_LABEL } from "../constants";
import { formatIDR } from "../lib/format";

interface StatisticsViewProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export function StatisticsView({ sidebarOpen, setSidebarOpen }: StatisticsViewProps) {
    const { statistics, loading, error, loadStatistics } = useStatisticsStore();

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const statusColors: Record<string, { bg: string; text: string; fill: string }> = {
        NEW: { bg: "bg-slate-100", text: "text-slate-700", fill: "bg-slate-500" },
        ASSIGNED: { bg: "bg-amber-50", text: "text-amber-700", fill: "bg-amber-500" },
        TRANSCRIBED: { bg: "bg-purple-50", text: "text-purple-700", fill: "bg-purple-500" },
        REVIEWED: { bg: "bg-blue-50", text: "text-blue-700", fill: "bg-blue-500" },
        COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", fill: "bg-emerald-500" },
    };

    if (error) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <button
                    onClick={loadStatistics}
                    className="mt-4 inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Try Again
                </button>
            </div>
        );
    }

    if (loading && !statistics) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-slate-50 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2f5a80]/30 border-t-[#2f5a80]" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading aggregate statistics...</p>
            </div>
        );
    }

    const stats = statistics || {
        jobs: { total: 0, byStatus: { NEW: 0, ASSIGNED: 0, TRANSCRIBED: 0, REVIEWED: 0, COMPLETED: 0 }, byLocation: { PHYSICAL: 0, REMOTE: 0 } },
        reporters: { total: 0, available: 0, unavailable: 0 },
        editors: { total: 0, available: 0, unavailable: 0 },
        payouts: { reporter: 0, editor: 0, total: 0 }
    };

    return (
        <div className="flex h-full flex-col bg-slate-50 overflow-y-auto custom-scrollbar">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 md:px-8 md:py-6 bg-white">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="rounded-sm p-1.5 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2f5a80]/20"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="font-serif text-2xl font-semibold leading-tight text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-[#2f5a80]" /> System Statistics
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Real-time metrics for jobs progression, reporter workloads, and editor availability.
                        </p>
                    </div>
                </div>

                <button
                    onClick={loadStatistics}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                    title="Refresh data"
                >
                    <RefreshCw className={["h-3.5 w-3.5", loading ? "animate-spin" : ""].join(" ")} />
                    Refresh
                </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 space-y-6 px-5 py-6 md:px-8 md:py-8">
                {/* 3-Column Summary Cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* Jobs Card */}
                    <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Jobs</span>
                            <div className="rounded bg-[#2f5a80]/10 p-2 text-[#2f5a80]">
                                <Briefcase className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-2 text-3xl font-bold font-mono text-slate-900">{stats.jobs.total}</p>
                        
                        <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> Physical Jobs
                                </span>
                                <span className="font-semibold font-mono">{stats.jobs.byLocation.PHYSICAL}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span className="flex items-center gap-1">
                                    <Globe className="h-3.5 w-3.5 text-slate-400" /> Remote Jobs
                                </span>
                                <span className="font-semibold font-mono">{stats.jobs.byLocation.REMOTE}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reporters Card */}
                    <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reporters</span>
                            <div className="rounded bg-emerald-50 p-2 text-emerald-700">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-2 text-3xl font-bold font-mono text-slate-900">{stats.reporters.total}</p>

                        <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Available Now</span>
                                <span className="font-semibold font-mono text-emerald-700">{stats.reporters.available}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>On Assignment</span>
                                <span className="font-semibold font-mono text-slate-500">{stats.reporters.unavailable}</span>
                            </div>
                        </div>
                    </div>

                    {/* Editors Card */}
                    <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Editors</span>
                            <div className="rounded bg-indigo-50 p-2 text-indigo-700">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-2 text-3xl font-bold font-mono text-slate-900">{stats.editors.total}</p>

                        <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Available Now</span>
                                <span className="font-semibold font-mono text-indigo-700">{stats.editors.available}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>On Review</span>
                                <span className="font-semibold font-mono text-slate-500">{stats.editors.unavailable}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completed Jobs Financials */}
                <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-6 flex items-center gap-2">
                        <Coins className="h-5 w-5 text-emerald-600" /> Completed Jobs Financials
                    </h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-md shadow-inner">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporter Payouts</span>
                            <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{formatIDR(stats.payouts?.reporter ?? 0)}</p>
                        </div>
                        <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-md shadow-inner">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Editor Payouts</span>
                            <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{formatIDR(stats.payouts?.editor ?? 0)}</p>
                        </div>
                        <div className="border border-slate-100 bg-[#2f5a80]/5 p-4 rounded-md shadow-inner border-[#2f5a80]/20">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2f5a80]">Total Payouts</span>
                            <p className="mt-2 text-2xl font-bold font-mono text-[#2f5a80]">{formatIDR(stats.payouts?.total ?? 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown Section */}
                <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-6">
                        Jobs Status Distribution
                    </h3>

                    {/* Progress Bar Group */}
                    <div className="w-full flex h-4 rounded overflow-hidden mb-6 bg-slate-100 border border-slate-200/50">
                        {Object.entries(stats.jobs.byStatus).map(([status, count]) => {
                            if (count === 0 || stats.jobs.total === 0) return null;
                            const percentage = (count / stats.jobs.total) * 100;
                            const color = statusColors[status]?.fill || "bg-slate-400";
                            return (
                                <div
                                    key={`bar-${status}`}
                                    className={[color, "transition-all duration-500"].join(" ")}
                                    style={{ width: `${percentage}%` }}
                                    title={`${STATUS_LABEL[status as keyof typeof STATUS_LABEL]}: ${count} (${percentage.toFixed(1)}%)`}
                                />
                            );
                        })}
                    </div>

                    {/* Detail Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(STATUS_LABEL).map(([key, label]) => {
                            const count = stats.jobs.byStatus[key as keyof typeof stats.jobs.byStatus] || 0;
                            const color = statusColors[key] || { bg: "bg-slate-100", text: "text-slate-700" };
                            const pct = stats.jobs.total > 0 ? (count / stats.jobs.total) * 100 : 0;
                            return (
                                <div
                                    key={key}
                                    className="flex flex-col justify-between border border-slate-100 bg-slate-50/50 p-4 rounded-md shadow-inner transition-colors hover:bg-slate-50"
                                >
                                    <span className={["inline-block self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", color.bg, color.text].join(" ")}>
                                        {label}
                                    </span>
                                    <div className="mt-4 flex items-baseline justify-between">
                                        <span className="text-2xl font-bold font-mono text-slate-900">{count}</span>
                                        <span className="text-xs font-mono text-slate-400">{pct.toFixed(0)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
