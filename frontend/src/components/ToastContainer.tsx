import { useToast } from "../hooks/useToast";

export function ToastContainer() {
    const { toasts } = useToast();

    return (
        <div id="toast-container" className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={[
                        "toast p-4 rounded bg-white shadow-xl border border-slate-200 border-l-4 transition-all duration-300 animate-in slide-in-from-bottom-5",
                        t.type === "success"
                            ? "border-l-emerald-600"
                            : t.type === "error"
                                ? "border-l-rose-600"
                                : "border-l-[#2f5a80]",
                    ].join(" ")}
                >
                    <p className="text-xs font-semibold text-slate-800">{t.message}</p>
                </div>
            ))}
        </div>
    );
}
