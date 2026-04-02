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
    if (type === 'violences') return 'Ça ne me blesse pas';
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

// --- DÉBUT GÉNÉRATEUR ZALGO ---
const zalgoUp = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0351', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346', '\u031a'];
const zalgoDown = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u0323'];
const zalgoMid = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334', '\u0335', '\u0336', '\u034f', '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362', '\u0338', '\u0337', '\u0361', '\u0489'];

function isLetter(char) {
    return /[a-zA-ZÀ-ÿ]/.test(char);
}

export function toZalgo(text) {
    // Sépare le texte par les mentions Discord pour ne pas les corrompre (<@id>, <:emoji:id>, etc)
    const parts = text.split(/(<[^>]+>)/g);
    let result = '';

    for (const part of parts) {
        if (part.startsWith('<') && part.endsWith('>')) {
            result += part; // Ne pas toucher aux mentions/emojis
        } else {
            for (const char of part) {
                if (isLetter(char)) {
                    result += char;
                    // Ajoute un peu de chaos autour de la lettre
                    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) result += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
                    for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) result += zalgoMid[Math.floor(Math.random() * zalgoMid.length)];
                    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) result += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
                } else {
                    result += char;
                }
            }
        }
    }
    return result;
}

export async function cursedTiti() {
    // Récupère une phrase positive et la corrompt
    const baseMsg = await happyTiti();
    return toZalgo(baseMsg);
}
// --- FIN GÉNÉRATEUR ZALGO ---

DiscordRequest