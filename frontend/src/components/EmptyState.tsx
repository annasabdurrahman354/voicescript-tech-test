import type React from "react";

interface EmptyStateProps {
    icon: React.ComponentType<any>;
    title: string;
    body: string;
}

export function EmptyState({ icon: Icon, title, body }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center animate-in fade-in duration-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Icon className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
            </div>
            <div>
                <p className="font-serif text-lg text-slate-900">{title}</p>
                <p className="max-w-[260px] text-sm text-slate-500 mt-1">{body}</p>
            </div>
        </div>
    );
}