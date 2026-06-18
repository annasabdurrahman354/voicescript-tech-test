import { Check, Circle, Stamp } from "lucide-react";
import type { Job } from "../types";
import { STATUS_FLOW, STATUS_LABEL } from "../constants";

interface DocketStampProps {
    status: Job["status"];
    showLabels?: boolean;
}

export function DocketStamp({ status, showLabels = false }: DocketStampProps) {
    const currentIdx = STATUS_FLOW.indexOf(status);
    const isCompleted = status === "COMPLETED";

    return (
        <div className="relative flex items-center justify-between w-full mt-1" aria-label={`Status: ${STATUS_LABEL[status]}`}>
            <div className="absolute left-[10%] right-[10%] top-[11px] h-0.5 bg-slate-200 z-0" />

            {currentIdx > 0 && (
                <div
                    className="absolute left-[10%] top-[11px] h-0.5 bg-emerald-600 z-0 transition-all duration-300"
                    style={{
                        width: `${(currentIdx / (STATUS_FLOW.length - 1)) * 80}%`
                    }}
                />
            )}

            {STATUS_FLOW.map((s, i) => {
                const isDone = i < currentIdx || (isCompleted && i === currentIdx);
                const isCurrent = i === currentIdx && !isCompleted;
                return (
                    <div key={s} className="z-10 flex flex-col items-center flex-1">
                        <div
                            className={[
                                "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                                isDone
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : isCurrent
                                        ? "border-[#2f5a80] bg-[#2f5a80]/10 text-[#2f5a80]"
                                        : "border-slate-300 bg-white text-slate-300",
                            ].join(" ")}
                            title={STATUS_LABEL[s]}
                        >
                            {isDone ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            ) : isCurrent ? (
                                <Stamp className="h-3 w-3" strokeWidth={2.5} />
                            ) : (
                                <Circle className="h-2 w-2" strokeWidth={3} />
                            )}
                        </div>

                        {showLabels && (
                            <span className={[
                                "text-[10px] uppercase tracking-wide transition-colors mt-2 text-center select-none",
                                s === status ? "font-bold text-slate-900 animate-pulse" : "text-slate-400"
                            ].join(" ")}>
                                {STATUS_LABEL[s]}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}