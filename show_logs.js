import { initDB, getScoreLogs } from './database.js';

async function main() {
  await initDB(); // Assure que la base de données est ouverte et prête

  console.log("⏳ Récupération de tous les logs de score...");
  
  // Récupère les logs (vous pouvez augmenter la limite si besoin)
  const logs = await getScoreLogs(1000); 

  if (logs.length === 0) {
    console.log("Pas encore de logs de score.");
    return;
  }

  // Prépare les données pour un affichage plus lisible
  const dataForTable = logs.map(log => {
    // Formatte la date pour une meilleure lisibilité dans la console
    const date = new Date(log.change_time).toLocaleString('fr-FR');
    
    // Retours les colonnes que nous voulons afficher
    return {
      Utilisateur: log.user_id, // L'ID Discord est souvent long mais peut être utile
      AncienScore: log.old_score,
      NouveauScore: log.new_score,
      Moment: date
    };
  });

  // 🪄 C'est là que la magie opère : console.table()
  console.log(`\n🏆 Historique des changements de score (${logs.length} entrées) :`);
  console.table(dataForTable);
}

main().catch(console.error);