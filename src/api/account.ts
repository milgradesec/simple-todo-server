import { Context } from "hono";
import * as bcrypt from "bcryptjs";

const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlZmF1bHQiLCJ1c2VySWQiOjB9.tkgKzEdeIC14dpfQTv9AsaTHFyefrmHaVVXiJQ9MA24";

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

    const hashedPasswd = bcrypt.hashSync(password, 10);
    const result = await c.env.DB.prepare(
        `INSERT INTO users (username, password) VALUES (?1,?2)`
    )
        .bind(username, hashedPasswd)
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
    if (row != null && bcrypt.compareSync(password, row.password)) {
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

    const hashedPasswd = bcrypt.hashSync(new_password, 10);
    const result = await c.env.DB.prepare(
        `UPDATE users SET password = ?1 WHERE id = ?2`
    )
        .bind(hashedPasswd, userId)
        .run();
    if (!result.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }
    return c.text("OK", 200);
}