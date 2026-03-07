import { loadSeries, selectSeriesSource } from '../../_lib/catalog.js';
import { parseIndex, requireGetOrHead, sendJson } from '../../_lib/http.js';
import { proxySource } from '../../_lib/stream.js';

export default async function handler(req, res) {
    if (!requireGetOrHead(req, res)) {
        return;
    }

    try {
        const seriesId = req.query.id;
        const seasonIndex = parseIndex(req.query.season, 0);
        const episodeIndex = parseIndex(req.query.episode, 0);
        const slotIndex = parseIndex(req.query.slot, 0);
        const series = await loadSeries(seriesId);
        const { episode, source } = selectSeriesSource(series, seasonIndex, episodeIndex, slotIndex);

        if (!episode || !source) {
            return sendJson(res, 404, {
                error: 'Requested episode source was not found.',
                series_id: seriesId,
                season: seasonIndex,
                episode: episodeIndex,
                slot: slotIndex,
            });
        }

        return proxySource(req, res, source, {
            kind: 'series',
            series_id: seriesId,
            season: seasonIndex,
            episode: episodeIndex,
            slot: slotIndex,
            episode_name: episode.name || null,
        });
    } catch (error) {
        return sendJson(res, 500, { error: error.message });
    }
}
