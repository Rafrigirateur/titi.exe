import 'dotenv/config';
import { getAllUsers } from './database.js';

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getRandomMessage(type) {
  const db = await import('./database.js');
  const messages = await db.getMessagesByType(type);
  if (!messages || messages.length === 0) { //Si pas de message en base, message par défaut
    if (type === 'insultes') return ' sale bolos';
    if (type === 'positivitee' || type === 'positivitée') return 'Ouiii'; // ✅ accepte les deux écritures
    if (type === 'citations') return 'Tu ne trouveras jamais l\'amour';
    return 'Message inconnu';
  }


  const randomIndex = Math.floor(Math.random() * messages.length);
  if(messages[randomIndex].substr(0, 1)==' ' || messages[randomIndex].substr(0, 1)==',' ) {
    return messages[randomIndex]; 
  } else {
    return " " + messages[randomIndex];
  }
}

export async function ragebaitTiti() {
  return await getRandomMessage('insultes');
}

export async function happyTiti() {
  return await getRandomMessage('positivitee');
}

export async function randomTiti() {
  return await getRandomMessage('citations');
}

export async function hurtTiti() {
  return await getRandomMessage('violences');
}


// Fonction pour générer la liste de choix des pseudos (pour les menus déroulants)
export async function getUserChoices() {
  const users = await getAllUsers();

  // Discord limite à 25 options max par menu déroulant
  const limited = users.slice(0, 25);

  // Formater pour les options de commande
  const choices = limited.map((user) => ({
    name: `User ${user.user_id}`, // sera remplacé par le vrai pseudo au besoin
    value: user.user_id,
  }));

  return choices;
}

export async function getDiscordUser(userId) {
  const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.username;
}

export async function getMessagesByType(type) {
  const db = await dbPromise;
  const rows = await db.all(`SELECT content FROM messages WHERE type = ?`, [type]);
  return rows.map(r => r.content);
}



DiscordRequest