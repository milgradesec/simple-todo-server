import { Hono } from 'hono'

const app = new Hono()

app.get('/', async c => {
  return c.text('Serverless Todo API v1', { status: 200 });
});

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
  const response = { id: values.id, token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
  return c.json(response)
})

app.post("/login", async c => {
  const { username, password } = await c.req.json();

  const values = await c.env.DB.prepare(
    `SELECT id,password FROM users WHERE username = ? LIMIT 1`
  )
    .bind(username)
    .first();
  if (values.password == password) {
    const response = { id: values.id, token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
    return c.json(response)
  }
  return c.text("Invalid Authentication", { status: 401 });
})

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
    `SELECT * FROM lists WHERE name = ?1 AND user_id = ?2`
  )
    .bind(name, userId)
    .first();

  return c.json(values, { status: 201 });
})

app.get('/users/:userId/lists', async c => {
  const { userId } = c.req.param();

  const values = await c.env.DB.prepare(
    `SELECT * FROM lists WHERE user_id = ?1`
  )
    .bind(userId)
    .all();

  return c.json(values.results)
})

app.put('/users/:userId/lists/:listId', async c => {
  return new Response('Not Implemented', { status: 501 });
})

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

app.post('/lists/:listId/items', async c => {
  // const responseBody = { id: 14 }

  // return c.json(responseBody);
  return new Response('Not Implemented', { status: 501 });
})

app.put('/lists/:listId/items/:itemId', async c => {
  return new Response('Not Implemented', { status: 501 });
})

app.all('*', () => new Response('Not Found', { status: 404 }))

export default app
