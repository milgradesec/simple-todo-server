import { Context } from "hono";

export async function createHandler(c: Context): Promise<Response> {
    const { userId } = c.req.param();
    const { title, content, start_time } = await c.req.json();

    const info = await c.env.DB.prepare(
        `INSERT INTO tasks (title, content, start_time, user_id) VALUES(?1,?2,?3,?4)`
    )
        .bind(title, content, start_time, userId)
        .run();
    if (!info.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }

    const values = await c.env.DB.prepare(
        `SELECT * FROM tasks WHERE title = ?1 AND user_id = ?2`
    )
        .bind(title, userId)
        .first();
    return c.json(values, { status: 201 });
}

export async function getAllHandler(c: Context): Promise<Response> {
    const { userId } = c.req.param();

    const rows = await c.env.DB.prepare(
        `SELECT * FROM tasks WHERE user_id = ?1`
    )
        .bind(userId)
        .all();
    return c.json(rows.results);
}

export async function editHandler(c: Context): Promise<Response> {
    const { userId, taskId } = c.req.param();
    const { title, content } = await c.req.json();

    const result = await c.env.DB.prepare(
        `UPDATE tasks SET title = ?1, content = ?2 WHERE id = ?3 AND user_id = ?4`
    )
        .bind(title, content, taskId, userId)
        .run();
    if (!result.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }
    if (result.meta.rows_written == 0) {
        return c.json({ error: "Task not found" }, 404);
    }
    return c.text("OK", 200);
}

export async function deleteHandler(c: Context): Promise<Response> {
    const { userId, taskId } = c.req.param();

    const result = await c.env.DB.prepare(
        `DELETE FROM tasks WHERE id = ?1 AND user_id = ?2`
    )
        .bind(taskId, userId)
        .run();
    if (!result.success) {
        return c.json({ error: "Unknown error" }, 500);
    }
    if (result.meta.rows_written == 0) {
        return c.json({ error: "Task not found" }, 404);
    }
    return c.text('OK', 200);
}