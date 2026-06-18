export interface Reporter {
    id: string;
    name: string;
    city: string;
    available: boolean;
    ratePerMinute: number;
}

export interface Editor {
    id: string;
    name: string;
    available: boolean;
    flatFee: number;
}

export interface Payment {
    id: string;
    jobId: string;
    reporterPayout: number;
    editorPayout: number;
    totalPayout: number;
    calculatedAt: string;
}

export interface Job {
    id: string;
    caseName: string;
    durationMin: number;
    locationType: "PHYSICAL" | "REMOTE";
    city: string | null;
    status: "NEW" | "ASSIGNED" | "TRANSCRIBED" | "REVIEWED" | "COMPLETED";
    reporterId: string | null;
    editorId: string | null;
    reporter: Reporter | null;
    editor: Editor | null;
    payment: Payment | null;
    createdAt: string;
}
