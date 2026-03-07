function readExtraHeaders() {
    const raw = process.env.PLAYBACK_PROVIDER_EXTRA_HEADERS_JSON;
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function parseSourceHeaders(headerValue) {
    if (!headerValue) return {};
    if (typeof headerValue === 'object') return headerValue;
    if (typeof headerValue !== 'string') return {};

    try {
        const parsed = JSON.parse(headerValue);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function normalizeMediaLink(link) {
    if (typeof link !== 'string') return '';

    const trimmed = link.trim();
    if (!trimmed) return '';
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('//')) return `https:${trimmed}`;

    return `https://${trimmed.replace(/^\/+/, '')}`;
}

export function getAllowedHosts() {
    const raw = process.env.PLAYBACK_ALLOWED_HOSTS || 'mbmove.mycdn-mb.xyz,mblinkmove.mycdn-mb.xyz,mblinkserie.mycdn-mb.xyz,mbserie.mycdn-mb.xyz,mbserie26.mycdn-mb.xyz,mbmove26.mycdn-mb.xyz,mb-r2.mycdn-mb.xyz,mbfile.mycdn-mb.xyz,mbmove.aws-s3-cloud.space,mbserie.aws-s3-cloud.space,mb-r2.aws-s3-cloud.space,mbfile.aws-s3-cloud.space,45.14.226.224';
    return raw
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
}

export function assertAllowedHost(mediaUrl) {
    const url = new URL(mediaUrl);
    const allowedHosts = getAllowedHosts();

    if (!allowedHosts.includes(url.hostname.toLowerCase())) {
        throw new Error(`Blocked media host: ${url.hostname}`);
    }

    return url;
}

export function buildProviderHeaders(req, source = {}) {
    const headers = {
        'User-Agent': source.useragent || process.env.PLAYBACK_PROVIDER_USER_AGENT || 'EasyPlexPlayer',
        Accept: req.headers.accept || '*/*',
        ...readExtraHeaders(),
        ...parseSourceHeaders(source.header),
    };

    if (req.headers.range) {
        headers.Range = req.headers.range;
    }

    if (process.env.PLAYBACK_PROVIDER_REFERER) {
        headers.Referer = process.env.PLAYBACK_PROVIDER_REFERER;
    }

    if (process.env.PLAYBACK_PROVIDER_ORIGIN) {
        headers.Origin = process.env.PLAYBACK_PROVIDER_ORIGIN;
    }

    if (process.env.PLAYBACK_PROVIDER_AUTHORIZATION) {
        headers.Authorization = process.env.PLAYBACK_PROVIDER_AUTHORIZATION;
    }

    if (process.env.PLAYBACK_PROVIDER_COOKIE) {
        headers.Cookie = process.env.PLAYBACK_PROVIDER_COOKIE;
    }

    return headers;
}

export function getProviderConfigSummary() {
    return {
        allowed_hosts: getAllowedHosts(),
        has_referer: Boolean(process.env.PLAYBACK_PROVIDER_REFERER),
        has_origin: Boolean(process.env.PLAYBACK_PROVIDER_ORIGIN),
        has_authorization: Boolean(process.env.PLAYBACK_PROVIDER_AUTHORIZATION),
        has_cookie: Boolean(process.env.PLAYBACK_PROVIDER_COOKIE),
        has_extra_headers: Boolean(process.env.PLAYBACK_PROVIDER_EXTRA_HEADERS_JSON),
        user_agent: process.env.PLAYBACK_PROVIDER_USER_AGENT || 'EasyPlexPlayer',
    };
}
