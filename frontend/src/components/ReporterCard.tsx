import type { Reporter } from "../types";
import { formatIDR } from "../lib/format";
import { MapPin, User } from "lucide-react";

interface ReporterCardProps {
    reporter: Reporter;
    isSelected: boolean;
    onClick: () => void;
}

export function ReporterCard({ reporter, isSelected, onClick }: ReporterCardProps) {
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
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-slate-100 p-1 text-slate-500">
                        <User className="h-4 w-4" />
                    </div>
                    <p className={[
                        "text-sm font-semibold leading-snug transition-colors",
                        isSelected ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                    ].join(" ")}>
                        {reporter.name}
                    </p>
                </div>
                <span className={[
                    "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    reporter.available 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-slate-50 text-slate-500 border border-slate-200"
                ].join(" ")}>
                    {reporter.available ? "Available" : "Busy"}
                </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {reporter.city}
                </span>
                <span className="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {formatIDR(reporter.ratePerMinute)}/min
                </span>
            </div>
        </button>
    );
}
