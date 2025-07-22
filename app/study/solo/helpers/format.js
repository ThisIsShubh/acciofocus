// Formatting helpers
export function getFormattedTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export function getFormattedDate(date) {
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
