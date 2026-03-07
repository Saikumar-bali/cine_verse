import { getSupabaseAdmin } from './supabase-admin.js';

function parseArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value.trim()) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function loadMovie(id) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(`Movie lookup failed: ${error.message}`);
    }

    if (!data) {
        throw new Error('Movie not found');
    }

    const topLevelVideos = parseArray(data.videos);
    const fallbackVideos = parseArray(data.data?.videos);

    return {
        ...data,
        videos: topLevelVideos.length ? topLevelVideos : fallbackVideos,
    };
}

export async function loadSeries(id) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(`Series lookup failed: ${error.message}`);
    }

    if (!data) {
        throw new Error('Series not found');
    }

    return {
        ...data,
        seasons: parseArray(data.seasons),
    };
}

export function selectMovieSource(movie, slotIndex = 0) {
    const sources = Array.isArray(movie.videos) ? movie.videos : [];
    return sources[slotIndex] || null;
}

export function selectSeriesSource(series, seasonIndex = 0, episodeIndex = 0, slotIndex = 0) {
    const seasons = Array.isArray(series.seasons) ? series.seasons : [];
    const season = seasons[seasonIndex];
    const episode = Array.isArray(season?.episodes) ? season.episodes[episodeIndex] : null;
    const sources = Array.isArray(episode?.videos) ? episode.videos : [];

    return {
        episode,
        source: sources[slotIndex] || null,
    };
}
