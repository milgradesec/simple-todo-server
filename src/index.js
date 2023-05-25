import { Router } from 'itty-router'
import { json, error, StatusError } from 'itty-router-extras'

const router = Router();

router.get('/', () => {
  return new Response('Serverless Todo API v1', { status: 200 });
});

router.post("/register", async request => {
  return new Response('Not Implemented', { status: 501 });
})

router.post("/login", async request => {
  if (request.headers.get("Content-Type") != "application/json") {
    return new Response('Bad Request', { status: 400 })
  }

  const { username, password } = await request.json();
  if (username === "admin@paesa.es" && password === "YTmFbcy94V3CFsGM") {
    const responseBody = { message: "OK", userId: 1432, token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  else {
    return new Response("Invalid Authentication", { status: 401 });
  }
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

export default {
  fetch: (req, env, ctx) => router
    .handle(req, env, ctx)
    .catch(error)
}
