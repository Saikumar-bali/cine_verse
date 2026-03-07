import { loadMovie, selectMovieSource } from '../../_lib/catalog.js';
import { parseIndex, requireGetOrHead, sendJson } from '../../_lib/http.js';
import { proxySource } from '../../_lib/stream.js';

export default async function handler(req, res) {
    if (!requireGetOrHead(req, res)) {
        return;
    }

    try {
        const movieId = req.query.id;
        const slotIndex = parseIndex(req.query.slot, 0);
        const movie = await loadMovie(movieId);
        const source = selectMovieSource(movie, slotIndex);

        if (!source) {
            return sendJson(res, 404, {
                error: 'Requested movie source was not found.',
                movie_id: movieId,
                slot: slotIndex,
            });
        }

        return proxySource(req, res, source, {
            kind: 'movie',
            movie_id: movieId,
            slot: slotIndex,
        });
    } catch (error) {
        return sendJson(res, 500, { error: error.message });
    }
}
