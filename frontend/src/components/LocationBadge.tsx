import { MapPin, Wifi } from "lucide-react";
import type { Job } from "../types";

export function LocationBadge({ job }: { job: Job }) {
    return job.locationType === "PHYSICAL" ? (
        <span className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">
            <MapPin className="h-3 w-3" />
            {job.city}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">
            <Wifi className="h-3 w-3" />
            Remote
        </span>
    );
}