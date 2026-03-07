export function noStore(res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
}

export function sendJson(res, statusCode, payload) {
    noStore(res);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
}

export function parseIndex(value, fallback = 0) {
    const parsed = Number.parseInt(String(value ?? fallback), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function requireGetOrHead(req, res) {
    if (req.method === 'GET' || req.method === 'HEAD') {
        return true;
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return false;
}

export async function safeReadText(response) {
    try {
        return await response.text();
    } catch {
        return '';
    }
}
