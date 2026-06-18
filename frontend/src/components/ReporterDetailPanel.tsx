import { ChevronLeft, MapPin, Receipt, User } from "lucide-react";
import type { Reporter } from "../types";
import { formatIDR } from "../lib/format";

interface ReporterDetailPanelProps {
    reporter: Reporter;
    onBack: () => void;
}

export function ReporterDetailPanel({ reporter, onBack }: ReporterDetailPanelProps) {
    return (
        <div className="flex h-full flex-col bg-slate-50">
            <div className="border-b border-slate-200 px-5 py-5 md:px-8 md:py-6 bg-white font-sans">
                <button
                    onClick={onBack}
                    className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 md:hidden"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to reporters
                </button>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                    Reporter Profile
                </p>
                <div className="mt-1 flex items-center gap-3">
                    <div className="rounded-full bg-[#2f5a80]/10 p-2 text-[#2f5a80]">
                        <User className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="font-serif text-2xl leading-tight text-slate-900">{reporter.name}</h2>
                        <div className="mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="h-3.5 w-3.5" />
                                {reporter.city}
                            </span>
                            <span className={[
                                "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                reporter.available 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-slate-50 text-slate-500 border border-slate-200"
                            ].join(" ")}>
                                {reporter.available ? "Available" : "Busy"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6 custom-scrollbar font-sans">
                <section className="mb-6 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <Receipt className="h-3.5 w-3.5" /> Rate Structure
                    </h3>
                    <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Base Rate</span>
                            <span>{formatIDR(reporter.ratePerMinute)} per minute</span>
                        </div>
                        <div className="flex justify-between text-slate-600 border-t border-dashed border-slate-100 pt-3">
                            <span>Hourly equivalent</span>
                            <span>{formatIDR(reporter.ratePerMinute * 60)} per hour</span>
                        </div>
                    </div>
                </section>

                <section className="mb-6 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Workplace Guidelines
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        This court reporter operates primarily within the <b>{reporter.city}</b> jurisdiction. For physical depositions, travel expense policies and local court-reporting guidelines apply.
                    </p>
                </section>
            </div>
        </div>
    );
}
