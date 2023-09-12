import jwt from '@tsndr/cloudflare-worker-jwt';
import type { MiddlewareHandler } from 'hono';

const TOKEN_STRINGS = '[A-Za-z0-9._~+/-]+=*';
const PREFIX = 'Bearer';

export function BearerAuthentication(options: {
    prefix?: string;
}): MiddlewareHandler {
    if (!options.prefix) {
        options.prefix = PREFIX;
    }
    return async (c, next) => {
        const secretkey = c.env.AUTH_SECRET_KEY;
        const headerToken = c.req.headers.get("Authorization");
        if (headerToken === null || !headerToken) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const regexp = new RegExp('^' + options.prefix + ' +(' + TOKEN_STRINGS + ') *$');
        const match = regexp.exec(headerToken);
        if (!match) {
            return c.json({ error: "Invalid token format" }, 400);
        }

        if (!await jwt.verify(match[1], secretkey)) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        await next();
    };
}
