import { Context } from "hono";

export async function createNoteHandler(c: Context): Promise<Response> {
    const { userId } = c.req.param();
    const { title, content } = await c.req.json();

    const result = await c.env.DB.prepare(
        `INSERT INTO notes (title, content, user_id) VALUES(?1,?2,?3)`
    )
        .bind(title, content, userId)
        .run();
    if (!result.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }

    const row = await c.env.DB.prepare(
        `SELECT * FROM notes WHERE title = ?1 AND user_id = ?2`
    )
        .bind(title, userId)
        .first();
    return c.json(row, 201);
}

export async function getNotesHandler(c: Context): Promise<Response> {
    const { userId } = c.req.param();

    const rows = await c.env.DB.prepare(
        `SELECT * FROM notes WHERE user_id = ?1`
    )
        .bind(userId)
        .all();
    return c.json(rows.results);
}

export async function editNoteHandler(c: Context): Promise<Response> {
    const { userId, noteId } = c.req.param();
    const { title, content } = await c.req.json();

    const result = await c.env.DB.prepare(
        `UPDATE notes SET title = ?1, content = ?2 WHERE id = ?3 AND user_id = ?4`
    )
        .bind(title, content, noteId, userId)
        .run();
    if (!result.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }
    if (result.meta.rows_written == 0) {
        return c.json({ error: "List not found" }, 404);
    }
    return c.text("OK", 200);
}

export async function deleteNoteHandler(c: Context): Promise<Response> {
    const { listId, noteId } = c.req.param();

    const result = await c.env.DB.prepare(
        `DELETE FROM notes WHERE id = ?1 AND list_id = ?2`
    )
        .bind(noteId, listId)
        .run();
    if (!result.success) {
        return c.json({ error: "Unkown database error" }, 500);
    }
    if (result.meta.rows_written == 0) {
        return c.json({ error: "Note not found" }, 404);
    }
    return c.text("OK", 200);
}