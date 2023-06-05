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

app.post('/lists', async c => {
  const { name } = await c.req.json();

  const info = await c.env.DB.prepare(`INSERT INTO lists (name) VALUES(?)`)
    .bind(name)
    .run();
  if (!info.success) {
    return new Response('ERROR', { status: 500 });
  }

  const values = await c.env.DB.prepare(
    `SELECT id FROM lists WHERE name = ? LIMIT 1`
  )
    .bind(name)
    .first();

  return c.json(values, { status: 201 });
})

app.get('/lists/:listId', async c => {
  const { listId } = c.req.param();

  const values = await c.env.DB.prepare(
    `SELECT id FROM lists WHERE id = ? LIMIT 1`
  )
    .bind(listId)
    .first();

  return c.json(values)
})

app.put('/lists/:listId', async c => {
  return new Response('Not Implemented', { status: 501 });
})

app.delete('/lists/:listId', async c => {
  const { listId } = c.req.param();

  const info = await c.env.DB.prepare(`DELETE FROM lists WHERE id = ?`)
    .bind(listId)
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

app.all('*', () => new Response('Unauthorized', { status: 401 }))

export default app
