import { createClient } from '@supabase/supabase-js';

let cachedClient;

export function getSupabaseAdmin() {
    if (cachedClient) {
        return cachedClient;
    }

    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY for playback broker.');
    }

    cachedClient = createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return cachedClient;
}
