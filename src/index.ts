import { Hono } from 'hono';
import * as Account from './api/account';
import * as Lists from './api/lists';
import * as Notes from './api/notes';
import * as Tasks from './api/tasks';
import { BearerAuthentication } from './auth';

type Bindings = {
    DB: D1Database
}

const TOKEN = "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async c => {
    return c.text('Serverless Todo API v1', 200);
});

/**
 * Register user.
 */
app.post("/register", async (c) => {
    return Account.registerHandler(c);
});

/**
 * Login.
 */
app.post("/login", async (c) => {
    return Account.loginHandler(c);
});

/**
 * Authentication middleware.
 */
app.use("/users/*", BearerAuthentication({ token: TOKEN }));

/**
 * Change password.
 */
app.post("/users/:userId/account/changePassword", async (c) => {
    return Account.changePasswordHandler(c);
});

/**
 * Create list.
 */
app.post("/users/:userId/lists", async (c) => {
    return Lists.createHandler(c);
});

/**
 * Get all lists.
 */
app.get('/users/:userId/lists', async (c) => {
    return Lists.getAllHandler(c);
});

/**
 * Edit list.
 */
app.put('/users/:userId/lists/:listId', async (c) => {
    return Lists.editHandler(c);
});

/**
 * Delete list.
 */
app.delete('/users/:userId/lists/:listId', async (c) => {
    return Lists.deleteHandler(c);
});

/**
 * Create note.
 */
app.post('/users/:userId/lists/:listId/notes', async c => {
    return Notes.createHandler(c);
});

/**
 * Get all notes.
 */
app.get('/users/:userId/notes', async (c) => {
    return Notes.getAllHandler(c);
});

/**
 * Edit note.
 */
app.put('/users/:userId/lists/:listId/notes/:noteId', async (c) => {
    return Notes.editHandler(c);
});

/**
 * Delete note.
 */
app.delete('/users/:userId/lists/:listId/notes/:noteId', async (c) => {
    return Notes.deleteHandler(c);
});

/**
 * Create task.
 */
app.post('/users/:userId/tasks', async (c) => {
    return Tasks.createHandler(c);
});

/**
 * Get all tasks.
 */
app.get('/users/:userId/tasks', async (c) => {
    return Tasks.getAllHandler(c);
});

/**
 * Edit task.
 */
app.put("/users/:userId/tasks/:taskId", async (c) => {
    return Tasks.editHandler(c);
});

/**
 * Delete task.
 */
app.delete("/users/:userId/tasks/:taskId", async (c) => {
    return Tasks.deleteHandler(c);
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