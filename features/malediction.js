// features/malediction.js
import { randomTiti } from '../utils.js';

class MaledictionManager {
    constructor() {
        this.isActive = false;
        this.allowedChannels = []; // Rempli via le dashboard web
        this.cursedUsers = new Map(); // Stocke : userId -> timeoutId
    }

    // Fonction appelée par le dashboard
    updateConfig(isActive, channels) {
        this.isActive = isActive;
        this.allowedChannels = channels;
        console.log(`[Malédiction] Statut: ${this.isActive ? 'ALLUMÉ' : 'ÉTEINT'}, Salons: ${this.allowedChannels.length}`);
        
        // Si on éteint, on coupe tous les timers en cours
        if (!this.isActive) this.clearAllCurses();
    }

    // Fonction appelée par la commande Discord /malediction
    toggleCurseOnUser(userId, client) {
        if (this.cursedUsers.has(userId)) {
            // L'utilisateur est déjà maudit, on le libère
            clearTimeout(this.cursedUsers.get(userId));
            this.cursedUsers.delete(userId);
            return false; // Indique qu'il n'est plus maudit
        } else {
            // On le maudit
            this.scheduleNextPing(userId, client);
            return true; // Indique qu'il est maudit
        }
    }

    async scheduleNextPing(userId, client) {
        if (!this.isActive || this.allowedChannels.length === 0) return;

        // Délai aléatoire (ex: entre 30 min et 2 heures)
        const minDelay = 30 * 60 * 1000;
        const maxDelay = 120 * 60 * 1000;
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        const timeoutId = setTimeout(async () => {
            try {
                // Choisit un salon aléatoire parmi ceux autorisés
                const channelId = this.allowedChannels[Math.floor(Math.random() * this.allowedChannels.length)];
                const channel = await client.channels.fetch(channelId);

                if (channel && channel.isTextBased()) {
                    const message = await randomTiti();
                    await channel.send(`<@${userId}> ${message}`);
                }
            } catch (error) {
                console.error("[Malédiction] Erreur de ping :", error);
            }

            // On relance la boucle pour ce joueur
            this.scheduleNextPing(userId, client);
        }, delay);

        // On sauvegarde le timeout pour pouvoir l'annuler si besoin
        this.cursedUsers.set(userId, timeoutId);
    }

    clearAllCurses() {
        for (let timeoutId of this.cursedUsers.values()) {
            clearTimeout(timeoutId);
        }
        this.cursedUsers.clear();
    }
}

export const maledictionManager = new MaledictionManager();