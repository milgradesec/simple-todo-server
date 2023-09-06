import type { MiddlewareHandler } from "hono";

const TOKEN_STRINGS = '[A-Za-z0-9._~+/-]+=*';
const PREFIX = 'Bearer';
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlZmF1bHQiLCJ1c2VySWQiOjB9.tkgKzEdeIC14dpfQTv9AsaTHFyefrmHaVVXiJQ9MA24";

export function BearerAuthentication(options: {
    token: string;
    prefix?: string;
}): MiddlewareHandler {
    if (!options.token) {
        throw new Error("bearer auth middleware requires options for \"token\"");
    }
    if (!options.prefix) {
        options.prefix = PREFIX;
    }

    return async (c, next) => {
        const headerToken = c.req.headers.get("Authorization");
        if (headerToken === null || !headerToken) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const regexp = new RegExp('^' + options.prefix + ' +(' + TOKEN_STRINGS + ') *$');
        const match = regexp.exec(headerToken);
        if (!match) {
            return c.json({ error: "Bad Request: invalid token format" }, 400);
        }

        if (match[1] != TOKEN) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        await next();
    };
}


// // Hash a password
// async function hashPassword(password: string): Promise<string> {
//   try {
//     const hashedPassword = await argon2.hash(password);
//     return hashedPassword;
//   } catch (error) {
//     throw new Error('Error hashing password: ' + error.message);
//   }
// }

// // Verify a password
// async function verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
//   try {
//     const isPasswordValid = await argon2.verify(hashedPassword, inputPassword);
//     return isPasswordValid;
//   } catch (error) {
//     throw new Error('Error verifying password: ' + error.message);
//   }
// }