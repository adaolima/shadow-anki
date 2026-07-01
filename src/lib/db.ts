import * as SQLite from 'expo-sqlite';

import { sm2Review } from './scheduler';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export type CardItem = {
  id: number;
  youtubeId: string;
  sourceUrl: string;
  title: string;
  segmentStart: number;
  segmentEnd: number;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  lastPracticedAt: string | null;
};

export type CreateCardInput = {
  youtubeId: string;
  sourceUrl: string;
  title: string;
  segmentStart: number;
  segmentEnd: number;
};

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('shadowanki.db');
  }

  return dbPromise;
}

function mapCard(row: any): CardItem {
  return {
    id: Number(row.id),
    youtubeId: String(row.youtube_id),
    sourceUrl: String(row.source_url),
    title: String(row.title),
    segmentStart: Number(row.segment_start),
    segmentEnd: Number(row.segment_end),
    repetitions: Number(row.repetitions),
    intervalDays: Number(row.interval_days),
    easeFactor: Number(row.ease_factor),
    dueAt: String(row.due_at),
    lastPracticedAt: row.last_practiced_at ? String(row.last_practiced_at) : null,
  };
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      youtube_id TEXT NOT NULL,
      source_url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      segment_start INTEGER NOT NULL DEFAULT 0,
      segment_end INTEGER NOT NULL DEFAULT 30,
      repetitions INTEGER NOT NULL DEFAULT 0,
      interval_days INTEGER NOT NULL DEFAULT 1,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      due_at TEXT NOT NULL,
      last_practiced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export async function createCard(input: CreateCardInput) {
  await initDb();
  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `
      INSERT OR REPLACE INTO cards (
        youtube_id,
        source_url,
        title,
        segment_start,
        segment_end,
        repetitions,
        interval_days,
        ease_factor,
        due_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, 1, 2.5, ?, ?, ?)
    `,
    input.youtubeId,
    input.sourceUrl,
    input.title,
    input.segmentStart,
    input.segmentEnd,
    now,
    now,
    now,
  );
}

export async function listCards(): Promise<CardItem[]> {
  await initDb();
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM cards ORDER BY datetime(due_at) ASC, datetime(updated_at) DESC`,
  );
  return rows.map(mapCard);
}

export async function getCardById(id: number): Promise<CardItem | null> {
  await initDb();
  const db = await getDb();
  const row = await db.getFirstAsync<any>(`SELECT * FROM cards WHERE id = ?`, id);
  return row ? mapCard(row) : null;
}

export async function reviewCard(card: CardItem, quality: number) {
  await initDb();
  const db = await getDb();
  const now = new Date().toISOString();

  const next = sm2Review(
    {
      repetitions: card.repetitions,
      intervalDays: card.intervalDays,
      easeFactor: card.easeFactor,
    },
    quality,
  );

  await db.runAsync(
    `
      UPDATE cards
      SET repetitions = ?,
          interval_days = ?,
          ease_factor = ?,
          due_at = ?,
          last_practiced_at = ?,
          updated_at = ?
      WHERE id = ?
    `,
    next.repetitions,
    next.intervalDays,
    next.easeFactor,
    next.dueAt,
    now,
    now,
    card.id,
  );
}
