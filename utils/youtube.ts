export interface VideoDetails {
    duration: string;
    viewCount: string;
    title?: string;
    thumbnail?: string;
}

export const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const formatDuration = (isoDuration: string) => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "N/A";

    const hours = (match[1] || "").replace("H", "");
    const minutes = (match[2] || "").replace("M", "");
    const seconds = (match[3] || "").replace("S", "");

    let formatted = "";
    if (hours) formatted += `${hours}h `;
    if (minutes) formatted += `${minutes}m `;
    if (seconds && !hours) formatted += `${seconds}s`;

    return formatted.trim() || "0s";
};

export const formatViewCount = (viewCount: string) => {
    const count = parseInt(viewCount, 10);
    if (isNaN(count)) return "0";

    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
};

export const fetchVideoDetails = async (videoId: string): Promise<VideoDetails | null> => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        if (!apiKey) {
            console.error("YouTube API key is missing");
            return null;
        }

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,statistics,snippet&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const item = data.items[0];
            return {
                duration: formatDuration(item.contentDetails.duration),
                viewCount: formatViewCount(item.statistics.viewCount),
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching video details:", error);
        return null;
    }
};
