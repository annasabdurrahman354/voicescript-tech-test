import { useEffect, useMemo, useState } from "react";
import { FileText, Users, UserCheck } from "lucide-react";
import { useToast } from "./hooks/useToast";
import { useJobStore } from "./stores/jobStore";
import { useReporterStore } from "./stores/reporterStore";
import { useEditorStore } from "./stores/editorStore";
import { EmptyState } from "./components/EmptyState";
import { JobDetailPanel } from "./components/JobDetailPanel";
import { NewJobModal } from "./components/NewJobModal";
import { Sidebar } from "./components/Sidebar";
import { JobList } from "./components/JobList";
import { ToastContainer } from "./components/ToastContainer";

import { ReporterList } from "./components/ReporterList";
import { ReporterDetailPanel } from "./components/ReporterDetailPanel";
import { NewReporterModal } from "./components/NewReporterModal";

import { EditorList } from "./components/EditorList";
import { EditorDetailPanel } from "./components/EditorDetailPanel";
import { NewEditorModal } from "./components/NewEditorModal";

import { StatisticsView } from "./components/StatisticsView";
import { useStatisticsStore } from "./stores/statisticsStore";

export default function CourtReportingDashboard() {
    const jobs = useJobStore((s) => s.jobs);
    const loading = useJobStore((s) => s.loading);
    const loadJobs = useJobStore((s) => s.loadJobs);
    const createJob = useJobStore((s) => s.createJob);
    const selectedJobId = useJobStore((s) => s.selectedJobId);
    const setSelectedJobId = useJobStore((s) => s.setSelectedJobId);

    const reporters = useReporterStore((s) => s.reporters);
    const selectedReporterId = useReporterStore((s) => s.selectedReporterId);
    const setSelectedReporterId = useReporterStore((s) => s.setSelectedReporterId);
    const loadReporters = useReporterStore((s) => s.loadReporters);
    const createReporter = useReporterStore((s) => s.createReporter);

    const editors = useEditorStore((s) => s.editors);
    const selectedEditorId = useEditorStore((s) => s.selectedEditorId);
    const setSelectedEditorId = useEditorStore((s) => s.setSelectedEditorId);
    const loadEditors = useEditorStore((s) => s.loadEditors);
    const createEditor = useEditorStore((s) => s.createEditor);
    const loadStatistics = useStatisticsStore((s) => s.loadStatistics);

    const { triggerToast } = useToast();

    const [activeTab, setActiveTab] = useState<"jobs" | "reporters" | "editors" | "statistics">("jobs");
    const [showNewJob, setShowNewJob] = useState(false);
    const [showNewReporter, setShowNewReporter] = useState(false);
    const [showNewEditor, setShowNewEditor] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        loadJobs();
        loadReporters();
        loadEditors();
    }, [loadJobs, loadReporters, loadEditors]);

    useEffect(() => {
        if (selectedJobId) {
            loadReporters().catch(() => {});
            loadEditors().catch(() => {});
        }
    }, [selectedJobId, loadReporters, loadEditors]);

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 1024);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const selectedJob = useMemo(
        () => jobs.find((j) => j.id === selectedJobId) || null,
        [jobs, selectedJobId]
    );

    const selectedReporter = useMemo(
        () => reporters.find((r) => r.id === selectedReporterId) || null,
        [reporters, selectedReporterId]
    );

    const selectedEditor = useMemo(
        () => editors.find((e) => e.id === selectedEditorId) || null,
        [editors, selectedEditorId]
    );

    async function handleCreateJob(input: Parameters<typeof createJob>[0]) {
        const job = await createJob(input);
        if (job) {
            triggerToast("Docket successfully created!", "success");
            setSelectedJobId(job.id);
            setShowNewJob(false);
        }
    }

    async function handleCreateReporter(input: Parameters<typeof createReporter>[0]) {
        const reporter = await createReporter(input);
        if (reporter) {
            triggerToast("Reporter successfully added!", "success");
            setSelectedReporterId(reporter.id);
            setShowNewReporter(false);
        }
    }

    async function handleCreateEditor(input: Parameters<typeof createEditor>[0]) {
        const editor = await createEditor(input);
        if (editor) {
            triggerToast("Editor successfully added!", "success");
            setSelectedEditorId(editor.id);
            setShowNewEditor(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 font-sans gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2f5a80]/30 border-t-[#2f5a80]" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Initializing Court Reporting System...</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">

                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    activeTab={activeTab}
                    onChangeTab={(tab) => {
                        setActiveTab(tab);
                        if (tab === "reporters") {
                            loadReporters().catch(() => {});
                        } else if (tab === "editors") {
                            loadEditors().catch(() => {});
                        } else if (tab === "jobs") {
                            loadJobs().catch(() => {});
                        } else if (tab === "statistics") {
                            loadStatistics().catch(() => {});
                        }
                    }}
                />

                {activeTab === "jobs" && (
                    <JobList
                        onShowNewJob={() => setShowNewJob(true)}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                )}

                {activeTab === "reporters" && (
                    <ReporterList
                        onShowNewReporter={() => setShowNewReporter(true)}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                )}

                {activeTab === "editors" && (
                    <EditorList
                        onShowNewEditor={() => setShowNewEditor(true)}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                )}

                <section
                    className={[
                        "flex-1 overflow-hidden bg-slate-50",
                        activeTab === "jobs" && !selectedJobId ? "hidden md:block" :
                        activeTab === "reporters" && !selectedReporterId ? "hidden md:block" :
                        activeTab === "editors" && !selectedEditorId ? "hidden md:block" :
                        "block",
                    ].join(" ")}
                >
                    {activeTab === "jobs" && (
                        selectedJob ? (
                            <JobDetailPanel
                                job={selectedJob}
                                onBack={() => setSelectedJobId(null)}
                            />
                        ) : (
                            <EmptyState
                                icon={FileText}
                                title="Select a doaaacket entry"
                                body="Choose a case from the list to view its progression, assignments, and payment details."
                            />
                        )
                    )}

                    {activeTab === "reporters" && (
                        selectedReporter ? (
                            <ReporterDetailPanel
                                reporter={selectedReporter}
                                onBack={() => setSelectedReporterId(null)}
                            />
                        ) : (
                            <EmptyState
                                icon={Users}
                                title="Select a reporter"
                                body="Choose a court reporter from the list to view their details, base rate, and availability status."
                            />
                        )
                    )}

                    {activeTab === "editors" && (
                        selectedEditor ? (
                            <EditorDetailPanel
                                editor={selectedEditor}
                                onBack={() => setSelectedEditorId(null)}
                            />
                        ) : (
                            <EmptyState
                                icon={UserCheck}
                                title="Select an editor"
                                body="Choose a transcript editor from the list to view their flat fee and availability status."
                            />
                        )
                    )}

                    {activeTab === "statistics" && (
                        <StatisticsView
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
                    )}
                </section>

                {showNewJob && (
                    <NewJobModal onClose={() => setShowNewJob(false)} onCreate={handleCreateJob} />
                )}

                {showNewReporter && (
                    <NewReporterModal onClose={() => setShowNewReporter(false)} onCreate={handleCreateReporter} />
                )}

                {showNewEditor && (
                    <NewEditorModal onClose={() => setShowNewEditor(false)} onCreate={handleCreateEditor} />
                )}

                <ToastContainer />
            </div>
        </>
    );
}

