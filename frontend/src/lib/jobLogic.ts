import type { Editor, Job, Reporter } from "../types";
import { ALLOWED_TRANSITIONS } from "../constants";

export function nextStatus(status: Job["status"]): Job["status"] | null {
    return ALLOWED_TRANSITIONS[status]?.[0] || null;
}

export function scoreReporter(reporter: Reporter, job: Job): number {
    if (job.locationType === "PHYSICAL" && job.city === reporter.city) {
        return 2;
    }
    if (job.locationType === "REMOTE") {
        return 1;
    }
    return 0;
}

export function selectBestReporter(reporters: Reporter[], job: Job): Reporter | null {
    const candidates = reporters.filter((r) => r.available);
    if (candidates.length === 0) return null;
    const ranked = [...candidates].sort((a, b) => {
        const sa = scoreReporter(a, job);
        const sb = scoreReporter(b, job);
        if (sb !== sa) return sb - sa;
        if (a.ratePerMinute !== b.ratePerMinute) return a.ratePerMinute - b.ratePerMinute;
        return a.name.localeCompare(b.name);
    });
    return ranked[0] || null;
}

export function calculatePayment(job: Job, reporter: Reporter | null, editor: Editor | null) {
    const reporterPayout = job.durationMin * (reporter?.ratePerMinute ?? 0);
    const editorPayout = editor?.flatFee ?? 0;
    return {
        reporterPayout,
        editorPayout,
        totalPayout: reporterPayout + editorPayout,
    };
}
