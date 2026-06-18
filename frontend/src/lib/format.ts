export function formatIDR(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });
}
