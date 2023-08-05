import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';

const app = new Hono()

app.get('/', async c => {
  return c.text('Serverless Todo API v1', { status: 200 });
});

const token = "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb"
app.use('/users/*', bearerAuth({ token }))

/**
 * Register user.
 */
app.post("/register", async c => {
  const { username, password } = await c.req.json();

  const count = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM users WHERE username = ?`
  )
    .bind(username)
    .first();
  if (count.count > 0) {
    return c.text("User already exists", { status: 403 });
  }

  const info = await c.env.DB.prepare(
    `INSERT INTO users (username, password) VALUES (?1,?2)`
  )
    .bind(username, password)
    .run();
  if (!info.success) {
    return c.text("Internal Server Error", { status: 500 });
  }

  const values = await c.env.DB.prepare(
    `SELECT id FROM users WHERE username = ? LIMIT 1`
  )
    .bind(username)
    .first();

  const response = { id: values.id, token: token };
  return c.json(response)
})

/**
 * Login.
 */
app.post('/login', async c => {
  const { username, password } = await c.req.json();

  const values = await c.env.DB.prepare(
    `SELECT id,password FROM users WHERE username = ? LIMIT 1`
  )
    .bind(username)
    .first();
  if (values.password == password) {
    const response = { id: values.id, token: token };
    return c.json(response)
  }
  return c.text("Invalid Authentication", { status: 401 });
})

/**
 * Change password for user.
 */
app.post('/users/:userId/account/changePassword', async c => {
  const { userId } = c.req.param();
  const { password, new_password } = await c.req.json();

  const values = await c.env.DB.prepare(
    `SELECT id,password FROM users WHERE id = ?1 LIMIT 1`
  )
    .bind(userId)
    .first();
  if (values.password != password) {
    return c.text("Invalid Authentication", { status: 401 });
  }

  const info = await c.env.DB.prepare(
    `UPDATE users SET password = ?1 WHERE id = ?2`
  )
    .bind(new_password, userId)
    .run();
  if (!info.success) {
    return c.text("Internal Server Error", { status: 500 });
  }

  return c.text("OK")
})

/**
 * Create list.
 */
app.post('/users/:userId/lists', async c => {
  const { userId } = c.req.param();
  const { name, privacy } = await c.req.json();

  const count = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM lists WHERE name = ?1 AND user_id = ?2`
  )
    .bind(name, userId)
    .first();
  if (count.count > 0) {
    return c.text("List already exists", { status: 409 });
  }

  const info = await c.env.DB.prepare(
    `INSERT INTO lists (name, privacy, user_id) VALUES(?1,?2,?3)`
  )
    .bind(name, privacy, userId)
    .run();
  if (!info.success) {
    return new Response('ERROR', { status: 500 });
  }

  const values = await c.env.DB.prepare(
    `SELECT * FROM lists WHERE name = ?1 AND user_id = ?2 LIMIT 1`
  )
    .bind(name, userId)
    .first();

  return c.json(values, { status: 201 });
})

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
})

/**
 * Edit list.
 */
app.put('/users/:userId/lists/:listId', async c => {
  return new Response('Not Implemented', { status: 501 });
})

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
  if (info.success) {
    return new Response('OK', { status: 200 });
  }
  return new Response('ERROR', { status: 500 });
})

/**
 * Create note.
 */
app.post('/users/:userId/lists/:listId/notes', async c => {
  const { userId, listId } = c.req.param();
  const { title, content, privacy } = await c.req.json();

  const info = await c.env.DB.prepare(
    `INSERT INTO notes (title, content, privacy, user_id, list_id) VALUES(?1,?2,?3,?4,?5)`
  )
    .bind(title, content, privacy, userId, listId)
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
})

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
})

/**
 * Edit note.
 */
app.put('/users/:userId/lists/:listId/items/:itemId', async c => {
  return new Response('Not Implemented', { status: 501 });
})

/**
 * Delete note.
 */
app.delete('/users/:userId/lists/:listId/notes/:noteId', async c => {
  const { listId, noteId } = c.req.param();

  const info = await c.env.DB.prepare(
    `DELETE FROM notes WHERE id = ?1 AND list_id = ?2`
  )
    .bind(noteId, listId)
    .run();
  if (info.success) {
    return new Response('OK', { status: 200 });
  }
  return new Response('ERROR', { status: 500 });
})

/**
 * Create task.
 */
app.post('/users/:userId/tasks', async c => {
  const { userId } = c.req.param();
  const { title, content, start_time, privacy, status } = await c.req.json();

  const info = await c.env.DB.prepare(
    `INSERT INTO tasks (title, content, start_time, privacy, status, user_id) VALUES(?1,?2,?3,?4,?5,?6)`
  )
    .bind(title, content, start_time, privacy, status, userId)
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
})

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
})

/**
 * Delete task.
 */
app.delete('/users/:userId/tasks/:taskId', async c => {
  const { userId, taskId } = c.req.param();

  const info = await c.env.DB.prepare(
    `DELETE FROM tasks WHERE id = ?1 AND user_id = ?2`
  )
    .bind(taskId, userId)
    .run();
  if (info.success) {
    return new Response('OK', { status: 200 });
  }
  return new Response('ERROR', { status: 500 });
})

app.all('*', () => new Response('Not Found', { status: 404 }))

export default app
