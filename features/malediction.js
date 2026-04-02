import { cursedTiti } from '../utils.js';
import { getMaledictionState, saveMaledictionState } from '../database.js';

class MaledictionManager {
    constructor() {
        this.isActive = false;
        this.allowedChannels = [];
        this.cursedUsers = new Map(); // Stocke désormais : userId -> { timeoutId, nextPingTime }
        this.client = null; 
    }

    async init(client) {
        this.client = client;
        const state = await getMaledictionState();
        this.isActive = state.isActive;
        this.allowedChannels = state.allowedChannels;
        
        console.log(`[Jupiter] Démarrage... Statut: ${this.isActive ? 'ALLUMÉ' : 'ÉTEINT'}, Cibles: ${state.cursedUsers.length}`);

        for (const userId of state.cursedUsers) {
            if (this.isActive) {
                this.scheduleNextPing(userId); 
            } else {
                this.cursedUsers.set(userId, { timeoutId: null, nextPingTime: null }); 
            }
        }
    }

    async syncDB() {
        const cursedArray = Array.from(this.cursedUsers.keys());
        await saveMaledictionState(this.isActive, this.allowedChannels, cursedArray);
    }

    async updateConfig(isActive, channels) {
        this.isActive = isActive;
        this.allowedChannels = channels;
        console.log(`[Jupiter] Mise à jour - Statut: ${this.isActive ? 'ALLUMÉ' : 'ÉTEINT'}`);
        
        if (!this.isActive) {
            this.pauseAllCurses(); 
        } else {
            this.resumeAllCurses(); 
        }
        await this.syncDB();
    }

    async toggleCurseOnUser(userId) {
        if (this.cursedUsers.has(userId)) {
            const data = this.cursedUsers.get(userId);
            if (data && data.timeoutId) clearTimeout(data.timeoutId);
            this.cursedUsers.delete(userId);
            await this.syncDB();
            return false; // N'est plus maudit
        } else {
            if (this.isActive) {
                this.scheduleNextPing(userId);
            } else {
                this.cursedUsers.set(userId, { timeoutId: null, nextPingTime: null });
            }
            await this.syncDB();
            return true; // Est maudit
        }
    }

    scheduleNextPing(userId) {
        // Sécurité : Si le système est éteint ou s'il n'y a pas de salons, on annule le timer
        if (!this.isActive || this.allowedChannels.length === 0) {
            this.cursedUsers.set(userId, { timeoutId: null, nextPingTime: null });
            return;
        }

        const minDelay = 30 * 60 * 1000; // 30 minutes
        const maxDelay = 120 * 60 * 1000; // 2 heures
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        const nextPingTime = Date.now() + delay; // 👈 On calcule l'heure exacte du prochain tir

        const timeoutId = setTimeout(async () => {
            try {
                const channelId = this.allowedChannels[Math.floor(Math.random() * this.allowedChannels.length)];
                const channel = await this.client.channels.fetch(channelId);

                if (channel && channel.isTextBased()) {
                    const message = await cursedTiti();
                    await channel.send(`<@${userId}> ${message}`);
                }
            } catch (error) {
                console.error("[Jupiter] Erreur de ping :", error);
            }
            this.scheduleNextPing(userId); // On boucle
        }, delay);

        // 👈 On sauvegarde l'objet complet
        this.cursedUsers.set(userId, { timeoutId, nextPingTime });
    }

    pauseAllCurses() {
        for (let [userId, data] of this.cursedUsers.entries()) {
            if (data && data.timeoutId) clearTimeout(data.timeoutId);
            this.cursedUsers.set(userId, { timeoutId: null, nextPingTime: null });
        }
    }

    resumeAllCurses() {
        for (let [userId, data] of this.cursedUsers.entries()) {
            if (!data || !data.timeoutId) this.scheduleNextPing(userId);
        }
    }
}

export const maledictionManager = new MaledictionManager();