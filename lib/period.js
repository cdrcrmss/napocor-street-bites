export function getPeriodStart(period) {
    const now = new Date();
    const date = new Date(now);

    if (period === "day") {
        date.setHours(0, 0, 0, 0);
        return date;
    }

    if (period === "week") {
        const dayIndex = (date.getDay() + 6) % 7;
        date.setDate(date.getDate() - dayIndex);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    if (period === "month") {
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    return null;
}

export function formatReceiptCode() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `RCP-${y}${m}${d}-${hh}${mm}${ss}-${random}`;
}