// Formatting helpers
export function getFormattedTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export function getFormattedDate(date) {
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
export function getFormattedJoinedDate(input) {
    const date = new Date(input);
    if (isNaN(date.getTime())) return 'Not available';

    return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        
    });
}

export function getFormattedLastActiveDate(input) {
    const date = typeof input === 'string' ? new Date(input) : input;
    return isNaN(date?.getTime()) || date.getFullYear() > 2100
        ? 'Unknown'
        : date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
