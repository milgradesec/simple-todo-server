import { Hono } from 'hono'

const router = new Hono()

router.get('/', async c => {
  return c.text('Serverless Todo API v1', { status: 200 });
});

router.post("/register", async c => {
  const { username, password } = await c.req.json();

  const count = await c.env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE username = ?")
    .bind(username)
    .first();
  if (count.count > 0) {
    return c.text("User already exists", { status: 403 });
  }

  const info = await c.env.DB.prepare(`INSERT INTO users (username, password) VALUES (?1,?2)`)
    .bind(username, password)
    .run();
  if (!info.success) {
    return c.text("Internal Server Error", { status: 500 });
  }

  const values = await c.env.DB.prepare(`SELECT id FROM users WHERE username = ? LIMIT 1`)
    .bind(username)
    .first();
  const response = { message: "OK", userId: values.id, token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
  return c.json(response)
})

router.post("/login", async c => {
  // if (request.headers.get("Content-Type") != "application/json") {
  //   return new Response('Bad Request', { status: 400 })
  // }

  const { username, password } = await c.req.json();
  const values = await c.env.DB.prepare(`SELECT id,password FROM users WHERE username = ? LIMIT 1`)
    .bind(username)
    .first();
  if (values.password == password) {
    const response = { message: "OK", userId: values.id, token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
    return c.json(response)
  }

  return c.text("Invalid Authentication", { status: 401 });
})

router.post('/lists', async request => {
  const responseBody = { message: "OK", listId: 23 }

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  })
})

router.put('/lists/:id', async request => {
  return new Response('OK', { status: 200 });
})

router.delete('/lists/:id', async request => {
  return new Response('OK', { status: 200 });
})

router.post('/lists/:id/items', async request => {
  const responseBody = { message: "OK", itemId: 14 }

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  })
})

router.put('/lists/:id/items/:itemId', async request => {
  return new Response('OK', { status: 200 });
})

router.all('*', () => new Response('Unauthorized ', { status: 401 }))

export default router
