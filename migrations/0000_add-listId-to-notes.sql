-- Migration number: 0000 	 2023-09-10T20:35:38.231Z
CREATE TABLE IF NOT EXISTS temp_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    list_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(list_id) REFERENCES lists(id)
);
INSERT INTO temp_notes (id, title, content, status, user_id)
SELECT *
FROM notes;
DROP TABLE notes;
ALTER TABLE temp_notes
    RENAME TO notes;
COMMIT;