DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS lists;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
INSERT INTO users (username, password)
VALUES ('admin@paesa.es', 'YTmFbcy94V3CFsGM');
INSERT INTO lists(name, user_id)
VALUES ('Compra', 1);