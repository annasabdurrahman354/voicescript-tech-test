import { useEffect, useState } from "react";
import {
    Menu,
    Plus,
    Search,
    SlidersHorizontal,
    Users,
} from "lucide-react";
import { EmptyState } from "./EmptyState";
import { useReporterStore } from "../stores/reporterStore";
import { ReporterCard } from "./ReporterCard";

interface ReporterListProps {
    onShowNewReporter: () => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export function ReporterList({
    onShowNewReporter,
    sidebarOpen,
    setSidebarOpen,
}: ReporterListProps) {
    const reporters = useReporterStore((s) => s.reporters);
    const error = useReporterStore((s) => s.error);
    const loadReporters = useReporterStore((s) => s.loadReporters);
    const selectedReporterId = useReporterStore((s) => s.selectedReporterId);
    const setSelectedReporterId = useReporterStore((s) => s.setSelectedReporterId);

    const searchQuery = useReporterStore((s) => s.searchQuery);
    const availableFilter = useReporterStore((s) => s.availableFilter);
    const sortBy = useReporterStore((s) => s.sortBy);
    const setFilters = useReporterStore((s) => s.setFilters);

    const [showFilters, setShowFilters] = useState(true);
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // Keep local search input synchronized if store state changes
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    // Debounce the search query to the API/Store
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localQuery !== searchQuery) {
                setFilters({ searchQuery: localQuery });
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [localQuery, searchQuery, setFilters]);

    return (
        <main
            className={[
                "flex w-full shrink-0 flex-col border-r border-slate-200 bg-slate-50 transition-all md:w-[380px] lg:w-[440px]",
                selectedReporterId ? "hidden md:flex" : "flex",
            ].join(" ")}
        >
            {/* Top Search & Actions Bar */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-4 md:px-5 bg-white">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-sm p-1.5 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2f5a80]/20"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        placeholder="Search reporter name or city…"
                        className="w-full rounded border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm outline-none transition-shadow focus:border-[#2f5a80] focus:ring-2 focus:ring-[#2f5a80]/20 focus:bg-white"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={[
                        "rounded-sm p-2 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2f5a80]/20",
                        showFilters ? "bg-slate-100 text-[#2f5a80]" : "",
                    ].join(" ")}
                    title="Toggle filters"
                >
                    <SlidersHorizontal className="h-4.5 w-4.5" />
                </button>
                <button
                    onClick={onShowNewReporter}
                    className="flex shrink-0 items-center gap-1.5 rounded bg-[#2f5a80] px-3.5 py-2 text-sm font-medium text-white transition-all hover:bg-[#2f5a80]/90 hover:shadow-md active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" /> <span className="hidden md:inline">New</span>
                </button>
            </div>

            {/* Filter controls row */}
            {showFilters && (
                <div className="grid grid-cols-2 gap-3 border-b border-slate-200 px-4 py-3 bg-white md:px-5">
                    <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setFilters({ sortBy: e.target.value as any })}
                            className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none transition-colors focus:border-[#2f5a80] focus:bg-white"
                        >
                            <option value="">Name (A-Z)</option>
                            <option value="city">City (A-Z)</option>
                            <option value="ratePerMinute">Rate per Minute</option>
                        </select>
                    </div>

                    <div className="flex flex-col justify-end pb-1.5">
                        <label className="flex items-center gap-2 text-xs text-slate-600 font-medium select-none cursor-pointer mt-auto">
                            <input
                                type="checkbox"
                                checked={availableFilter}
                                onChange={(e) => setFilters({ availableFilter: e.target.checked })}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#2f5a80] focus:ring-[#2f5a80]/20"
                            />
                            Only show available
                        </label>
                    </div>
                </div>
            )}

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {error ? (
                    <div className="p-6 text-center">
                        <p className="text-sm font-medium text-red-600">{error}</p>
                        <button
                            onClick={loadReporters}
                            className="mt-3 inline-flex rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100"
                        >
                            Try again
                        </button>
                    </div>
                ) : reporters.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No reporters found"
                        body="Try adjusting your search or filters, or add a new reporter."
                    />
                ) : (
                    reporters.map((reporter) => {
                        const isSelected = reporter.id === selectedReporterId;
                        return (
                            <ReporterCard
                                key={reporter.id}
                                reporter={reporter}
                                isSelected={isSelected}
                                onClick={() => setSelectedReporterId(reporter.id)}
                            />
                        );
                    })
                )}
            </div>
        </main>
    );
}
