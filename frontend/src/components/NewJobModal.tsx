import { useEffect, useRef, useState } from "react";
import { MapPin, Wifi, X } from "lucide-react";

interface NewJobModalProps {
    onClose: () => void;
    onCreate: (data: { caseName: string; durationMin: number; locationType: "PHYSICAL" | "REMOTE"; city: string | null }) => Promise<void>;
}

export function NewJobModal({ onClose, onCreate }: NewJobModalProps) {
    const [caseName, setCaseName] = useState("");
    const [durationMin, setDurationMin] = useState("");
    const [locationType, setLocationType] = useState<"PHYSICAL" | "REMOTE">("PHYSICAL");
    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!caseName.trim()) return setError("Case name is required.");
        if (!durationMin || Number(durationMin) <= 0)
            return setError("Duration must be a positive number of minutes.");
        if (locationType === "PHYSICAL" && !city.trim())
            return setError("City is required for physical jobs.");

        setIsSubmitting(true);
        try {
            await onCreate({
                caseName: caseName.trim(),
                durationMin: Number(durationMin),
                locationType,
                city: locationType === "PHYSICAL" ? city.trim() : null,
            });
        } catch (err: any) {
            setError(err.message || "Failed to create job.");
            setIsSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="w-full max-w-md rounded-md border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h2 className="font-serif text-lg text-slate-900">File a new docket</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-sm p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Close"
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Case name
                        </label>
                        <input
                            autoFocus
                            value={caseName}
                            onChange={(e) => { setCaseName(e.target.value); setError(""); }}
                            placeholder="e.g. Smith v. Jones — Deposition"
                            className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-shadow focus:border-[#2f5a80] focus:ring-2 focus:ring-[#2f5a80]/20"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={durationMin}
                            onChange={(e) => { setDurationMin(e.target.value); setError(""); }}
                            placeholder="90"
                            className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-shadow focus:border-[#2f5a80] focus:ring-2 focus:ring-[#2f5a80]/20"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Location type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["PHYSICAL", "REMOTE"] as const).map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    onClick={() => { setLocationType(opt); setError(""); }}
                                    className={[
                                        "flex items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-sm font-medium transition-all",
                                        locationType === opt
                                            ? "border-[#2f5a80] bg-[#2f5a80]/10 text-[#2f5a80] shadow-sm"
                                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                                    ].join(" ")}
                                    disabled={isSubmitting}
                                >
                                    {opt === "PHYSICAL" ? <MapPin className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
                                    {opt === "PHYSICAL" ? "Physical" : "Remote"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {locationType === "PHYSICAL" && (
                        <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                City
                            </label>
                            <input
                                value={city}
                                onChange={(e) => { setCity(e.target.value); setError(""); }}
                                placeholder="Jakarta"
                                className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-shadow focus:border-[#2f5a80] focus:ring-2 focus:ring-[#2f5a80]/20"
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {error && (
                        <p className="rounded-sm bg-red-50 px-3 py-2 text-xs font-medium text-red-600 animate-in fade-in">
                            {error}
                        </p>
                    )}

                    <div className="mt-2 flex justify-end gap-3 pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-sm bg-[#2f5a80] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#2f5a80]/90 hover:shadow-md active:scale-[0.98] disabled:opacity-70"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}