import { ChevronLeft, PenTool, Receipt, User } from "lucide-react";
import type { Editor } from "../types";
import { formatIDR } from "../lib/format";

interface EditorDetailPanelProps {
    editor: Editor;
    onBack: () => void;
}

export function EditorDetailPanel({ editor, onBack }: EditorDetailPanelProps) {
    return (
        <div className="flex h-full flex-col bg-slate-50">
            <div className="border-b border-slate-200 px-5 py-5 md:px-8 md:py-6 bg-white font-sans">
                <button
                    onClick={onBack}
                    className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-950 md:hidden"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to editors
                </button>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                    Editor Profile
                </p>
                <div className="mt-1 flex items-center gap-3">
                    <div className="rounded-full bg-[#2f5a80]/10 p-2 text-[#2f5a80]">
                        <User className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="font-serif text-2xl leading-tight text-slate-900">{editor.name}</h2>
                        <div className="mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                <PenTool className="h-3.5 w-3.5" />
                                Editor Specialist
                            </span>
                            <span className={[
                                "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                editor.available 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-slate-50 text-slate-500 border border-slate-200"
                            ].join(" ")}>
                                {editor.available ? "Available" : "Busy"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6 custom-scrollbar font-sans">
                <section className="mb-6 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <Receipt className="h-3.5 w-3.5" /> Compensation Structure
                    </h3>
                    <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Flat Fee Rate</span>
                            <span>{formatIDR(editor.flatFee)} per job</span>
                        </div>
                    </div>
                </section>

                <section className="mb-6 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Workplace Guidelines
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        This editor operates remotely and provides transcript proofreading, grammar adjustment, audio alignment verification, and formatting compliance for court transcripts.
                    </p>
                </section>
            </div>
        </div>
    );
}
