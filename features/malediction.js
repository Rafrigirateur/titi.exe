import { randomTiti } from '../utils.js';
import { getMaledictionState, saveMaledictionState } from '../database.js';

class MaledictionManager {
    constructor() {
        this.isActive = false;
        this.allowedChannels = [];
        this.cursedUsers = new Map(); // Stocke : userId -> timeoutId
        this.client = null; // Garde une référence du bot pour relancer les pings
    }

    // Appelée au démarrage de l'app
    async init(client) {
        this.client = client;
        const state = await getMaledictionState();
        this.isActive = state.isActive;
        this.allowedChannels = state.allowedChannels;
        
        console.log(`[Jupiter] Démarrage... Statut: ${this.isActive ? 'ALLUMÉ' : 'ÉTEINT'}, Salons: ${this.allowedChannels.length}, Cibles: ${state.cursedUsers.length}`);

        // Restaurer les joueurs maudits depuis la DB
        for (const userId of state.cursedUsers) {
            if (this.isActive) {
                this.scheduleNextPing(userId); // Relance les timers
            } else {
                this.cursedUsers.set(userId, null); // Ajouté en pause
            }
        }
    }

    // Synchronise la RAM vers SQLite
    async syncDB() {
        const cursedArray = Array.from(this.cursedUsers.keys());
        await saveMaledictionState(this.isActive, this.allowedChannels, cursedArray);
    }

    // Fonction appelée par le dashboard web
    async updateConfig(isActive, channels) {
        this.isActive = isActive;
        this.allowedChannels = channels;
        console.log(`[Jupiter] Mise à jour - Statut: ${this.isActive ? 'ALLUMÉ' : 'ÉTEINT'}`);
        
        if (!this.isActive) {
            this.pauseAllCurses(); // Met en pause sans supprimer les joueurs
        } else {
            this.resumeAllCurses(); // Relance le feu
        }
        await this.syncDB();
    }

    // Fonction appelée par la commande Discord /malediction
    async toggleCurseOnUser(userId) {
        if (this.cursedUsers.has(userId)) {
            clearTimeout(this.cursedUsers.get(userId));
            this.cursedUsers.delete(userId);
            await this.syncDB();
            return false; // N'est plus maudit
        } else {
            if (this.isActive) {
                this.scheduleNextPing(userId);
            } else {
                this.cursedUsers.set(userId, null);
            }
            await this.syncDB();
            return true; // Est maudit
        }
    }

    scheduleNextPing(userId) {
        if (!this.isActive || this.allowedChannels.length === 0) return;

        const minDelay = 30 * 60 * 1000;
        const maxDelay = 120 * 60 * 1000;
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        const timeoutId = setTimeout(async () => {
            try {
                const channelId = this.allowedChannels[Math.floor(Math.random() * this.allowedChannels.length)];
                const channel = await this.client.channels.fetch(channelId);

                if (channel && channel.isTextBased()) {
                    const message = await randomTiti();
                    await channel.send(`<@${userId}> ${message}`);
                }
            } catch (error) {
                console.error("[Jupiter] Erreur de ping :", error);
            }
            this.scheduleNextPing(userId); // Boucle
        }, delay);

        this.cursedUsers.set(userId, timeoutId);
    }

    pauseAllCurses() {
        for (let [userId, timeoutId] of this.cursedUsers.entries()) {
            clearTimeout(timeoutId);
            this.cursedUsers.set(userId, null);
        }
    }

    resumeAllCurses() {
        for (let [userId, timeoutId] of this.cursedUsers.entries()) {
            if (!timeoutId) this.scheduleNextPing(userId);
        }
    }
}

export const maledictionManager = new MaledictionManager();