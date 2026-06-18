import { useCallback, useState } from "react";

export interface Toast {
    id: string;
    message: string;
    type: "default" | "success" | "error";
}

const TOAST_DURATION_MS = 4000;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const triggerToast = useCallback((message: string, type: Toast["type"] = "default") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_DURATION_MS);
    }, []);

    return { toasts, triggerToast };
}
