import { useMemo, useState, useEffect } from "react";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Receipt,
    Users,
} from "lucide-react";
import type { Job, Reporter, Editor } from "../types";
import { STATUS_FLOW } from "../constants";
import { calculatePayment } from "../lib/jobLogic";
import { formatDate, formatIDR } from "../lib/format";
import { useToast } from "../hooks/useToast";
import { useJobStore } from "../stores/jobStore";
import { apiFetch } from "../lib/api";
import { DocketStamp } from "./DocketStamp";
import { LocationBadge } from "./LocationBadge";
import { reporterService } from "../services/reporterService";
import { editorService } from "../services/editorService";

interface JobDetailPanelProps {
    job: Job;
    onBack: () => void;
}

export function JobDetailPanel({ job, onBack }: JobDetailPanelProps) {
    const assignReporter = useJobStore((s) => s.assignReporter);
    const assignEditor = useJobStore((s) => s.assignEditor);
    const finishTranscription = useJobStore((s) => s.finishTranscription);
    const finishJob = useJobStore((s) => s.finishJob);
    const getSuggestedReporter = useJobStore((s) => s.getSuggestedReporter);

    const { triggerToast } = useToast();

    const [selectedReporterId, setSelectedReporterId] = useState<string | null>(null);
    const [selectedEditorId, setSelectedEditorId] = useState<string | null>(null);
    const [suggestedReporters, setSuggestedReporters] = useState<Reporter[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    // Local state for searching/sorting available reporters
    const [localReporterSearch, setLocalReporterSearch] = useState("");
    const [debouncedReporterSearch, setDebouncedReporterSearch] = useState("");
    const [reporterSortBy, setReporterSortBy] = useState<"" | "name" | "city" | "ratePerMinute">("");
    const [reportersList, setReportersList] = useState<Reporter[]>([]);

    // Local state for searching/sorting available editors
    const [localEditorSearch, setLocalEditorSearch] = useState("");
    const [debouncedEditorSearch, setDebouncedEditorSearch] = useState("");
    const [editorSortBy, setEditorSortBy] = useState<"" | "name" | "flatfee">("");
    const [editorsList, setEditorsList] = useState<Editor[]>([]);

    const reporter = job.reporter;
    const editor = job.editor;
    const payment = job.payment;

    const previewPayment = useMemo(() => {
        if (!reporter) return null;
        return calculatePayment(job, reporter, editor);
    }, [job, reporter, editor]);

    // Local suggestion calculations for editors
    const suggestedEditor = useMemo(() => {
        if (editorsList.length === 0) return null;
        return [...editorsList].sort((a, b) => a.flatFee - b.flatFee)[0] || null;
    }, [editorsList]);

    // Load suggested reporters & reset local choices on job/status updates
    useEffect(() => {
        if (job.status === "NEW") {
            getSuggestedReporter(job.id)
                .then((r) => setSuggestedReporters(r ? [r] : []))
                .catch(() => setSuggestedReporters([]));
        } else {
            setSuggestedReporters([]);
        }
        setSelectedReporterId(null);
        setSelectedEditorId(null);
    }, [job.id, job.status, getSuggestedReporter]);

    // Debounce reporter search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedReporterSearch(localReporterSearch);
        }, 300);
        return () => clearTimeout(handler);
    }, [localReporterSearch]);

    // Debounce editor search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedEditorSearch(localEditorSearch);
        }, 300);
        return () => clearTimeout(handler);
    }, [localEditorSearch]);

    // Fetch available reporters locally
    useEffect(() => {
        if (job.status !== "NEW") return;

        let active = true;
        reporterService.listReporters({
            available: true,
            search: debouncedReporterSearch || undefined,
            sortBy: reporterSortBy || undefined,
        }).then((res) => {
            if (active) {
                setReportersList(res);
            }
        }).catch(() => {});

        return () => {
            active = false;
        };
    }, [job.id, job.status, debouncedReporterSearch, reporterSortBy]);

    // Fetch available editors locally
    useEffect(() => {
        const isTranscribed = STATUS_FLOW.indexOf(job.status) >= STATUS_FLOW.indexOf("TRANSCRIBED");
        if (!isTranscribed || job.editor) return;

        let active = true;
        editorService.listEditors({
            available: true,
            search: debouncedEditorSearch || undefined,
            sortBy: editorSortBy || undefined,
        }).then((res) => {
            if (active) {
                setEditorsList(res);
            }
        }).catch(() => {});

        return () => {
            active = false;
        };
    }, [job.id, job.status, job.editor, debouncedEditorSearch, editorSortBy]);

    const calculatePaymentAction = async (jobId: string) => {
        const res = await apiFetch<{ totalPayout: number }>(`/jobs/${jobId}/payment`);
        await useJobStore.getState().loadJobs();
        return res;
    };

    async function handleAction(fn: () => Promise<void>) {
        setActionLoading(true);
        setActionError("");
        try {
            await fn();
        } catch (err: any) {
            setActionError(err.message || "An error occurred.");
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="flex h-full flex-col bg-slate-50">
            <div className="border-b border-slate-200 px-5 py-5 md:px-8 md:py-6 bg-white">
                <button
                    onClick={onBack}
                    className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 md:hidden"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to jobs
                </button>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                    Docket #{job.id.substring(0, 8).toUpperCase()}
                </p>
                <h2 className="mt-1 font-serif text-2xl leading-tight text-slate-900">{job.caseName}</h2>
                <div className="mt-4 flex items-center gap-4">
                    <LocationBadge job={job} />
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {job.durationMin} min
                    </span>
                    <span className="text-xs text-slate-500 border-l border-slate-200 pl-4">
                        Filed {formatDate(job.createdAt)}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6 custom-scrollbar">
                {actionError && (
                    <div className="mb-4 rounded-sm bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-medium text-red-600 animate-in fade-in">
                        {actionError}
                    </div>
                )}

                <section className="mb-8">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Progress
                    </h3>
                    <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                        <DocketStamp status={job.status} showLabels={true} />
                    </div>
                </section>

                <section className="mb-6 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <Users className="h-3.5 w-3.5" /> Reporter
                    </h3>
                    {reporter ? (
                        <div className="flex items-center justify-between rounded bg-slate-50 p-3 border border-slate-100">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{reporter.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {reporter.city} · {formatIDR(reporter.ratePerMinute)}/min
                                </p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                    ) : job.status === "NEW" ? (
                        <div>
                            {/* Search, Filter, Sort Controls for Reporters */}
                            <div className="flex flex-col gap-2 mb-3 bg-slate-50 p-3 rounded border border-slate-200">
                                <div className="flex gap-2">
                                    <input
                                        value={localReporterSearch}
                                        onChange={(e) => setLocalReporterSearch(e.target.value)}
                                        placeholder="Search name or city..."
                                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#2f5a80] focus:ring-1 focus:ring-[#2f5a80]"
                                    />
                                    <select
                                        value={reporterSortBy}
                                        onChange={(e) => setReporterSortBy(e.target.value as any)}
                                        className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[#2f5a80]"
                                    >
                                        <option value="">Sort by Name</option>
                                        <option value="city">Sort by City</option>
                                        <option value="ratePerMinute">Sort by Rate</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reporters Scrollable List */}
                            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar">
                                {/* Suggested Matches */}
                                {suggestedReporters.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-[#2f5a80] uppercase tracking-wider mb-1.5">
                                            Suggested Matches
                                        </p>
                                        <div className="space-y-1.5">
                                            {suggestedReporters.map((r) => {
                                                const isSelected = selectedReporterId === r.id;
                                                return (
                                                    <button
                                                        key={`suggested-${r.id}`}
                                                        onClick={() => setSelectedReporterId(r.id)}
                                                        className={[
                                                            "w-full flex items-center justify-between rounded border px-3 py-2 text-left text-xs transition-all hover:bg-slate-50",
                                                            isSelected ? "border-[#2f5a80] bg-[#2f5a80]/5 ring-1 ring-[#2f5a80]" : "border-slate-200 bg-white",
                                                        ].join(" ")}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-semibold text-slate-900">{r.name}</span>
                                                                <span className="rounded bg-[#2f5a80]/15 text-[#2f5a80] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                                                                    Suggested
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-500 text-[10px] mt-0.5">{r.city}</p>
                                                        </div>
                                                        <span className="font-mono font-medium text-slate-600">
                                                            {formatIDR(r.ratePerMinute)}/m
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Main List */}
                                <div>
                                    {suggestedReporters.length > 0 && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3 mb-1.5">
                                            All Reporters
                                        </p>
                                    )}
                                    <div className="space-y-1.5">
                                        {reportersList
                                            .filter((r) => !suggestedReporters.some((sr) => sr.id === r.id))
                                            .map((r) => {
                                                const isSelected = selectedReporterId === r.id;
                                                return (
                                                    <button
                                                        key={`all-${r.id}`}
                                                        onClick={() => setSelectedReporterId(r.id)}
                                                        className={[
                                                            "w-full flex items-center justify-between rounded border px-3 py-2 text-left text-xs transition-all hover:bg-slate-50",
                                                            isSelected ? "border-[#2f5a80] bg-[#2f5a80]/5 ring-1 ring-[#2f5a80]" : "border-slate-200 bg-white",
                                                        ].join(" ")}
                                                    >
                                                        <div>
                                                            <span className="font-semibold text-slate-900">{r.name}</span>
                                                            <p className="text-slate-500 text-[10px] mt-0.5">{r.city}</p>
                                                        </div>
                                                        <span className="font-mono font-medium text-slate-600">
                                                            {formatIDR(r.ratePerMinute)}/m
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        {reportersList.filter((r) => !suggestedReporters.some((sr) => sr.id === r.id)).length === 0 && (
                                            <p className="text-xs text-slate-400 italic py-2">No other reporters found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAction(async () => {
                                    if (!selectedReporterId) return;
                                    const updated = await assignReporter(job.id, selectedReporterId);
                                    triggerToast(`Reporter assigned: ${updated.reporter?.name ?? ""}`, "success");
                                    setSelectedReporterId(null);
                                })}
                                className="w-full rounded-sm bg-[#2f5a80] py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2f5a80]/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                                disabled={actionLoading || !selectedReporterId}
                            >
                                {actionLoading ? "Assigning..." : selectedReporterId 
                                    ? `Assign Selected Reporter` 
                                    : "Select a reporter above"}
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Not yet assigned.</p>
                    )}
                </section>

                <section className="mb-6 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <FileText className="h-3.5 w-3.5" /> Editor
                    </h3>
                    {editor ? (
                        <div className="flex items-center justify-between rounded bg-slate-50 p-3 border border-slate-100">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{editor.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Flat fee {formatIDR(editor.flatFee)}</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                    ) : STATUS_FLOW.indexOf(job.status) >= STATUS_FLOW.indexOf("TRANSCRIBED") ? (
                        <div>
                            {/* Search, Filter, Sort Controls for Editors */}
                            <div className="flex flex-col gap-2 mb-3 bg-slate-50 p-3 rounded border border-slate-200">
                                <div className="flex gap-2">
                                    <input
                                        value={localEditorSearch}
                                        onChange={(e) => setLocalEditorSearch(e.target.value)}
                                        placeholder="Search editor name..."
                                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#2f5a80] focus:ring-1 focus:ring-[#2f5a80]"
                                    />
                                    <select
                                        value={editorSortBy}
                                        onChange={(e) => setEditorSortBy(e.target.value as any)}
                                        className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[#2f5a80]"
                                    >
                                        <option value="">Sort by Name</option>
                                        <option value="flatfee">Sort by Flat Fee</option>
                                    </select>
                                </div>
                            </div>

                            {/* Editors Scrollable List */}
                            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar">
                                {/* Suggested Matches */}
                                {suggestedEditor && (
                                    <div>
                                        <p className="text-[10px] font-bold text-[#2f5a80] uppercase tracking-wider mb-1.5">
                                            Suggested Matches
                                        </p>
                                        <div className="space-y-1.5">
                                            <button
                                                key={`suggested-editor-${suggestedEditor.id}`}
                                                onClick={() => setSelectedEditorId(suggestedEditor.id)}
                                                className={[
                                                    "w-full flex items-center justify-between rounded border px-3 py-2 text-left text-xs transition-all hover:bg-slate-50",
                                                    selectedEditorId === suggestedEditor.id ? "border-[#2f5a80] bg-[#2f5a80]/5 ring-1 ring-[#2f5a80]" : "border-slate-200 bg-white",
                                                ].join(" ")}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-slate-900">{suggestedEditor.name}</span>
                                                        <span className="rounded bg-[#2f5a80]/15 text-[#2f5a80] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                                                            Suggested
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="font-mono font-medium text-slate-600">
                                                    {formatIDR(suggestedEditor.flatFee)}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Main Editor List */}
                                <div>
                                    {suggestedEditor && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3 mb-1.5">
                                            All Editors
                                        </p>
                                    )}
                                    <div className="space-y-1.5">
                                        {editorsList
                                            .filter((e) => !suggestedEditor || e.id !== suggestedEditor.id)
                                            .map((e) => {
                                                const isSelected = selectedEditorId === e.id;
                                                return (
                                                    <button
                                                        key={`all-editor-${e.id}`}
                                                        onClick={() => setSelectedEditorId(e.id)}
                                                        className={[
                                                            "w-full flex items-center justify-between rounded border px-3 py-2 text-left text-xs transition-all hover:bg-slate-50",
                                                            isSelected ? "border-[#2f5a80] bg-[#2f5a80]/5 ring-1 ring-[#2f5a80]" : "border-slate-200 bg-white",
                                                        ].join(" ")}
                                                    >
                                                        <div>
                                                            <span className="font-semibold text-slate-900">{e.name}</span>
                                                        </div>
                                                        <span className="font-mono font-medium text-slate-600">
                                                            {formatIDR(e.flatFee)}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        {editorsList.filter((e) => !suggestedEditor || e.id !== suggestedEditor.id).length === 0 && (
                                            <p className="text-xs text-slate-400 italic py-2">No other editors found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAction(async () => {
                                    if (!selectedEditorId) return;
                                    const updated = await assignEditor(job.id, selectedEditorId);
                                    triggerToast(`Editor assigned: ${updated.editor?.name ?? ""}`, "success");
                                    setSelectedEditorId(null);
                                })}
                                className="w-full rounded-sm bg-[#2f5a80] py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2f5a80]/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                                disabled={actionLoading || !selectedEditorId}
                            >
                                {actionLoading ? "Assigning..." : selectedEditorId 
                                    ? `Assign Selected Editor` 
                                    : "Select an editor above"}
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">
                            Available once the job reaches Transcribed.
                        </p>
                    )}
                </section>

                <section className="mb-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <Receipt className="h-3.5 w-3.5" /> Payment Breakdown
                    </h3>
                    {reporter ? (
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Reporter payout</span>
                                <span>{formatIDR(previewPayment?.reporterPayout ?? 0)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Editor payout</span>
                                <span>{formatIDR(previewPayment?.editorPayout ?? 0)}</span>
                            </div>
                            <div className="mt-3 flex justify-between border-t border-dashed border-slate-200 pt-3 text-sm font-semibold text-slate-900">
                                <span>Total payout</span>
                                <span className="text-[#2f5a80]">{formatIDR(previewPayment?.totalPayout ?? 0)}</span>
                            </div>

                            {payment ? (
                                <div className="mt-3 bg-emerald-50 text-emerald-800 rounded px-3 py-2 border border-emerald-100 flex items-center justify-between font-sans">
                                    <span className="text-[11px] font-medium">Recorded in Database</span>
                                    <span className="text-[10px] opacity-75">{formatDate(payment.calculatedAt)}</span>
                                </div>
                            ) : (
                                <div className="mt-4 pt-2 border-t border-slate-100 font-sans flex flex-col gap-2">
                                    <p className="text-[11px] text-slate-500">
                                        This payment is computed client-side as a preview. Record it in the database to finalize:
                                    </p>
                                    <button
                                        onClick={() => handleAction(async () => {
                                            const payment = await calculatePaymentAction(job.id);
                                            triggerToast(`Payment finalized: ${formatIDR(payment.totalPayout)}`, "success");
                                        })}
                                        className="w-full flex items-center justify-center gap-1.5 rounded-sm border border-amber-600 bg-amber-50 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-70"
                                        disabled={actionLoading}
                                    >
                                        💰 {actionLoading ? "Processing..." : "Record & Finalize Payout"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">
                            Requires a reporter to be assigned first.
                        </p>
                    )}
                </section>
            </div>

            <div className="border-t border-slate-200 bg-white px-5 py-4 md:px-8 md:py-5 font-sans">
                {job.status === "NEW" ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-sm border border-slate-200 bg-slate-50 py-3 text-sm font-medium text-slate-500">
                        Please assign a reporter to proceed
                    </div>
                ) : job.status === "TRANSCRIBED" ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-sm border border-slate-200 bg-slate-50 py-3 text-sm font-medium text-slate-500">
                        Please assign an editor to proceed
                    </div>
                ) : job.status === "COMPLETED" ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-sm border border-emerald-600 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Job Completed
                    </div>
                ) : (
                    <button
                        onClick={() => handleAction(async () => {
                            if (job.status === "ASSIGNED") {
                                await finishTranscription(job.id);
                                triggerToast("Status advanced to Transcribed", "success");
                            } else if (job.status === "REVIEWED") {
                                await finishJob(job.id);
                                triggerToast("Status advanced to Completed", "success");
                            }
                        })}
                        className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#2f5a80] py-3 text-sm font-semibold text-white transition-all hover:bg-[#2f5a80]/90 hover:shadow-md active:scale-[0.98] disabled:opacity-75"
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Updating..." : job.status === "ASSIGNED" ? "Mark as Transcribed" : "Mark as Completed"}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}