import { Context } from 'hono';

export async function createHandler(c: Context): Promise<Response> {
  const { userId } = c.req.param();
  const { name, privacy } = await c.req.json();

  const rowCount = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM lists WHERE name = ?1 AND user_id = ?2`,
  )
    .bind(name, userId)
    .first('count');
  if (rowCount != null && rowCount != 0) {
    return c.json({ error: 'List already exists' }, 409);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO lists (name, privacy, user_id) VALUES(?1,?2,?3)`,
  )
    .bind(name, privacy, userId)
    .run();
  if (!result.success) {
    return c.json({ error: 'Unkown database error' }, 500);
  }

  const row = await c.env.DB.prepare(
    `SELECT * FROM lists WHERE name = ?1 AND user_id = ?2 LIMIT 1`,
  )
    .bind(name, userId)
    .first();
  return c.json(row, 201);
}

export async function getAllHandler(c: Context): Promise<Response> {
  const { userId } = c.req.param();

  const rows = await c.env.DB.prepare(`SELECT * FROM lists WHERE user_id = ?1`)
    .bind(userId)
    .all();
  return c.json(rows.results);
}

export async function editHandler(c: Context): Promise<Response> {
  const { userId, listId } = c.req.param();
  const { name, privacy } = await c.req.json();

  const result = await c.env.DB.prepare(
    `UPDATE lists SET name = ?1, privacy = ?2 WHERE id = ?3 AND user_id = ?4`,
  )
    .bind(name, privacy, listId, userId)
    .run();
  if (!result.success) {
    return c.json({ error: 'Unkown database error' }, 500);
  }
  if (result.meta.rows_written == 0) {
    return c.json({ error: 'List not found' }, 404);
  }
  return c.text('OK', 200);
}

export async function deleteHandler(c: Context): Promise<Response> {
  const { listId, userId } = c.req.param();

  const result = await c.env.DB.prepare(
    `DELETE FROM lists WHERE id = ?1 AND user_id = ?2`,
  )
    .bind(listId, userId)
    .run();
  if (!result.success) {
    return c.json({ error: 'Unkown database error' }, 500);
  }
  if (result.meta.rows_written == 0) {
    return c.json({ error: 'List not found' }, 404);
  }
  return c.text('OK', 200);
}
