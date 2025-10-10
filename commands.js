import 'dotenv/config';
import { capitalize, InstallGlobalCommands, getUserChoices } from './utils.js';

const userChoices = await getUserChoices(); // on charge les pseudos ici


// Simple test command
/**
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
 */

const PERDU = {
  name: 'perdu',
  description: 'À essayer durant une heure miroir',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const LEADERBOARD = {
  name: 'leaderboard',
  description: 'Affiche les membres en tête du classement',
  options: [
    {
      type: 6, // USER → Discord affiche automatiquement les membres du serveur
      name: 'user',
      description: 'Choisis un utilisateur pour voir son score',
      required: false,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};


const SUGGESTION = {
  name: 'suggestion',
  description: 'Permet d\'ajouter des messages à Titi.exe',
  type: 1,
  options: [
    {
      type: 3,
      name: 'type',
      description: 'choisis le type de message à ajouter',
      required: true,
      choices: [
        { name: 'insultes', value: 'insultes' },
        { name: 'positivitee', value: 'positivitee' },
        { name: 'citations', value: 'citations' },
      ],
    },
    {
      type: 3,
      name: 'message',
      description: 'contenu du message',
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};


const SETSCORE_COMMAND = {
  name: 'setscore',
  description: 'Modifie le score d’un utilisateur (réservé au développeur)',
  type: 1,
  options: [
    {
      name: 'user',
      description: 'Utilisateur à modifier',
      type: 6, // USER → menu Discord natif
      required: true,
    },
    {
      name: 'value',
      description: 'Nouveau score',
      type: 4, // INTEGER
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}; 

// Command containing options
/**
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};
 */

const ALL_COMMANDS = [PERDU, LEADERBOARD, SETSCORE_COMMAND, SUGGESTION];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
