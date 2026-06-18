import { BarChart3, Briefcase, Scale, UserCheck, Users } from "lucide-react";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    activeTab: "jobs" | "reporters" | "editors" | "statistics";
    onChangeTab: (tab: "jobs" | "reporters" | "editors" | "statistics") => void;
}

export function Sidebar({
    open,
    onClose,
    activeTab,
    onChangeTab,
}: SidebarProps) {
    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={[
                    "fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-100 transition-all duration-300 ease-in-out lg:static lg:z-auto",
                    open ? "translate-x-0 lg:ml-0" : "-translate-x-full lg:-ml-60",
                ].join(" ")}
            >
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
                    <div className="rounded bg-[#2f5a80]/10 p-1.5">
                        <Scale className="h-5 w-5 text-[#2f5a80]" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="font-serif text-[15px] font-semibold leading-none text-slate-900">VoiceScript</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">
                            Docket Office
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {[
                        { id: "jobs", label: "Jobs", icon: Briefcase },
                        { id: "reporters", label: "Reporters", icon: Users },
                        { id: "editors", label: "Editors", icon: UserCheck },
                        { id: "statistics", label: "Statistics", icon: BarChart3 },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onChangeTab(item.id as any);
                                    onClose(); // Close mobile sidebar on selection
                                }}
                                className={[
                                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-[#2f5a80]/15 text-[#2f5a80]"
                                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900",
                                ].join(" ")}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}

