// Exemple d'exécution d'une requête SQL brute dans un script temporaire
import { dbPromise } from './database.js';

async function runSqlUpdate() {
  const db = await dbPromise;

  const sql = `
    UPDATE messages
    SET content = 'et ' || content
    WHERE content GLOB '[tT]*';
  `;
  
  const result = await db.run(sql);
  
  console.log(`✅ ${result.changes} messages mis à jour.`);
}

runSqlUpdate();