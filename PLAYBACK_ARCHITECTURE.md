# Playback Broker Structure

This frontend is deployed as a Vite app plus Vercel serverless functions.

## Layout

```text
movies_website/
  api/
    _lib/
      catalog.js
      http.js
      provider.js
      stream.js
      supabase-admin.js
    play/
      health.js
      movie/
        [id].js
      series/
        [id].js
  src/
    lib/
      playback.ts
    pages/
      MovieDetail.tsx
      SeriesDetail.tsx
```

## Runtime model

1. The browser never receives provider cookies or secret headers.
2. The browser plays only same-origin URLs under `/api/play/...`.
3. Vercel functions fetch the source URL from Supabase with service-role credentials.
4. Vercel functions attach optional provider headers from server-side env vars.
5. If the provider still blocks Vercel IPs, playback will still fail and you need your own media origin or your own storage.

## Important limitation

This architecture is correct for app-only provider APIs, but Vercel is still a weak place to proxy large video files long-term.
If provider access works but streaming is unstable under Vercel limits, move `api/_lib/stream.js` logic to a dedicated Node server, Cloudflare Worker, or your own storage/CDN without changing the frontend contract.

## Minimal test flow

1. Deploy the site and functions to Vercel.
2. Set the server-only env vars in Vercel project settings.
3. Open `/api/play/health` and verify env validation.
4. Open a movie page and click a server button.
5. If playback returns provider denial, the provider is blocking the Vercel runtime itself.

## Required Vercel env

Set PLAYBACK_ALLOWED_HOSTS to the provider hostnames you actually use. The current known set is:

``text
mbmove.mycdn-mb.xyz,mblinkmove.mycdn-mb.xyz,mblinkserie.mycdn-mb.xyz,mbserie.mycdn-mb.xyz,mbserie26.mycdn-mb.xyz,mbmove26.mycdn-mb.xyz,mb-r2.mycdn-mb.xyz,mbfile.mycdn-mb.xyz,mbmove.aws-s3-cloud.space,mbserie.aws-s3-cloud.space,mb-r2.aws-s3-cloud.space,mbfile.aws-s3-cloud.space,45.14.226.224
`` 
