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
  const response = { message: "OK", userId: values.id, token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
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
    const response = { message: "OK", userId: values.id, token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
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
  return c.json({ message: "OK", listId: values.id });

})

app.put('/lists/:id', async c => {
  return new Response('OK', { status: 200 });
})

app.delete('/lists/:id', async c => {
  const { id } = c.req.param();

  const info = await c.env.DB.prepare(`DELETE FROM lists WHERE id = ?`)
    .bind(id)
    .run();
  if (info.success) {
    return new Response('OK', { status: 200 });
  }
  return new Response('ERROR', { status: 500 });
})

app.post('/lists/:id/items', async c => {
  const responseBody = { message: "OK", itemId: 14 }

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  })
})

app.put('/lists/:id/items/:itemId', async c => {
  return new Response('OK', { status: 200 });
})

app.all('*', () => new Response('Unauthorized', { status: 401 }))

export default app
