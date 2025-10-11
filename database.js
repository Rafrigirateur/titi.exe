// database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Ouvre une seule connexion à la BDD (singleton)
export const dbPromise = open({
  filename: './perdu.db',
  driver: sqlite3.Database,
});

// Initialise la table si elle n’existe pas
export async function initDB() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      user_id TEXT PRIMARY KEY,
      score INTEGER DEFAULT 0
    );
  `);
  // ✅ Nouvelle table pour le logging des scores
  await db.exec(`
    CREATE TABLE IF NOT EXISTS score_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      old_score INTEGER NOT NULL,
      new_score INTEGER NOT NULL,
      change_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Base de données initialisée");
}

// Fonction utilitaire pour logger le changement de score
async function logScoreChange(userId, oldScore, newScore) {
  const db = await dbPromise;
  await db.run(
    'INSERT INTO score_logs (user_id, old_score, new_score) VALUES (?, ?, ?)',
    [userId, oldScore, newScore]
  );
}

// Ajoute ou incrémente le score d’un utilisateur
export async function incrementScore(userId) {
  const db = await dbPromise;
  const existing = await db.get('SELECT score FROM scores WHERE user_id = ?', userId);
  
  const oldScore = existing ? existing.score : 0;
  const newScore = oldScore + 1;

  if (existing) {
    await db.run('UPDATE scores SET score = score + 1 WHERE user_id = ?', userId);
  } else {
    await db.run('INSERT INTO scores (user_id, score) VALUES (?, 1)', userId);
  }
  
  // 📝 Log du changement de score
  await logScoreChange(userId, oldScore, newScore);

  return newScore;
}

// Récupère le score d’un utilisateur
export async function getScore(userId) {
  const db = await dbPromise;
  const result = await db.get('SELECT score FROM scores WHERE user_id = ?', userId);
  return result ? result.score : 0;
}

// Définit un score manuellement (et crée l’utilisateur si besoin)
export async function setScore(userId, newScore) {
  const db = await dbPromise;
  
  // Récupère l'ancien score pour le log
  const existing = await db.get('SELECT score FROM scores WHERE user_id = ?', userId);
  const oldScore = existing ? existing.score : 0;
  const finalNewScore = newScore; // Le score défini est le nouveau score

  await db.run(
    `INSERT INTO scores (user_id, score)
     VALUES (?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET score = excluded.score`,
    [userId, finalNewScore]
  );
  
  // 📝 Log du changement de score
  await logScoreChange(userId, oldScore, finalNewScore);
}

// Récupère tous les utilisateurs
export async function getAllUsers() {
  const db = await dbPromise;
  const rows = await db.all('SELECT user_id, score FROM scores ORDER BY score DESC');
  return rows;
}

// Retourne le top des joueurs classés par score
export async function getLeaderboard(limit = 10) {
  const db = await dbPromise;
  const rows = await db.all('SELECT user_id, score FROM scores ORDER BY score DESC LIMIT ?', limit);
  return rows;
}

// Retourne le top des joueurs classés par score
export async function getMessages(limit = 10) {
  const db = await dbPromise;
  const rows = await db.all('SELECT user_id, score FROM scores ORDER BY score DESC LIMIT ?', limit);
  return rows;
}


// database.js
export async function addMessage(userId, type, message) {
  const db = await dbPromise;

  // assure la table existe (au moins avec un id)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT
    );
  `);

  // récupère les colonnes existantes
  const cols = await db.all("PRAGMA table_info(messages)");
  const names = cols.map(c => c.name);

  // ajoute les colonnes manquantes si besoin
  if (!names.includes('author_id')) {
    try { await db.run("ALTER TABLE messages ADD COLUMN author_id TEXT"); } catch(e){ /* ignore */ }
  }
  if (!names.includes('type')) {
    try { await db.run("ALTER TABLE messages ADD COLUMN type TEXT"); } catch(e){ /* ignore */ }
  }
  if (!names.includes('content') && !names.includes('message')) {
    try { await db.run("ALTER TABLE messages ADD COLUMN content TEXT"); } catch(e){ /* ignore */ }
  }

  // recalcul (au cas où on a créé des colonnes)
  const cols2 = await db.all("PRAGMA table_info(messages)");
  const names2 = cols2.map(c => c.name);

  const contentCol = names2.includes('content') ? 'content' : (names2.includes('message') ? 'message' : 'content');
  const authorCol = names2.includes('author_id') ? 'author_id' : (names2.includes('user_id') ? 'user_id' : 'author_id');

  // insert
  const sql = `INSERT INTO messages (${authorCol}, type, ${contentCol}) VALUES (?, ?, ?)`;
  await db.run(sql, [userId, type, message]);

  return true;
}


// 🔍 Récupère tous les messages d’un type donné
export async function getMessagesByType(type) {
  const db = await dbPromise;
  const rows = await db.all(`SELECT content FROM messages WHERE type = ?`, [type]);
  return rows.map(r => r.content);
}

// 🔍 Récupère tous les logs de score
export async function getScoreLogs(limit = 100) {
  const db = await dbPromise;
  // Sélectionne les logs et les trie du plus récent au plus ancien
  const rows = await db.all(
    'SELECT user_id, old_score, new_score, change_time FROM score_logs ORDER BY change_time DESC LIMIT ?', 
    limit
  );
  return rows;
}