import { getProviderConfigSummary } from '../_lib/provider.js';
import { sendJson } from '../_lib/http.js';

export default async function handler(_req, res) {
    sendJson(res, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            has_supabase_url: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
            has_supabase_service_key: Boolean(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
        },
        provider: getProviderConfigSummary(),
    });
}
