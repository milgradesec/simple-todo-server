DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS lists;
DROP TABLE IF EXISTS notes;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
-- CREATE TABLE IF NOT EXISTS auth_tokens(
--     token TEXT NOT NULL,
--     user_id INTEGER NOT NULL,
--     FOREIGN KEY(user_id) REFERENCES users(id)
-- );
CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    privacy INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    privacy INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    day DATE NOT NULL DEFAULT (strftime('%Y-%m-%d', 'now')),
    start_time DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M', 'now')),
    privacy INTEGER DEFAULT 1,
    status TEXT DEFAULT 'SCHEDULED',
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);