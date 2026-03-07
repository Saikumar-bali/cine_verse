import { Readable } from 'node:stream';
import { assertAllowedHost, buildProviderHeaders, normalizeMediaLink } from './provider.js';
import { noStore, safeReadText, sendJson } from './http.js';

const PASSTHROUGH_HEADERS = [
    'accept-ranges',
    'content-length',
    'content-range',
    'content-type',
    'etag',
    'last-modified',
];

function passthroughHeaders(upstream, res) {
    for (const headerName of PASSTHROUGH_HEADERS) {
        const value = upstream.headers.get(headerName);
        if (value) {
            res.setHeader(headerName, value);
        }
    }
}

export async function proxySource(req, res, source, context = {}) {
    const mediaUrl = normalizeMediaLink(source?.link);
    if (!mediaUrl) {
        return sendJson(res, 404, { error: 'Playback source link missing.', context });
    }

    try {
        assertAllowedHost(mediaUrl);
    } catch (error) {
        return sendJson(res, 403, { error: error.message, context });
    }

    const controller = new AbortController();
    const timeoutMs = Number.parseInt(process.env.PLAYBACK_PROXY_TIMEOUT_MS || '25000', 10);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let upstream;
    try {
        upstream = await fetch(mediaUrl, {
            method: req.method === 'HEAD' ? 'HEAD' : 'GET',
            headers: buildProviderHeaders(req, source),
            redirect: 'follow',
            signal: controller.signal,
        });
    } catch (error) {
        clearTimeout(timeoutId);
        return sendJson(res, 502, {
            error: `Upstream fetch failed: ${error.message}`,
            context,
        });
    }

    clearTimeout(timeoutId);

    if (!upstream.ok && upstream.status !== 206) {
        const preview = (await safeReadText(upstream)).slice(0, 240);
        return sendJson(res, upstream.status === 403 ? 424 : upstream.status, {
            error: 'Provider denied or failed playback request.',
            provider_status: upstream.status,
            preview,
            context,
        });
    }

    noStore(res);
    res.statusCode = upstream.status;
    passthroughHeaders(upstream, res);

    if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'video/mp4');
    }

    if (req.method === 'HEAD' || !upstream.body) {
        res.end();
        return;
    }

    const readable = Readable.fromWeb(upstream.body);
    readable.on('error', (error) => {
        if (!res.headersSent) {
            sendJson(res, 502, {
                error: `Proxy stream failed: ${error.message}`,
                context,
            });
            return;
        }

        res.destroy(error);
    });

    readable.pipe(res);
}
