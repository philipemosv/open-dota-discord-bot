import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bot.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    steam_id TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface User {
  discord_id: string;
  steam_id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export function findUserByDiscordId(discordId: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE discord_id = ?');
  return stmt.get(discordId) as User | undefined;
}

export function upsertUser(
  discordId: string,
  steamId: string,
  username: string,
): void {
  const stmt = db.prepare(`
    INSERT INTO users (discord_id, steam_id, username, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(discord_id) DO UPDATE SET
      steam_id = excluded.steam_id,
      username = excluded.username,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(discordId, steamId, username);
}

export default db;
