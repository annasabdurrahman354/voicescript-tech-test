import { Clock } from "lucide-react";
import type { Job } from "../types";
import { formatDate } from "../lib/format";
import { LocationBadge } from "./LocationBadge";
import { DocketStamp } from "./DocketStamp";

interface JobCardProps {
    job: Job;
    isSelected: boolean;
    onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
    return (
        <button
            onClick={onClick}
            className={[
                "group flex w-full flex-col gap-2.5 border-b border-slate-200 px-6 py-5 text-left transition-all",
                isSelected ? "bg-white" : "hover:bg-white",
            ].join(" ")}
            style={isSelected ? { boxShadow: "inset 4px 0 0 #2f5a80" } : { boxShadow: "inset 4px 0 0 transparent" }}
        >
            <div className="flex items-start justify-between gap-2">
                <p className={[
                    "text-sm font-semibold leading-snug transition-colors",
                    isSelected ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                ].join(" ")}>
                    {job.caseName}
                </p>
                <span className="shrink-0 font-mono text-[10px] text-slate-400 mt-0.5">
                    {formatDate(job.createdAt)}
                </span>
            </div>
            <div className="flex items-center gap-2.5">
                <LocationBadge job={job} />
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Clock className="h-3 w-3" />
                    {job.durationMin}m
                </span>
                {job.reporter && (
                    <span className="truncate text-[11px] font-medium text-slate-500">· {job.reporter.name}</span>
                )}
            </div>
            <DocketStamp status={job.status} />
        </button>
    );
}
