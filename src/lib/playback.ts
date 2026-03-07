export function buildMoviePlaybackUrl(movieId: string | number, slotIndex = 0) {
    const params = new URLSearchParams({ slot: String(slotIndex) });
    return `/api/play/movie/${encodeURIComponent(String(movieId))}?${params.toString()}`;
}

export function buildSeriesPlaybackUrl(seriesId: string | number, seasonIndex = 0, episodeIndex = 0, slotIndex = 0) {
    const params = new URLSearchParams({
        season: String(seasonIndex),
        episode: String(episodeIndex),
        slot: String(slotIndex),
    });

    return `/api/play/series/${encodeURIComponent(String(seriesId))}?${params.toString()}`;
}
