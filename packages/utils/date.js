// Date formatting utilities
export const formatDate = (date, format = 'short') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    switch (format) {
        case 'short':
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        case 'long':
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'relative':
            return getRelativeTime(dateObj);
        default:
            return dateObj.toLocaleDateString();
    }
};
export const getRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (diffInDays < 7) {
        const days = Math.floor(diffInDays);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    return formatDate(date, 'short');
};
