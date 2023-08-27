import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';

type Bindings = {
    DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

const token = "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb"
app.use("/users/*", bearerAuth({ token }))

app.get("/", async c => {
    return c.text('Serverless Todo API v1', 200);
});

/**
 * Register user.
 */
app.post("/register", async c => {
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
        return c.json({ error: "Failed to write to the database" }, 500);
    }

    const row = await c.env.DB.prepare(
        `SELECT id FROM users WHERE username = ? LIMIT 1`
    )
        .bind(username)
        .first();
    if (row == null) {
        return
    }
    return c.json({ id: row.id, token: token });
});

/**
 * Login.
 */
app.post("/login", async (c) => {
    const { username, password } = await c.req.json();

    const values = await c.env.DB.prepare(
        `SELECT id,password FROM users WHERE username = ? LIMIT 1`
    )
        .bind(username)
        .first();
    if (values != null && values.password == password) {
        return c.json({ id: values.id, token: token });
    }
    return c.json({ err: "Invalid authentication" }, 401);
});

/**
 * Change password.
 */
app.post("/users/:userId/account/changePassword", async c => {
    const { userId } = c.req.param();
    const { password, new_password } = await c.req.json();

    const values = await c.env.DB.prepare(
        `SELECT id,password FROM users WHERE id = ?1 LIMIT 1`
    )
        .bind(userId)
        .first();
    if (values != null && values.password != password) {
        return c.json({ err: "Invalid authentication" }, 401);
    }

    const info = await c.env.DB.prepare(
        `UPDATE users SET password = ?1 WHERE id = ?2`
    )
        .bind(new_password, userId)
        .run();
    if (!info.success) {
        return c.json({ error: "Failed to write to the database" }, 500);
    }
    return c.text("OK")
});

/**
 * Create list.
 */
app.post("/users/:userId/lists", async c => {
    const { userId } = c.req.param();
    const { name, privacy } = await c.req.json();

    const count = await c.env.DB.prepare(
        `SELECT COUNT(*) AS count FROM lists WHERE name = ?1 AND user_id = ?2`
    )
        .bind(name, userId)
        .first("count");
    if (count != null && count != 0) {
        return c.json({ error: "List already exists" }, 409);
    }

    const info = await c.env.DB.prepare(
        `INSERT INTO lists (name, privacy, user_id) VALUES(?1,?2,?3)`
    )
        .bind(name, privacy, userId)
        .run();
    if (!info.success) {
        return c.json({ error: "Failed to write to the database" }, 500);
    }

    const values = await c.env.DB.prepare(
        `SELECT * FROM lists WHERE name = ?1 AND user_id = ?2 LIMIT 1`
    )
        .bind(name, userId)
        .first();
    return c.json(values, 201);
});

/**
 * Get all lists.
 */
app.get('/users/:userId/lists', async c => {
    const { userId } = c.req.param();

    const values = await c.env.DB.prepare(
        `SELECT * FROM lists WHERE user_id = ?1`
    )
        .bind(userId)
        .all();

    return c.json(values.results)
});

/**
 * Edit list.
 */
app.put('/users/:userId/lists/:listId', async c => {
    return new Response('Not Implemented', { status: 501 });
});

/**
 * Delete list.
 */
app.delete('/users/:userId/lists/:listId', async c => {
    const { listId, userId } = c.req.param();

    const info = await c.env.DB.prepare(
        `DELETE FROM lists WHERE id = ?1 AND user_id = ?2`
    )
        .bind(listId, userId)
        .run();
    if (!info.success) {
        return new Response('ERROR', { status: 500 });
    }
    return new Response('OK', { status: 200 });
});

/**
 * Create note.
 */
app.post('/users/:userId/lists/:listId/notes', async c => {
    const { userId, listId } = c.req.param();
    const { title, content, status } = await c.req.json();

    const info = await c.env.DB.prepare(
        `INSERT INTO notes (title, content, status, user_id, list_id) VALUES(?1,?2,?3,?4,?5)`
    )
        .bind(title, content, status, userId, listId)
        .run();
    if (!info.success) {
        return new Response('ERROR', { status: 500 });
    }

    const values = await c.env.DB.prepare(
        `SELECT * FROM notes WHERE title = ?1 AND user_id = ?2 AND list_id = ?3`
    )
        .bind(title, userId, listId)
        .first();

    return c.json(values, { status: 201 });
});

/**
 * Get all notes.
 */
app.get('/users/:userId/notes', async c => {
    const { userId } = c.req.param();

    const values = await c.env.DB.prepare(
        `SELECT * FROM notes WHERE user_id = ?1`
    )
        .bind(userId)
        .all();
    return c.json(values.results)
});

/**
 * Edit note.
 */
app.put('/users/:userId/lists/:listId/items/:itemId', async c => {
    return new Response('Not Implemented', { status: 501 });
});

/**
 * Delete note.
 */
app.delete('/users/:userId/lists/:listId/notes/:noteId', async c => {
    const { listId, noteId } = c.req.param();

    const { success } = await c.env.DB.prepare(
        `DELETE FROM notes WHERE id = ?1 AND list_id = ?2`
    )
        .bind(noteId, listId)
        .run();
    if (!success) {
        return new Response('ERROR', { status: 500 });
    }
    return new Response('OK', { status: 200 });
});

/**
 * Create task.
 */
app.post('/users/:userId/tasks', async c => {
    const { userId } = c.req.param();
    const { title, content, start_time } = await c.req.json();

    const info = await c.env.DB.prepare(
        `INSERT INTO tasks (title, content, start_time, user_id) VALUES(?1,?2,?3,?4)`
    )
        .bind(title, content, start_time, userId)
        .run();
    if (!info.success) {
        return new Response('ERROR', { status: 500 });
    }

    const values = await c.env.DB.prepare(
        `SELECT * FROM tasks WHERE title = ?1 AND user_id = ?2`
    )
        .bind(title, userId)
        .first();

    return c.json(values, { status: 201 });
});

/**
 * Get all tasks.
 */
app.get('/users/:userId/tasks', async c => {
    const { userId } = c.req.param();

    const values = await c.env.DB.prepare(
        `SELECT * FROM tasks WHERE user_id = ?1`
    )
        .bind(userId)
        .all();

    return c.json(values.results)
});

/**
 * Edit task.
 */
app.put('/users/:userId/tasks/:taskId', async c => {
    return new Response('Not Implemented', { status: 501 });
});

/**
 * Delete task.
 */
app.delete('/users/:userId/tasks/:taskId', async c => {
    const { userId, taskId } = c.req.param();

    const stmt = c.env.DB.prepare(`DELETE FROM tasks WHERE id = ?1 AND user_id = ?2`);
    const info = await stmt.bind(taskId, userId).run();
    if (!info.success) {
        return c.text('Unknown error', { status: 500 });
    }
    return c.text('OK', { status: 200 });
});

/**
 * Error handler.
 */
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: err.message }, 500);
});

// const api = new Hono().basePath('/v1')
// api.get('/book', (c) => c.text('List Books')) // GET /api/book

export default app