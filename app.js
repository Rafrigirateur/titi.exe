import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
  
} from 'discord-interactions';
import { DiscordRequest, ragebaitTiti, happyTiti } from './utils.js';
import { initDB, incrementScore, setScore, getLeaderboard, addMessage, getScore } from './database.js';

// Create an express app
const app = express();
// Get port, or default to 7778
const PORT = process.env.PORT || 7778;
// To keep track of our active games
const lastPerduTimes = {};

initDB();

function normalizeType(type) {
  const mapping = {
    'positivitee': 'positivitee',
    'positivitée': 'positivitee',
    'insultes': 'insultes',
    'citations': 'citations',
    'citation': 'citations'
  };
  return mapping[type] || type;
}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    /**
     * PERDU
     */
    if (name === 'perdu') {
      var now = new Date();
      var heure = now.getHours();
      var minute = now.getMinutes();
      var minute_txt = String(now.getMinutes()).padStart(2, '0');

      // Si la commande est utilisée dans un serveur (guild)
      const userId = req.body.member?.user?.id;

      // Si la commande est utilisée dans un DM
      const dmUserId = req.body.user?.id;

      // Pour être sûr d’avoir l’ID dans les deux cas :
      const authorId = userId || dmUserId;

      const timeKey = `${heure}:${minute}`; // ex: '12:12'
      const lastKey = lastPerduTimes[authorId];

      
      if (heure == minute){ //faire en sorte d'éviter de pouvoir spamm
        if (lastKey === timeKey) {
            // L'utilisateur a déjà réclamé son point pendant cette minute
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.EPHEMERAL, // Réponse visible uniquement par l'utilisateur
                    content: `Tu as déjà perdu à **${timeKey}** ! Attends la prochaine heure miroir 😁`,
                },
            });
        }
        const score = await incrementScore(authorId);
        lastPerduTimes[authorId] = timeKey; 
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `${String(heure)}h${String(minute_txt)} ${await happyTiti()} !!! t'as perdu ${await getScore(authorId)} fois 😁` //Ajouter le nombre de fois ou qlq a perdu
            }
          ]
        },
      });

      } else {
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `Il est ${String(heure)}h${String(minute_txt)} <@${userId}>${await ragebaitTiti()} 😁` //Créer la fonction !!!
            }
          ]
        },
      });
      }
    }

    //Commande Kys

    /**
     * LEADERBOARD
     */
    if (name === 'leaderboard') {
      const leaderboard = await getLeaderboard();

      // Si un utilisateur a été sélectionné
      const userOption = data.options?.find(o => o.name === 'user');
      if (userOption) {
        const userId = userOption.value;
        const userScore = leaderboard.find(u => u.user_id === userId);

        if (!userScore) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `L'utilisateur <@${userId}> n'a pas encore de score.`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `**${userScore.score}** points pour <@${userId}> 🏅`,
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      // Sinon → afficher le classement complet
      if (leaderboard.length === 0) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "🏆 Personne n’a encore de score ! Utilisez `/perdu` pour commencer 😁",
          },
        });
      }

      const formatted = leaderboard
        .map((row, index) => {
          const rank = index + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
          return `${medal} <@${row.user_id}> — **${row.score}** points`;
        })
        .join('\n');

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: 'Classement des meilleurs joueurs',
              description: formatted,
              color: 0x7289da,
            },
          ],
        },
      });
    }


    /**
     * SETSCORE
     */
    if (name === 'setscore') {
      const authorId = req.body.member?.user?.id || req.body.user?.id;
      const DEV_ID = '519556904452751392'; // ton ID Discord

      // 🔒 Vérifie si c’est bien toi
      if (authorId !== DEV_ID) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Commande réservée à Rafthon",
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      // ✅ Récupération des paramètres
      const userId = data.options.find(o => o.name === 'user').value;
      const newScore = data.options.find(o => o.name === 'value').value;

      // 🔍 Vérifie si l'utilisateur existe déjà
      const leaderboard = await getLeaderboard();
      const existingUser = leaderboard.find(u => u.user_id === userId);

      if (!existingUser) {
        // 👶 S’il n’existe pas, on le crée avec un score initial
        await setScore(userId, newScore);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `✅ Nouvel utilisateur ajouté : <@${userId}> avec **${newScore}** points.`,
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      } else {
        // 🔁 Sinon, on met simplement à jour son score
        await setScore(userId, newScore);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `✏️ Score de <@${userId}> mis à jour à **${newScore}** points.`,
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
    }

    /**
     * SUGGESTION
     */
    if (name === 'suggestion') {
      const userId = req.body.member?.user?.id || req.body.user?.id;
      const now = new Date();
      const heure = now.getHours();
      const minute = String(now.getMinutes()).padStart(2, '0');

      const typeOptionRaw = data.options.find(o => o.name === 'type')?.value || 'autre';
      const messageOption = data.options.find(o => o.name === 'message')?.value || '';

      const MAX_MESSAGE_FOR_ID = 60; 

      if (messageOption.length > MAX_MESSAGE_FOR_ID) {
          return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                  content: "⚠️ Le message est trop long pour la confirmation par bouton. Veuillez le raccourcir.",
                  flags: InteractionResponseFlags.EPHEMERAL,
              },
          });
      }


      // Normaliser le type avant de l'utiliser
      const typeOption = normalizeType(typeOptionRaw);

      const encoded = encodeURIComponent(messageOption);
      const confirmId = `confirm_suggestion_${typeOption}_${encoded}`;
      const cancelId = `cancel_suggestion`;

      if(typeOption ==='insultes') {
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL, // 👈 message visible uniquement par l'utilisateur
          content: `Il est ${heure}h${minute} <@${userId}> ${messageOption} 😁\nÊtes-vous sûr de vouloir ajouter ce message ?\n`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'OUI',
                  style: 3, // vert
                  custom_id: confirmId,
                },
                {
                  type: 2,
                  label: 'ANNULER',
                  style: 4, // rouge
                  custom_id: cancelId,
                },
              ],
            },
          ],
        },
      });
      } 
      if(typeOption === 'positivitee') {
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL, // 👈 message visible uniquement par l'utilisateur
          content: `${String(heure)}h${String(minute)} ${messageOption} 😁\nÊtes-vous sûr de vouloir ajouter ce message ?\n`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'OUI',
                  style: 3, // vert
                  custom_id: confirmId,
                },
                {
                  type: 2,
                  label: 'ANNULER',
                  style: 4, // rouge
                  custom_id: cancelId,
                },
              ],
            },
          ],
        },
      });
      }
      if(typeOption === 'citations') {
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL, // 👈 message visible uniquement par l'utilisateur
          content: `${messageOption} 😁\nConfirmer ?`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'OUI',
                  style: 3, // vert
                  custom_id: confirmId,
                },
                {
                  type: 2,
                  label: 'ANNULER',
                  style: 4, // rouge
                  custom_id: cancelId,
                },
              ],
            },
          ],
        },
      });
      }
      
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  /**
   * Gestion des boutons
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const custom_id = data?.custom_id || '';
    const userId = req.body.member?.user?.id || req.body.user?.id;

    // confirm_suggestion_<type>_<encodedMessage>
    if (custom_id.startsWith('confirm_suggestion_')) {
      const payload = custom_id.slice('confirm_suggestion_'.length);
      const sepIndex = payload.indexOf('_');
      if (sepIndex === -1) {
        return res.sendStatus(400);
      }

      let typeOption = payload.slice(0, sepIndex);
      typeOption = normalizeType(typeOption); // Ajoutez cette ligne
      const encoded = payload.slice(sepIndex + 1);
      const message = decodeURIComponent(encoded);

      await addMessage(userId, typeOption, message);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Message ajouté à la catégorie **${typeOption}** ! Merci <@${userId}> 😄`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    // cancel (annulation)
    if (custom_id === 'cancel_suggestion' || custom_id.startsWith('cancel_suggestion_')) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Suggestion annulée.',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    // si d'autres boutons, gérer ici...
  }


  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
