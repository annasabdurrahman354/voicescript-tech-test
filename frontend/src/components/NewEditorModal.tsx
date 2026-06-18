import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface NewEditorModalProps {
    onClose: () => void;
    onCreate: (data: { name: string; flatFee: number }) => Promise<void>;
}

export function NewEditorModal({ onClose, onCreate }: NewEditorModalProps) {
    const [name, setName] = useState("");
    const [flatFee, setFlatFee] = useState("");
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
        if (!name.trim()) return setError("Editor name is required.");
        if (!flatFee || Number(flatFee) <= 0)
            return setError("Flat fee must be a positive number.");

        setIsSubmitting(true);
        try {
            await onCreate({
                name: name.trim(),
                flatFee: Number(flatFee),
            });
        } catch (err: any) {
            setError(err.message || "Failed to create editor.");
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
                    <h2 className="font-serif text-lg text-slate-900">Add a new editor</h2>
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
                            Editor name
                        </label>
                        <input
                            autoFocus
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            placeholder="e.g. Jane Smith"
                            className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-shadow focus:border-[#2f5a80] focus:ring-2 focus:ring-[#2f5a80]/20"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Flat Fee (IDR)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={flatFee}
                            onChange={(e) => { setFlatFee(e.target.value); setError(""); }}
                            placeholder="50000"
                            className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-shadow focus:border-[#2f5a80] focus:ring-2 focus:ring-[#2f5a80]/20"
                            disabled={isSubmitting}
                        />
                    </div>

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
                            {isSubmitting ? "Creating..." : "Create editor"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
