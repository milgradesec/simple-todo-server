import { Context } from "hono";

const TOKEN = "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb";

export async function registerHandler(c: Context): Promise<Response> {
    const { username, password } = await c.req.json();

    const rowCount = await c.env.DB.prepare(
        `SELECT COUNT(*) AS count FROM users WHERE username = ?`
    )
        .bind(username)
        .first("count");
    if (rowCount != null && rowCount != 0) {
        return c.json({ error: "User already exists" }, 403);
    }

    const result = await c.env.DB.prepare(
        `INSERT INTO users (username, password) VALUES (?1,?2)`
    )
        .bind(username, password)
        .run();
    if (!result.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }

    const row = await c.env.DB.prepare(
        `SELECT id FROM users WHERE username = ? LIMIT 1`
    )
        .bind(username)
        .first();
    if (row == null) {
        return c.json({ error: "Unkown database error" }, 500);
    }
    return c.json({ id: row.id, token: TOKEN }, 200);
}

export async function loginHandler(c: Context): Promise<Response> {
    const { username, password } = await c.req.json();

    const row = await c.env.DB.prepare(
        `SELECT id,password FROM users WHERE username = ? LIMIT 1`
    )
        .bind(username)
        .first();
    if (row != null && row.password == password) {
        return c.json({ id: row.id, token: TOKEN });
    }
    return c.json({ error: "Invalid authentication" }, 401);
}

export async function changePasswordHandler(c: Context): Promise<Response> {
    const { userId } = c.req.param();
    const { password, new_password } = await c.req.json();

    const row = await c.env.DB.prepare(
        `SELECT id, password FROM users WHERE id = ?1 LIMIT 1`
    )
        .bind(userId)
        .first();
    if (row != null && row.password != password) {
        return c.json({ error: "Invalid authentication" }, 401);
    }

    const result = await c.env.DB.prepare(
        `UPDATE users SET password = ?1 WHERE id = ?2`
    )
        .bind(new_password, userId)
        .run();
    if (!result.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }
    return c.text("OK", 200);
}