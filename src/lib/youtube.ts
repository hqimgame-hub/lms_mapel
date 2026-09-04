/**
 * Utility functions for YouTube URL parsing and embedding
 */

export function extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const cleanUrl = url.trim();

    // Regular expression covering various YouTube URL formats:
    // - youtube.com/watch?v=ID
    // - youtu.be/ID
    // - youtube.com/embed/ID
    // - youtube.com/v/ID
    // - youtube.com/shorts/ID
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = cleanUrl.match(regExp);

    return match ? match[1] : null;
}

export function isYouTubeUrl(url: string): boolean {
    if (!url) return false;
    return extractYouTubeVideoId(url) !== null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
}
